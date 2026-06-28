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

export function assessSupportIntensity(profile, safety) {
  const text = JSON.stringify(profile || {});
  const householdSize = Number(profile?.householdSize || 1);
  const incomeMonthly = Number(profile?.incomeMonthly || 0);
  const needs = Array.isArray(profile?.needs) ? profile.needs : [];

  let score = 20;
  score += Math.min(20, householdSize * 3);
  score += Math.min(25, needs.length * 8);
  if (incomeMonthly > 0 && incomeMonthly < 1500) score += 15;
  if (/eviction|shelter|unsafe|medical|medication|childcare|disabled/i.test(text)) score += 18;
  if (safety?.level === "crisis") score += 25;
  if (safety?.level === "blocked") score = 0;

  const bounded = Math.max(0, Math.min(100, score));
  return {
    score: bounded,
    tier: bounded >= 80 ? "critical" : bounded >= 60 ? "high-touch" : bounded >= 40 ? "guided" : "standard"
  };
}
