const crisisPatterns = [/suicide|self harm|domestic violence|unsafe tonight|no shelter tonight|medical emergency/i];
const blockedPatterns = [/forge|lie on application|hide income|fake document|bypass verification/i];

export function classifySafety(profile) {
  const text = JSON.stringify(profile || {});
  const crisis = crisisPatterns.find((pattern) => pattern.test(text));
  if (crisis) {
    return {
      level: "crisis",
      reason: "Potential immediate safety need detected. Escalate to local emergency or crisis services.",
      matchedPolicy: String(crisis)
    };
  }
  const blocked = blockedPatterns.find((pattern) => pattern.test(text));
  if (blocked) {
    return {
      level: "blocked",
      reason: "Request appears to involve fraud or bypassing verification. The agent cannot assist with that.",
      matchedPolicy: String(blocked)
    };
  }
  return { level: "standard", reason: "No crisis or fraud pattern detected.", matchedPolicy: null };
}

export function validateToolOutput(tool, output) {
  if (tool === "profile.normalize") return Boolean(output?.householdSize && output?.needs?.length);
  if (tool === "policy.retrieve") return Array.isArray(output) && output.length > 0;
  if (tool === "eligibility.screen") return Array.isArray(output?.programs);
  if (tool === "document.checklist") return Array.isArray(output?.documents);
  if (tool === "handoff.compose") return Boolean(output?.summary && output?.disclaimer);
  return false;
}
