// hack-calc Display Simulator
const canvas = document.getElementById('displayCanvas');
const ctx = canvas.getContext('2d');

let currentMode = 'custom';
let currentContent = null;

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
});

// Mode switching
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        document.getElementById('currentMode').textContent = 
            btn.dataset.mode === 'calculator' ? 'Calculator Layout' : 'Custom Content';
        renderDisplay();
    });
});

// Switch button
document.getElementById('switchBtn').addEventListener('click', () => {
    if (currentMode === 'calculator') {
        document.querySelectorAll('.mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === 'custom');
        });
        currentMode = 'custom';
        document.getElementById('currentMode').textContent = 'Custom Content';
        document.getElementById('switchBtn').textContent = 'Switch to Calculator';
    } else {
        document.querySelectorAll('.mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === 'calculator');
        });
        currentMode = 'calculator';
        document.getElementById('currentMode').textContent = 'Calculator Layout';
        document.getElementById('switchBtn').textContent = 'Switch to Custom';
    }
    renderDisplay();
});

// Image upload
const imageUpload = document.getElementById('imageUpload');
const imageInput = document.getElementById('imageInput');

imageUpload.addEventListener('click', () => imageInput.click());

imageUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUpload.style.borderColor = 'var(--text-tertiary)';
});

imageUpload.addEventListener('dragleave', () => {
    imageUpload.style.borderColor = 'var(--border-light)';
});

imageUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    imageUpload.style.borderColor = 'var(--border-light)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImage(file);
    }
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImage(file);
    }
});

function handleImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentContent = { type: 'image', data: img };
            document.querySelector('[data-tab="image"]').click();
            document.querySelector('[data-mode="custom"]').click();
            renderDisplay();
            updateLatexOutput(`// Image uploaded: ${file.name}\n// Converted to 284x76 grayscale\n// LaTeX representation:\n\\text{Image: ${file.name.replace(/\.[^/.]+$/, '')}}`);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

document.getElementById('processImage').addEventListener('click', () => {
    if (imageInput.files[0]) {
        handleImage(imageInput.files[0]);
    }
});

// Text processing
document.getElementById('processText').addEventListener('click', () => {
    const text = document.getElementById('textInput').value;
    if (!text.trim()) return;
    
    currentContent = { type: 'text', data: text };
    document.querySelector('[data-tab="text"]').click();
    document.querySelector('[data-mode="custom"]').click();
    renderDisplay();
    
    // Simple LaTeX conversion
    let latex = text
        .replace(/\^([a-zA-Z0-9]+)/g, '^{$1}')
        .replace(/_([a-zA-Z0-9]+)/g, '_{$1}')
        .replace(/\*\*/g, '\\textbf{')
        .replace(/\*/g, '\\textit{')
        .replace(/\n/g, '\\\\\n');
    
    updateLatexOutput(`% Processed from text input\n\\begin{aligned}\n${latex}\n\\end{aligned}`);
});

function updateLatexOutput(content) {
    document.getElementById('latexOutput').textContent = content;
}

// Render display
function renderDisplay() {
    ctx.fillStyle = currentMode === 'calculator' ? '#152228' : '#152228';
    ctx.fillRect(0, 0, 284, 76);
    
    if (currentMode === 'calculator') {
        // Draw calculator layout
        ctx.fillStyle = '#bccfc4';
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillText('DEG M STO', 8, 12);
        ctx.fillText('sin(30)+12', 8, 32);
        ctx.font = '14px "JetBrains Mono"';
        ctx.textAlign = 'right';
        ctx.fillText('12.5', 276, 58);
        ctx.textAlign = 'left';
    } else if (currentContent) {
        if (currentContent.type === 'image') {
            // Draw image scaled to fit
            const img = currentContent.data;
            const scale = Math.min(284 / img.width, 76 / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (284 - w) / 2;
            const y = (76 - h) / 2;
            ctx.drawImage(img, x, y, w, h);
        } else if (currentContent.type === 'text') {
            ctx.fillStyle = '#bccfc4';
            ctx.font = '9px "JetBrains Mono"';
            const lines = currentContent.data.split('\n').slice(0, 6);
            lines.forEach((line, i) => {
                ctx.fillText(line.substring(0, 40), 8, 14 + i * 10);
            });
        }
    } else {
        ctx.fillStyle = '#bccfc4';
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillText('hack-calc', 8, 20);
        ctx.fillText('UPLOAD CONTENT', 8, 35);
    }
}

// Screenshot
document.getElementById('captureBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `hack-calc-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

// Initial render
renderDisplay();
