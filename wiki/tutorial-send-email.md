# Tutorial: Send Email

Status: Draft

Short description
Step-by-step tutorial: send an email using BasicMails.

Overview
- Summary: Using API or CLI to send a message
- Audience: Users
- Related: /wiki/usage.md

Getting started
1. Start local server
2. Use API or CLI

Examples / Commands
```bash
curl -X POST http://localhost:3000/api/send -d '{"to":"friend@example.com","subject":"Hi","text":"Hello"}'
```

Notes / Tips
- Check delivery logs

Contributors
- your-name
