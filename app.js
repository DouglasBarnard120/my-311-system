(() => {
  'use strict';

  // ── Storage helpers ──────────────────────────────────────────────────────────
  const STORAGE_KEY = 'my311_requests';

  function loadRequests() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveRequests(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // ── ID / reference generation ────────────────────────────────────────────────
  function generateRef() {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `311-${ts}-${rnd}`;
  }

  // ── Category config ──────────────────────────────────────────────────────────
  const CATEGORIES = {
    pothole:       { label: 'Pothole / Road Damage',    icon: '🛣️',  priority: 'high' },
    streetlight:   { label: 'Broken Street Light',      icon: '💡',  priority: 'medium' },
    graffiti:      { label: 'Graffiti',                 icon: '🎨',  priority: 'low' },
    trash:         { label: 'Illegal Dumping / Trash',  icon: '🗑️',  priority: 'medium' },
    noise:         { label: 'Noise Complaint',           icon: '📢',  priority: 'medium' },
    tree:          { label: 'Fallen Tree / Hazard',     icon: '🌳',  priority: 'high' },
    water:         { label: 'Water / Sewer Issue',      icon: '💧',  priority: 'high' },
    sidewalk:      { label: 'Sidewalk Damage',          icon: '🚶',  priority: 'medium' },
    signage:       { label: 'Missing / Damaged Sign',   icon: '🚧',  priority: 'low' },
    other:         { label: 'Other',                    icon: '📋',  priority: 'low' },
  };

  const STATUS_FLOW = ['open', 'in-progress', 'resolved', 'closed'];

  const STATUS_LABELS = {
    'open':        'Open',
    'in-progress': 'In Progress',
    'resolved':    'Resolved',
    'closed':      'Closed',
  };

  // ── State ────────────────────────────────────────────────────────────────────
  let requests = loadRequests();
  let currentView = 'home';
  let filterStatus = 'all';
  let filterCategory = 'all';
  let filterSearch = '';

  // ── DOM refs ─────────────────────────────────────────────────────────────────
  const views       = document.querySelectorAll('.view');
  const navLinks    = document.querySelectorAll('[data-view]');
  const statsTotal  = document.getElementById('stat-total');
  const statsOpen   = document.getElementById('stat-open');
  const statsInProg = document.getElementById('stat-inprog');
  const statsRes    = document.getElementById('stat-resolved');

  // ── Navigation ───────────────────────────────────────────────────────────────
  function showView(name) {
    currentView = name;
    views.forEach(v => v.classList.toggle('active', v.dataset.view === name));
    navLinks.forEach(a => a.classList.toggle('active', a.dataset.view === name));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (name === 'requests') renderRequestList();
    if (name === 'home')     updateStats();
  }

  navLinks.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showView(a.dataset.view);
    });
  });

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      showView(el.dataset.goto);
    });
  });

  // ── Stats ────────────────────────────────────────────────────────────────────
  function updateStats() {
    statsTotal.textContent  = requests.length;
    statsOpen.textContent   = requests.filter(r => r.status === 'open').length;
    statsInProg.textContent = requests.filter(r => r.status === 'in-progress').length;
    statsRes.textContent    = requests.filter(r => r.status === 'resolved').length;
  }

  // ── Submit form ──────────────────────────────────────────────────────────────
  const submitForm    = document.getElementById('submit-form');
  const descTextarea  = document.getElementById('desc');
  const charCount     = document.getElementById('char-count');
  const categorySelect = document.getElementById('category');

  // Populate category select
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${cat.icon}  ${cat.label}`;
    categorySelect.appendChild(opt);
  });

  descTextarea.addEventListener('input', () => {
    charCount.textContent = `${descTextarea.value.length} / 500`;
  });

  submitForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(submitForm);
    const catKey = fd.get('category');
    const cat = CATEGORIES[catKey];

    const newRequest = {
      id:          generateRef(),
      category:    catKey,
      title:       cat.label,
      icon:        cat.icon,
      priority:    cat.priority,
      description: fd.get('description').trim(),
      address:     fd.get('address').trim(),
      name:        fd.get('name').trim(),
      email:       fd.get('email').trim(),
      phone:       fd.get('phone').trim(),
      status:      'open',
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
      timeline: [
        { status: 'open', label: 'Request submitted', date: new Date().toISOString() }
      ],
    };

    requests.unshift(newRequest);
    saveRequests(requests);
    updateStats();

    submitForm.reset();
    charCount.textContent = '0 / 500';

    showSuccessModal(newRequest.id);
  });

  // ── Success modal ────────────────────────────────────────────────────────────
  const successModal    = document.getElementById('success-modal');
  const successRef      = document.getElementById('success-ref');
  const modalCloseBtn   = document.getElementById('modal-close');
  const modalViewBtn    = document.getElementById('modal-view-requests');

  function showSuccessModal(ref) {
    successRef.textContent = ref;
    successModal.classList.add('open');
  }

  modalCloseBtn.addEventListener('click', () => successModal.classList.remove('open'));
  successModal.addEventListener('click', e => {
    if (e.target === successModal) successModal.classList.remove('open');
  });
  modalViewBtn.addEventListener('click', () => {
    successModal.classList.remove('open');
    showView('requests');
  });

  // ── Request List ─────────────────────────────────────────────────────────────
  const listEl         = document.getElementById('requests-list');
  const filterStatusEl = document.getElementById('filter-status');
  const filterCatEl    = document.getElementById('filter-category');
  const filterSearchEl = document.getElementById('filter-search');

  // Populate filter category select
  const allOpt = document.createElement('option');
  allOpt.value = 'all'; allOpt.textContent = 'All Categories';
  filterCatEl.appendChild(allOpt);
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${cat.icon} ${cat.label}`;
    filterCatEl.appendChild(opt);
  });

  filterStatusEl.addEventListener('change', () => { filterStatus = filterStatusEl.value; renderRequestList(); });
  filterCatEl.addEventListener('change',    () => { filterCategory = filterCatEl.value;  renderRequestList(); });
  filterSearchEl.addEventListener('input',  () => { filterSearch = filterSearchEl.value.toLowerCase().trim(); renderRequestList(); });

  function renderRequestList() {
    requests = loadRequests(); // refresh from storage

    let filtered = requests.filter(r => {
      if (filterStatus !== 'all'   && r.status !== filterStatus)     return false;
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterSearch && !(`${r.id} ${r.title} ${r.description} ${r.address}`).toLowerCase().includes(filterSearch)) return false;
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>${requests.length === 0 ? 'No requests have been submitted yet.' : 'No requests match your filters.'}</p>
        </div>`;
      return;
    }

    listEl.innerHTML = filtered.map(r => requestCardHTML(r)).join('');

    // Bind status change buttons
    listEl.querySelectorAll('[data-advance]').forEach(btn => {
      btn.addEventListener('click', () => advanceStatus(btn.dataset.advance));
    });
    listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteRequest(btn.dataset.delete));
    });
  }

  function requestCardHTML(r) {
    const date = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const statusClass = `badge-${r.status}`;
    const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(r.status) + 1];

    return `
      <div class="request-card" id="card-${r.id}">
        <div class="request-icon">${r.icon}</div>
        <div class="request-body">
          <div class="request-header">
            <span class="request-id">${r.id}</span>
            <span class="request-title">${escapeHTML(r.title)}</span>
            <span class="badge ${statusClass}">${STATUS_LABELS[r.status]}</span>
          </div>
          <div class="request-meta">
            📍 ${escapeHTML(r.address || 'No address provided')} &nbsp;·&nbsp; 📅 ${date}
            &nbsp;·&nbsp; <span class="priority-${r.priority}">● ${capitalize(r.priority)} priority</span>
          </div>
          ${r.description ? `<div class="request-desc">${escapeHTML(r.description)}</div>` : ''}
          <div class="request-actions">
            ${nextStatus ? `<button class="btn btn-sm btn-secondary" data-advance="${r.id}">Mark ${STATUS_LABELS[nextStatus]}</button>` : ''}
            <button class="btn btn-sm btn-outline" style="color:var(--muted);border-color:var(--border)" data-delete="${r.id}">🗑 Delete</button>
          </div>
        </div>
      </div>`;
  }

  function advanceStatus(id) {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    const idx = STATUS_FLOW.indexOf(req.status);
    if (idx < STATUS_FLOW.length - 1) {
      req.status = STATUS_FLOW[idx + 1];
      req.updatedAt = new Date().toISOString();
      req.timeline.push({ status: req.status, label: `Status changed to ${STATUS_LABELS[req.status]}`, date: req.updatedAt });
      saveRequests(requests);
      renderRequestList();
      updateStats();
      showToast(`Request ${id} marked as ${STATUS_LABELS[req.status]}`);
    }
  }

  function deleteRequest(id) {
    if (!confirm('Delete this request? This cannot be undone.')) return;
    requests = requests.filter(r => r.id !== id);
    saveRequests(requests);
    renderRequestList();
    updateStats();
    showToast('Request deleted.');
  }

  // ── Track view ───────────────────────────────────────────────────────────────
  const trackForm   = document.getElementById('track-form');
  const trackResult = document.getElementById('track-result');

  trackForm.addEventListener('submit', e => {
    e.preventDefault();
    const ref = document.getElementById('track-id').value.trim().toUpperCase();
    const req = loadRequests().find(r => r.id === ref);

    if (!req) {
      trackResult.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>No request found with ID <strong>${escapeHTML(ref)}</strong>.<br>Please check the reference number and try again.</p></div>`;
      return;
    }

    const createdDate = new Date(req.createdAt).toLocaleString('en-US');
    const timelineHTML = [...req.timeline].reverse().map((t, i) => `
      <div class="timeline-item">
        <div class="timeline-dot${i === 0 ? '' : ' inactive'}"></div>
        <div class="timeline-content">
          <strong>${escapeHTML(t.label)}</strong>
          <span>${new Date(t.date).toLocaleString('en-US')}</span>
        </div>
      </div>`).join('');

    trackResult.innerHTML = `
      <div class="request-card" style="margin-bottom:1rem">
        <div class="request-icon">${req.icon}</div>
        <div class="request-body">
          <div class="request-header">
            <span class="request-id">${req.id}</span>
            <span class="request-title">${escapeHTML(req.title)}</span>
            <span class="badge badge-${req.status}">${STATUS_LABELS[req.status]}</span>
          </div>
          <div class="request-meta">📍 ${escapeHTML(req.address || 'N/A')} &nbsp;·&nbsp; Submitted: ${createdDate}</div>
          ${req.description ? `<div class="request-desc">${escapeHTML(req.description)}</div>` : ''}
        </div>
      </div>
      <h3 class="section-title">Status Timeline</h3>
      <div class="timeline">${timelineHTML}</div>`;
  });

  // ── Toast ─────────────────────────────────────────────────────────────────────
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  }

  // ── Utilities ─────────────────────────────────────────────────────────────────
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ── Init ──────────────────────────────────────────────────────────────────────
  updateStats();
  showView('home');
})();
