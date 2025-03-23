# Life Dashboard

A comprehensive dashboard for managing your life, including habit tracking, task management, focus sessions, and water intake tracking.

## Features

- User authentication system with email/password
- Task management
- Habit tracking
- Focus timer with Pomodoro technique
- Water intake tracking
- Progress analytics

## Installation

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/your-username/life-dashboard.git
cd life-dashboard
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file:

```bash
# For local development with a local PostgreSQL database
DATABASE_URL="postgresql://username:password@localhost:5432/life-dashboard?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:

```bash
# Create the database tables
pnpm prisma migrate dev --name init
```

5. Start the development server:

```bash
pnpm dev
```

### Coolify Deployment

1. Create a PostgreSQL database on your Coolify instance.

2. Update the environment variables in Coolify:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A secure random string
   - `NEXTAUTH_URL`: Your Coolify app URL

3. Deploy to Coolify using the Dockerfile.

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js
- TailwindCSS
- Shadcn UI
- Lucide React Icons

## License

MIT
