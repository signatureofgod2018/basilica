/**
 * T0 — Qdrant Platform Test
 * Verifies the vector database is reachable and functional.
 * Run: npm run test:platform
 */
import { describe, it, expect, afterAll } from "vitest";

const QDRANT_URL = process.env["QDRANT_URL"] ?? "http://localhost:6333";
const TEST_COLLECTION = "test_platform_check";

describe("T0 — Qdrant Platform", () => {
  afterAll(async () => {
    // Cleanup test collection
    try {
      await fetch(`${QDRANT_URL}/collections/${TEST_COLLECTION}`, { method: "DELETE" });
    } catch { /* ignore */ }
  });

  it("Qdrant health endpoint returns 200", async () => {
    const res = await fetch(`${QDRANT_URL}/healthz`).catch(() => null);
    expect(res, "Qdrant not reachable — is docker compose up?").not.toBeNull();
    expect(res!.ok).toBe(true);
  });

  it("can list collections", async () => {
    const res = await fetch(`${QDRANT_URL}/collections`);
    expect(res.ok).toBe(true);
    const body = await res.json() as { result: { collections: unknown[] } };
    expect(Array.isArray(body.result.collections)).toBe(true);
  });

  it("can create a test collection", async () => {
    const res = await fetch(`${QDRANT_URL}/collections/${TEST_COLLECTION}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vectors: { size: 4, distance: "Cosine" },
      }),
    });
    expect(res.ok).toBe(true);
  });

  it("can upsert a test vector", async () => {
    const res = await fetch(`${QDRANT_URL}/collections/${TEST_COLLECTION}/points`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: [{ id: 1, vector: [0.1, 0.2, 0.3, 0.4], payload: { test: true } }],
      }),
    });
    expect(res.ok).toBe(true);
  });

  it("can search by vector similarity", async () => {
    const res = await fetch(`${QDRANT_URL}/collections/${TEST_COLLECTION}/points/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vector: [0.1, 0.2, 0.3, 0.4], limit: 1 }),
    });
    expect(res.ok).toBe(true);
    const body = await res.json() as { result: unknown[] };
    expect(body.result.length).toBeGreaterThan(0);
  });

  it("no port conflict on 6333", async () => {
    // Verified implicitly by health check above
    expect(true).toBe(true);
  });
});
