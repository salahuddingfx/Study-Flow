// StudyFlow v2.5 - Note-Taking System
// Integrated with Backend API & PDF Export

class NotesManager {
    constructor(baseUrl) {
        this.baseUrl = baseUrl || '';
        this.notes = this.loadFromLocal();
        this.token = localStorage.getItem('token') || null;
    }

    setToken(token) {
        this.token = token;
        if (token) {
            this.loadNotes();
        }
    }

    // Load notes from API
    async loadNotes() {
        if (!this.token) return this.loadFromLocal();

        try {
            console.log('Fetching notes from:', `${this.baseUrl || ''}/api/notes`);
            const res = await fetch(`${this.baseUrl || ''}/api/notes`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            // Log error details if the response is not OK (e.g., 400 or 500)
            if (!res.ok) {
                const errorText = await res.text();
                console.error(`API Error ${res.status}:`, errorText);
                
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.message === 'jwt malformed' || errorJson.error === 'Not authorized, token failed') {
                        console.warn('Invalid token, clearing session...');
                        // Optional: this.token = null; localStorage.removeItem('studyflow_token');
                    }
                } catch(e) {}
                
                // Fallback to local
                return this.loadFromLocal();
            }

            // Check for HTML response (404 page)
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Received HTML instead of JSON. Check API URL.');
            }

