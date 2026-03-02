// StudyFlow v2.5 - UI Integration
// Adds export and notes functionality to existing UI

(function() {
  'use strict';

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initV25Features);
  } else {
    initV25Features();
  }

  function initV25Features() {
    console.log('🚀 Initializing StudyFlow v2.5 features...');
    
    // Add export menu to footer or header
    addExportMenu();
    
    // Add notes quick access
    addNotesButton();
    
    // Add offline status indicator
    addOfflineIndicator();
    
    // Setup online/offline listeners
    setupOfflineSync();
    
    console.log('✅ v2.5 features initialized');
  }

  // Add export dropdown menu
  function addExportMenu() {
    // Find footer or suitable container
    const footer = document.querySelector('footer') || document.querySelector('.footer');
    if (!footer) return;

    const exportMenu = document.createElement('div');
    exportMenu.id = 'v25-export-menu';
    exportMenu.className = 'fixed bottom-20 right-6 z-50';
    exportMenu.style.cssText = 'will-change: transform; transform: translateZ(0);';
    exportMenu.innerHTML = `
      <div class="relative">
        <button id="export-toggle" 
                class="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
                style="will-change: transform; transform: translateZ(0);"
                title="Export Data (v2.5)">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
        </button>
        
        <div id="export-dropdown" 
             class="hidden absolute bottom-full right-0 mb-2 bg-slate-800 rounded-lg shadow-xl border border-white/10 overflow-hidden"
             style="min-width: 200px; will-change: opacity; contain: layout style paint;">
          <div class="p-2 border-b border-white/10 bg-purple-600/20">
            <p class="text-xs font-bold text-purple-300">📊 Export Data (v2.5)</p>
          </div>
          <button onclick="exportManager.exportSessionsToCSV()" 
                  class="w-full text-left px-4 py-2 hover:bg-white/5 transition text-sm">
            📅 Sessions (CSV)
          </button>
          <button onclick="exportManager.exportTasksToCSV()" 
                  class="w-full text-left px-4 py-2 hover:bg-white/5 transition text-sm">
            ✅ Tasks (CSV)
          </button>
          <button onclick="exportManager.exportSubjectsToCSV()" 
                  class="w-full text-left px-4 py-2 hover:bg-white/5 transition text-sm">
            📚 Subjects (CSV)
          </button>
          <button onclick="exportManager.exportAnalyticsToCSV()" 
                  class="w-full text-left px-4 py-2 hover:bg-white/5 transition text-sm">
            📈 Analytics (CSV)
          </button>
          <div class="border-t border-white/10"></div>
          <button onclick="exportManager.exportToExcelCSV()" 
                  class="w-full text-left px-4 py-2 hover:bg-white/5 transition text-sm">
            📑 Full Workbook (Excel)
          </button>
          <button onclick="exportManager.exportAllData()" 
                  class="w-full text-left px-4 py-2 hover:bg-white/5 transition text-sm">
            💾 Complete Backup (JSON)
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(exportMenu);

    // Toggle dropdown with debounce for performance
    const toggleBtn = document.getElementById('export-toggle');
    const dropdown = document.getElementById('export-dropdown');
    
    let toggleTimeout;
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearTimeout(toggleTimeout);
      toggleTimeout = setTimeout(() => {
        dropdown.classList.toggle('hidden');
      }, 10);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdown.classList.add('hidden');
    });
  }

  // Add notes quick access button
  function addNotesButton() {
    const exportMenu = document.getElementById('v25-export-menu');
    if (!exportMenu) return;

    const notesBtn = document.createElement('div');
    notesBtn.className = 'mb-3';
    notesBtn.style.cssText = 'will-change: transform; transform: translateZ(0);';
    notesBtn.innerHTML = `
      <button id="notes-toggle" 
              class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
              style="will-change: transform; transform: translateZ(0);"
              title="Quick Notes (v2.5)">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      </button>
    `;
    
    exportMenu.querySelector('.relative').prepend(notesBtn);

    // Notes modal with debounce
    let notesTimeout;
    document.getElementById('notes-toggle').addEventListener('click', () => {
      clearTimeout(notesTimeout);
      notesTimeout = setTimeout(showNotesModal, 10);
    });
  }

  // Show notes modal
  function showNotesModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
          <h2 class="text-xl font-bold">📝 Quick Notes (v2.5)</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-white/80 hover:text-white text-2xl">&times;</button>
        </div>
        
        <!-- Actions -->
        <div class="p-4 border-b border-white/10 flex gap-2 flex-wrap">
          <button onclick="notesUI.showCreateDialog(); notesUI.renderNotesList('notes-list-container')" 
                  class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition">
            ➕ New Note
          </button>
          <button onclick="notesUI.manager.exportToJSON()" 
                  class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition">
            💾 Export Notes
          </button>
          <input type="file" id="import-notes-input" accept=".json" class="hidden" onchange="handleNotesImport(this)">
          <button onclick="document.getElementById('import-notes-input').click()" 
                  class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition">
            📥 Import Notes
          </button>
        </div>
        
        <!-- Notes List -->
        <div id="notes-list-container" class="p-4 overflow-y-auto" style="max-height: 60vh;">
          <div class="text-center text-sm opacity-50">Loading notes...</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Render notes
    setTimeout(() => {
      notesUI.renderNotesList('notes-list-container');
    }, 100);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Add offline indicator
  function addOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.className = 'fixed top-4 right-4 z-50 hidden';
    indicator.innerHTML = `
      <div class="bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
        <svg class="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2a1 1 0 102 0V7zm-1 4a1 1 0 100 2 1 1 0 000-2z"></path>
        </svg>
        <span>Offline - Changes will sync when online</span>
      </div>
    `;
    
    document.body.appendChild(indicator);
  }

  // Setup offline/online sync
  function setupOfflineSync() {
    window.addEventListener('offline', () => {
      document.getElementById('offline-indicator')?.classList.remove('hidden');
      console.log('📴 Offline mode - queueing changes');
    });

    window.addEventListener('online', () => {
      document.getElementById('offline-indicator')?.classList.add('hidden');
      console.log('📶 Back online - syncing...');
      
      // Trigger service worker sync
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_OFFLINE_QUEUE'
        });
      }
      
      // Show success notification
      showSyncNotification();
    });
  }

  // Show sync notification
  function showSyncNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm';
    notification.textContent = '✅ Data synced successfully!';
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  // Global import handler
  window.handleNotesImport = async function(input) {
    if (input.files && input.files[0]) {
      try {
        const count = await notesUI.manager.importFromJSON(input.files[0]);
        alert(`✅ Imported ${count} notes successfully!`);
        notesUI.renderNotesList('notes-list-container');
      } catch (error) {
        alert('❌ Import failed: ' + error.message);
      }
    }
  };

})();
