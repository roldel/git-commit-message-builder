const form = document.getElementById('commitForm');
const output = document.getElementById('output');
const breakingChange = document.getElementById('breakingChange');
const breakingDetailContainer = document.getElementById('breakingDetailContainer');
const resetBtn = document.getElementById('resetBtn');

// Show/hide breaking detail field
function updateBreakingDetailVisibility() {
  breakingDetailContainer.style.display = breakingChange.checked ? 'block' : 'none';
}
breakingChange.addEventListener('change', updateBreakingDetailVisibility);

// Build the message from current inputs
function buildMessage() {
  const type = document.getElementById('type').value;
  const scopeRaw = document.getElementById('scope').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const body = document.getElementById('body').value.trim();
  const footer = document.getElementById('footer').value.trim();
  const isBreaking = breakingChange.checked;
  const breakingDetail = document.getElementById('breakingDetail')?.value?.trim?.() || '';

  const hasContent = type || scopeRaw || subject || body || footer || isBreaking;
  
  if (!hasContent) {
    output.textContent = '(Start typing or select a type to generate...)';
    output.style.color = 'var(--muted)';
    return;
  }
  output.style.color = 'var(--text)';

  // Build Header
  let header = '';
  if (type) header += type;
  if (scopeRaw) header += `(${scopeRaw})`;
  if (isBreaking) header += '!';
  
  if (type || (subject && !type)) {
    header += ': ';
  }
  
  if (subject) header += subject;

  let fullMessage = header;

  if (body) fullMessage += `\n\n${body}`;

  const fullFooter = [];
  if (isBreaking) {
    fullFooter.push(`BREAKING CHANGE: ${breakingDetail || '<explain what changed>'}`);
  }
  if (footer) fullFooter.push(footer);

  if (fullFooter.length > 0) {
    fullMessage += `\n\n${fullFooter.join('\n')}`;
  }

  output.textContent = fullMessage;
}

// Debounce helper
function debounce(fn, ms = 50) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

const updatePreview = debounce(() => {
  updateBreakingDetailVisibility();
  buildMessage();
}, 10); 

// Reset logic
resetBtn.addEventListener('click', () => {
  form.reset();
  updateBreakingDetailVisibility();
  buildMessage();
});

// Wire up live updates
const inputs = ['type', 'scope', 'subject', 'body', 'footer', 'breakingDetail'];
inputs.forEach(id => {
  const el = document.getElementById(id);
  if(el) el.addEventListener('input', updatePreview);
  if(el && el.tagName === 'SELECT') el.addEventListener('change', updatePreview);
});

breakingChange.addEventListener('change', updatePreview);

// Copy button logic
function copyToClipboard() {
  const text = output.textContent;
  // Don't copy placeholder text
  if (text.startsWith('(Start typing')) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.copy-btn');
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = original), 1500);
  });
}
// Expose copy function globally so HTML onclick works
window.copyToClipboard = copyToClipboard;

// Theme toggle logic
const toggleBtn = document.getElementById('themeToggle');

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (e) {}
  updateToggleUI(theme);
}

function updateToggleUI(theme) {
  const isDark = theme === 'dark';
  toggleBtn.setAttribute('aria-pressed', String(isDark));
  toggleBtn.querySelector('.icon').textContent = isDark ? '🌙' : '☀️';
  toggleBtn.querySelector('.label').textContent = isDark ? 'Dark' : 'Light';
}

toggleBtn.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

// Init
updateToggleUI(currentTheme());
updateBreakingDetailVisibility();
buildMessage();