            const data = await res.json();
            if (data.success) {
                this.notes = data.data;
                this.saveToLocal();
                return this.notes;
            } else {
                console.warn('API returned success:false', data);
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        }
        return this.loadFromLocal();
    }

    // Load from local storage
    loadFromLocal() {
        const saved = localStorage.getItem('studyflow_notes');
        return saved ? JSON.parse(saved) : [];
    }

    // Save to local storage
    saveToLocal() {
        localStorage.setItem('studyflow_notes', JSON.stringify(this.notes));
    }

    // Get all notes (synchronous accessor)
    getAllNotes() {
        return this.notes.sort((a, b) => {
             // Handle both pinned/isPinned properties
            const pinnedA = a.pinned || a.isPinned;
            const pinnedB = b.pinned || b.isPinned;
            if (pinnedA !== pinnedB) return pinnedB - pinnedA;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    }


    // Create new note with offline support
    async createNote(title, content, subject = '') {
        const localNote = {
            id: Date.now().toString(),
            title: title || 'Untitled Note',
            content: content || '',
            subject: subject,
            tags: subject ? [subject] : [],
            pinned: false,
            isPinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!this.token) {
            this.notes.unshift(localNote);
            this.saveToLocal();
            return localNote;
        }

        try {
            // Use defaults to prevent validation errors
            const payload = {
                title: title && title.trim() ? title : 'Untitled Note',
                content: content || '', // Allow empty content (backend should handle this)
                tags: subject ? [subject] : []
            };
            
            // If backend requires content, add a placeholder space if empty (temporary fix)
            // But ideally we relax backend validation. For now, let's send ' ' if empty to be safe.
            if (!payload.content) payload.content = ' '; 

            const res = await fetch(`${this.baseUrl}/api/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                this.notes.unshift(data.data);
                this.saveToLocal();
                return data.data;
            }
        } catch (error) {
            console.warn('Backend offline, saving locally:', error);
            // Fallback to local
            this.notes.unshift(localNote);
            this.saveToLocal();
            return localNote;
        }
    }

    // Update existing note with offline support
    async updateNote(id, updates) {
        // Optimistic local update
        const index = this.notes.findIndex(n => n.id === id || n._id === id);
        let previousState = null;
        if (index !== -1) {
            previousState = { ...this.notes[index] };
            this.notes[index] = { ...this.notes[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveToLocal();
        }

        if (!this.token) return this.notes[index];

        try {
            const res = await fetch(`${this.baseUrl}/api/notes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (data.success && index !== -1) {
                this.notes[index] = data.data; // Sync with server state
                this.saveToLocal();
                return data.data;
            }
        } catch (error) {
            console.warn('Backend update failed, keeping local changes:', error);
            // Keep the optimistic update
        }
        return this.notes[index];
    }


    // Delete note with offline support
    async deleteNote(id) {
        if (!id || id === 'undefined') {
             console.warn('Invalid ID passed to deleteNote:', id);
             return false;
        }

        // Optimistic delete
        const originalNotes = [...this.notes];
        this.notes = this.notes.filter(n => n.id !== id && n._id !== id);
        this.saveToLocal();

        if (!this.token) return true;

        try {
            const res = await fetch(`${this.baseUrl}/api/notes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await res.json();
            if (data.success) {
                return true;
            } else {
                // If soft delete or logic error on server, maybe restore? 
                // But usually we trust client intent for deletion.
            }
        } catch (error) {
            console.warn('Backend delete failed, keeping local delete:', error);
            // Optionally could queue for retry, but for now we prioritized UX (it stays deleted)
        }
        return true;
    }

    // Toggle pin
    async togglePin(id) {
        const note = this.notes.find(n => n._id === id || n.id === id);
        if (note) {
            const isPinned = note.pinned || note.isPinned || false;
            if (this.token) {
                return await this.updateNote(id, { isPinned: !isPinned });
            } else {
                return await this.updateNote(id, { pinned: !isPinned, isPinned: !isPinned });
            }
        }
    }

    // Search notes
    searchNotes(query) {
        const lowerQuery = query.toLowerCase();
        return this.notes.filter(note =>
            (note.title && note.title.toLowerCase().includes(lowerQuery)) ||
            (note.content && note.content.toLowerCase().includes(lowerQuery)) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
    }

    // Export note to PDF
    exportToPDF(noteId) {
        const note = this.notes.find(n => n._id === noteId || n.id === noteId);
        if (!note || !window.jspdf) {
            alert('PDF library not loaded or note not found');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // --- Header Design ---
        // Top accent bar
        doc.setFillColor(139, 92, 246); // Purple-500
        doc.rect(0, 0, 210, 5, 'F');
        
        // Brand Name
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('StudyFlow Notes', 20, 15);

        // --- Note Title ---
        doc.setFontSize(24);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        const title = note.title || 'Untitled Note';
        const splitTitle = doc.splitTextToSize(title, 170);
        doc.text(splitTitle, 20, 30);
        
        let currentY = 30 + (splitTitle.length * 10);

        // --- Metadata Section ---
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        
        const dateStr = new Date(note.updatedAt || new Date()).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        doc.text(`Last Updated: ${dateStr}`, 20, currentY);
        currentY += 6;

        if (note.tags && note.tags.length > 0) {
            doc.text(`Tags: ${note.tags.join(', ')}`, 20, currentY);
            currentY += 10;
        } else {
            currentY += 4;
        }

        // Divider
        doc.setDrawColor(230);
        doc.setLineWidth(0.5);
        doc.line(20, currentY, 190, currentY);
        currentY += 15;

        // --- Content Section ---
        doc.setFontSize(11);
        doc.setTextColor(50);
        doc.setLineHeightFactor(1.5);
        
        // Simple HTML stripping but preserving newlines
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = (note.content || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n');
        const text = tempDiv.innerText || tempDiv.textContent || '';
        
        const splitText = doc.splitTextToSize(text, 170);
        
        // Pagination logic
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const footerHeight = 20;
        
        // Print text line by line to handle page breaks
        // Note: splitText is an array of strings
        if (Array.isArray(splitText)) {
            for (let i = 0; i < splitText.length; i++) {
                if (currentY > pageHeight - footerHeight - margin) {
                    doc.addPage();
                    currentY = margin + 10; // Reset Y for new page
                    
                    // Add header on new page too? Optional.
                }
                doc.text(splitText[i], 20, currentY);
                currentY += 7; // Line height
            }
        } else {
             doc.text(splitText, 20, currentY);
        }

        // --- Footer ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Footer Line
            doc.setDrawColor(230);
            doc.setLineWidth(0.1);
            doc.line(20, 280, 190, 280);

            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text('Created with StudyFlow', 20, 290);
            doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' });
        }

        // Start File Download
        const filename = `StudyFlow_Note_${(note.title || 'untitled').replace(/[^a-z0-9]/gi, '_').substring(0, 30)}.pdf`;
        doc.save(filename);
    }
}

// UI Manager for Notes
class NotesUI {
  constructor() {
    // Default to localhost:5000 if not provided, or detect environment
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // const baseUrl = isLocal ? 'http://localhost:5000' : 'https://study-flow-nfym.onrender.com';
    // FORCE LOCALHOST FOR DEBUGGING IF 127.0.0.1 DETECTED
    let baseUrl = 'https://study-flow-nfym.onrender.com';
    if (isLocal) baseUrl = 'http://localhost:5000';
    
    console.log('NotesUI BaseURL:', baseUrl); // Debug log

    this.manager = new NotesManager(baseUrl);
    this.currentView = 'list';
    this.init();
  }

  async init() {
    // Will be called when notes section is opened
    console.log('📝 Notes system initialized with URL:', this.manager.baseUrl);
    
    // Try to sync with server if token exists
    if (localStorage.getItem('token') || localStorage.getItem('jwt')) {
        // Ensure token is set on manager if not already
        if (!this.manager.token) {
            this.manager.setToken(localStorage.getItem('token') || localStorage.getItem('jwt'));
        }
        await this.manager.loadNotes();
        this.renderNotesList('notes-list');
    }
  }

  // Render notes list
  renderNotesList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const notes = this.manager.getAllNotes();
    
    if (notes.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 opacity-50">
          <p class="text-lg mb-2">📝</p>
          <p>No notes yet. Create your first note!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notes.map(note => `
      <div class="note-card bg-white/5 rounded-lg p-4 mb-3 hover:bg-white/10 transition cursor-pointer" data-id="${note._id || note.id}">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-lg ${(note.pinned || note.isPinned) ? 'text-yellow-400' : ''}">${(note.pinned || note.isPinned) ? '📌 ' : ''}${this.escapeHtml(note.title)}</h3>
          <div class="flex gap-2">
             <button class="pdf-btn opacity-50 hover:opacity-100 hover:text-blue-400" title="Export to PDF" onclick="event.stopPropagation(); notesUI.exportToPDF('${note._id || note.id}')">
              📄
            </button>
            <button class="pin-btn opacity-50 hover:opacity-100" onclick="event.stopPropagation(); notesUI.togglePin('${note._id || note.id}')">
              ${(note.pinned || note.isPinned) ? '📌' : '📍'}
            </button>
            <button class="delete-btn opacity-50 hover:opacity-100 hover:text-red-400" onclick="event.stopPropagation(); notesUI.deleteNote('${note._id || note.id}')">
              🗑️
            </button>
          </div>
        </div>
        <p class="text-sm opacity-70 mb-2 line-clamp-2">${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
        <div class="flex justify-between items-center text-xs opacity-50">
          <span>${(note.tags && note.tags[0]) ? `📚 ${note.tags[0]}` : ''}</span>
          <span>${this.formatDate(note.updatedAt)}</span>
        </div>
      </div>
    `).join('');

    // Add click handlers (backup)
    container.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          this.openNote(card.dataset.id); // Pass as string
        }
      });
    });
  }

  // Create note dialog
  async showCreateDialog() {
    const title = prompt('Note Title:');
    if (!title) return;
    
    const content = prompt('Note Content:');
    if (content === null) return;

    const subject = prompt('Subject (optional):') || '';
    
    await this.manager.createNote(title, content, subject);
    this.renderNotesList('notes-list');
  }

  // Open note for editing
  async openNote(id) {
    const note = this.manager.notes.find(n => (n.id == id || n._id == id));
    if (!note) return;

    const newTitle = prompt('Edit Title:', note.title);
    if (newTitle && newTitle !== note.title) {
      const newContent = prompt('Edit Content:', note.content);
      if (newContent !== null) {
        await this.manager.updateNote(id, { title: newTitle, content: newContent });
        this.renderNotesList('notes-list');
      }
    }
  }

  // Delete note
  async deleteNote(id) {
    if (confirm('Delete this note?')) {
      await this.manager.deleteNote(id);
      this.renderNotesList('notes-list');
    }
  }

  // Toggle pin
  async togglePin(id) {
    await this.manager.togglePin(id);
    this.renderNotesList('notes-list');
  }

  // Export to PDF
  exportToPDF(id) {
      this.manager.exportToPDF(id);
  }

  // Search notes
  searchNotes(query) {
    const results = this.manager.searchNotes(query);
    // Re-render with filtered results
    const container = document.getElementById('notes-list');
    if (!container) return;
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 opacity-50">
          <p>No notes found for "${this.escapeHtml(query)}"</p>
        </div>
      `;
      return;
    }
    
    // We don't want to replace this.manager.notes, just filter view
    // But RenderNotesList uses getAllNotes().
    // Hack: render manually here
    // ... Simplified ...
    // For now, let's just alert if complex search is needed, but the original code mutated this.manager.notes which is bad for sync.
    // I'll skip implementing advanced search view modification here to keep it simple, or I should implement a filter in getAllNotes.
    // Original code: this.manager.notes = results; (This is bad if we syncing)
    // I'll fix this by adding a "render(notes)" method.
    
    // New Render Logic
    const tempNotes = results.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    container.innerHTML = tempNotes.map(note => `
      <div class="note-card bg-white/5 rounded-lg p-4 mb-3 hover:bg-white/10 transition cursor-pointer" data-id="${note._id || note.id}">
        <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-lg ${(note.pinned || note.isPinned) ? 'text-yellow-400' : ''}">${(note.pinned || note.isPinned) ? '📌 ' : ''}${this.escapeHtml(note.title)}</h3>
             <div class="flex gap-2">
                <button class="pdf-btn opacity-50 hover:opacity-100 hover:text-blue-400" title="Export to PDF" onclick="event.stopPropagation(); notesUI.exportToPDF('${note._id || note.id}')">
                   📄
                </button>
             </div>
        </div>
        <p class="text-sm opacity-70 mb-2 line-clamp-2">${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
      </div>
    `).join('');
    
    // Add click handlers
     container.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          this.openNote(card.dataset.id);
        }
      });
    });
  }

  // Utility functions
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  }
}

// Initialize
const notesUI = new NotesUI();

// Export for global access
window.NotesManager = NotesManager;
window.notesUI = notesUI;

console.log('📝 StudyFlow Notes v2.5 loaded');
