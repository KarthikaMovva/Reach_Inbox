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

# Architecture

```text
                         ┌─────────────────┐
                         │     Frontend    │
                         │ React + Vite    │
                         └────────┬────────┘
                                  │
                                  │ REST API
                                  ▼
                         ┌─────────────────┐
                         │   Express API   │
                         │ Node + TypeScript│
                         └───────┬─────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   │                           │
                   ▼                           ▼
          ┌─────────────────┐        ┌─────────────────┐
          │   PostgreSQL    │        │  BullMQ Queue   │
          │    + Prisma     │        │                 │
          └─────────────────┘        └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │      Redis      │
                                      └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │  Email Worker   │
                                      └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │ Email Provider  │
                                      │   / SMTP       │
                                      └─────────────────┘