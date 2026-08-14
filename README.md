# ReachInbox

A full-stack email management and scheduling application built with React,
Node.js, PostgreSQL, Prisma, BullMQ, and Redis.

ReachInbox allows users to authenticate, configure sender identities, compose
emails to multiple recipients, send emails immediately, schedule emails for
later delivery, and monitor sent email activity.

The application uses an asynchronous queue-based email architecture so that
email delivery is handled by background workers rather than blocking API
requests.

---

## Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Protected application routes
- Persistent authentication state

### Email Management

- Compose emails
- Multiple recipient support
- Subject and email body
- Send emails immediately
- Schedule emails for later delivery
- View sent emails
- View email details
- Email status tracking

### Sender Management

- Create sender identities
- Retrieve configured senders
- Select a sender when composing an email

### Asynchronous Email Processing

- BullMQ-based email queue
- Redis-backed job processing
- Background email worker
- Scheduled email jobs
- Retry handling for failed email jobs
- Failed job tracking

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Responsive dashboard
- Reusable components
- Loading states
- Validation states
- Error handling
- Success notifications

### Attachments

File upload and attachment functionality is intentionally not implemented in
the current version.

---
# Setup Guide

## 1. Clone the Repository

```bash
git clone <YOUR_PRIVATE_REPOSITORY_URL>
cd Reach_Inbox
```

## 2. Backend Setup

Open a terminal inside the backend directory:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

## 3. Backend Environment Variables

Create a `.env` file inside the `Backend` directory:

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
WORKER_CONCURRENCY=
EMAIL_SEND_DELAY_MS=
MAX_EMAILS_PER_HOUR=
JWT_SECRET=
JWT_EXPIRES_IN=
FRONTEND_URL=
REDIS_URL=redis://localhost:6379
```

> Important: Never commit `.env` files or expose JWT, database, Redis, or SMTP credentials.

## 4. PostgreSQL Setup

Create a PostgreSQL database and configure its connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply existing migrations:

```bash
npx prisma migrate deploy
```

For local development, migrations can be created using:

```bash
npx prisma migrate dev
```

> Important: Do not use `prisma migrate dev` against the production database.

## 5. Redis Setup

ReachInbox uses Redis for BullMQ and email throttling.

For local development, make sure Redis is running:

```bash
redis-server
```

Then configure:

```env
REDIS_URL=redis://localhost:6379
```

For production, use a managed Redis service and configure the production Redis connection string.

The Redis connection must be compatible with the application's `ioredis` configuration.

## 6. Start the Backend API

Run:

```bash
npm run dev
```

The backend should start on:

`http://localhost:5000`

### Health Check

```http
GET http://localhost:5000/health
```

Expected response:

```json
{
"status": "ok",
"service": "reachinbox-backend"
}
```

## 7. Start the Email Worker

BullMQ requires the email worker to run separately from the API server.

Open another terminal:

```bash
cd Backend
npm run worker
```

The worker processes queued and scheduled email jobs.

For local development, both processes should be running:

Terminal 1: `npm run dev`

Terminal 2: `npm run worker`

## 8. Frontend Setup

Open another terminal:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

## 9. Frontend Environment Variables

Create a `.env` file inside the `Frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend uses this URL to communicate with the backend API.

For production, change it to the deployed backend URL:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

> Important: Do not put secrets in frontend environment variables. Anything beginning with `VITE_` can be exposed to the browser.

## 10. Start the Frontend

Run:

```bash
npm run dev
```

Vite will provide a local URL similar to:

`http://localhost:5173`

## 11. Running the Complete Application

The application requires three concurrent processes:

### Terminal 1 — Backend API

```bash
cd Backend
npm run dev
```

### Terminal 2 — BullMQ Worker

```bash
cd Backend
npm run worker
```

### Terminal 3 — Frontend

```bash
cd Frontend
npm run dev
```