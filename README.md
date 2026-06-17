# Code.edit.app

A browser-native website builder inspired by Google Sites. It provides one large editable website canvas, advanced block insertion, page management, font controls, theme controls, local device saving, viewer-only publishing, and standalone HTML export.

## Local storage saving

Draft websites are saved in the browser local storage on the current device. Published viewer snapshots are stored locally, and published viewer links include a read-only snapshot fallback so opening the link shows the public viewer without editor controls.

## Public website export

For a site that is public on the world wide web, use **Download public HTML** and upload the generated file to a static host such as GitHub Pages, Netlify, Vercel, or any standard web server. The app has no backend, so it cannot make a worldwide public database-backed link by itself.

## Run locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4173/index.html>.
