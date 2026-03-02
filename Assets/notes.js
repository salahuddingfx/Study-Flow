// StudyFlow v2.5 - Note-Taking System
// Simple localStorage-based note management

class NotesManager {
  constructor() {
    this.notes = this.loadNotes();
    this.currentNote = null;
  }

  // Load notes from localStorage
  loadNotes() {
    const saved = localStorage.getItem('studyflow_notes');
    return saved ? JSON.parse(saved) : [];
  }

  // Save notes to localStorage
  saveNotes() {
    localStorage.setItem('studyflow_notes', JSON.stringify(this.notes));
    this.syncToIndexedDB();
  }

  // Create new note
  createNote(title, content, subject = '') {
    const note = {
      id: Date.now(),
      title: title || 'Untitled Note',
      content: content || '',
      subject: subject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      pinned: false
    };
    
    this.notes.unshift(note);
    this.saveNotes();
    return note;
  }

  // Update existing note
  updateNote(id, updates) {
    const index = this.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notes[index] = {
        ...this.notes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveNotes();
      return this.notes[index];
    }
    return null;
  }

  // Delete note
  deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveNotes();
  }

  // Get all notes
  getAllNotes() {
    return this.notes.sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }

  // Search notes
  searchNotes(query) {
    const lowerQuery = query.toLowerCase();
    return this.notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.subject.toLowerCase().includes(lowerQuery)
    );
  }

  // Toggle pin
  togglePin(id) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.pinned = !note.pinned;
      this.saveNotes();
    }
  }

  // Add tag
  addTag(id, tag) {
    const note = this.notes.find(n => n.id === id);
    if (note && !note.tags.includes(tag)) {
      note.tags.push(tag);
      this.saveNotes();
    }
  }

  // Sync to IndexedDB for offline support
  async syncToIndexedDB() {
    if (!('indexedDB' in window)) return;

    try {
      const db = await this.openDB();
      const tx = db.transaction('notes', 'readwrite');
      const store = tx.objectStore('notes');
      
      // Clear and re-add all notes
      await store.clear();
      for (const note of this.notes) {
        await store.add(note);
      }
    } catch (error) {
      console.warn('IndexedDB sync failed:', error);
    }
  }

  // Open IndexedDB
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('StudyFlowDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('offlineQueue')) {
          db.createObjectStore('offlineQueue', { autoIncrement: true });
        }
      };
    });
  }

  // Export notes to JSON
  exportToJSON() {
    const dataStr = JSON.stringify(this.notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyflow_notes_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Import notes from JSON
  async importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            this.notes = [...this.notes, ...imported];
            this.saveNotes();
            resolve(imported.length);
          } else {
            reject(new Error('Invalid format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

// UI Manager for Notes
class NotesUI {
  constructor() {
    this.manager = new NotesManager();
    this.currentView = 'list';
    this.init();
  }

  init() {
    // Will be called when notes section is opened
    console.log('📝 Notes system initialized');
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
      <div class="note-card bg-white/5 rounded-lg p-4 mb-3 hover:bg-white/10 transition cursor-pointer" data-id="${note.id}">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-lg ${note.pinned ? 'text-yellow-400' : ''}">${note.pinned ? '📌 ' : ''}${this.escapeHtml(note.title)}</h3>
          <div class="flex gap-2">
            <button class="pin-btn opacity-50 hover:opacity-100" onclick="notesUI.togglePin(${note.id})">
              ${note.pinned ? '📌' : '📍'}
            </button>
            <button class="delete-btn opacity-50 hover:opacity-100 hover:text-red-400" onclick="notesUI.deleteNote(${note.id})">
              🗑️
            </button>
          </div>
        </div>
        <p class="text-sm opacity-70 mb-2 line-clamp-2">${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
        <div class="flex justify-between items-center text-xs opacity-50">
          <span>${note.subject ? `📚 ${note.subject}` : ''}</span>
          <span>${this.formatDate(note.updatedAt)}</span>
        </div>
      </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          this.openNote(parseInt(card.dataset.id));
        }
      });
    });
  }

  // Create note dialog
  showCreateDialog() {
    const title = prompt('Note Title:');
    if (!title) return;
    
    const content = prompt('Note Content:');
    if (content === null) return;

    const subject = prompt('Subject (optional):') || '';
    
    this.manager.createNote(title, content, subject);
    this.renderNotesList('notes-list');
  }

  // Open note for editing
  openNote(id) {
    const note = this.manager.notes.find(n => n.id === id);
    if (!note) return;

    const newTitle = prompt('Edit Title:', note.title);
    if (newTitle && newTitle !== note.title) {
      const newContent = prompt('Edit Content:', note.content);
      if (newContent !== null) {
        this.manager.updateNote(id, { title: newTitle, content: newContent });
        this.renderNotesList('notes-list');
      }
    }
  }

  // Delete note
  deleteNote(id) {
    if (confirm('Delete this note?')) {
      this.manager.deleteNote(id);
      this.renderNotesList('notes-list');
    }
  }

  // Toggle pin
  togglePin(id) {
    this.manager.togglePin(id);
    this.renderNotesList('notes-list');
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
    
    // Render filtered notes
    this.manager.notes = results;
    this.renderNotesList('notes-list');
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
