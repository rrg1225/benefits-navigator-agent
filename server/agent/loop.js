import { randomUUID } from "node:crypto";
import { classifySafety, validateToolOutput } from "./policies.js";
import { runTool } from "./tools.js";

export async function runNavigator(profile, options = {}) {
  const state = {
    runId: `run_${Date.now()}_${randomUUID().slice(0, 8)}`,
    startedAt: new Date().toISOString(),
    mode: options.mode || process.env.AGENT_MODE || "dry-run",
    profile,
    safety: classifySafety(profile),
    normalizedProfile: null,
    programs: [],
    observations: [],
    trace: []
  };

  state.trace.push(event(1, "observe", { safety: state.safety }));
  if (state.safety.level === "blocked") return finish(state, "blocked", state.safety.reason);

  const sequence = ["profile.normalize", "policy.retrieve", "eligibility.screen", "document.checklist", "handoff.compose"];
  for (let index = 0; index < sequence.length; index += 1) {
    const tool = sequence[index];
    state.trace.push(event(index + 2, "decide", { tool }));
    const output = await runTool(tool, { profile }, state);
    if (tool === "profile.normalize") state.normalizedProfile = output;
    if (tool === "policy.retrieve") state.programs = output;
    const observation = { tool, output };
    state.observations.push(observation);
    state.trace.push(event(index + 2, "act", { observation }));
    const ok = validateToolOutput(tool, output);
    state.trace.push(event(index + 2, "validate", { tool, ok }));
    if (!ok) return finish(state, "failed", `Tool output failed validation: ${tool}`);
  }

  return finish(state, state.safety.level === "crisis" ? "crisis-escalation" : "completed", "navigation_handoff_ready");
}

function finish(state, status, reason) {
  state.status = status;
  state.completedAt = new Date().toISOString();
  const handoff = state.observations.find((item) => item.tool === "handoff.compose")?.output;
  state.final = {
    status,
    reason,
    safety: state.safety,
    quality: {
      groundedPrograms: state.programs.length,
      dryRunOnly: state.mode === "dry-run",
      externalSubmissions: state.observations.filter((item) => item.output?.externalSubmissionPerformed).length,
      validatedTools: state.trace.filter((item) => item.phase === "validate" && item.ok).length
    },
    handoff
  };
  return state;
}

function event(step, phase, payload) {
  return { step, phase, at: new Date().toISOString(), ...payload };
}
