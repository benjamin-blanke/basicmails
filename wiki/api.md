# API

Status: Draft

Short description
Programmatic API reference and examples.

Overview
- Summary: Endpoints and auth
- Audience: Developers
- Related: /wiki/api-reference.md

Getting started
1. Obtain an API key
2. Call POST /send

Examples / Commands
```bash
curl -X POST -H "Authorization: Bearer $BASICMAILS_API_KEY" \
  -d '{"to":"you@example.com","subject":"Hi","text":"Hello"}' \
  http://localhost:3000/api/send
```

Notes / Tips
- Use SDKs for easier integration

Contributors
- your-name
