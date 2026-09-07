import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  mysqlEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = mysqlEnum("role", ["organizer", "buyer"]);
export const orderStatusEnum = mysqlEnum("status", ["pending", "paid", "cancelled", "expired"]);

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: userRoleEnum.notNull().default("buyer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("email_idx").on(table.email)]
);

export const events = mysqlTable(
  "events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organizerId: varchar("organizer_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    location: varchar("location", { length: 500 }).notNull(),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at").notNull(),
    isPublished: int("is_published").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("organizer_idx").on(table.organizerId),
    index("starts_at_idx").on(table.startsAt),
  ]
);

export const ticketTiers = mysqlTable(
  "ticket_tiers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    eventId: varchar("event_id", { length: 36 })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    priceInCents: int("price_in_cents").notNull(),
    quota: int("quota").notNull(),
    soldCount: int("sold_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("event_idx").on(table.eventId)]
);

export const orders = mysqlTable(
  "orders",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    buyerId: varchar("buyer_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    status: orderStatusEnum.default("pending").notNull(),
    totalInCents: int("total_in_cents").notNull(),
    reservedUntil: timestamp("reserved_until").notNull(),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("buyer_idx").on(table.buyerId),
    index("status_idx").on(table.status),
    index("reserved_until_idx").on(table.reservedUntil),
  ]
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    orderId: varchar("order_id", { length: 36 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    ticketTierId: varchar("ticket_tier_id", { length: 36 })
      .notNull()
      .references(() => ticketTiers.id),
    quantity: int("quantity").notNull(),
    unitPriceInCents: int("unit_price_in_cents").notNull(),
    subtotalInCents: int("subtotal_in_cents").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("order_idx").on(table.orderId)]
);

export const tickets = mysqlTable(
  "tickets",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    orderId: varchar("order_id", { length: 36 })
      .notNull()
      .references(() => orders.id),
    orderItemId: varchar("order_item_id", { length: 36 })
      .notNull()
      .references(() => orderItems.id),
    ticketTierId: varchar("ticket_tier_id", { length: 36 })
      .notNull()
      .references(() => ticketTiers.id),
    qrData: varchar("qr_data", { length: 255 }).notNull().unique(),
    isUsed: int("is_used").default(0).notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("order_idx").on(table.orderId),
    index("qr_data_idx").on(table.qrData),
    uniqueIndex("unique_qr").on(table.qrData),
  ]
);

export const checkIns = mysqlTable(
  "check_ins",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    ticketId: varchar("ticket_id", { length: 36 })
      .notNull()
      .references(() => tickets.id),
    scannedBy: varchar("scanned_by", { length: 36 })
      .notNull()
      .references(() => users.id),
    scannedAt: timestamp("scanned_at").defaultNow().notNull(),
  },
  (table) => [index("ticket_idx").on(table.ticketId)]
);

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  orders: many(orders),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  ticketTiers: many(ticketTiers),
}));

export const ticketTiersRelations = relations(ticketTiers, ({ one, many }) => ({
  event: one(events, {
    fields: [ticketTiers.eventId],
    references: [events.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  items: many(orderItems),
  tickets: many(tickets),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  ticketTier: one(ticketTiers, {
    fields: [orderItems.ticketTierId],
    references: [ticketTiers.id],
  }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  order: one(orders, {
    fields: [tickets.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [tickets.orderItemId],
    references: [orderItems.id],
  }),
  ticketTier: one(ticketTiers, {
    fields: [tickets.ticketTierId],
    references: [ticketTiers.id],
  }),
  checkIns: many(checkIns),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  ticket: one(tickets, {
    fields: [checkIns.ticketId],
    references: [tickets.id],
  }),
  scanner: one(users, {
    fields: [checkIns.scannedBy],
    references: [users.id],
  }),
}));
