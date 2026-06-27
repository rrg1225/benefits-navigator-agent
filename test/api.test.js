import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server/index.js";

async function startServer() {
  const app = createApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

test("creates a grounded benefits navigation handoff", async (t) => {
  const { server, baseUrl } = await startServer();
  t.after(() => server.close());

  const response = await fetch(`${baseUrl}/api/runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ profile: { householdSize: 3, incomeMonthly: 1400, zipCode: "10027", needs: ["food", "childcare"] } })
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  const run = await response.json();
  assert.equal(run.status, "completed");
  assert.ok(run.final.quality.groundedPrograms >= 2);
  assert.equal(run.final.quality.externalSubmissions, 0);
  assert.match(run.final.handoff.disclaimer, /not legal/i);
});

test("escalates crisis and blocks fraud patterns", async (t) => {
  const { server, baseUrl } = await startServer();
  t.after(() => server.close());

  const crisis = await fetch(`${baseUrl}/api/runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ profile: { householdSize: 1, needs: ["shelter"], urgency: "unsafe tonight" } })
  });
  assert.equal((await crisis.json()).status, "crisis-escalation");

  const blocked = await fetch(`${baseUrl}/api/runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ profile: { householdSize: 1, needs: ["food"], notes: "fake document and hide income" } })
  });
  const body = await blocked.json();
  assert.equal(body.status, "blocked");
  assert.equal(body.observations.length, 0);
});
