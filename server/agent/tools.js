import { retrievePrograms } from "./knowledge.js";

export const toolCatalog = [
  { name: "profile.normalize", permission: "read", description: "Normalize resident intake into structured needs and constraints." },
  { name: "policy.retrieve", permission: "read", description: "Retrieve local benefit program guidance from a curated knowledge base." },
  { name: "eligibility.screen", permission: "advisory", description: "Generate a non-final screening result for likely program fit." },
  { name: "document.checklist", permission: "advisory", description: "Create a document checklist and missing information list." },
  { name: "handoff.compose", permission: "write-dry-run", description: "Draft a social-worker handoff without submitting applications." }
];

export async function runTool(tool, input, state) {
  if (tool === "profile.normalize") return normalizeProfile(input.profile);
  if (tool === "policy.retrieve") return retrievePrograms(state.normalizedProfile);
  if (tool === "eligibility.screen") return screenEligibility(state);
  if (tool === "document.checklist") return buildChecklist(state);
  if (tool === "handoff.compose") return composeHandoff(state);
  throw new Error(`Unknown tool: ${tool}`);
}

function normalizeProfile(profile = {}) {
  const needs = Array.isArray(profile.needs)
    ? profile.needs.filter(Boolean)
    : String(profile.needs || "").split(",").map((item) => item.trim()).filter(Boolean);
  return {
    householdSize: Math.max(1, Number(profile.householdSize) || 1),
    incomeMonthly: Math.max(0, Number(profile.incomeMonthly) || 0),
    zipCode: String(profile.zipCode || "").slice(0, 10),
    language: String(profile.language || "English"),
    urgency: String(profile.urgency || "standard"),
    needs,
    notes: String(profile.notes || "").slice(0, 1000)
  };
}

function screenEligibility(state) {
  const programs = state.programs.map((program) => ({
    id: program.id,
    name: program.name,
    category: program.category,
    fit: program.score >= 2 ? "strong" : "possible",
    reason: program.notes
  }));
  return {
    programs,
    caveat: "This is a navigation screen, not a final eligibility decision."
  };
}

function buildChecklist(state) {
  const documents = [...new Set(state.programs.flatMap((program) => program.documents))];
  const missingInfo = [];
  if (!state.normalizedProfile.zipCode) missingInfo.push("ZIP code");
  if (!state.normalizedProfile.incomeMonthly) missingInfo.push("Monthly income estimate");
  return { documents, missingInfo };
}

function composeHandoff(state) {
  const screen = state.observations.find((item) => item.tool === "eligibility.screen")?.output;
  const checklist = state.observations.find((item) => item.tool === "document.checklist")?.output;
  return {
    summary: `Screened ${state.normalizedProfile.needs.join(", ")} needs for a household of ${state.normalizedProfile.householdSize}.`,
    priority: state.safety.level === "crisis" ? "crisis-escalation" : state.normalizedProfile.urgency,
    likelyPrograms: screen?.programs || [],
    documents: checklist?.documents || [],
    missingInfo: checklist?.missingInfo || [],
    nextSteps: [
      "Confirm resident consent before collecting documents.",
      "Verify local program rules and deadlines with an official source.",
      "Schedule a follow-up checkpoint and record outcome."
    ],
    disclaimer: "Navigation support only. This is not legal, medical, or final eligibility advice.",
    externalSubmissionPerformed: false
  };
}
