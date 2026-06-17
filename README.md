# Code.edit.app

A browser-native website builder inspired by Google Sites. It lets you create pages, insert website sections, edit content directly, switch themes, preview the site, publish a shareable URL, and download a complete HTML file.

## No-cookie publishing

The publish action stores the current site data in the URL hash instead of cookies, accounts, or a server database. Any modern browser can open the generated link and reconstruct the site from that URL.

## Run locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4173/index.html>.
