# Basic Mails — Coming soon

A lightweight, responsive coming-soon page with a soft purple/pink accent, subtle entrance animation, and an illustrative inbox preview. All website files live in `website/`; no root-level application files or dependencies are required.

## Preview locally

From the repository directory, run:

```sh
python3 -m http.server 8080 --directory website
```

Open http://localhost:8080. You can also open `website/index.html` directly in a browser.

## Deploy

Serve `website/` as the static document root. No install or build command is needed. For a host that asks for a project root or output directory, select `website`.

## Files

- `index.html`: page content and metadata
- `styles.css`: responsive styles and reduced-motion support
- `favicon.svg`: local brand favicon

The page does not load external fonts, use analytics, collect email addresses, or require JavaScript. GitHub links point to this repository. The inbox is explicitly labeled as a design preview, not a working mail client. No launch date, pricing, or unconfirmed technical features are promised.
