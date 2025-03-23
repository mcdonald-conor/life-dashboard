#!/bin/sh

set -e

# Print environment information (without secrets)
echo "Node version: $(node -v)"
echo "Starting application in $NODE_ENV environment"

# Extract host from DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "Database host: $DB_HOST"
echo "Database port: $DB_PORT"

# Show Prisma version and path
echo "Prisma CLI path: $(which prisma)"
echo "Prisma CLI version: $(prisma --version || echo 'Not found')"

# Display network info for debugging
echo "Network interfaces:"
ip addr || echo "ip command not found"

# Test network connectivity with a longer timeout
echo "Testing network connectivity to the database..."
if nc -z -w10 $DB_HOST $DB_PORT 2>/dev/null; then
  echo "Network connectivity test: SUCCESS - Can reach $DB_HOST:$DB_PORT"
else
  echo "Network connectivity test: FAILED - Cannot reach $DB_HOST:$DB_PORT"
  echo "Trying with the host 'postgres' instead..."

  if nc -z -w10 postgres 5432 2>/dev/null; then
    echo "Network connectivity test: SUCCESS - Can reach postgres:5432"
    echo "Using 'postgres' as the database host instead."
    # Adjust the DATABASE_URL to use postgres as host
    export DATABASE_URL=$(echo $DATABASE_URL | sed "s/@$DB_HOST:/@postgres:/")
    echo "New DATABASE_URL format: $(echo $DATABASE_URL | sed 's/:.*/:***/g')"
  else
    echo "Network connectivity test: FAILED - Cannot reach postgres:5432 either"
    echo "Docker network configuration issue likely"
  fi
fi

# Test with pg_isready if available
if command -v pg_isready > /dev/null; then
  echo "Testing PostgreSQL with pg_isready..."
  if pg_isready -h $DB_HOST -p $DB_PORT -U postgres; then
    echo "PostgreSQL server is accepting connections"
  else
    echo "PostgreSQL server is not accepting connections at $DB_HOST:$DB_PORT"
    echo "Trying with 'postgres' as host..."
    if pg_isready -h postgres -p 5432 -U postgres; then
      echo "PostgreSQL server is accepting connections at postgres:5432"
    fi
  fi
fi

# Print Prisma info and DATABASE_URL
echo "Current DATABASE_URL format: $(echo $DATABASE_URL | sed 's/:.*/:***/g')"
echo "Prisma schema path: $(find /app -name schema.prisma)"

# Try the database connection with our test script
if [ -f /app/test-db.js ]; then
  echo "Running database connection test script..."
  node /app/test-db.js || echo "Node test script failed"
fi

# Add a longer wait time for database
echo "Waiting for database to be available (increased timeout)..."
for i in 1 2 3 4 5 6 7 8
do
  echo "Attempt $i: Checking database connection with Prisma..."

  # Use npx to ensure we use the local prisma in node_modules
  if npx prisma db pull --schema=/app/prisma/schema.prisma --force; then
    echo "Database connection successful!"
    break
  fi

  if [ $i -eq 8 ]; then
    echo "Error: Failed to connect to the database after 8 attempts"
    echo "Will continue anyway and let the application handle reconnection..."
  fi

  echo "Database not ready yet, waiting 10 seconds..."
  sleep 10
done

# Run migrations (but don't fail if they don't succeed)
echo "Running database migrations..."
npx prisma migrate deploy --schema=/app/prisma/schema.prisma || echo "Migration failed, but continuing..."

echo "Generating Prisma client..."
npx prisma generate --schema=/app/prisma/schema.prisma || echo "Client generation failed, but continuing..."

echo "Starting application..."
exec "$@"
