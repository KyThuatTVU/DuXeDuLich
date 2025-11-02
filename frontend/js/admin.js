// View Booking Modal Functions
function viewBooking(id) {
    console.log('Viewing booking:', id);
    const modal = document.getElementById('viewModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // TODO: Fetch booking details from API
    // fetch(`/api/bookings/${id}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         // Update modal content with real data
    //     });
}

function closeViewModal() {
    const modal = document.getElementById('viewModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
const viewModal = document.getElementById('viewModal');
viewModal.addEventListener('click', (e) => {
    if (e.target === viewModal) {
        closeViewModal();
    }
});

// Confirm Booking
function confirmBooking(id) {
    if (confirm('Xác nhận đơn đặt xe này?')) {
        console.log('Confirming booking:', id);
        
        // TODO: Send confirmation to API
        // fetch(`/api/bookings/${id}/confirm`, {
        //     method: 'POST'
        // })
        // .then(response => response.json())
        // .then(data => {
        //     alert('Đã xác nhận đơn đặt xe!');
        //     location.reload();
        // });

        // Demo: Update UI
        alert('Đã xác nhận đơn đặt xe thành công!');
        closeViewModal();
    }
}

// Cancel Booking
function cancelBooking(id) {
    const reason = prompt('Lý do hủy đơn (không bắt buộc):');
    
    if (reason !== null) {
        console.log('Cancelling booking:', id, 'Reason:', reason);
        
        // TODO: Send cancellation to API
        // fetch(`/api/bookings/${id}/cancel`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ reason })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     alert('Đã hủy đơn đặt xe!');
        //     location.reload();
        // });

        // Demo: Update UI
        alert('Đã hủy đơn đặt xe!');
        closeViewModal();
    }
}

// Complete Booking
function completeBooking(id) {
    if (confirm('Đánh dấu chuyến đi này đã hoàn thành?')) {
        console.log('Completing booking:', id);
        
        // TODO: Send completion to API
        // fetch(`/api/bookings/${id}/complete`, {
        //     method: 'POST'
        // })
        // .then(response => response.json())
        // .then(data => {
        //     alert('Đã hoàn thành chuyến đi!');
        //     location.reload();
        // });

        // Demo: Update UI
        alert('Đã đánh dấu hoàn thành chuyến đi!');
    }
}

// Filter functionality
const statusFilter = document.querySelector('select');
const dateFromFilter = document.querySelectorAll('input[type="date"]')[0];
const dateToFilter = document.querySelectorAll('input[type="date"]')[1];
const searchInput = document.querySelector('input[type="text"]');

function applyFilters() {
    const status = statusFilter.value;
    const dateFrom = dateFromFilter.value;
    const dateTo = dateToFilter.value;
    const search = searchInput.value.toLowerCase();

    console.log('Applying filters:', { status, dateFrom, dateTo, search });

    // TODO: Implement actual filtering logic
    // This would typically involve making an API call with filter parameters
}

// Add event listeners for filters
statusFilter.addEventListener('change', applyFilters);
dateFromFilter.addEventListener('change', applyFilters);
dateToFilter.addEventListener('change', applyFilters);

// Debounce search input
let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 500);
});

// Export to Excel functionality
function exportToExcel() {
    alert('Xuất dữ liệu ra Excel...');
    // TODO: Implement Excel export
}

// Print functionality
function printBookings() {
    window.print();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape' && !viewModal.classList.contains('hidden')) {
        closeViewModal();
    }
    
    // Ctrl+P to print
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printBookings();
    }
});

// Real-time updates simulation
function checkForNewBookings() {
    // TODO: Implement WebSocket or polling for real-time updates
    console.log('Checking for new bookings...');
}

// Check every 30 seconds
setInterval(checkForNewBookings, 30000);

// Notification sound (optional)
function playNotificationSound() {
    // const audio = new Audio('notification.mp3');
    // audio.play();
}

// Show notification
function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Xe Thảo Vy - Admin', {
            body: message,
            icon: '/favicon.ico'
        });
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin panel loaded');
    
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    dateFromFilter.value = firstDay.toISOString().split('T')[0];
    dateToFilter.value = lastDay.toISOString().split('T')[0];
});

// Stats update function
function updateStats() {
    // TODO: Fetch stats from API
    // fetch('/api/bookings/stats')
    //     .then(response => response.json())
    //     .then(data => {
    //         // Update stats cards
    //     });
}

// Update stats every minute
setInterval(updateStats, 60000);

console.log('%c🔐 Admin Panel Loaded', 'color: #2563eb; font-size: 16px; font-weight: bold;');
