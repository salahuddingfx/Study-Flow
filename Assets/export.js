// StudyFlow v2.5 - Enhanced Export System
// CSV, JSON, and basic Excel export functionality

class ExportManager {
  constructor() {
    this.initialized = true;
  }

  // Export sessions to CSV
  exportSessionsToCSV() {
    const sessions = this.getSessionsData();
    if (!sessions || sessions.length === 0) {
      alert('No session data to export');
      return;
    }

    const headers = ['Date', 'Type', 'Duration (mins)', 'Subject', 'Completed', 'Notes'];
    const rows = sessions.map(s => [
      new Date(s.createdAt || s.date).toLocaleDateString(),
      s.type || 'Focus',
      s.duration || 25,
      s.subject || 'General',
      s.completed ? 'Yes' : 'No',
      (s.notes || '').replace(/,/g, ';') // Escape commas
    ]);

    const csv = this.arrayToCSV([headers, ...rows]);
    this.downloadFile(csv, `studyflow_sessions_${Date.now()}.csv`, 'text/csv');
    
    console.log('✅ Sessions exported to CSV');
  }

  // Export tasks to CSV
  exportTasksToCSV() {
    const tasks = this.getTasksData();
    if (!tasks || tasks.length === 0) {
      alert('No task data to export');
      return;
    }

    const headers = ['Task', 'Subject', 'Priority', 'Status', 'Due Date', 'Created', 'Completed'];
    const rows = tasks.map(t => [
      (t.title || t.task || '').replace(/,/g, ';'),
      t.subject || '',
      t.priority || 'Medium',
      t.completed ? 'Completed' : 'Pending',
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      new Date(t.createdAt || Date.now()).toLocaleDateString(),
      t.completedAt ? new Date(t.completedAt).toLocaleDateString() : ''
    ]);

    const csv = this.arrayToCSV([headers, ...rows]);
    this.downloadFile(csv, `studyflow_tasks_${Date.now()}.csv`, 'text/csv');
    
    console.log('✅ Tasks exported to CSV');
  }

  // Export subjects to CSV
  exportSubjectsToCSV() {
    const subjects = this.getSubjectsData();
    if (!subjects || subjects.length === 0) {
      alert('No subject data to export');
      return;
    }

    const headers = ['Subject', 'Total Hours', 'Sessions', 'Progress %', 'Last Studied'];
    const rows = subjects.map(s => [
      s.name || s.subject,
      (s.totalMinutes / 60 || 0).toFixed(1),
      s.sessions || 0,
      s.progress || 0,
      s.lastStudied ? new Date(s.lastStudied).toLocaleDateString() : 'Never'
    ]);

    const csv = this.arrayToCSV([headers, ...rows]);
    this.downloadFile(csv, `studyflow_subjects_${Date.now()}.csv`, 'text/csv');
    
    console.log('✅ Subjects exported to CSV');
  }

  // Export analytics to CSV
  exportAnalyticsToCSV() {
    const analytics = this.getAnalyticsData();
    if (!analytics) {
      alert('No analytics data available');
      return;
    }

    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Study Hours', (analytics.totalMinutes / 60 || 0).toFixed(1)],
      ['Total Sessions', analytics.totalSessions || 0],
      ['Completed Tasks', analytics.completedTasks || 0],
      ['Active Subjects', analytics.activeSubjects || 0],
      ['Current Streak', analytics.currentStreak || 0],
      ['Longest Streak', analytics.longestStreak || 0],
      ['Achievement Points', analytics.points || 0],
      ['Tier', analytics.tier || 'Bronze'],
      ['Total Achievements', analytics.totalAchievements || 0]
    ];

    const csv = this.arrayToCSV([headers, ...rows]);
    this.downloadFile(csv, `studyflow_analytics_${Date.now()}.csv`, 'text/csv');
    
