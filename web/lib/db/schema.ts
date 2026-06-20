// Production persistence schema (Drizzle / Postgres) — per ../../DATABASE.md.
// Used when DATABASE_URL is set + a PgStore is wired. The MVP default runs on the
// in-memory store (lib/db/store.ts); swap to Postgres for production durability.

import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // auth provider (Clerk) user id, or cookie uid in dev
  email: text("email"),
  plan: text("plan").notNull().default("free"), // free | pro
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  userId: text("user_id").primaryKey(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status"), // active | canceled | past_due
  currentPeriodEnd: timestamp("current_period_end"),
});

// Optional Pro "history" (per DATABASE.md) — not used by the MVP free generator.
export const generations = pgTable("generations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  sourceRef: text("source_ref"),
  ir: jsonb("ir").notNull(),
  descriptions: jsonb("descriptions"),
  endpointCount: integer("endpoint_count"),
  createdAt: timestamp("created_at").defaultNow(),
});
