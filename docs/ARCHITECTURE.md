# Benefits Navigator Agent Architecture

Benefits Navigator Agent is designed for social workers and nonprofit intake teams that need fast, auditable benefit-navigation support without pretending to make final eligibility decisions.

## Agent Loop

```text
resident profile
  -> safety classifier
  -> profile normalization
  -> policy retrieval
  -> non-final eligibility screen
  -> document checklist
  -> social-worker handoff
  -> trace persistence
```

## Core Modules

| Path | Responsibility |
| --- | --- |
| `server/agent/policies.js` | Crisis escalation and fraud/bypass guardrails |
| `server/agent/knowledge.js` | Local benefits guidance knowledge base |
| `server/agent/tools.js` | Tool contracts for screening, checklist, handoff |
| `server/agent/loop.js` | Agent state machine and output validation |
| `eval/scenarios.test.js` | Regression scenarios for normal, crisis, and blocked runs |
| `src/App.jsx` | Social-worker console and trace inspection |

## Practical Deployment Path

- Add local policy PDFs through a RAG ingestion pipeline.
- Use `OPENAI_API_KEY` and `OPENAI_BASE_URL` for optional language generation.
- Store resident sessions in MySQL through `MYSQL_URL`.
- Queue follow-up jobs through Redis using `REDIS_URL`.
- Keep application submission as a separate human-approved workflow.

## Safety Boundaries

- Not legal, medical, or final eligibility advice.
- Crisis-like profiles are escalated rather than treated as routine screens.
- Fraud or verification-bypass requests stop before tools run.
- No external applications are submitted by the agent.
