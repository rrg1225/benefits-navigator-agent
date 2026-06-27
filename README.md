# Benefits Navigator Agent

[![CI](https://github.com/rrg1225/benefits-navigator-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/rrg1225/benefits-navigator-agent/actions/workflows/ci.yml)
![AI Agent](https://img.shields.io/badge/AI%20Agent-Public%20Benefits-264653)
![Civic Tech](https://img.shields.io/badge/Civic%20Tech-Social%20Services-2A9D8F)
![Guardrails](https://img.shields.io/badge/Guardrails-Crisis%20%26%20Fraud%20Checks-B42318)
![License](https://img.shields.io/badge/License-MIT-green)

Benefits Navigator Agent is an AI-agent-style workspace for public benefits navigation. It helps social workers and nonprofit teams screen resident needs, retrieve relevant program guidance, create document checklists, and produce auditable handoffs without making final eligibility decisions.

## Social Pain Point

Residents often need food, healthcare, housing, childcare, or emergency shelter support, but the path is fragmented across agencies, documents, deadlines, and local rules. Case workers lose time repeating intake and residents miss benefits because next steps are unclear. This project turns an intake profile into a grounded navigation handoff.

## Features

- Agent loop with safety classification, tool execution, validation, and trace persistence.
- Program retrieval for food assistance, healthcare, housing stabilization, and childcare support.
- Crisis escalation for unsafe-night, self-harm, domestic violence, or medical emergency language.
- Fraud/bypass guardrail for fake documents or hidden-income requests.
- Document checklist and missing-information detection.
- React social-worker console with trace inspection.
- Scenario eval suite covering normal, crisis, and blocked runs.
- Optional path for OpenAI-compatible APIs, MySQL persistence, and Redis follow-up queues.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API defaults to `http://localhost:4520`.

## Scripts

```bash
npm test
npm run eval
npm run build
npm run start
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service health and provider mode |
| `GET` | `/api/tools` | Agent tool catalog |
| `GET` | `/api/metrics/runtime` | Runtime counters |
| `POST` | `/api/runs` | Run benefits navigation and persist trace |

## Quality Gates

- `npm test` covers normal navigation, crisis escalation, fraud blocking, and dry-run guarantees.
- `npm run eval` replays scenario regressions.
- GitHub Actions runs tests and build on pull requests and `main`.
- Architecture notes live in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## License

MIT
