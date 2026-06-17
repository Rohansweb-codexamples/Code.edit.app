const defaultSite = {
  siteName: 'Studio Portfolio',
  theme: 'indigo',
  header: 'split',
  activePage: 'home',
  buttonLink: 'https://example.com',
  pages: [
    {
      id: 'home',
      title: 'Home',
      content: `
        <section class="site-section site-hero">
          <div>
            <p class="eyebrow">Build without code</p>
            <h1>Launch a polished website today.</h1>
            <p>Create pages, add sections, edit text directly, preview your site, and publish a shareable link that stores everything in the URL.</p>
            <a class="site-button" href="https://example.com">Start a project</a>
          </div>
          <div class="hero-card"></div>
        </section>
        <section class="site-section">
          <h2>What you can make</h2>
          <div class="card-grid">
            <article class="card"><h3>Landing pages</h3><p>Present your idea with a strong hero, proof points, and clear next steps.</p></article>
            <article class="card"><h3>Portfolios</h3><p>Showcase projects, services, galleries, and contact information.</p></article>
            <article class="card"><h3>Team hubs</h3><p>Publish resources that work in any modern browser from one link.</p></article>
          </div>
        </section>`
    }
  ]
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const state = clone(defaultSite);

const elements = {
  siteName: document.querySelector('#siteName'),
  themeSelect: document.querySelector('#themeSelect'),
  headerStyle: document.querySelector('#headerStyle'),
  pageList: document.querySelector('#pageList'),
  currentPageSelect: document.querySelector('#currentPageSelect'),
  pageTitle: document.querySelector('#pageTitle'),
  buttonLink: document.querySelector('#buttonLink'),
  canvas: document.querySelector('#canvas'),
  previewFrame: document.querySelector('#previewFrame'),
  dialog: document.querySelector('#publishDialog'),
  publishedUrl: document.querySelector('#publishedUrl')
};

const normalizeState = () => {
  if (!Array.isArray(state.pages) || state.pages.length === 0) {
    state.pages = clone(defaultSite.pages);
  }

  state.pages = state.pages.map((item, index) => ({
    id: item.id || `page-${index + 1}`,
    title: item.title || `Page ${index + 1}`,
    content: item.content || '<section class="site-section"><h2>Untitled page</h2><p>Start editing this page.</p></section>'
  }));

  if (!state.pages.some((item) => item.id === state.activePage)) {
    state.activePage = state.pages[0].id;
  }

  state.siteName = state.siteName || defaultSite.siteName;
  state.theme = state.theme || defaultSite.theme;
  state.header = state.header || defaultSite.header;
  state.buttonLink = state.buttonLink || defaultSite.buttonLink;
};

const page = () => {
  normalizeState();
  return state.pages.find((item) => item.id === state.activePage) || state.pages[0];
};
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'page';
const encodeSite = () => btoa(unescape(encodeURIComponent(JSON.stringify(state))));
const decodeSite = (value) => JSON.parse(decodeURIComponent(escape(atob(value))));

const loadFromHash = () => {
  const hash = window.location.hash.replace(/^#site=/, '');
  if (!hash || hash === window.location.hash) return;
  try {
    const loaded = decodeSite(hash);
    Object.assign(state, loaded);
    normalizeState();
  } catch (error) {
    console.warn('Could not load published site data.', error);
  }
};

const sectionTemplates = {
  text: '<section class="site-section"><h2>New text section</h2><p>Write a clear message for your visitors. This area is editable and will appear in the live preview.</p></section>',
  feature: '<section class="site-section"><h2>Feature cards</h2><div class="card-grid"><article class="card"><h3>Fast editing</h3><p>Change text directly on the canvas.</p></article><article class="card"><h3>Share links</h3><p>Publish without cookies or accounts.</p></article><article class="card"><h3>Exportable</h3><p>Download a complete HTML file.</p></article></div></section>',
  gallery: '<section class="site-section"><h2>Gallery</h2><div class="gallery-grid"><div class="gallery-item">Image block</div><div class="gallery-item">Image block</div><div class="gallery-item">Image block</div></div></section>',
  cta: '<section class="site-section"><h2>Ready to begin?</h2><p>Add a persuasive message and link visitors to the next step.</p><a class="site-button" href="https://example.com">Contact us</a></section>',
  contact: '<section class="site-section"><h2>Contact</h2><form class="contact-form"><input placeholder="Name"><input placeholder="Email"><textarea placeholder="Message"></textarea><button type="button">Send message</button></form></section>',
  embed: '<section class="site-section"><h2>Embed box</h2><div class="embed-box">Paste embed content or describe the external resource here.</div></section>'
};

const buildSiteHtml = (singlePageOnly = false) => {
  const navLinks = state.pages.map((item) => `<a href="#${item.id}">${item.title}</a>`).join('');
  const pages = (singlePageOnly ? [page()] : state.pages).map((item) => `<main id="${item.id}" class="published-page"><div class="published-page-inner">${item.content}</div></main>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${state.siteName}</title>
<style>${publishedStyles()}</style>
</head>
<body data-theme="${state.theme}" data-header="${state.header}">
<header class="published-header"><strong>${state.siteName}</strong><nav>${navLinks}</nav></header>
${pages}
<script>document.querySelectorAll('a[href^="#"]').forEach(function(link){link.addEventListener('click',function(){document.querySelectorAll('.published-page').forEach(function(page){page.style.display='none'});var target=document.querySelector(link.getAttribute('href'));if(target)target.style.display='block';});});document.querySelectorAll('.published-page').forEach(function(page,index){page.style.display=index===0?'block':'none'});<\/script>
</body>
</html>`;
};

const publishedStyles = () => `
:root{--site-bg:#ffffff;--site-text:#111827;--site-muted:#5b6472;--site-card:#f8fafc;--site-accent:#4f46e5}body[data-theme=forest]{--site-accent:#047857;--site-card:#ecfdf5}body[data-theme=minimal]{--site-accent:#92400e;--site-card:#fffbeb}body[data-theme=slate]{--site-accent:#334155;--site-card:#f1f5f9}*{box-sizing:border-box}body{margin:0;background:var(--site-bg);color:var(--site-text);font-family:Inter,system-ui,sans-serif}.published-header{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;gap:20px;align-items:center;padding:18px 7vw;background:rgba(255,255,255,.9);border-bottom:1px solid #e5e7eb;backdrop-filter:blur(14px)}nav{display:flex;flex-wrap:wrap;gap:14px}nav a{color:var(--site-accent);font-weight:800;text-decoration:none}.published-page-inner{max-width:1120px;margin:0 auto;padding:42px 24px}.site-section{margin:24px 0;padding:24px;border-radius:20px}.site-hero{display:grid;grid-template-columns:1.2fr .8fr;gap:28px;align-items:center;padding:44px;border-radius:28px;background:linear-gradient(135deg,var(--site-accent),#06b6d4);color:#fff}body[data-header=centered] .site-hero{display:block;text-align:center}body[data-header=compact] .site-hero{display:block;padding:30px}.site-hero h1{margin:0 0 14px;font-size:clamp(34px,6vw,64px);line-height:.98}.site-section p{line-height:1.7}.eyebrow{margin:0 0 3px;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.site-button{display:inline-flex;margin-top:16px;padding:13px 18px;border-radius:999px;background:#fff;color:var(--site-accent);text-decoration:none;font-weight:900}.hero-card{min-height:220px;border-radius:24px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3)}.card-grid,.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.card,.gallery-item,.contact-form,.embed-box{padding:20px;border-radius:20px;background:var(--site-card);border:1px solid rgba(100,116,139,.22)}.gallery-item{min-height:140px;display:grid;place-items:center;color:var(--site-muted)}.contact-form{display:grid;gap:12px}.contact-form input,.contact-form textarea{width:100%;padding:12px;border:1px solid #dbe4f0;border-radius:12px}@media(max-width:760px){.published-header,.site-hero,.card-grid,.gallery-grid{display:block}.published-header nav{margin-top:10px}}`;

const renderPages = () => {
  elements.pageList.innerHTML = '';
  elements.currentPageSelect.innerHTML = '';
  state.pages.forEach((item) => {
    const button = document.createElement('button');
    button.className = `page-tab${item.id === state.activePage ? ' is-active' : ''}`;
    button.type = 'button';
    button.textContent = item.title;
    button.addEventListener('click', () => selectPage(item.id));
    elements.pageList.appendChild(button);

    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.title;
    option.selected = item.id === state.activePage;
    elements.currentPageSelect.appendChild(option);
  });
};

const renderEditor = () => {
  normalizeState();
  const active = page();
  document.body.dataset.theme = state.theme;
  document.body.dataset.header = state.header;
  elements.siteName.value = state.siteName;
  elements.themeSelect.value = state.theme;
  elements.headerStyle.value = state.header;
  renderPages();
  elements.currentPageSelect.value = active.id;
  elements.pageTitle.value = active.title;
  elements.buttonLink.value = state.buttonLink;
  elements.canvas.innerHTML = active.content;
  renderPreview();
};

const renderPreview = () => {
  page().content = elements.canvas.innerHTML;
  elements.previewFrame.srcdoc = buildSiteHtml();
};

const selectPage = (id) => {
  page().content = elements.canvas.innerHTML;
  state.activePage = id;
  renderEditor();
};

const addPage = () => {
  const title = `Page ${state.pages.length + 1}`;
  const id = `${slugify(title)}-${Date.now().toString(36)}`;
  page().content = elements.canvas.innerHTML;
  state.pages.push({
    id,
    title,
    content: '<section class="site-section site-hero"><div><p class="eyebrow">New page</p><h1>Start building this page.</h1><p>Add sections from the insert panel and edit this copy directly.</p><a class="site-button" href="https://example.com">Primary action</a></div><div class="hero-card"></div></section>'
  });
  state.activePage = id;
  renderEditor();
};

const publish = () => {
  page().content = elements.canvas.innerHTML;
  const url = `${window.location.origin}${window.location.pathname}#site=${encodeSite()}`;
  window.history.replaceState(null, '', `#site=${encodeSite()}`);
  elements.publishedUrl.value = url;
  elements.dialog.showModal();
};

const download = () => {
  page().content = elements.canvas.innerHTML;
  const blob = new Blob([buildSiteHtml()], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(state.siteName)}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const insertSection = (type) => {
  document.execCommand('insertHTML', false, sectionTemplates[type]);
  renderPreview();
};

document.querySelector('#addPageButton').addEventListener('click', addPage);
document.querySelector('#previewButton').addEventListener('click', renderPreview);
document.querySelector('#publishButton').addEventListener('click', publish);
document.querySelector('#downloadButton').addEventListener('click', download);
document.querySelector('#copyLinkButton').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(elements.publishedUrl.value);
  } catch (error) {
    elements.publishedUrl.select();
    document.execCommand('copy');
  }
});
document.querySelector('#openPublishedButton').addEventListener('click', () => window.open(elements.publishedUrl.value, '_blank', 'noopener'));
elements.siteName.addEventListener('input', () => { state.siteName = elements.siteName.value; renderPreview(); });
elements.themeSelect.addEventListener('change', () => { state.theme = elements.themeSelect.value; renderEditor(); });
elements.headerStyle.addEventListener('change', () => { state.header = elements.headerStyle.value; renderEditor(); });
elements.currentPageSelect.addEventListener('change', () => selectPage(elements.currentPageSelect.value));
elements.pageTitle.addEventListener('input', () => { page().title = elements.pageTitle.value; renderPages(); renderPreview(); });
elements.buttonLink.addEventListener('input', () => { state.buttonLink = elements.buttonLink.value; elements.canvas.querySelectorAll('.site-button').forEach((link) => link.href = state.buttonLink); renderPreview(); });
elements.canvas.addEventListener('input', renderPreview);
document.querySelectorAll('[data-section]').forEach((button) => button.addEventListener('click', () => insertSection(button.dataset.section)));

normalizeState();
loadFromHash();
renderEditor();
