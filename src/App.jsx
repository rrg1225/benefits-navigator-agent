import { useEffect, useState } from "react";

const examples = [
  {
    label: "Food + childcare",
    profile: { householdSize: 3, incomeMonthly: 1400, zipCode: "10027", needs: ["food", "childcare"], urgency: "soon", notes: "Single parent needs groceries and daycare support." }
  },
  {
    label: "Housing crisis",
    profile: { householdSize: 2, incomeMonthly: 900, zipCode: "10031", needs: ["shelter", "rent"], urgency: "unsafe tonight", notes: "No shelter tonight after eviction." }
  },
  {
    label: "Healthcare",
    profile: { householdSize: 1, incomeMonthly: 600, zipCode: "10002", needs: ["medication", "health insurance"], urgency: "standard", notes: "Lost coverage and needs medication list reviewed." }
  }
];

export default function App() {
  const [profileText, setProfileText] = useState(JSON.stringify(examples[0].profile, null, 2));
  const [run, setRun] = useState(null);
  const [tools, setTools] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/tools").then((response) => response.json()).then(setTools).catch(() => setTools([]));
  }, []);

  async function execute(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const profile = JSON.parse(profileText);
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profile })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Run failed");
      setRun(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Public benefits navigation</p>
          <h1>Benefits Navigator Agent</h1>
          <p>Screen needs, retrieve program guidance, build document checklists, and create auditable social-worker handoffs.</p>
        </div>
        <div className="notice">Navigation support only. Not legal, medical, or final eligibility advice.</div>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="layout">
        <div className="panel">
          <h2>Resident profile</h2>
          <form onSubmit={execute} className="form">
            <textarea value={profileText} onChange={(event) => setProfileText(event.target.value)} />
            <div className="examples">
              {examples.map((example) => (
                <button type="button" className="secondary" key={example.label} onClick={() => setProfileText(JSON.stringify(example.profile, null, 2))}>
                  {example.label}
                </button>
              ))}
            </div>
            <button type="submit" disabled={loading}>{loading ? "Running..." : "Run navigator"}</button>
          </form>
        </div>
        <aside className="panel">
          <h2>Tool contracts</h2>
          <div className="tool-list">
            {tools.map((tool) => (
              <div key={tool.name}>
                <strong>{tool.name}</strong>
                <span>{tool.permission}</span>
                <p>{tool.description}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {run && (
        <section className="results">
          <div className="panel status-panel">
            <span className={`status ${run.status}`}>{run.status}</span>
            <h2>{run.final.reason}</h2>
            <div className="metrics">
              <Metric label="Intensity" value={run.final.quality.supportIntensity.tier} />
              <Metric label="Score" value={run.final.quality.supportIntensity.score} />
              <Metric label="Programs" value={run.final.quality.groundedPrograms} />
              <Metric label="Submissions" value={run.final.quality.externalSubmissions} />
              <Metric label="Validated" value={run.final.quality.validatedTools} />
            </div>
          </div>
          <div className="panel">
            <h2>Handoff</h2>
            <pre>{JSON.stringify(run.final.handoff, null, 2)}</pre>
          </div>
          <div className="panel trace">
            <h2>Audit trace</h2>
            {run.trace.map((event, index) => (
              <article key={`${event.phase}-${event.step}-${index}`}>
                <span>{event.step}</span>
                <div>
                  <strong>{event.phase}</strong>
                  <pre>{JSON.stringify(event, null, 2)}</pre>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
