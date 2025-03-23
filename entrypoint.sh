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

# Test network connectivity first
echo "Testing network connectivity to the database..."
if nc -z -w5 $DB_HOST $DB_PORT 2>/dev/null; then
  echo "Network connectivity test: SUCCESS - Can reach $DB_HOST:$DB_PORT"
else
  echo "Network connectivity test: FAILED - Cannot reach $DB_HOST:$DB_PORT"
  echo "This suggests a network issue between the application and database containers"
fi

# Test with pg_isready if available
if command -v pg_isready > /dev/null; then
  echo "Testing PostgreSQL with pg_isready..."
  if pg_isready -h $DB_HOST -p $DB_PORT -U postgres; then
    echo "PostgreSQL server is accepting connections"
  else
    echo "PostgreSQL server is not accepting connections"
  fi
fi

# Test database connection with Prisma
echo "Current DATABASE_URL format: $(echo $DATABASE_URL | sed 's/:.*/:***/g')"

# Try the database connection with our test script
if [ "$DEBUG_DB" = "true" ]; then
  echo "Running database connection test script..."
  node test-db.js
fi

# Add a simple connection check with error output
for i in 1 2 3 4 5
do
  echo "Attempt $i: Checking database connection with Prisma..."
  if prisma db pull --schema=./prisma/schema.prisma --force; then
    echo "Database connection successful!"
    break
  fi

  if [ $i -eq 5 ]; then
    echo "Error: Failed to connect to the database after 5 attempts"
    exit 1
  fi

  echo "Database not ready yet, waiting 5 seconds..."
  sleep 5
done

# Run migrations
echo "Running database migrations..."
prisma migrate deploy --schema=./prisma/schema.prisma

echo "Database migrations completed!"

# Generate Prisma client if needed
echo "Generating Prisma client..."
prisma generate --schema=./prisma/schema.prisma

echo "Starting application..."
exec "$@"
