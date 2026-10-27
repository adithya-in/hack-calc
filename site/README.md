# hack-calc Website

Brutalist/minimal product site for hack-calc.

## Local Development

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Can deploy to GitHub Pages, Netlify, Vercel, etc.

For GitHub Pages from repo root, serve `/site` or copy to `docs/`.

## Update Payment Link

When Razorpay KYC clears, update the "Buy Kit" buttons to point to your Razorpay Payment Link:

```html
<a href="https://rzp.io/l/YOUR-LINK" class="btn btn--primary">Get Kit →</a>
```

Replace in `index.html`: nav CTA, hero CTA, buy section.
