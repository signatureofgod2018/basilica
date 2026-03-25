/**
 * UC-03 — Import Transcript
 * Verifies a raw transcript can be imported and produces a valid Thread.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MockConnector } from "../helpers/mock-connector.js";
import { SAMPLE_TRANSCRIPT, MOCK_TURNS } from "../fixtures/index.js";
import { setupTestDatabase, clearTestDatabase, teardownTestDatabase } from "../helpers/test-db.js";

describe("UC-03 — Import Transcript", () => {
  let connector: MockConnector;

  beforeAll(async () => {
    await setupTestDatabase();
    connector = new MockConnector();
  });

  afterAll(() => teardownTestDatabase());
  beforeEach(() => clearTestDatabase());

  it("import() parses transcript into correct number of turns", async () => {
    const thread = await connector.import(SAMPLE_TRANSCRIPT, { platform: "claude" });
    const expectedTurns = SAMPLE_TRANSCRIPT.trim().split("\n").filter(Boolean).length;
    expect(thread.turns.length).toBe(expectedTurns);
  });

  it("turns alternate correctly between user and assistant roles", async () => {
    const thread = await connector.import(SAMPLE_TRANSCRIPT, { platform: "claude" });
    thread.turns.forEach((turn, i) => {
      expect(turn.role).toBe(i % 2 === 0 ? "user" : "assistant");
    });
  });

  it("thread is created with correct platform metadata", async () => {
    const thread = await connector.import(SAMPLE_TRANSCRIPT, {
      platform: "claude",
      instanceName: "Acuitas",
    });
    expect(thread.instanceName).toBe("Acuitas");
    expect(thread.slug).toContain("Acuitas");
  });

  it("all turns are persisted to PostgreSQL in correct order", async () => {
    // TODO: after PostgresStore is implemented, assert turn_index ordering
    expect(true).toBe(true); // placeholder
  });

  it("thread is indexed in Qdrant after import", async () => {
    // TODO: after QdrantStore is implemented, assert collection contains thread ID
    expect(true).toBe(true); // placeholder
  });

  it("provenance chain has one record per turn", async () => {
    // TODO: assert provenance_records count = turn count
    expect(true).toBe(true); // placeholder
  });

  it("import with no instanceName still creates valid thread", async () => {
    const thread = await connector.import("hello\nhi there", { platform: "copilot" });
    expect(thread.id).toBeTruthy();
    expect(thread.status).toBe("active");
  });
});
