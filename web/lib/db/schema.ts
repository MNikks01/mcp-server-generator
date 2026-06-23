// Production persistence schema (Drizzle / Postgres) — per ../../DATABASE.md.
// Used when DATABASE_URL is set + a PgStore is wired. The MVP default runs on the
// in-memory store (lib/db/store.ts); swap to Postgres for production durability.
//
// MCPForge is free & open source: no plans, no billing tables. A user record just
// anchors a session's saved generations.

import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // auth provider (Clerk) user id, or cookie uid in dev
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved generations (history) — available to everyone.
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
