# Md Jisan Hossain — Portfolio

Personal portfolio website for Md Jisan Hossain, Graphic Designer & Digital Marketing Specialist.

**Stack:** HTML5, CSS3, Vanilla JavaScript. No build step.

## Local development

Open with any static server. From the project root:

```bash
# Python 3
python -m http.server 5500

# or Node (if installed)
npx serve .
```

Then visit <http://localhost:5500>.

## Project structure

```
.
├── index.html
├── 404.html
├── robots.txt
├── css/style.css
├── js/
│   ├── config.js      # site-wide config (links, roles, cvUrl)
│   └── main.js        # UI wiring
└── assets/
    ├── images/        # portrait, OG placeholder, portfolio art
    ├── icons/         # favicon
    ├── fonts/         # (self-hosted web fonts, if added later)
    └── cv/            # drop the real CV PDF here
```

## Configuration

Edit [`js/config.js`](js/config.js) to update:

- `cvUrl` — once a real PDF exists (e.g. `assets/cv/md-jisan-hossain.pdf`), the Download CV button auto-enables.
- `social.*` — real Facebook / Instagram / LinkedIn / Behance URLs.
- `roles` — the hero typing animation.

## Sprint plan

- **Sprint 1 (this):** Full responsive UI across all 10 sections. No deployment.
- **Sprint 2:** Finalize interactive behavior — typing effect, portfolio lightbox, contact form provider.
- **Sprint 3:** Optimization, SEO polish, approved GitHub Pages deployment.

## Placeholders to replace

- `assets/images/portfolio/` — real portfolio artwork (eight items referenced).
- `assets/cv/` — real CV PDF.
- `assets/images/og-image-placeholder.svg` — final social share image.
- Social URLs in `js/config.js`.

## Privacy

The site intentionally excludes father's name, mother's name, religion, marital status, blood group and full residential address. These should never be added to the site, metadata or source.
