const STORAGE_KEY = 'codeEditSitesProject';
const PUBLISHED_KEY = 'codeEditPublishedSites';

const defaultSite = {
  siteName: 'Studio Portfolio',
  theme: 'indigo',
  font: 'Inter, system-ui, sans-serif',
  header: 'split',
  activePage: 'home',
  buttonLink: 'https://example.com',
  accentColor: '#4f46e5',
  backgroundColor: '#ffffff',
  pages: [
    {
      id: 'home',
      title: 'Home',
      content: `
        <section class="site-section site-hero">
          <div>
            <p class="eyebrow">Build without code</p>
            <h1>Launch a polished website today.</h1>
            <p>Create pages, add sections, edit text directly, save automatically on this device, preview in a viewer, and export a public HTML website.</p>
            <a class="site-button" href="https://example.com">Start a project</a>
          </div>
          <div class="hero-card"><h3>Live site block</h3><p>Replace this card with your best proof, image notes, or offer.</p></div>
        </section>
        <section class="site-section">
          <h2>What you can make</h2>
          <div class="card-grid">
            <article class="card"><h3>Landing pages</h3><p>Present your idea with a strong hero, proof points, and clear next steps.</p></article>
            <article class="card"><h3>Portfolios</h3><p>Showcase projects, services, galleries, and contact information.</p></article>
            <article class="card"><h3>Team hubs</h3><p>Publish resources that work as a standalone website.</p></article>
          </div>
        </section>`
    }
  ]
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const state = clone(defaultSite);

const elements = {
  builderApp: document.querySelector('#builderApp'),
  publicView: document.querySelector('#publicView'),
  siteName: document.querySelector('#siteName'),
  themeSelect: document.querySelector('#themeSelect'),
  fontSelect: document.querySelector('#fontSelect'),
  headerStyle: document.querySelector('#headerStyle'),
  accentColor: document.querySelector('#accentColor'),
  backgroundColor: document.querySelector('#backgroundColor'),
  pageList: document.querySelector('#pageList'),
  currentPageSelect: document.querySelector('#currentPageSelect'),
  pageTitle: document.querySelector('#pageTitle'),
  buttonLink: document.querySelector('#buttonLink'),
  canvas: document.querySelector('#canvas'),
  previewDialog: document.querySelector('#previewDialog'),
  previewFrame: document.querySelector('#previewFrame'),
  publishDialog: document.querySelector('#publishDialog'),
  publishedUrl: document.querySelector('#publishedUrl'),
  deleteSectionButton: document.querySelector('#deleteSectionButton'),
  placementStatus: document.querySelector('#placementStatus')
};

let pendingSectionType = null;
let selectedSection = null;

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'site';
const encodeSite = (site) => btoa(unescape(encodeURIComponent(JSON.stringify(site))));
const decodeSite = (value) => JSON.parse(decodeURIComponent(escape(atob(value))));
const publishedStore = () => JSON.parse(localStorage.getItem(PUBLISHED_KEY) || '{}');
const savePublishedStore = (store) => localStorage.setItem(PUBLISHED_KEY, JSON.stringify(store));

const cleanEditorHtml = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('.is-selected').forEach((node) => node.classList.remove('is-selected'));
  return template.innerHTML;
};

const normalizeState = () => {
  if (!Array.isArray(state.pages) || state.pages.length === 0) state.pages = clone(defaultSite.pages);
  state.pages = state.pages.map((item, index) => ({
    id: item.id || `page-${index + 1}`,
    title: item.title || `Page ${index + 1}`,
    content: item.content || '<section class="site-section"><h2>Untitled page</h2><p>Start editing this page.</p></section>'
  }));
  if (!state.pages.some((item) => item.id === state.activePage)) state.activePage = state.pages[0].id;
  state.siteName = state.siteName || defaultSite.siteName;
  state.theme = state.theme || defaultSite.theme;
  state.font = state.font || defaultSite.font;
  state.header = state.header || defaultSite.header;
  state.buttonLink = state.buttonLink || defaultSite.buttonLink;
  state.accentColor = state.accentColor || defaultSite.accentColor;
  state.backgroundColor = state.backgroundColor || defaultSite.backgroundColor;
};

const page = () => {
  normalizeState();
  return state.pages.find((item) => item.id === state.activePage) || state.pages[0];
};

