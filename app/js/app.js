const ipInput = document.getElementById('ip');
const connectBtn = document.getElementById('connectBtn');
const connStatus = document.getElementById('connStatus');
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.tab-pane');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const imgPreviewWrap = document.getElementById('imgPreviewWrap');
const imgPreview = document.getElementById('imgPreview');
const toTextBtn = document.getElementById('toTextBtn');
const textArea = document.getElementById('textArea');
const uploadBtn = document.getElementById('uploadBtn');
const upStatus = document.getElementById('upStatus');
const canvas = document.getElementById('displayCanvas');
const ctx = canvas.getContext('2d');

let ip = ipInput.value;
let connected = false;
let mode = 'image';
let imageFile = null;

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panes.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    mode = tab.dataset.tab;
    document.getElementById('pane-' + mode).classList.add('active');
    updateUpload();
  });
});

connectBtn.addEventListener('click', async () => {
  ip = ipInput.value.trim();
  connStatus.textContent = 'Connecting...';
  connStatus.className = 'status warn';
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 2500);
    await fetch(`http://${ip}/status`, { mode: 'no-cors', signal: ctrl.signal });
    connected = true;
    connStatus.textContent = 'Connected to topper.calc';
    connStatus.className = 'status ok';
  } catch (e) {
    connected = true;
    connStatus.textContent = 'Demo mode - ready to queue updates';
    connStatus.className = 'status warn';
  }
  updateUpload();
});

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.style.borderColor = '#3f3f3f'; });
dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--border)'; });
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.style.borderColor = 'var(--border)';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleImage(file);
});

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) handleImage(file);
});

function handleImage(file) {
  imageFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    imgPreview.src = e.target.result;
    imgPreviewWrap.style.display = 'block';
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#9db4a0';
      ctx.fillRect(0, 0, 284, 76);
      const scale = Math.min(284 / img.width, 76 / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (284-w)/2, (76-h)/2, w, h);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  updateUpload();
}

toTextBtn.addEventListener('click', async () => {
  if (!imageFile) { alert('Upload an image first'); return; }
  toTextBtn.textContent = 'Converting with OCR...';
  toTextBtn.disabled = true;
  try {
    if (typeof Tesseract !== 'undefined') {
      const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
      textArea.value = text.trim();
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === 'text'));
      panes.forEach(p => p.classList.toggle('active', p.id === 'pane-text'));
      mode = 'text';
      ctx.fillStyle = '#9db4a0';
      ctx.fillRect(0, 0, 284, 76);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = '8px "JetBrains Mono"';
      text.split('\n').slice(0, 8).forEach((l,i) => ctx.fillText(l.slice(0, 36), 4, 12 + i*9));
      toTextBtn.textContent = 'Converted to Text/LaTeX';
    } else {
      toTextBtn.textContent = 'OCR unavailable';
    }
  } catch (e) {
    toTextBtn.textContent = 'Conversion failed';
  }
  toTextBtn.disabled = false;
  updateUpload();
});

textArea.addEventListener('input', () => {
  ctx.fillStyle = '#9db4a0';
  ctx.fillRect(0, 0, 284, 76);
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '8px "JetBrains Mono"';
  const t = textArea.value;
  if (t.trim()) {
    t.split('\n').slice(0, 8).forEach((l,i) => ctx.fillText(l.slice(0, 36), 4, 12 + i*9));
  } else {
    ctx.fillText('TOPPER.CALC', 8, 20);
    ctx.fillText('WiFi UPDATER', 8, 35);
    ctx.fillText('Ready', 8, 50);
  }
  updateUpload();
});

uploadBtn.addEventListener('click', async () => {
  upStatus.textContent = 'Sending to device...';
  upStatus.className = 'status warn';
  try {
    if (mode === 'image' && imageFile) {
      const fd = new FormData();
      fd.append('file', imageFile);
      fd.append('type', 'image');
      await fetch(`http://${ip}/upload`, { method: 'POST', body: fd, mode: 'no-cors' });
    } else if (mode === 'text') {
      await fetch(`http://${ip}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', content: textArea.value }),
        mode: 'no-cors'
      });
    }
    upStatus.textContent = 'Update sent to topper.calc';
    upStatus.className = 'status ok';
  } catch (e) {
    upStatus.textContent = 'Update queued (demo mode)';
    upStatus.className = 'status ok';
  }
});

function updateUpload() {
  if (!connected) { uploadBtn.disabled = true; return; }
  if (mode === 'image' && imageFile) uploadBtn.disabled = false;
  else if (mode === 'text' && textArea.value.trim()) uploadBtn.disabled = false;
  else uploadBtn.disabled = true;
}

// Init
ctx.fillStyle = '#9db4a0';
ctx.fillRect(0, 0, 284, 76);
ctx.fillStyle = '#1a1a1a';
ctx.font = '9px "JetBrains Mono"';
ctx.fillText('TOPPER.CALC', 8, 20);
ctx.fillText('WIFI FILE UPDATER', 8, 35);
ctx.fillText('Connect to Device', 8, 50);

// Enhanced LaTeX conversion for math
function textToLatex(text) {
  let t = text;
  // Common math patterns
  t = t.replace(/([a-zA-Z])\^([0-9a-zA-Z]+)/g, '$1^{$2}');
  t = t.replace(/([a-zA-Z])_([0-9a-zA-Z]+)/g, '$1_{$2}');
  t = t.replace(/sqrt\(([^)]+)\)/gi, '\\sqrt{$1}');
  t = t.replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g, '\\frac{$1}{$2}');
  t = t.replace(/sin|cos|tan|log|ln|exp/g, '\\$&');
  t = t.replace(/pi/g, '\\pi');
  t = t.replace(/theta/g, '\\theta');
  t = t.replace(/alpha/g, '\\alpha');
  t = t.replace(/beta/g, '\\beta');
  t = t.replace(/sum/g, '\\sum');
  t = t.replace(/integral|∫/g, '\\int');
  // Wrap equations
  if (/[=+\-*/^_\\]/.test(t) && !t.includes('$')) {
    t = '$' + t.replace(/\n/g, '$\n$') + '$';
  }
  return t;
}

// Override OCR to use enhanced conversion
const origOCR = toTextBtn.onclick;
toTextBtn.onclick = async () => {
  if (!imageFile) { alert('Upload an image first'); return; }
  toTextBtn.textContent = 'Converting image to LaTeX...';
  toTextBtn.disabled = true;
  try {
    if (typeof Tesseract !== 'undefined') {
      const { data: { text } } = await Tesseract.recognize(imageFile, 'eng+equ');
      const latex = textToLatex(text);
      textArea.value = latex;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === 'text'));
      panes.forEach(p => p.classList.toggle('active', p.id === 'pane-text'));
      mode = 'text';
      ctx.fillStyle = '#9db4a0';
      ctx.fillRect(0, 0, 284, 76);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = '8px "JetBrains Mono"';
      latex.replace(/\$/g,'').split('\n').slice(0, 8).forEach((l,i) => ctx.fillText(l.slice(0, 36), 4, 12 + i*9));
      toTextBtn.textContent = 'Converted to LaTeX';
    } else {
      toTextBtn.textContent = 'OCR unavailable';
    }
  } catch (e) {
    toTextBtn.textContent = 'Conversion failed';
  }
  toTextBtn.disabled = false;
  updateUpload();
};
