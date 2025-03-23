#!/bin/sh

set -e

# Print environment information (without secrets)
echo "Node version: $(node -v)"
echo "Starting application in $NODE_ENV environment"

# Wait for database to be ready
echo "Waiting for database to be ready..."
# Add a simple connection check
for i in 1 2 3 4 5
do
  echo "Attempt $i: Checking database connection..."
  if pnpm prisma db pull --force >/dev/null 2>&1; then
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
pnpm prisma migrate deploy

echo "Database migrations completed!"

# Generate Prisma client if needed
echo "Generating Prisma client..."
pnpm prisma generate

echo "Starting application..."
exec "$@"
