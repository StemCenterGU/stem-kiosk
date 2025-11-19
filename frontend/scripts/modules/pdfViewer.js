export function mount(container) {
  const pdfViewer = new PDFViewer(container);
  
  return {
    destroy() {
      pdfViewer.destroy();
    },
    loadPDF(url) {
      return pdfViewer.loadPDF(url);
    }
  };
}

class PDFViewer {
  constructor(container) {
    this.container = container;
    this.currentPage = 1;
    this.totalPages = 1;
    this.pdfDoc = null;
    this.isLoading = false;
    
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="pdf-viewer">
        <div class="pdf-controls">
          <button class="pdf-btn" id="prevPage" disabled>← Previous</button>
          <span class="pdf-page-info" id="pageInfo">Page 1 of 1</span>
          <button class="pdf-btn" id="nextPage" disabled>Next →</button>
          <button class="pdf-btn" id="fullscreenBtn">⛶ Fullscreen</button>
        </div>
        
        <div class="pdf-canvas-container">
          <canvas id="pdfCanvas" class="pdf-canvas"></canvas>
          <div class="pdf-loading" id="pdfLoading">
            <div class="pdf-spinner"></div>
            <p>Loading PDF...</p>
          </div>
          <div class="pdf-error" id="pdfError" style="display: none;">
            <h3>PDF Loading Error</h3>
            <p>Unable to load the PDF file. Please try again.</p>
            <button class="pdf-btn" onclick="location.reload()">Retry</button>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const prevBtn = this.container.querySelector('#prevPage');
    const nextBtn = this.container.querySelector('#nextPage');
    const fullscreenBtn = this.container.querySelector('#fullscreenBtn');

    prevBtn?.addEventListener('click', () => this.previousPage());
    nextBtn?.addEventListener('click', () => this.nextPage());
    fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
  }

  async loadPDF(url) {
    this.showLoading();
    
    try {
      await this.loadRealPDF(url);
    } catch (error) {
      console.error('PDF loading failed:', error);
      this.showError();
    }
  }

  async loadRealPDF(url) {
    // Display PDF directly in the kiosk interface
    const canvas = this.container.querySelector('#pdfCanvas');
    const canvasContainer = this.container.querySelector('.pdf-canvas-container');
    
    if (!canvas || !canvasContainer) {
      throw new Error('PDF canvas not found');
    }

    // Clear any existing content
    canvasContainer.innerHTML = '';
    
    // Create an iframe to display the PDF directly
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: var(--border-radius);
      background: white;
    `;
    
    // Add error handling
    iframe.onerror = () => {
      this.showError();
    };
    
    // Add load handling
    iframe.onload = () => {
      this.hideLoading();
      this.updatePageInfo();
      this.updateControls();
    };
    
    canvasContainer.appendChild(iframe);
    
    // Set up page navigation
    this.totalPages = 1;
    this.currentPage = 1;
    this.pdfDoc = { url, iframe: true };
    
    // Hide loading after a short delay
    setTimeout(() => {
      this.hideLoading();
    }, 2000);
  }

  showLoading() {
    this.isLoading = true;
    const loading = this.container.querySelector('#pdfLoading');
    if (loading) loading.style.display = 'flex';
  }

  hideLoading() {
    this.isLoading = false;
    const loading = this.container.querySelector('#pdfLoading');
    if (loading) loading.style.display = 'none';
  }

  showError() {
    this.isLoading = false;
    this.hideLoading();
    const error = this.container.querySelector('#pdfError');
    if (error) error.style.display = 'block';
  }

  updatePageInfo() {
    const pageInfo = this.container.querySelector('#pageInfo');
    if (pageInfo) {
      pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    }
  }

  updateControls() {
    const prevBtn = this.container.querySelector('#prevPage');
    const nextBtn = this.container.querySelector('#nextPage');
    
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePageInfo();
      this.updateControls();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePageInfo();
      this.updateControls();
    }
  }

  toggleFullscreen() {
    const canvasContainer = this.container.querySelector('.pdf-canvas-container');
    const fullscreenBtn = this.container.querySelector('#fullscreenBtn');
    
    if (!document.fullscreenElement) {
      // Enter fullscreen
      canvasContainer.requestFullscreen().then(() => {
        fullscreenBtn.textContent = '⛶ Exit Fullscreen';
        fullscreenBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
        // Fallback: open PDF in new window
        const iframe = canvasContainer.querySelector('iframe');
        if (iframe) {
          window.open(iframe.src, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        }
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().then(() => {
        fullscreenBtn.textContent = '⛶ Fullscreen';
        fullscreenBtn.style.background = '';
      }).catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  }

  destroy() {
    // Cleanup if needed
    this.container.innerHTML = '';
  }
}
