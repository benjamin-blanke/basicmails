<div align="center">

# BasicMails

### Email, without the noise.

A calmer, more considered inbox experience — designed around clarity, privacy, and the belief that email should feel simple again.

[**Visit basicmails.com →**](https://basicmails.com)

<br />

[![Website](https://img.shields.io/badge/website-basicmails.com-111111?style=for-the-badge&logo=vercel&logoColor=white)](https://basicmails.com)
[![Built with Next.js](https://img.shields.io/badge/built%20with-Next.js-111111?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-first-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

<br />

> **The world is loud enough. Your inbox doesn't have to be.**

BasicMails is a modern email concept and interactive product experience for everyday communication. The current repository contains the product website, an interactive mailbox preview, a protected demo, and the launch infrastructure around it.

## The idea

Most inboxes compete for your attention. BasicMails takes the opposite approach:

- **Quiet by default** — less visual noise, fewer distractions.
- **Clear by design** — the important things should be obvious.
- **Privacy at the core** — thoughtful defaults and careful handling of sensitive data.
- **Made for real life** — a familiar experience without unnecessary complexity.

## Explore the experience

The website is a dark, responsive Next.js experience with motion that respects reduced-motion preferences. Try the interactive mailbox preview to:

- search sample messages;
- filter unread mail;
- star, archive, restore, and mark messages read or unread;
- compose and edit a demo draft; and
- explore the larger mail experience at `/experience`.

> All messages in the public preview are fictional. The actual mail service has not launched yet.

### Routes

| Route | What you'll find |
| --- | --- |
| `/` | Landing page, product principles, and interactive inbox preview |
| `/experience` | A larger interactive mailbox experience |
| `/about` | The philosophy behind BasicMails |
| `/updates` | Build notes and animated FAQ |
| `/team` | The people behind the project |
| `/waitlist` | Launch waiting list |
| `/roadmap` | What is coming next |
| `/demo` | Protected mailbox demo |

## Run it locally

The product website lives in [`website/`](./website) and requires **Node.js 22.x**.

```bash
git clone https://github.com/benjamin-blanke/basicmails.git
cd basicmails/website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring.

### Validate and build

```bash
npm run typecheck
npm run build
npm start
```

To run the demo authentication test:

```bash
node --experimental-strip-types --test tests/demo-auth.test.mjs
```

## Project map

```text
basicmails/
├── website/
│   ├── src/app/          # Routes, metadata, and server entry points
│   ├── src/components/   # Reusable UI and interactive experiences
│   ├── src/lib/          # Site configuration and sample content
│   ├── src/styles/       # Inbox and route styling
│   ├── tests/            # Focused validation tests
│   └── vercel.json       # Website build configuration
├── CONTRIBUTING.md
├── SECURITY.md
├── SUPPORT.md
└── README.md
```

## Deploy the website

The website is configured for Vercel:

1. Import this repository into Vercel.
2. Set the project **Root Directory** to `website`.
3. Select **Next.js** as the framework.
4. Deploy.

The included [`website/vercel.json`](./website/vercel.json) defines the install and build commands. Marketing pages work without environment variables. The protected demo and launch waiting list require the server-only variables documented in [`website/README.md`](./website/README.md).

## Contributing

Have a thoughtful improvement? Contributions are welcome.

1. Fork the repository.
2. Create a focused branch.
3. Make the change and add tests where appropriate.
4. Run the relevant type checks and validation.
5. Open a pull request with context and screenshots for visual changes.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the project workflow and [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) for community guidelines.

## Security & support

Please do not publish vulnerabilities, secrets, or exploit details in public issues. Follow the private reporting guidance in [`SECURITY.md`](./SECURITY.md).

For questions, bugs, and product feedback, see [`SUPPORT.md`](./SUPPORT.md) or open an issue.

## Roadmap

BasicMails is being built in public. The direction is simple: make email feel calmer, more intentional, and easier to trust.

The current roadmap includes continued work on the mailbox experience, launch readiness, privacy details, and the foundations of the service behind the interface.

<div align="center">

<br />

**Simple is not less. It's focused.**

[Website](https://basicmails.com) · [Issues](https://github.com/benjamin-blanke/basicmails/issues) · [Contributing](./CONTRIBUTING.md)

</div>
