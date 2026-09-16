# BasicMails

![Release](https://img.shields.io/github/v/release/benjamin-blanke/basicmails?label=release)
![License](https://img.shields.io/github/license/benjamin-blanke/basicmails)
![Language](https://img.shields.io/github/languages/top/benjamin-blanke/basicmails)
![Stars](https://img.shields.io/github/stars/benjamin-blanke/basicmails?style=social)
![Issues](https://img.shields.io/github/issues/benjamin-blanke/basicmails)

A modern, simple, and reliable email provider built for everyday communication. Fast, secure, and privacy-first — designed for both personal and professional use.

---

## Table of Contents
- [Why BasicMails](#why-basicmails)
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Development](#development)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Contact](#contact)

---

## Why BasicMails
BasicMails focuses on the essentials: deliverability, privacy, and a clean user experience. We aim to be the email service you trust for everyday messaging without the bloat.

## Features
- ✅ Lightweight, TypeScript-first codebase
- 🔒 End-to-end privacy considerations
- ⚡ Fast delivery and reliable queuing
- 📧 Clean APIs for sending and receiving
- ♻️ Extensible: plugins for storage, spam filtering, metrics

## Quick Start

Clone the repo and install dependencies:

```bash
git clone https://github.com/benjamin-blanke/basicmails.git
cd basicmails
npm install
```

Run locally (development):

```bash
npm run dev
# or
pnpm dev
```

Build for production:

```bash
npm run build
npm start
```

Example: sending an email via the programmatic API

```ts
import { BasicMailsClient } from 'basicmails'

const client = new BasicMailsClient({ apiKey: process.env.BASICMAILS_API_KEY })
await client.send({
  to: 'friend@example.com',
  from: 'you@basicmails.local',
  subject: 'Hello from BasicMails',
  text: 'This is a quick test email.'
})
```

## Configuration
Create a `.env` file at the project root with the following variables (example):

```
BASICMAILS_SMTP_HOST=smtp.example.com
BASICMAILS_SMTP_PORT=587
BASICMAILS_SMTP_USER=username
BASICMAILS_SMTP_PASS=secret
BASICMAILS_API_KEY=your_api_key_here
```

See /docs or the `config` directory for advanced options (storage backends, rate limits, DKIM/DMARC settings).

## Development
- Code style: Prettier + ESLint
- Tests: Jest (or vitest if configured)
- Run tests: `npm test`
- CI: Add a GitHub Actions workflow to run tests and lint on pushes & PRs

Recommended branches: `main` for stable releases, feature branches for work.

## Contributing
Contributions are welcome! Please:
1. Fork the repo and create a feature branch.
2. Open a PR with a clear description and tests where applicable.
3. Ensure linting and tests pass.

See CONTRIBUTING.md for details and the code of conduct.

## Security
If you discover a security vulnerability, please open a confidential issue or contact the maintainer directly. Do not disclose vulnerabilities in public issues.

## License
This project is available under the LICENSE in this repository.

---

## Contact
Built with care by the BasicMails team — https://github.com/benjamin-blanke

If you'd like a hosted demo, deployment help, or CI setup, open an issue or drop a PR.

---
