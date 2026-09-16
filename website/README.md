# Basic Mails website

Next.js App Router + TypeScript + React + Motion. All source lives in `website/`.

## Run

Requires Node.js 20.9 or newer.

```sh
cd website
npm install
npm run dev
```

## Validate and build

```sh
npm run typecheck
npm run build
npm start
```

## Routes

- `/`: animated coming-soon home, interactive inbox, feature principles
- `/experience`: larger interactive mail preview
- `/about`: project philosophy
- `/updates`: build notes and animated FAQ
- `/sitemap.xml`, `/robots.txt`: search engine metadata

## Interactive preview

Search sample mail (press `/` while focused inside the preview), filter unread messages, star/unstar, archive/restore, mark read/unread, reset the demo, and compose or edit a demo draft. Native dialogs handle keyboard focus and Escape. On mobile, opening a message switches to the reading pane with a back button. Demo state is memory-only and resets on refresh or route navigation. No messages are sent, no accounts are created, and no waitlist data is collected.

Light/dark theme preference is stored locally. Motion respects reduced-motion preferences. All mail content is fictional. The actual mail service has not launched.

## Vercel

Import the repository with **Root Directory: `website`** and **Framework: Next.js**. The included `vercel.json` sets the install/build commands. Direct connector deployments upload the contents of this folder. Automatic GitHub deployment requires linking the repository in Vercel.

No environment variables are required. Geist is optimized with `next/font`. The site origin is configured in `src/lib/site.ts`.

## Structure

`src/app` owns routes and metadata, `src/components` contains reusable UI and interactive components, `src/lib` holds site configuration and sample content, `src/styles` contains the inbox and route styles, and `public` contains the favicon.
