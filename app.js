const page = document.querySelector('#page');
const wordCount = document.querySelector('#wordCount');
const stats = document.querySelector('#stats');
const canvas = document.querySelector('#graphicsBoard');
const ctx = canvas.getContext('2d');
let currentShape = 'rect';
let shapes = [];

const runCommand = (command, value = null) => {
  document.execCommand(command, false, value);
  page.focus();
  updateStats();
};

document.querySelectorAll('[data-command]').forEach((button) => {
  button.addEventListener('click', () => runCommand(button.dataset.command));
});

document.querySelector('#blockStyle').addEventListener('change', (event) => runCommand('formatBlock', event.target.value));
document.querySelector('#fontFamily').addEventListener('change', (event) => runCommand('fontName', event.target.value));
document.querySelector('#fontSize').addEventListener('change', (event) => runCommand('fontSize', Math.max(1, Math.min(7, Math.round(event.target.value / 10)))));
document.querySelector('#foreColor').addEventListener('input', (event) => runCommand('foreColor', event.target.value));
document.querySelector('#hiliteColor').addEventListener('input', (event) => runCommand('hiliteColor', event.target.value));
document.querySelector('#themePicker').addEventListener('change', (event) => document.body.dataset.theme = event.target.value);
document.querySelector('#toggleFocus').addEventListener('click', () => document.body.classList.toggle('focus'));

const snippets = {
  heading: '<h2>New section heading</h2><p>Add your ideas here...</p>',
  callout: '<div class="callout"><strong>Decision:</strong> Capture the key takeaway, owner, and next action.</div>',
  table: '<table><tr><th>Owner</th><th>Task</th><th>Status</th></tr><tr><td>Design</td><td>Brand system</td><td>In progress</td></tr><tr><td>Growth</td><td>Launch copy</td><td>Review</td></tr></table>',
  checklist: '<ul><li>☐ Research references</li><li>☐ Draft content</li><li>☐ Share for approval</li></ul>',
  divider: '<hr />',
  sticker: '<p><span class="sticker">Big idea ✨</span></p>'
};

document.querySelectorAll('[data-insert]').forEach((button) => {
  button.addEventListener('click', () => runCommand('insertHTML', snippets[button.dataset.insert]));
});

const updateStats = () => {
  const text = page.innerText.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const chars = text.length;
  const read = Math.max(1, Math.ceil(words / 225));
  wordCount.textContent = `${words} words`;
  stats.textContent = `${words} words · ${chars} characters · ${read} min read · Autosaved locally`;
  localStorage.setItem('codeEditDoc', page.innerHTML);
  localStorage.setItem('codeEditTitle', document.querySelector('#documentTitle').value);
};

page.addEventListener('input', updateStats);
document.querySelector('#documentTitle').addEventListener('input', updateStats);

const savedDoc = localStorage.getItem('codeEditDoc');
const savedTitle = localStorage.getItem('codeEditTitle');
if (savedDoc) page.innerHTML = savedDoc;
if (savedTitle) document.querySelector('#documentTitle').value = savedTitle;
updateStats();

document.querySelector('#exportHtml').addEventListener('click', async () => {
  const title = document.querySelector('#documentTitle').value || 'Code.edit document';
  const stylesheet = await fetch('styles.css').then((response) => response.text()).catch(() => 'body{font-family:system-ui,sans-serif}.page{max-width:900px;margin:auto;padding:48px}');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${stylesheet}</style></head><body><main class="page">${page.innerHTML}</main></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'document'}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelectorAll('[data-shape]').forEach((button) => {
  button.addEventListener('click', () => currentShape = button.dataset.shape);
});

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach(({ type, x, y, color }) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    if (type === 'circle') { ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.fill(); }
    if (type === 'rect') ctx.fillRect(x - 36, y - 24, 72, 48);
    if (type === 'note') { ctx.fillStyle = '#fde68a'; ctx.fillRect(x - 42, y - 30, 84, 60); ctx.fillStyle = '#78350f'; ctx.font = 'bold 14px sans-serif'; ctx.fillText('Note', x - 18, y + 5); }
    if (type === 'arrow') { ctx.beginPath(); ctx.moveTo(x - 42, y + 24); ctx.lineTo(x + 42, y - 24); ctx.lineTo(x + 24, y - 24); ctx.moveTo(x + 42, y - 24); ctx.lineTo(x + 36, y - 4); ctx.stroke(); }
  });
};

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  shapes.push({ type: currentShape, x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY, color: getComputedStyle(document.body).getPropertyValue('--accent').trim() });
  draw();
});

document.querySelector('#clearBoard').addEventListener('click', () => { shapes = []; draw(); });
draw();
