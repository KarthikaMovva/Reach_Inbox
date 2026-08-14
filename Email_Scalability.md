# ReachInbox — 1000+ Email Handling Architecture

## 1. Overview

ReachInbox uses an asynchronous email-processing architecture designed to
prevent email delivery from blocking the API request.

The main processing pipeline is:

Frontend
    ↓
Express API
    ↓
PostgreSQL
    ↓
BullMQ
    ↓
Redis
    ↓
Email Worker
    ↓
SMTP / Email Provider

The API is responsible for accepting and persisting email requests, while the
background worker is responsible for processing and delivering emails.

---

## 2. Why asynchronous processing is used

Sending an email directly inside the HTTP request would make the API dependent
on the email provider's response time.

For example:

User
  ↓
POST /emails
  ↓
SMTP request
  ↓
wait
  ↓
SMTP response
  ↓
HTTP response

This becomes inefficient when a large number of emails need to be sent.

ReachInbox instead uses:

POST /emails
  ↓
Persist email
  ↓
Create BullMQ job
  ↓
Return API response
  ↓
Worker processes job asynchronously

This separates API request handling from email delivery.

---

## 3. PostgreSQL persistence

Email information is persisted using PostgreSQL through Prisma.

This provides durable application-level storage for email records and their
states.

The database acts as the source of truth for the application's email data.

The queue is responsible for asynchronous processing, while PostgreSQL
maintains the persistent application record.

---

## 4. BullMQ and Redis

BullMQ is used as the asynchronous job queue.

Redis is used as the BullMQ backend.

The email queue allows email delivery work to be processed independently from
the API request.

The architecture can therefore accept many email requests without requiring
the API process to synchronously deliver every email.

---

## 5. Worker architecture

A dedicated email worker consumes jobs from the BullMQ email queue.

Conceptually:

Redis
  ↓
BullMQ email queue
  ↓
Email worker
  ↓
Email sender
  ↓
SMTP / provider

The worker is responsible for executing the actual email delivery operation.

This separation makes the system more resilient and allows worker processing
to be scaled independently from the API server.

---

## 6. Multiple recipients

The backend email model represents an individual recipient.

Therefore, when the frontend receives multiple recipients:

recipient1@example.com
recipient2@example.com
recipient3@example.com

the frontend creates individual email requests:

Email #1 → recipient1@example.com
Email #2 → recipient2@example.com
Email #3 → recipient3@example.com

Each email becomes an independent database record and queue job.

This is preferable to placing a very large recipient list into a single job
because each recipient can have an independent processing result.

---

## 7. Scheduled emails

Scheduled emails use the `scheduledAt` value.

Conceptually:

Current time
    ↓
Email request
    ↓
scheduledAt
    ↓
BullMQ delayed job
    ↓
Redis
    ↓
Worker executes at the scheduled time
    ↓
Email provider

This allows scheduled email processing without continuously polling the
database from the frontend.

---

## 8. Retry and failure handling

Email delivery can fail because of temporary SMTP/provider errors or other
network problems.

BullMQ provides retry capabilities for failed jobs.

Conceptually:

Worker
  ↓
Attempt delivery
  ↓
Success → completed

Failure
  ↓
Retry
  ↓
Attempt delivery again

If retries are exhausted, the job remains failed and can be investigated
separately.

This prevents a temporary delivery failure from immediately becoming a
permanent application failure.

---

## 9. 1000+ email processing

The architecture is designed around asynchronous job processing rather than
synchronous email delivery.

For example, a batch of 1000 emails can conceptually become:

1000 API email requests
        ↓
1000 persisted email records
        ↓
1000 queue jobs
        ↓
BullMQ / Redis
        ↓
Worker processes jobs
        ↓
Email provider

The API does not need to wait for all 1000 emails to be delivered before
responding to the user.

The queue provides buffering between incoming requests and email delivery.

---

## 10. Important scalability limitation

The current implementation should not be described as having guaranteed
production throughput of 1000+ emails per minute or per second.

A real throughput guarantee requires load testing with:

- actual Redis configuration
- actual worker concurrency
- actual PostgreSQL configuration
- actual SMTP/email provider
- provider rate limits
- network conditions
- retry behavior

Therefore:

"Supports 1000+ queued email jobs architecturally"

is an accurate statement.

---

## 11. Production scaling strategy

If email volume increases significantly, the worker layer can be scaled
independently.

Example:

                    Redis
                      │
              BullMQ Email Queue
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
    Worker 1      Worker 2      Worker 3
        │             │             │
        └─────────────┼─────────────┘
                      ↓
                Email Provider

Multiple worker processes can consume jobs from the same queue.

This allows processing capacity to be increased without unnecessarily
scaling the API server.

---

## 12. Provider rate limiting

Email providers generally impose sending limits.

Therefore, production deployments should configure queue processing so that
worker throughput stays within provider limits.

Increasing worker concurrency without considering provider limits can result
in:

- throttling
- temporary provider failures
- rejected messages
- increased retries

Therefore queue concurrency and provider limits must be considered together.

---

## 13. Database considerations

For large email volumes:

- indexes should exist on frequently queried email fields
- completed/old email records should eventually be archived if necessary
- database connection pooling should be configured correctly
- large queries should use pagination

The frontend should not request an unlimited number of email records at once.

## 14. Current project conclusion

ReachInbox uses a queue-based asynchronous architecture for email delivery.

The architecture is suitable for handling large numbers of queued email jobs
because email delivery is separated from the HTTP request lifecycle.

The current project should be described as:

"An asynchronous email delivery system using Express, PostgreSQL, Prisma,
BullMQ, Redis, and background workers, designed to queue and process large
email workloads."

A formal production throughput guarantee requires load testing and depends on
the configured email provider and infrastructure.