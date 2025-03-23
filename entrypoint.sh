#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
npx prisma migrate deploy
echo "Database migrations completed!"

# Start the application
echo "Starting application..."
exec "$@"
