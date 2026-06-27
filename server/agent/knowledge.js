export const programs = [
  {
    id: "SNAP",
    name: "Food assistance screening",
    category: "Food",
    keywords: ["food", "groceries", "hungry", "snap", "formula"],
    documents: ["Photo ID", "Proof of residence", "Household income", "Expense summary"],
    notes: "Screen for emergency food pantry referral while benefits application is pending."
  },
  {
    id: "MEDICAID",
    name: "Health coverage navigation",
    category: "Healthcare",
    keywords: ["doctor", "medication", "health", "insurance", "medical"],
    documents: ["Photo ID", "Household income", "Current insurance status", "Medication list"],
    notes: "Do not provide medical advice. Route urgent symptoms to clinical or emergency support."
  },
  {
    id: "HOUSING",
    name: "Housing stabilization",
    category: "Housing",
    keywords: ["rent", "eviction", "shelter", "utility", "homeless"],
    documents: ["Lease or shelter letter", "Eviction or shutoff notice", "Income documents", "Household roster"],
    notes: "Immediate unsafe-night situations require local crisis shelter escalation."
  },
  {
    id: "CHILDCARE",
    name: "Childcare subsidy navigation",
    category: "Childcare",
    keywords: ["child", "children", "daycare", "school", "parent"],
    documents: ["Child age verification", "Work or school schedule", "Income documents"],
    notes: "Prioritize single caregivers with work, school, or medical obligations."
  }
];

export function retrievePrograms(profile) {
  const text = JSON.stringify(profile || {}).toLowerCase();
  return programs
    .map((program) => ({
      ...program,
      score: program.keywords.filter((keyword) => text.includes(keyword)).length
    }))
    .filter((program) => program.score > 0)
    .sort((a, b) => b.score - a.score);
}
