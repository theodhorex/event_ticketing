# AGENTS.md

Panduan untuk AI coding agent (Claude Code, Cursor, dsb) saat bantu develop project ini.

## Project Overview

Event Ticketing System — platform jual beli tiket event dengan sistem tier, checkout, dan check-in via QR code.

**Stack:**
- Runtime: Bun
- Framework: Next.js (App Router) + TypeScript
- ORM: Drizzle ORM
- Database: MySQL (driver: `mysql2`)
- Auth: NextAuth
- Validasi: Zod
- QR: `qrcode`

## Setup Commands

```bash
bun install                  # install dependencies
bun run dev                  # jalanin dev server
bun x drizzle-kit generate   # generate migration dari schema
bun x drizzle-kit migrate    # apply migration ke db
bun x drizzle-kit studio     # buka GUI buat inspect data
```

Sebelum run apapun, pastiin `.env` udah ada `DATABASE_URL` yang valid.

## Project Structure

```
src/
  app/            → routes (Next.js App Router)
  db/
    schema.ts     → definisi tables (single source of truth skema)
    index.ts      → db client instance
  lib/            → helper (auth config, qrcode gen, dll)
  components/     → UI components
drizzle/          → hasil generate migration (jangan diedit manual)
drizzle.config.ts → config drizzle-kit
```

## Database Conventions

- Semua perubahan skema **wajib** lewat `src/db/schema.ts`, lalu generate migration. Jangan pernah ALTER TABLE manual di db.
- Storage engine MySQL harus InnoDB (default) — dibutuhin buat row-level locking (`FOR UPDATE`).
- Status kolom (order status, ticket status) pakai `mysqlEnum()`, bukan string bebas atau tabel lookup terpisah.
- Primary key pakai `int().autoincrement()` kecuali butuh public-facing ID (misal kode tiket) → pakai `varchar` + generate UUID di application layer.
- Operasi yang menyentuh kuota tiket (checkout, cancel, expire) **wajib** dibungkus `db.transaction()` dan pakai `.for('update')` buat row lock. Ini non-negotiable — race condition di sini bikin oversold tiket.

## Code Style

- TypeScript strict mode, hindari `any`.
- Validasi semua input dari client (form, API body) pakai Zod schema sebelum masuk ke query Drizzle.
- Query kompleks (join, relasi) taruh di `src/db/queries/` sebagai fungsi reusable, jangan inline di route handler.
- Penamaan tabel: plural, snake_case di db (`ticket_tiers`), camelCase di TypeScript (`ticketTiers`).

## Testing Instructions

- Sebelum commit, jalanin `bun run build` buat mastiin gak ada TypeScript error.
- Untuk perubahan skema, generate migration dan review file SQL yang dihasilkan sebelum di-apply — jangan langsung `migrate` tanpa dicek.
- Test manual flow checkout dengan simulasi concurrent request (2 tab/request bersamaan) buat verifikasi row locking jalan, terutama kalau ubah logic di sekitar `ticket_tiers` quota.

## PR / Commit Guidelines

- Commit message: `type: deskripsi singkat` (misal `feat: add checkout transaction lock`, `fix: qr checkin idempotency`).
- Migration file yang di-generate drizzle-kit ikut di-commit bareng perubahan schema.ts terkait — jangan dipisah.

## Do Not

- Jangan ubah file di folder `drizzle/` (migration history) secara manual.
- Jangan bikin query update quota tiket di luar transaction block.
- Jangan hardcode credential DB — selalu lewat `.env` / `process.env.DATABASE_URL`.