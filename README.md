# Melted — lovemelted.com

Marketing & storefront site for **Melted**, an independent Arizona cannabis collective.
Static site: plain HTML + [Tailwind CSS](https://tailwindcss.com) (CDN) + vanilla JS. No build step.

## Live site

Hosted on GitHub Pages: https://ryanjpenney.github.io/lovemelted/

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Homepage — hero, product lineup, brand pillars, merch, story, locations |
| `product.html` | Dynamic product detail page (`product.html?id=<product>`) with image gallery + ship/dispensary chooser |
| `locations.html` | Store locator — ranks Curaleaf AZ dispensaries by distance from a ZIP |
| `merch.html` | Merch shop grid |
| `about.html` | Brand story, Join Melted (`#join`), Contact (`#contact`) |
| `faqs.html` | FAQ accordion |
| `events.html` | Events & happenings |
| `assets/melted.js` | Shared logic: injected header/footer, nav dropdown, persistent ZIP selector (localStorage), product catalog, store-locator engine |
| `assets/melted/` | Image assets |

The header (nav + ZIP selector) and footer are injected into every page from `assets/melted.js`,
so a single edit there updates the whole site. All links are relative, so the site works from any subpath.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Notes

- Dispensary addresses/phone numbers are representative placeholders tied to real city coordinates (distance ranking is accurate); swap in exact details when available.
- ZIP geocoding currently covers Arizona.
- 21+. Products contain marijuana and are available only at licensed Arizona dispensaries.
