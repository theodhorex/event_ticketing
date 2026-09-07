# Event Ticketing System

A full-stack event ticketing platform built with Next.js, Drizzle ORM, and MySQL. Designed to handle real-world concurrency challenges like race conditions during ticket checkout.

## Tech Stack

- **Runtime:** Bun
- **Framework:** Next.js 16.3.4 (App Router) + TypeScript
- **ORM:** Drizzle ORM with mysql2 driver
- **Database:** MySQL (MariaDB)
- **Auth:** NextAuth v5 (Credentials provider, JWT strategy)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Animations:** Framer Motion
- **Validation:** Zod
- **QR Code:** qrcode

## Features

### Authentication
- User registration with role selection (Organizer / Buyer)
- Secure login with NextAuth v5 (JWT strategy)
- Protected routes via middleware

### User Roles

**Organizer:**
- Create and manage events
- Configure multiple ticket tiers per event (name, price, quota)
- View sales dashboard (total sold, revenue per tier)
- QR-based check-in scanning at venue

**Buyer:**
- Browse public events
- Purchase tickets across multiple tiers
- View order history and e-tickets
- QR code ticket for check-in

### Technical Highlights

- **Race Condition Prevention:** Transaction-based checkout with row-level locking (`SELECT ... FOR UPDATE`) to prevent overselling when multiple users checkout simultaneously
- **Reservation Hold:** Orders have a 10-minute reservation window before expiry if unpaid
- **Idempotent Check-in:** QR codes can only be scanned once — duplicate scans are rejected
- **E-Ticket Generation:** Unique QR code generated per ticket

## Database Schema

```
users          — id, email, passwordHash, name, role, timestamps
events         — id, organizerId, title, description, location, startsAt, endsAt, isPublished
ticket_tiers   — id, eventId, name, description, priceInCents, quota, soldCount
orders         — id, buyerId, status (pending/paid/cancelled/expired), totalInCents, reservedUntil
order_items    — id, orderId, ticketTierId, quantity, unitPriceInCents, subtotalInCents
tickets        — id, orderId, orderItemId, ticketTierId, qrData, isUsed, usedAt
check_ins      — id, ticketId, scannedBy, scannedAt
```

## Getting Started

### Prerequisites

- Bun runtime
- MySQL/MariaDB server
- XAMPP (recommended for local development)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd event-ticketing

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

### Database Setup

1. Create a MySQL database named `event_ticketing`
2. Update `.env` with your database credentials:

```env
DATABASE_URL="mysql://root:@localhost:3306/event_ticketing"
AUTH_SECRET="your-secret-key-here"
```

3. Run migrations (via Drizzle or phpMyAdmin using the schema in `db/schema.ts`)

### Development

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   ├── api/              # API routes
│   │   └── auth/         # NextAuth handlers
│   ├── dashboard/         # Protected dashboard
│   ├── events/           # Public event listing
│   └── page.tsx          # Landing page
├── components/
│   └── ui/               # shadcn-style components
├── db/
│   ├── schema.ts         # Drizzle schema definitions
│   └── index.ts          # Database connection
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   └── utils.ts          # Utility functions
└── proxy.ts             # Auth middleware
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/[...nextauth]` | NextAuth handlers |

## Milestones

- [x] **M1:** Project setup, database schema, authentication
- [x] **M2:** UI components with animations
- [ ] **M3:** CRUD event & ticket tier (organizer)
- [ ] **M4:** Checkout flow with transaction locking
- [ ] **M5:** E-ticket generation with QR codes
- [ ] **M6:** Check-in via QR scanning
- [ ] **M7:** Dashboard reports
- [ ] **M8:** Polish & deployment

## License

Private portfolio project.
