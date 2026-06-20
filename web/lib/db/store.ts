// Plan store. MVP default = in-memory (per process). Production = Postgres via the
// Drizzle schema (lib/db/schema.ts) + DATABASE_URL — implement PgStore behind the same
// interface and return it from getStore() when DATABASE_URL is set.

import type { Plan } from "../plan";

export interface UserRecord {
  id: string;
  plan: Plan;
  stripeCustomerId?: string;
}

export interface Store {
  getUser(id: string): Promise<UserRecord>;
  setPlan(id: string, plan: Plan): Promise<void>;
  linkStripeCustomer(id: string, customerId: string): Promise<void>;
  findByStripeCustomer(customerId: string): Promise<UserRecord | null>;
}

class MemoryStore implements Store {
  private users = new Map<string, UserRecord>();
  async getUser(id: string): Promise<UserRecord> {
    let u = this.users.get(id);
    if (!u) {
      u = { id, plan: "free" };
      this.users.set(id, u);
    }
    return u;
  }
  async setPlan(id: string, plan: Plan): Promise<void> {
    (await this.getUser(id)).plan = plan;
  }
  async linkStripeCustomer(id: string, customerId: string): Promise<void> {
    (await this.getUser(id)).stripeCustomerId = customerId;
  }
  async findByStripeCustomer(customerId: string): Promise<UserRecord | null> {
    for (const u of this.users.values()) if (u.stripeCustomerId === customerId) return u;
    return null;
  }
}

// Singleton across dev hot-reload / a single server process.
const g = globalThis as unknown as { __mcpforgeStore?: Store };

export function getStore(): Store {
  if (!g.__mcpforgeStore) {
    // if (process.env.DATABASE_URL) g.__mcpforgeStore = new PgStore(); // production
    g.__mcpforgeStore = new MemoryStore();
  }
  return g.__mcpforgeStore;
}
