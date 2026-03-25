/**
 * T0 — Docker Platform Test
 * Verifies Docker is running and required containers are healthy.
 * Run: npm run test:platform
 */
import { describe, it, expect } from "vitest";
import { execSync } from "child_process";

function dockerExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (e: unknown) {
    throw new Error(`Docker command failed: ${cmd}\n${(e as Error).message}`);
  }
}

describe("T0 — Docker Platform", () => {
  it("docker daemon is running", () => {
    const output = dockerExec("docker info --format '{{.ServerVersion}}'");
    expect(output).toBeTruthy();
  });

  it("boardroom-postgres container is running", () => {
    const status = dockerExec(
      "docker inspect --format='{{.State.Status}}' boardroom-postgres 2>/dev/null || echo 'not found'"
    );
    expect(status, "boardroom-postgres not running — run: docker compose up -d").toBe("running");
  });

  it("boardroom-postgres container is healthy", () => {
    const health = dockerExec(
      "docker inspect --format='{{.State.Health.Status}}' boardroom-postgres 2>/dev/null || echo 'unknown'"
    );
    expect(health, "boardroom-postgres unhealthy").toBe("healthy");
  });

  it("boardroom-qdrant container is running", () => {
    const status = dockerExec(
      "docker inspect --format='{{.State.Status}}' boardroom-qdrant 2>/dev/null || echo 'not found'"
    );
    expect(status, "boardroom-qdrant not running — run: docker compose up -d").toBe("running");
  });

  it("boardroom-qdrant container is healthy", () => {
    const health = dockerExec(
      "docker inspect --format='{{.State.Health.Status}}' boardroom-qdrant 2>/dev/null || echo 'unknown'"
    );
    expect(health, "boardroom-qdrant unhealthy").toBe("healthy");
  });
});