    console.log('✅ Analytics exported to CSV');
  }

  // Export all data (combined)
  exportAllData() {
    const allData = {
      exportDate: new Date().toISOString(),
      version: '2.5.0',
      user: this.getUserData(),
      sessions: this.getSessionsData(),
      tasks: this.getTasksData(),
      subjects: this.getSubjectsData(),
      analytics: this.getAnalyticsData(),
      notes: this.getNotesData(),
      achievements: this.getAchievementsData()
    };

    const json = JSON.stringify(allData, null, 2);
    this.downloadFile(json, `studyflow_complete_backup_${Date.now()}.json`, 'application/json');
    
    console.log('✅ Complete data exported to JSON');
  }

  // Create multi-sheet CSV (TSV format for Excel)
  exportToExcelCSV() {
    const sheets = {
      'Sessions': this.prepareSessionsSheet(),
      'Tasks': this.prepareTasksSheet(),
      'Subjects': this.prepareSubjectsSheet(),
      'Analytics': this.prepareAnalyticsSheet()
    };

    let excelContent = '';
    
    for (const [sheetName, data] of Object.entries(sheets)) {
      excelContent += `\n=== ${sheetName} ===\n`;
      excelContent += this.arrayToCSV(data, '\t') + '\n';
    }

    this.downloadFile(excelContent, `studyflow_workbook_${Date.now()}.xls`, 'application/vnd.ms-excel');
    
    console.log('✅ Multi-sheet workbook exported');
  }

  // Data retrieval helpers
  getSessionsData() {
    const sessions = JSON.parse(localStorage.getItem('studyflow_sessions') || '[]');
    return sessions;
  }

  getTasksData() {
    const tasks = JSON.parse(localStorage.getItem('studyflow_tasks') || '[]');
    return tasks;
  }

  getSubjectsData() {
    const subjects = JSON.parse(localStorage.getItem('studyflow_subjects') || '[]');
    return subjects;
  }

  getAnalyticsData() {
    return {
      totalMinutes: parseInt(localStorage.getItem('studyflow_totalStudyMinutes')) || 0,
      totalSessions: parseInt(localStorage.getItem('studyflow_totalSessions')) || 0,
      completedTasks: parseInt(localStorage.getItem('studyflow_completedTasks')) || 0,
      activeSubjects: this.getSubjectsData().length,
      currentStreak: parseInt(localStorage.getItem('studyflow_currentStreak')) || 0,
      longestStreak: parseInt(localStorage.getItem('studyflow_longestStreak')) || 0,
      points: parseInt(localStorage.getItem('studyflow_points')) || 0,
      tier: localStorage.getItem('studyflow_tier') || 'Bronze',
      totalAchievements: parseInt(localStorage.getItem('studyflow_totalAchievements')) || 0
    };
  }

  getNotesData() {
    return JSON.parse(localStorage.getItem('studyflow_notes') || '[]');
  }

  getUserData() {
    const user = JSON.parse(localStorage.getItem('studyflow_user') || '{}');
    return {
      username: user.username || 'Guest',
      email: user.email || ''
    };
  }

  getAchievementsData() {
    return JSON.parse(localStorage.getItem('studyflow_achievements') || '[]');
  }

  // Sheet preparation
  prepareSessionsSheet() {
    const sessions = this.getSessionsData();
    const headers = ['Date', 'Type', 'Duration', 'Subject', 'Status'];
    const rows = sessions.map(s => [
      new Date(s.createdAt || s.date).toLocaleDateString(),
      s.type || 'Focus',
      `${s.duration || 25} min`,
      s.subject || 'General',
      s.completed ? 'Completed' : 'Incomplete'
    ]);
    return [headers, ...rows];
  }

  prepareTasksSheet() {
    const tasks = this.getTasksData();
    const headers = ['Task', 'Subject', 'Priority', 'Status', 'Due Date'];
    const rows = tasks.map(t => [
      t.title || t.task || '',
      t.subject || '',
      t.priority || 'Medium',
      t.completed ? 'Done' : 'Pending',
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''
    ]);
    return [headers, ...rows];
  }

  prepareSubjectsSheet() {
    const subjects = this.getSubjectsData();
    const headers = ['Subject', 'Hours', 'Sessions', 'Progress'];
    const rows = subjects.map(s => [
      s.name || s.subject,
      `${(s.totalMinutes / 60 || 0).toFixed(1)}h`,
      s.sessions || 0,
      `${s.progress || 0}%`
    ]);
    return [headers, ...rows];
  }

  prepareAnalyticsSheet() {
    const analytics = this.getAnalyticsData();
    return [
      ['Metric', 'Value'],
      ['Total Hours', `${(analytics.totalMinutes / 60).toFixed(1)}h`],
      ['Total Sessions', analytics.totalSessions],
      ['Completed Tasks', analytics.completedTasks],
      ['Current Streak', `${analytics.currentStreak} days`],
      ['Achievement Tier', analytics.tier],
      ['Total Points', analytics.points]
    ];
  }

  // Utility: Convert array to CSV
  arrayToCSV(data, separator = ',') {
    return data.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains separator
        if (cellStr.includes(separator) || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(separator)
    ).join('\n');
  }

  // Utility: Download file
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import data from JSON backup
  async importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Restore data
          if (data.sessions) localStorage.setItem('studyflow_sessions', JSON.stringify(data.sessions));
          if (data.tasks) localStorage.setItem('studyflow_tasks', JSON.stringify(data.tasks));
          if (data.subjects) localStorage.setItem('studyflow_subjects', JSON.stringify(data.subjects));
          if (data.notes) localStorage.setItem('studyflow_notes', JSON.stringify(data.notes));
          
          resolve(true);
          alert('Data imported successfully! Please refresh the page.');
        } catch (error) {
          reject(error);
          alert('Import failed: Invalid file format');
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

// Initialize
const exportManager = new ExportManager();

// Export for global access
window.ExportManager = ExportManager;
window.exportManager = exportManager;

console.log('📊 StudyFlow Export System v2.5 loaded');
