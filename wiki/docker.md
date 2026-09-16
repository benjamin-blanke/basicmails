# Docker

Status: Draft

Short description
Docker build and run instructions for BasicMails.

Overview
- Summary: Dockerfile and runtime flags
- Audience: Operators
- Related: /wiki/deployment.md

Getting started
1. Build the image

Examples / Commands
```bash
docker build -t basicmails:local .
docker run -e BASICMAILS_API_KEY=xxx -p 3000:3000 basicmails:local
```

Notes / Tips
- Mount volumes for storage in dev

Contributors
- your-name