const saveProject = () => {
  page().content = cleanEditorHtml(elements.canvas.innerHTML);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadProject = () => {
  try {
    Object.assign(state, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
  } catch (error) {
    console.warn('Could not load local project.', error);
  }
  normalizeState();
};

const sectionTemplates = {
  text: '<section class="site-section"><h2>New text section</h2><p>Write a clear message for your visitors. This area is editable and saved in local storage on this device.</p></section>',
  feature: '<section class="site-section"><h2>Feature cards</h2><div class="card-grid"><article class="card"><h3>Fast editing</h3><p>Change text directly on the canvas.</p></article><article class="card"><h3>Device saving</h3><p>Drafts are stored in browser local storage.</p></article><article class="card"><h3>Public export</h3><p>Download a complete HTML file for hosting.</p></article></div></section>',
  gallery: '<section class="site-section"><h2>Gallery</h2><div class="gallery-grid"><div class="gallery-item">Image block</div><div class="gallery-item">Image block</div><div class="gallery-item">Image block</div></div></section>',
  pricing: '<section class="site-section"><h2>Pricing</h2><div class="card-grid"><article class="card"><h3>Starter</h3><p>For simple pages and portfolios.</p><strong>$9</strong></article><article class="card"><h3>Growth</h3><p>For launches and small teams.</p><strong>$29</strong></article><article class="card"><h3>Studio</h3><p>For advanced public sites.</p><strong>$99</strong></article></div></section>',
  faq: '<section class="site-section"><h2>Frequently asked questions</h2><details open><summary>Can I edit this?</summary><p>Yes. Select the text on the canvas and type.</p></details><details><summary>How do I publish?</summary><p>Use the viewer for a local read-only page or download HTML for a real public host.</p></details></section>',
  cta: '<section class="site-section"><h2>Ready to begin?</h2><p>Add a persuasive message and link visitors to the next step.</p><a class="site-button" href="https://example.com">Contact us</a></section>',
  contact: '<section class="site-section"><h2>Contact</h2><form class="contact-form"><input placeholder="Name"><input placeholder="Email"><textarea placeholder="Message"></textarea><button type="button">Send message</button></form></section>',
  embed: '<section class="site-section"><h2>Embed box</h2><div class="embed-box">Paste embed content or describe the external resource here.</div></section>'
};

const publishedStyles = () => `
:root{--site-bg:${state.backgroundColor};--site-text:#111827;--site-muted:#5b6472;--site-card:#f8fafc;--site-accent:${state.accentColor};--site-font:${state.font}}body[data-theme=forest]{--site-card:#ecfdf5}body[data-theme=minimal]{--site-card:#fffbeb}body[data-theme=slate]{--site-card:#f1f5f9}body[data-theme=rose]{--site-card:#fff1f2}*{box-sizing:border-box}body{margin:0;background:var(--site-bg);color:var(--site-text);font-family:var(--site-font)}.published-header{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;gap:20px;align-items:center;padding:18px 7vw;background:rgba(255,255,255,.92);border-bottom:1px solid #e5e7eb;backdrop-filter:blur(14px)}nav{display:flex;flex-wrap:wrap;gap:14px}nav a{color:var(--site-accent);font-weight:800;text-decoration:none}.published-page-inner{max-width:1120px;margin:0 auto;padding:42px 24px}.site-section{margin:24px 0;padding:24px;border-radius:20px}.site-hero{display:grid;grid-template-columns:1.2fr .8fr;gap:28px;align-items:center;padding:44px;border-radius:28px;background:linear-gradient(135deg,var(--site-accent),#06b6d4);color:#fff}body[data-header=centered] .site-hero{display:block;text-align:center}body[data-header=compact] .site-hero{display:block;padding:30px}.site-hero h1{margin:0 0 14px;font-size:clamp(34px,6vw,64px);line-height:.98}.site-section p{line-height:1.7}.eyebrow{margin:0 0 3px;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.site-button{display:inline-flex;margin-top:16px;padding:13px 18px;border-radius:999px;background:#fff;color:var(--site-accent);text-decoration:none;font-weight:900}.hero-card{min-height:220px;border-radius:24px;padding:24px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3)}.card-grid,.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.card,.gallery-item,.contact-form,.embed-box{padding:20px;border-radius:20px;background:var(--site-card);border:1px solid rgba(100,116,139,.22)}.gallery-item{min-height:140px;display:grid;place-items:center;color:var(--site-muted)}.contact-form{display:grid;gap:12px}.contact-form input,.contact-form textarea{width:100%;padding:12px;border:1px solid #dbe4f0;border-radius:12px}details{padding:16px 0;border-bottom:1px solid #e5e7eb}summary{cursor:pointer;font-weight:900}@media(max-width:760px){.published-header,.site-hero,.card-grid,.gallery-grid{display:block}.published-header nav{margin-top:10px}}`;

const buildSiteHtml = () => {
  const navLinks = state.pages.map((item) => `<a href="#${item.id}">${item.title}</a>`).join('');
  const pages = state.pages.map((item) => `<main id="${item.id}" class="published-page"><div class="published-page-inner">${item.content}</div></main>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${state.siteName}</title><style>${publishedStyles()}</style></head><body data-theme="${state.theme}" data-header="${state.header}"><header class="published-header"><strong>${state.siteName}</strong><nav>${navLinks}</nav></header>${pages}<script>function showPage(id){document.querySelectorAll('.published-page').forEach(function(page){page.style.display='none'});var target=document.querySelector(id);if(target)target.style.display='block'}document.querySelectorAll('a[href^="#"]').forEach(function(link){link.addEventListener('click',function(event){event.preventDefault();showPage(link.getAttribute('href'));history.replaceState(null,'',link.getAttribute('href'))})});showPage(location.hash||'#${state.pages[0].id}');<\/script></body></html>`;
};

const applyDesign = () => {
  document.body.dataset.theme = state.theme;
  document.body.dataset.header = state.header;
  document.documentElement.style.setProperty('--site-accent', state.accentColor);
  document.documentElement.style.setProperty('--site-bg', state.backgroundColor);
  document.documentElement.style.setProperty('--site-font', state.font);
};

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
  applyDesign();
  elements.siteName.value = state.siteName;
  elements.themeSelect.value = state.theme;
  elements.fontSelect.value = state.font;
  elements.headerStyle.value = state.header;
  elements.accentColor.value = state.accentColor;
  elements.backgroundColor.value = state.backgroundColor;
  renderPages();
  elements.currentPageSelect.value = active.id;
  elements.pageTitle.value = active.title;
  elements.buttonLink.value = state.buttonLink;
  selectedSection = null;
  pendingSectionType = null;
  elements.canvas.classList.remove('is-placing');
  elements.placementStatus.textContent = 'Select text to edit, or choose a block then click the page to place it.';
  elements.canvas.innerHTML = active.content;
};

const selectPage = (id) => {
  saveProject();
  state.activePage = id;
  renderEditor();
};

const addPage = () => {
  saveProject();
  const title = `Page ${state.pages.length + 1}`;
  const id = `${slugify(title)}-${Date.now().toString(36)}`;
  state.pages.push({
    id,
    title,
    content: '<section class="site-section site-hero"><div><p class="eyebrow">New page</p><h1>Start building this page.</h1><p>Add sections from the insert panel and edit this copy directly.</p><a class="site-button" href="https://example.com">Primary action</a></div><div class="hero-card"><h3>Content card</h3><p>Add details here.</p></div></section>'
  });
  state.activePage = id;
  renderEditor();
  saveProject();
};

const setPendingSection = (type) => {
  pendingSectionType = type;
  elements.canvas.classList.add('is-placing');
  elements.placementStatus.textContent = `${type} block selected. Click the page to place it.`;
};

const selectSection = (section) => {
  if (selectedSection) selectedSection.classList.remove('is-selected');
  selectedSection = section;
  if (selectedSection) {
    selectedSection.classList.add('is-selected');
    elements.placementStatus.textContent = 'Section selected. Edit text directly or delete the selected section.';
  }
};

const placeSection = (event) => {
  if (!pendingSectionType) return false;
  event.preventDefault();
  const html = sectionTemplates[pendingSectionType];
  const targetSection = event.target.closest('.site-section');
  if (targetSection && elements.canvas.contains(targetSection)) {
    targetSection.insertAdjacentHTML('afterend', html);
  } else {
    elements.canvas.insertAdjacentHTML('beforeend', html);
  }
  pendingSectionType = null;
  elements.canvas.classList.remove('is-placing');
  elements.placementStatus.textContent = 'Block placed. Click another block to insert more, or edit text directly.';
  saveProject();
  return true;
};

const deleteSelectedSection = () => {
  if (!selectedSection || !elements.canvas.contains(selectedSection)) {
    elements.placementStatus.textContent = 'Click a section on the page before deleting.';
    return;
  }
  const sectionToDelete = selectedSection;
  selectedSection = null;
  sectionToDelete.remove();
  elements.placementStatus.textContent = 'Section deleted.';
  saveProject();
};

const showPreview = () => {
  saveProject();
  elements.previewFrame.srcdoc = buildSiteHtml();
  elements.previewDialog.showModal();
};

const publish = () => {
  saveProject();
  const slug = slugify(state.siteName);
  const store = publishedStore();
  store[slug] = clone(state);
  savePublishedStore(store);
  const url = `${window.location.origin}${window.location.pathname}?view=${encodeURIComponent(slug)}#site=${encodeSite(store[slug])}`;
  elements.publishedUrl.value = url;
  elements.publishDialog.showModal();
};

const download = () => {
  saveProject();
  const blob = new Blob([buildSiteHtml()], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(state.siteName)}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const newSite = () => {
  if (!confirm('Create a new blank site on this device? This replaces the current local draft.')) return;
  Object.assign(state, clone(defaultSite));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderEditor();
};

const renderPublicViewer = (slug) => {
  let site = publishedStore()[slug];
  if (!site && window.location.hash.startsWith('#site=')) {
    try {
      site = decodeSite(window.location.hash.slice(6));
      const store = publishedStore();
      store[slug] = site;
      savePublishedStore(store);
    } catch (error) {
      console.warn('Could not load published viewer link.', error);
    }
  }
  if (!site) {
    elements.publicView.hidden = false;
    elements.builderApp.hidden = true;
    elements.publicView.innerHTML = '<main class="missing-view"><h1>Published site not found.</h1><p>This viewer link has no readable published data. Publish again or download the public HTML file and upload it to a web host.</p></main>';
    return true;
  }
  Object.assign(state, site);
  normalizeState();
  elements.publicView.hidden = false;
  elements.builderApp.hidden = true;
  elements.publicView.innerHTML = buildSiteHtml().match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
  applyDesign();
  const showPublicPage = (id) => {
    elements.publicView.querySelectorAll('.published-page').forEach((pageElement) => { pageElement.style.display = 'none'; });
    const target = elements.publicView.querySelector(id);
    if (target) target.style.display = 'block';
  };
  elements.publicView.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showPublicPage(link.getAttribute('href'));
      history.replaceState(null, '', `?view=${encodeURIComponent(slug)}${link.getAttribute('href')}`);
    });
  });
  const initialHash = window.location.hash && !window.location.hash.startsWith('#site=') ? window.location.hash : `#${state.pages[0].id}`;
  showPublicPage(initialHash);
  return true;
};

