// Idea Incubator Module
export function mount(container) {
    let ideas = [];

    function init() {
        // Load saved ideas from localStorage
        ideas = JSON.parse(localStorage.getItem('stem-ideas') || '[]');

        container.innerHTML = `
      <div class="idea-incubator">
        <!-- Header -->
        <div class="incubator__header">
          <h1>💡 Idea Incubator</h1>
          <p>Share your brilliant STEM ideas and inventions!</p>
          <button class="incubator__close" id="incubatorClose">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Main Content -->
        <div class="incubator__content">
          <!-- Submit New Idea Section -->
          <div class="incubator__submit-section">
            <h2>✨ Submit Your Idea</h2>
            <button class="btn-submit-idea" id="btnSubmitIdea">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span>Add New Idea</span>
            </button>
          </div>

          <!-- Filter/Sort Options -->
          <div class="incubator__filters">
            <button class="filter-btn filter-btn--active" data-filter="all">All Ideas</button>
            <button class="filter-btn" data-filter="popular">Most Popular</button>
            <button class="filter-btn" data-filter="recent">Most Recent</button>
          </div>

          <!-- Ideas Grid -->
          <div class="incubator__grid" id="ideasGrid">
            <!-- Ideas will be rendered here -->
          </div>
        </div>
      </div>
    `;

        setupEventListeners();
        renderIdeas('all');
    }

    function setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('incubatorClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const backBtn = document.getElementById('backBtn');
                if (backBtn) backBtn.click();
            });
        }

        // Submit idea button
        const submitBtn = document.getElementById('btnSubmitIdea');
        if (submitBtn) {
            submitBtn.addEventListener('click', showSubmitDialog);
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                document.querySelectorAll('.filter-btn').forEach(b =>
                    b.classList.remove('filter-btn--active')
                );
                e.currentTarget.classList.add('filter-btn--active');
                renderIdeas(filter);
            });
        });
    }

    function showSubmitDialog() {
        const dialogHTML = `
            <div class="idea-dialog-overlay" id="ideaDialogOverlay">
                <div class="idea-dialog">
                    <div class="idea-dialog__header">
                        <h2>💡 Share Your Idea</h2>
                        <button class="idea-dialog__close" id="ideaDialogClose">×</button>
                    </div>
                    <div class="idea-dialog__body">
                        <div class="idea-input-group">
                            <label>Idea Title:</label>
                            <input type="text" id="ideaTitle" class="idea-input" placeholder="e.g., Solar-Powered Water Filter" maxlength="50" />
                        </div>
                        <div class="idea-input-group">
                            <label>Description:</label>
                            <textarea id="ideaDescription" class="idea-textarea" placeholder="Describe your idea..." maxlength="200" rows="4"></textarea>
                        </div>
                        <div class="idea-input-group">
                            <label>Your Name (optional):</label>
                            <input type="text" id="ideaAuthor" class="idea-input" placeholder="Anonymous" maxlength="30" />
                        </div>
                        <div class="idea-input-group">
                            <label>Category:</label>
                            <select id="ideaCategory" class="idea-select">
                                <option value="invention">💡 Invention</option>
                                <option value="experiment">🔬 Experiment</option>
                                <option value="project">🛠️ Project</option>
                                <option value="question">❓ Question</option>
                                <option value="other">✨ Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="idea-dialog__footer">
                        <button class="idea-btn idea-btn--cancel" id="ideaCancel">Cancel</button>
                        <button class="idea-btn idea-btn--submit" id="ideaSubmit">🚀 Submit Idea</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dialogHTML);

        // Event listeners for dialog
        document.getElementById('ideaDialogClose').addEventListener('click', closeSubmitDialog);
        document.getElementById('ideaCancel').addEventListener('click', closeSubmitDialog);
        document.getElementById('ideaSubmit').addEventListener('click', submitIdea);
    }

    function closeSubmitDialog() {
        const overlay = document.getElementById('ideaDialogOverlay');
        if (overlay) overlay.remove();
    }

    function submitIdea() {
        const title = document.getElementById('ideaTitle').value.trim();
        const description = document.getElementById('ideaDescription').value.trim();
        const author = document.getElementById('ideaAuthor').value.trim() || 'Anonymous';
        const category = document.getElementById('ideaCategory').value;

        if (!title || !description) {
            alert('Please fill in both title and description!');
            return;
        }

        const newIdea = {
            id: Date.now(),
            title,
            description,
            author,
            category,
            likes: 0,
            timestamp: new Date().toISOString()
        };

        ideas.push(newIdea);
        localStorage.setItem('stem-ideas', JSON.stringify(ideas));

        closeSubmitDialog();
        showSuccessMessage('✅ Your idea has been submitted!');
        renderIdeas('all');
    }

    function renderIdeas(filter) {
        const grid = document.getElementById('ideasGrid');
        if (!grid) return;

        let filteredIdeas = [...ideas];

        // Apply filter
        if (filter === 'popular') {
            filteredIdeas.sort((a, b) => b.likes - a.likes);
        } else if (filter === 'recent') {
            filteredIdeas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else {
            // 'all' - sort by most recent
            filteredIdeas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }

        if (filteredIdeas.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">💡</div>
                    <h3>No Ideas Yet!</h3>
                    <p>Be the first to share a brilliant STEM idea!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredIdeas.map(idea => `
            <div class="idea-card" data-id="${idea.id}">
                <div class="idea-card__header">
                    <span class="idea-category idea-category--${idea.category}">${getCategoryIcon(idea.category)} ${idea.category}</span>
                    <span class="idea-date">${formatDate(idea.timestamp)}</span>
                </div>
                <h3 class="idea-title">${escapeHtml(idea.title)}</h3>
                <p class="idea-description">${escapeHtml(idea.description)}</p>
                <div class="idea-card__footer">
                    <span class="idea-author">by ${escapeHtml(idea.author)}</span>
                    <button class="idea-like-btn ${idea.liked ? 'idea-like-btn--liked' : ''}" data-id="${idea.id}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="${idea.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>${idea.likes}</span>
                    </button>
                </div>
            </div>
        `).join('');

        // Add like button event listeners
        grid.querySelectorAll('.idea-like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const ideaId = parseInt(btn.dataset.id);
                toggleLike(ideaId);
            });
        });
    }

    function toggleLike(ideaId) {
        const idea = ideas.find(i => i.id === ideaId);
        if (!idea) return;

        if (idea.liked) {
            idea.likes--;
            idea.liked = false;
        } else {
            idea.likes++;
            idea.liked = true;
        }

        localStorage.setItem('stem-ideas', JSON.stringify(ideas));

        // Re-render with current filter
        const activeFilter = document.querySelector('.filter-btn--active');
        const filter = activeFilter ? activeFilter.dataset.filter : 'all';
        renderIdeas(filter);
    }

    function getCategoryIcon(category) {
        const icons = {
            invention: '💡',
            experiment: '🔬',
            project: '🛠️',
            question: '❓',
            other: '✨'
        };
        return icons[category] || '✨';
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showSuccessMessage(message) {
        const msgHTML = `
            <div class="success-toast" id="successToast">
                ${message}
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', msgHTML);
        setTimeout(() => {
            const toast = document.getElementById('successToast');
            if (toast) toast.remove();
        }, 3000);
    }

    function destroy() {
        // Cleanup if needed
    }

    init();
    return { destroy };
}
