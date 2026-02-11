// Whiteboard module for drawing and notes

export function mount(container) {
    let isDrawing = false;
    let currentColor = '#000000';
    let currentTool = 'pen';
    let lineWidth = 3;
    let canvas, ctx;
    let lastX = 0;
    let lastY = 0;
    let isHeaderCollapsed = false;

    function init() {
        container.innerHTML = `
      <div class="whiteboard">
        <div class="whiteboard__header" id="whiteboardHeader">
          <button class="whiteboard__toggle" id="headerToggle" aria-label="Toggle toolbar">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="toggle-icon-expand">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="toggle-icon-collapse">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          <div class="whiteboard__header-content">
            <h3>Whiteboard</h3>
            <div class="whiteboard__tools">
              <button class="whiteboard__tool whiteboard__tool--active" data-tool="pen">✏️ Pen</button>
              <button class="whiteboard__tool" data-tool="eraser">🧹 Eraser</button>
              <button class="whiteboard__tool" data-tool="clear">🗑️ Clear All</button>
            </div>
            <div class="whiteboard__colors">
              <button class="whiteboard__color whiteboard__color--active" data-color="#000000" style="background: #000000"></button>
              <button class="whiteboard__color" data-color="#ff0000" style="background: #ff0000"></button>
              <button class="whiteboard__color" data-color="#00ff00" style="background: #00ff00"></button>
              <button class="whiteboard__color" data-color="#0000ff" style="background: #0000ff"></button>
              <button class="whiteboard__color" data-color="#ffff00" style="background: #ffff00"></button>
              <button class="whiteboard__color" data-color="#ff00ff" style="background: #ff00ff"></button>
              <button class="whiteboard__color" data-color="#00ffff" style="background: #00ffff"></button>
              <button class="whiteboard__color" data-color="#ffffff" style="background: #ffffff; border: 2px solid #ccc"></button>
            </div>
            <div class="whiteboard__size">
              <label>Size:</label>
              <input type="range" id="lineWidth" min="1" max="20" value="3">
              <span id="sizeValue">3</span>
            </div>
            <button class="whiteboard__close" id="whiteboardClose" aria-label="Close whiteboard">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span>Close</span>
            </button>
          </div>
        </div>
        <div class="whiteboard__canvas-wrapper">
          <canvas id="whiteboardCanvas"></canvas>
        </div>
      </div>
    `;

        canvas = document.getElementById('whiteboardCanvas');
        ctx = canvas.getContext('2d');

        // Dynamically set canvas size
        function resizeCanvas() {
            const wrapper = document.querySelector('.whiteboard__canvas-wrapper');
            if (wrapper) {
                canvas.width = wrapper.clientWidth;
                canvas.height = wrapper.clientHeight;

                // Refill with white after resize
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Reset drawing properties
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }

        // Initial resize
        resizeCanvas();

        // Handle window resize
        window.addEventListener('resize', resizeCanvas);

        setupEventListeners();
    }

    function setupEventListeners() {
        // Toggle button for collapsing/expanding header
        const toggleBtn = document.getElementById('headerToggle');
        const header = document.getElementById('whiteboardHeader');
        if (toggleBtn && header) {
            toggleBtn.addEventListener('click', () => {
                isHeaderCollapsed = !isHeaderCollapsed;
                if (isHeaderCollapsed) {
                    header.classList.add('whiteboard__header--collapsed');
                } else {
                    header.classList.remove('whiteboard__header--collapsed');
                }
                // Resize canvas after header changes
                setTimeout(resizeCanvas, 100);
            });
        }

        // Close button - triggers the back button in the activity view
        const closeBtn = document.getElementById('whiteboardClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                // Trigger the back button click
                const backBtn = document.getElementById('backBtn');
                if (backBtn) {
                    backBtn.click();
                }
            });
        }

        // Tool buttons
        document.querySelectorAll('.whiteboard__tool').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;

                if (tool === 'clear') {
                    clearCanvas();
                    return;
                }

                currentTool = tool;
                document.querySelectorAll('.whiteboard__tool').forEach(b =>
                    b.classList.remove('whiteboard__tool--active')
                );
                e.target.classList.add('whiteboard__tool--active');
            });
        });

        // Color buttons
        document.querySelectorAll('.whiteboard__color').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentColor = e.target.dataset.color;
                document.querySelectorAll('.whiteboard__color').forEach(b =>
                    b.classList.remove('whiteboard__color--active')
                );
                e.target.classList.add('whiteboard__color--active');
            });
        });

        // Line width slider
        const lineWidthSlider = document.getElementById('lineWidth');
        const sizeValue = document.getElementById('sizeValue');
        lineWidthSlider.addEventListener('input', (e) => {
            lineWidth = e.target.value;
            sizeValue.textContent = lineWidth;
        });

        // Mouse/Touch/Pointer events
        canvas.addEventListener('pointerdown', startDrawing);
        canvas.addEventListener('pointermove', draw);
        canvas.addEventListener('pointerup', stopDrawing);
        canvas.addEventListener('pointercancel', stopDrawing);
        canvas.style.touchAction = 'none'; // Prevent scrolling/zooming while drawing
    }

    let points = [];

    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        lastX = x;
        lastY = y;
        points = [{ x, y, pressure: e.pressure || 0.5 }];

        // Initial dot
        ctx.beginPath();
        ctx.arc(x, y, (lineWidth * (e.pressure || 0.5)) / 2, 0, Math.PI * 2);
        ctx.fillStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
        ctx.fill();
    }

    function draw(e) {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pressure = e.pressure || 0.5;

        points.push({ x, y, pressure });

        if (points.length < 3) {
            const b = points[0];
            ctx.beginPath();
            ctx.arc(b.x, b.y, (lineWidth * b.pressure) / 2, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (currentTool === 'eraser') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = lineWidth * 4; // Eraser is always a bit bigger
        } else {
            ctx.strokeStyle = currentColor;
            // Adjust line width based on pressure for a natural feel
            const adjustedWidth = lineWidth * (0.5 + pressure);
            ctx.lineWidth = adjustedWidth;
        }

        // Quadratic curve for smoothing
        ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
        const midX = (points[points.length - 2].x + x) / 2;
        const midY = (points[points.length - 2].y + y) / 2;
        ctx.quadraticCurveTo(points[points.length - 2].x, points[points.length - 2].y, midX, midY);

        ctx.stroke();

        // Keep local array small for performance
        if (points.length > 10) points.shift();
    }

    function stopDrawing() {
        isDrawing = false;
        points = [];
    }

    function clearCanvas() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function destroy() {
        const resizeHandler = () => { }; // Placeholder if needed
        window.removeEventListener('resize', resizeHandler);

        canvas.removeEventListener('pointerdown', startDrawing);
        canvas.removeEventListener('pointermove', draw);
        canvas.removeEventListener('pointerup', stopDrawing);
        canvas.removeEventListener('pointercancel', stopDrawing);
    }

    init();

    return { destroy };
}
