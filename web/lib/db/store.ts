// Generation store. MVP default = in-memory (per process). Production = Postgres
// via the Drizzle schema (lib/db/schema.ts) + DATABASE_URL — implement a PgStore behind
// the same interface and return it from getStore() when DATABASE_URL is set.
//
// MCPForge is free & open source: there are no plan tiers. The store keeps a lightweight
// user record only to attach saved generations to an (anonymous) session.

import type { Plan } from "../plan";

export interface UserRecord {
  id: string;
  plan: Plan;
}

export interface GenerationRecord {
  id: string;
  userId: string;
  name: string;
  sourceRef?: string;
  ir: unknown;
  descriptions: Record<string, string>;
  endpointCount: number;
  createdAt: string;
}

export interface Store {
  getUser(id: string): Promise<UserRecord>;
  saveGeneration(rec: GenerationRecord): Promise<void>;
  listGenerations(userId: string, limit?: number): Promise<GenerationRecord[]>;
  getGeneration(id: string): Promise<GenerationRecord | null>;
}

const MAX_HISTORY_PER_USER = 50;

class MemoryStore implements Store {
  private users = new Map<string, UserRecord>();
  private generations = new Map<string, GenerationRecord>();

  async getUser(id: string): Promise<UserRecord> {
    let u = this.users.get(id);
    if (!u) {
      u = { id, plan: "free" };
      this.users.set(id, u);
    }
    return u;
  }
  async saveGeneration(rec: GenerationRecord): Promise<void> {
    this.generations.set(rec.id, rec);
    // cap history per user to avoid unbounded memory in dev
    const mine = [...this.generations.values()]
      .filter((g) => g.userId === rec.userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    for (const old of mine.slice(MAX_HISTORY_PER_USER)) this.generations.delete(old.id);
  }
  async listGenerations(userId: string, limit = 20): Promise<GenerationRecord[]> {
    return [...this.generations.values()]
      .filter((g) => g.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
  async getGeneration(id: string): Promise<GenerationRecord | null> {
    return this.generations.get(id) ?? null;
  }
}

const g = globalThis as unknown as { __mcpforgeStore?: Store };

export function getStore(): Store {
  if (!g.__mcpforgeStore) {
    // if (process.env.DATABASE_URL) g.__mcpforgeStore = new PgStore(); // production
    g.__mcpforgeStore = new MemoryStore();
  }
  return g.__mcpforgeStore;
}
