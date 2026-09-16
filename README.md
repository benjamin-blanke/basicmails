# BasicMails

![Release](https://img.shields.io/github/v/release/benjamin-blanke/basicmails?label=release)
![License](https://img.shields.io/github/license/benjamin-blanke/basicmails)
![Language](https://img.shields.io/github/languages/top/benjamin-blanke/basicmails)
![Stars](https://img.shields.io/github/stars/benjamin-blanke/basicmails?style=social)
![Issues](https://img.shields.io/github/issues/benjamin-blanke/basicmails)

██████╗  █████╗ ███████╗███████╗ ██████╗██╗██╗     ███████╗
██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝██║██║     ██╔════╝
██████╔╝███████║█████╗  ███████╗██║     ██║██║     █████╗  
██╔══██╗██╔══██║██╔══╝  ╚════██║██║     ██║██║     ██╔══╝  
██║  ██║██║  ██║███████╗███████║╚██████╗██║███████╗███████╗
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝╚═╝╚══════╝╚══════╝

A modern, simple, and reliable email provider built for everyday communication. Fast, secure, and privacy-first — designed for both personal and professional use.

---

## Table of Contents
- [Why BasicMails](#why-basicmails)
- [Features](#features)
- [ASCII vibe](#ascii-vibe)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
  - [Programmatic API (TypeScript)](#programmatic-api-typescript)
  - [CLI (local dev)](#cli-local-dev)
- [Configuration](#configuration)
- [Architecture & Design](#architecture--design)
- [Deployment](#deployment)
- [Testing & CI](#testing--ci)
- [Observability & Metrics](#observability--metrics)
- [Security & Privacy](#security--privacy)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact & Support](#contact--support)
- [Acknowledgements](#acknowledgements)

---

## Why BasicMails
Email doesn't need to be complicated. BasicMails strips the cruft while keeping the important stuff: reliable delivery, privacy-first defaults, and a pleasant developer experience. It’s built to be easy to run, extend, and integrate.

## Features
- ✅ TypeScript-first, easy to read and extend
- 🔒 Privacy-minded defaults and secure storage options
- ⚡ High-throughput delivery with simple queuing
- 📧 REST + programmatic client APIs for send/receive
- ♻️ Plugin system for storage, spam rules, and integrations
- 📬 SMTP-compatible endpoints for legacy interoperability
- 🧪 Test harness and local dev CLI to simulate mail flows

## ASCII vibe
Because README art matters. Here’s a little mailbox:

      .----------------.
      |  ______  ____  |
      | / ____ \|  _ \ |
      || |    | | |_) )|
      || |    | |  __/ |
      || |____| | |    |
      | \______/|_|    |
      '----------------'
           \   ^__^
            \  (oo)\_______
               (__)\       )\/\
                   ||----w |
                   ||     ||

---

## Quick Start

Clone, install, and run a dev instance:

```bash
git clone https://github.com/benjamin-blanke/basicmails.git
cd basicmails
npm install
npm run dev
# or with pnpm
pnpm install
pnpm dev
```

Open http://localhost:3000 (or whatever dev port is printed) and use the local web UI or CLI to enqueue test messages.

## Usage Examples

### Programmatic API (TypeScript)
```ts
import { BasicMailsClient } from 'basicmails'

const client = new BasicMailsClient({
  apiKey: process.env.BASICMAILS_API_KEY,
  baseUrl: process.env.BASICMAILS_API_URL || 'http://localhost:3000'
})

await client.send({
  to: 'friend@example.com',
  from: 'you@basicmails.local',
  subject: 'Hello from BasicMails',
  text: 'This is a quick test email.'
})
```

### CLI (local dev)
Send a test email via the local CLI tool:
```bash
# from project root
npx basicmails send --to friend@example.com --subject "Test" --text "Hello from CLI"
```

## Configuration

Create a `.env` at the project root with the basics (example):

```
BASICMAILS_SMTP_HOST=smtp.example.com
BASICMAILS_SMTP_PORT=587
BASICMAILS_SMTP_USER=username
BASICMAILS_SMTP_PASS=secret
BASICMAILS_API_KEY=your_api_key_here
BASICMAILS_DKIM_PRIVATE_KEY_PATH=/etc/dkim/private.key
BASICMAILS_DKIM_SELECTOR=basicmail
```

Advanced options live in `/config/*` and can be swapped via environment or runtime config providers.

## Architecture & Design

- Core services
  - API service (REST + internal RPC)
  - Delivery worker pool (SMTP adapters)
  - Storage abstraction (in-memory / filesystem / S3)
  - Plugin manager (filters, spam rules, transforms)
- Design goals
  - Small surface area — keep the core minimal
  - Extensible via plugins and adapters
  - Observable and testable

Diagram (conceptual):

[API] <--> [Queue] <--> [Delivery Workers] <--> [SMTP/Provider]
                 |
                 +--> [Storage: messages, logs]
                 +--> [Plugins: DKIM, spam, routing]

## Deployment

- Containerized: Dockerfile included
- Kubernetes: Example manifests under `/deploy/k8s`
- Environment deployments: use secrets for API keys and DKIM private keys
- Rolling updates: leverage healthchecks and readiness probes to avoid data loss

Example Docker run:
```bash
docker build -t basicmails:latest .
docker run -e BASICMAILS_API_KEY=xxx -p 3000:3000 basicmails:latest
```

## Testing & CI

- Unit tests: Jest or vitest (src/*.test.ts)
- Integration: lightweight harness spins up an ephemeral SMTP endpoint
- Suggested GitHub Actions:
  - lint + typecheck on pull_request
  - tests + build on push to main
  - release action to publish a release artifact

## Observability & Metrics

- Expose Prometheus metrics at /metrics
- Request logs + delivery timing and success/failure counters
- Optional integration: Sentry for error grouping

## Security & Privacy

- Keep DKIM private keys in a secrets manager, never committed to the repo
- Default to privacy-preserving logging (truncate PII in logs)
- Encourage TLS-only SMTP connections
- If you discover a vulnerability: open a confidential issue or email the maintainer — do not post secrets or exploit details publicly.

## Contributing

We love contributions! Suggested workflow:

1. Fork the repo and create a feature branch (`feature/awesome-mail`)
2. Add tests for new behavior
3. Open a PR with a clear description and link to any relevant issues
4. CI will run lint, types, and tests; maintainers will review

Pull request checklist:
- [ ] Tests added or updated
- [ ] Linting passes
- [ ] Types checked (tsc)

If you want a template, see `.github/PULL_REQUEST_TEMPLATE.md` (coming soon — PRs to add are welcome).

## Roadmap (short-term)
- [ ] First-class plugin SDK
- [ ] Hosted demo instance + deployment guide
- [ ] DKIM management tooling
- [ ] Better admin UI and message inspection features

## Advanced Topics

- DKIM/DMARC: BasicMails provides hooks to sign outbound messages with DKIM; ensure DNS TXT records match your selector.
- Backpressure: delivery workers back off and persist messages for retries.
- Storage: switch between local, S3, or a DB-backed store with a config toggle.

## License
This project is available under the LICENSE in this repository.

## Contact & Support
Built with care by the BasicMails team — https://github.com/benjamin-blanke

For hosting, enterprise features, or security questions, open an issue or reach out via the contact listed on the profile.

## Acknowledgements
Thanks to maintainers and contributors who keep this project simple, secure, and fast.

---
