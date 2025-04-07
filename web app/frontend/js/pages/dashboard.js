/**
 * Dashboard page functionality
 * Handles dashboard-specific interactions and data loading
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard functionality when the page is loaded
  if (document.querySelector('.dashboard-page')) {
    initDashboard();
  }
});

/**
 * Initialize dashboard functionality
 */
function initDashboard() {
  // Load dashboard data
  loadDashboardData();
  
  // Set up event listeners
  setupDashboardEvents();
}

/**
 * Load dashboard data from API
 */
async function loadDashboardData() {
  try {
    // Show loading state
    showDashboardLoading(true);
    
    // Fetch dashboard data from API
    const dashboardData = await api.dashboard.getSummary();
    
    // Update summary cards
    updateSummaryCards(dashboardData);
    
    // Update activity table
    updateActivityTable(dashboardData.recentActivity || []);
    
    // Hide loading state
    showDashboardLoading(false);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error loading dashboard data. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showDashboardLoading(false);
  }
}

/**
 * Update summary cards with dashboard data
 * @param {Object} data - Dashboard data
 */
function updateSummaryCards(data) {
  // Update forms count
  const formsCount = document.getElementById('forms-count');
  if (formsCount) {
    formsCount.textContent = data.formsCount || 0;
  }
  
  // Update recipients count
  const recipientsCount = document.getElementById('recipients-count');
  if (recipientsCount) {
    recipientsCount.textContent = data.recipientsCount || 0;
  }
  
  // Update emails sent count
  const emailsSentCount = document.getElementById('emails-sent-count');
  if (emailsSentCount) {
    emailsSentCount.textContent = data.emailsSentCount || 0;
  }
  
  // Update forms returned count
  const formsReturnedCount = document.getElementById('forms-returned-count');
  if (formsReturnedCount) {
    formsReturnedCount.textContent = data.formsReturnedCount || 0;
  }
}

/**
 * Update activity table with recent activity data
 * @param {Array} activities - List of recent activities
 */
function updateActivityTable(activities) {
  const tableBody = document.getElementById('activity-table-body');
  
  if (!tableBody) return;
  
  // Clear table
  tableBody.innerHTML = '';
  
  // Check if there are activities
  if (activities.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="3">No recent activity</td>
      </tr>
    `;
    return;
  }
  
  // Add activity rows
  activities.forEach(activity => {
    const statusClass = getStatusClass(activity.status);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(activity.date)}</td>
      <td>${activity.activity}</td>
      <td><span class="status-badge status-${statusClass}">${activity.status}</span></td>
    `;
    
    tableBody.appendChild(row);
  });
}

/**
 * Get the CSS class for a status
 * @param {string} status - Status text
 * @returns {string} - CSS class
 */
function getStatusClass(status) {
  status = status.toLowerCase();
  
  if (['completed', 'sent', 'processed'].includes(status)) {
    return 'success';
  } else if (['pending', 'in progress'].includes(status)) {
    return 'info';
  } else if (['warning', 'not returned'].includes(status)) {
    return 'warning';
  } else if (['error', 'failed'].includes(status)) {
    return 'error';
  }
  
  return 'pending';
}

/**
 * Format a date string
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Set up dashboard event listeners
 */
function setupDashboardEvents() {
  // Example: Refresh button
  const refreshBtn = document.querySelector('.dashboard-page .btn-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadDashboardData();
    });
  }
  
  // Example: New Form button
  const newFormBtn = document.querySelector('.dashboard-page .btn-primary');
  if (newFormBtn) {
    newFormBtn.addEventListener('click', () => {
      router.navigate('/forms');
    });
  }
}

/**
 * Show or hide dashboard loading state
 * @param {boolean} isLoading - Whether dashboard is loading
 */
function showDashboardLoading(isLoading) {
  const dashboardPage = document.querySelector('.dashboard-page');
  
  if (!dashboardPage) return;
  
  if (isLoading) {
    dashboardPage.classList.add('loading');
    
    // Add loading spinner if it doesn't exist
    if (!dashboardPage.querySelector('.loading-overlay')) {
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      `;
      dashboardPage.appendChild(loadingOverlay);
    }
  } else {
    dashboardPage.classList.remove('loading');
    
    // Remove loading spinner if it exists
    const loadingOverlay = dashboardPage.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }
}
