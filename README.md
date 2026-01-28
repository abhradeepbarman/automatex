# Automatex

Automatex is a powerful workflow automation platform designed to integrate various services and execute complex workflows efficiently. It allows users to create triggers and actions to automate tasks across different applications like Gmail, Discord, and more.

## Architecture

The project is a monorepo built with [Turborepo](https://turbo.build/repo) and consists of the following applications:

### Apps

- **`web`**: The frontend dashboard built with [Vite](https://vitejs.dev/), [React](https://react.dev/), and [Tailwind CSS](https://tailwindcss.com/). It provides a user-friendly interface for managing workflows, viewing dashboard statistics, and configuring integrations.
- **`server`**: The backend API built with [Express](https://expressjs.com/) and [Node.js](https://nodejs.org/). It handles user authentication, workflow management, and communicates with the database.
- **`executor`**: A specialized worker service that executes the automation workflows. It uses [BullMQ](https://docs.bullmq.io/) and [Redis](https://redis.io/) for job queuing and processing.

### Packages

- **`@repo/common`**: Shared utilities, constants, and Zod schemas used across applications.
- **`@repo/db`**: Database schema and ORM configuration using [Drizzle ORM](https://orm.drizzle.team/) and PostgreSQL.
- **`@repo/eslint-config`**: Shared ESLint configurations.
- **`@repo/typescript-config`**: Shared TypeScript configurations.

## Tech Stack

- **Monorepo Tool**: Turborepo
- **Package Manager**: pnpm
- **Frontend**: React, Vite, Tailwind CSS, Radix UI, Lucide React
- **Backend**: Node.js, Express
- **Database**: PostgreSQL, Drizzle ORM
- **Queue/Workers**: BullMQ, Redis
- **Language**: TypeScript

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (>= 18)
- [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/abhradeepbarman/automatex.git
    cd automatex
    ```

2.  Install dependencies:

    ```bash
    pnpm install
    ```

3.  Set up environment variables:

    Copy the sample environment files and configure them with your credentials.

    ```bash
    # Root (if applicable) or individual apps
    cp apps/server/.env.sample apps/server/.env
    cp apps/web/.env.sample apps/web/.env
    cp apps/executor/.env.sample apps/executor/.env
    ```

    Update the `.env` files with your database URL, Redis connection string, and other necessary secrets.

4.  Database Migration:

    Run the database migrations to set up the schema.

    ```bash
    # Using the filter to run the migrate script in the db package
    pnpm --filter @repo/db db:migrate
    ```

### Running the Project

To start all applications in development mode:

```bash
pnpm dev
```

This command uses Turbo to run the `dev` script in all apps (`web`, `server`, `executor`) simultaneously.

- **Web Dashboard**: http://localhost:5173 (default Vite port)
- **API Server**: http://localhost:3000 (check logs for actual port)

### Building

To build all apps and packages:

```bash
pnpm build
```

## Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