document.querySelector('#newSiteButton').addEventListener('click', newSite);
document.querySelector('#addPageButton').addEventListener('click', addPage);
document.querySelector('#previewButton').addEventListener('click', showPreview);
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
document.querySelectorAll('[data-command]').forEach((button) => button.addEventListener('click', () => { document.execCommand(button.dataset.command); saveProject(); }));
document.querySelector('#textColor').addEventListener('input', (event) => { document.execCommand('foreColor', false, event.target.value); saveProject(); });
elements.deleteSectionButton.addEventListener('click', deleteSelectedSection);
document.querySelectorAll('[data-section]').forEach((button) => button.addEventListener('click', () => setPendingSection(button.dataset.section)));
elements.canvas.addEventListener('click', (event) => {
  if (placeSection(event)) return;
  const section = event.target.closest('.site-section');
  if (section && elements.canvas.contains(section)) selectSection(section);
});
elements.siteName.addEventListener('input', () => { state.siteName = elements.siteName.value; saveProject(); });
elements.themeSelect.addEventListener('change', () => { state.theme = elements.themeSelect.value; applyDesign(); saveProject(); });
elements.fontSelect.addEventListener('change', () => { state.font = elements.fontSelect.value; applyDesign(); saveProject(); });
elements.headerStyle.addEventListener('change', () => { state.header = elements.headerStyle.value; applyDesign(); saveProject(); });
elements.accentColor.addEventListener('input', () => { state.accentColor = elements.accentColor.value; applyDesign(); saveProject(); });
elements.backgroundColor.addEventListener('input', () => { state.backgroundColor = elements.backgroundColor.value; applyDesign(); saveProject(); });
elements.currentPageSelect.addEventListener('change', () => selectPage(elements.currentPageSelect.value));
elements.pageTitle.addEventListener('input', () => { page().title = elements.pageTitle.value; renderPages(); saveProject(); });
elements.buttonLink.addEventListener('input', () => { state.buttonLink = elements.buttonLink.value; elements.canvas.querySelectorAll('.site-button').forEach((link) => link.href = state.buttonLink); saveProject(); });
elements.canvas.addEventListener('input', saveProject);

const viewSlug = new URLSearchParams(window.location.search).get('view');
if (!viewSlug || !renderPublicViewer(viewSlug)) {
  loadProject();
  renderEditor();
  saveProject();
}
