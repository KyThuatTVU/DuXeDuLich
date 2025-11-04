// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Current view state
let currentView = 'dashboard';
let currentData = {};

// Helper function to upload image
async function uploadImage(imageFile) {
    if (!imageFile) {
        return null;
    }

    console.log('📤 Uploading image:', imageFile.name, imageFile.type, imageFile.size);

    const uploadFormData = new FormData();
    uploadFormData.append('image', imageFile);

    try {
        const uploadResponse = await fetch(`${API_BASE_URL}/admin/upload`, {
            method: 'POST',
            body: uploadFormData
        });

        console.log('📥 Upload response status:', uploadResponse.status);

        const uploadResult = await uploadResponse.json();
        console.log('📥 Upload result:', uploadResult);

        if (uploadResult.success) {
            console.log('✅ Image uploaded:', uploadResult.imageUrl);
            return uploadResult.imageUrl;
        } else {
            console.error('❌ Upload failed:', uploadResult.message);
            showNotification(uploadResult.message || 'Lỗi khi upload ảnh', 'error');
            return null;
        }
    } catch (error) {
        console.error('❌ Error uploading image:', error);
        showNotification('Lỗi khi upload ảnh: ' + error.message, 'error');
        return null;
    }
}

// Initialize admin page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Admin page initialized');
    displayAdminUsername();
    loadDashboard();
    setupNavigation();
    setupChangePasswordForm();
});

// Display admin username
function displayAdminUsername() {
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
    const usernameEl = document.getElementById('adminUsername');
    if (usernameEl && adminData.username) {
        usernameEl.textContent = `👤 ${adminData.username}`;
    }
}

// Change Password Modal Functions
function openChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('hidden');
    document.getElementById('changePasswordForm').reset();
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.add('hidden');
    document.getElementById('changePasswordForm').reset();
}

// Setup change password form
function setupChangePasswordForm() {
    const form = document.getElementById('changePasswordForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showNotification('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
            document.getElementById('newPassword').focus();
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('Mật khẩu mới và xác nhận mật khẩu không khớp', 'error');
            document.getElementById('confirmPassword').focus();
            return;
        }

        if (newPassword === currentPassword) {
            showNotification('Mật khẩu mới phải khác mật khẩu hiện tại', 'error');
            document.getElementById('newPassword').focus();
            return;
        }

        // Check password strength
        if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            if (!confirm('Mật khẩu nên chứa cả chữ và số để bảo mật tốt hơn. Bạn có muốn tiếp tục?')) {
                return;
            }
        }

        try {
            const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

            if (!adminData.userId) {
                showNotification('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }

            // Disable submit button to prevent double submission
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang xử lý...';

            const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: adminData.userId,
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            const result = await response.json();

            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;

            if (result.success) {
                showNotification('✅ Đổi mật khẩu thành công! Đang đăng xuất...', 'success');
                closeChangePasswordModal();

                // Logout after 2 seconds
                setTimeout(() => {
                    localStorage.removeItem('adminLoggedIn');
                    localStorage.removeItem('adminData');
                    sessionStorage.removeItem('adminLoggedIn');
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showNotification('❌ ' + (result.message || 'Đổi mật khẩu thất bại'), 'error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            showNotification('❌ Lỗi kết nối server. Vui lòng thử lại.', 'error');
            
            // Re-enable submit button on error
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-check mr-2"></i>Đổi mật khẩu';
        }
    });
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-view]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-view');
            switchView(view);

            // Update active state
            navLinks.forEach(l => l.classList.remove('active', 'bg-blue-700'));
            link.classList.add('active', 'bg-blue-700');
        });
    });
}

// Switch view
function switchView(view) {
    currentView = view;
    console.log('📄 Switching to view:', view);

    switch (view) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'statistics':
            loadStatistics();
            break;
        case 'vehicles':
            loadVehicles();
            break;
        case 'services':
            loadServices();
            break;
        case 'posts':
            loadPosts();
            break;
        case 'contacts':
            loadContacts();
            break;
        case 'accounts':
            loadAccounts();
            break;
        default:
            loadDashboard();
    }
}

// ============ DASHBOARD ============
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`);
        const result = await response.json();

        if (result.success) {
            displayDashboard(result.data);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function displayDashboard(stats) {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <h2 class="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Tổng Đặt Lịch</p>
                        <p class="text-3xl font-bold text-gray-800">${stats.totalBookings}</p>
                    </div>
                    <i class="fas fa-calendar-check text-4xl text-blue-500"></i>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Đặt Lịch Chờ</p>
                        <p class="text-3xl font-bold text-yellow-600">${stats.pendingBookings}</p>
                    </div>
                    <i class="fas fa-clock text-4xl text-yellow-500"></i>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Tổng Xe</p>
                        <p class="text-3xl font-bold text-gray-800">${stats.totalVehicles}</p>
                    </div>
                    <i class="fas fa-car text-4xl text-green-500"></i>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Tổng Dịch Vụ</p>
                        <p class="text-3xl font-bold text-gray-800">${stats.totalServices}</p>
                    </div>
                    <i class="fas fa-concierge-bell text-4xl text-purple-500"></i>
                </div>
            </div>
        </div>

        <!-- Hướng dẫn sử dụng hệ thống -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 mb-8">
            <div class="flex items-start gap-4 mb-6">
                <div class="bg-primary w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-info-circle text-white text-2xl"></i>
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-book-open text-primary mr-2"></i>Hướng Dẫn Sử Dụng Hệ Thống Admin
                    </h3>
                    <p class="text-gray-600">Chào mừng bạn đến với trang quản trị. Dưới đây là hướng dẫn chi tiết về các chức năng chính.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Đặt Lịch -->
                <div class="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center mb-3">
                        <div class="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-calendar-check text-blue-600 text-lg"></i>
                        </div>
                        <h4 class="font-bold text-gray-800 text-lg">Đặt Lịch</h4>
                    </div>
                    <ul class="space-y-2 text-sm text-gray-600">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Xem danh sách tất cả đơn đặt xe từ khách hàng</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Thay đổi trạng thái: Chờ xác nhận → Đã xác nhận → Hoàn thành</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Xem chi tiết thông tin khách hàng, điểm đón, giờ đón</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Xóa đơn đặt không hợp lệ hoặc đã hủy</span>
                        </li>
                    </ul>
                </div>

                <!-- Thống Kê -->
                <div class="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center mb-3">
                        <div class="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-chart-bar text-green-600 text-lg"></i>
                        </div>
                        <h4 class="font-bold text-gray-800 text-lg">Thống Kê</h4>
                    </div>
                    <ul class="space-y-2 text-sm text-gray-600">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Xem thống kê đơn đặt theo ngày, tháng, năm</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Lọc theo khoảng thời gian tùy chỉnh</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span><strong>Xuất Excel:</strong> Tải báo cáo chi tiết theo trạng thái</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Phân tích xu hướng đơn đặt qua thời gian</span>
                        </li>
                    </ul>
                </div>

                <!-- Quản lý Xe -->
                <div class="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center mb-3">
                        <div class="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-car text-purple-600 text-lg"></i>
                        </div>
                        <h4 class="font-bold text-gray-800 text-lg">Quản Lý Xe</h4>
                    </div>
                    <ul class="space-y-2 text-sm text-gray-600">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Thêm mới xe: Tên, loại, giá, hình ảnh, thông tin tài xế</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Chỉnh sửa thông tin xe, cập nhật giá, đổi ảnh</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Thay đổi trạng thái: Sẵn sàng / Không sẵn sàng</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Xóa xe không còn sử dụng</span>
                        </li>
                    </ul>
                </div>

                <!-- Quản lý Dịch vụ -->
                <div class="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center mb-3">
                        <div class="bg-yellow-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-concierge-bell text-yellow-600 text-lg"></i>
                        </div>
                        <h4 class="font-bold text-gray-800 text-lg">Quản Lý Dịch Vụ</h4>
                    </div>
                    <ul class="space-y-2 text-sm text-gray-600">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Thêm dịch vụ mới: Tên, mô tả, giá, hình ảnh</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Chỉnh sửa thông tin dịch vụ hiện có</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span><strong>Đổi ảnh dịch vụ:</strong> Upload ảnh mới, hiển thị ngay trang chủ</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Xóa dịch vụ không còn cung cấp</span>
                        </li>
                    </ul>
                </div>

                <!-- Quản lý Bài viết -->
                <div class="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center mb-3">
                        <div class="bg-red-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-newspaper text-red-600 text-lg"></i>
                        </div>
                        <h4 class="font-bold text-gray-800 text-lg">Quản Lý Bài Viết</h4>
                    </div>
                    <ul class="space-y-2 text-sm text-gray-600">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Đăng bài viết tin tức, khuyến mãi, hướng dẫn</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Thêm tiêu đề, nội dung, hình ảnh, danh mục</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span><strong>Tự động hiển thị:</strong> Bài viết xuất hiện ngay trang chủ</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Chỉnh sửa hoặc xóa bài viết cũ</span>
                        </li>
                    </ul>
                </div>

                <!-- Quản lý Liên hệ & Tài khoản -->
                <div class="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center mb-3">
                        <div class="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-users text-indigo-600 text-lg"></i>
                        </div>
                        <h4 class="font-bold text-gray-800 text-lg">Liên Hệ & Tài Khoản</h4>
                    </div>
                    <ul class="space-y-2 text-sm text-gray-600">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span><strong>Liên hệ:</strong> Xem, trả lời tin nhắn từ khách hàng</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span><strong>Tài khoản:</strong> Thêm, sửa, khóa tài khoản admin/nhân viên</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Phân quyền: Admin, Doanh nghiệp, Khách hàng</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i>
                            <span>Đổi mật khẩu từ menu trên cùng</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Lưu ý quan trọng -->
            <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div class="flex items-start">
                    <i class="fas fa-exclamation-triangle text-yellow-600 text-xl mr-3 mt-1"></i>
                    <div>
                        <h5 class="font-bold text-gray-800 mb-2">
                            <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>Lưu Ý Quan Trọng
                        </h5>
                        <ul class="space-y-1 text-sm text-gray-700">
                            <li>• <strong>Upload ảnh:</strong> Chọn file từ máy tính, hệ thống tự động lưu và hiển thị</li>
                            <li>• <strong>Thống kê & Excel:</strong> Vào mục "Thống Kê" để xem báo cáo và xuất file Excel chi tiết</li>
                            <li>• <strong>Trạng thái đơn:</strong> Nhớ cập nhật trạng thái đơn đặt để khách hàng biết tiến độ</li>
                            <li>• <strong>Bảo mật:</strong> Đăng xuất khi rời khỏi máy tính, đổi mật khẩu định kỳ</li>
                            <li>• <strong>Backup:</strong> Nên xuất Excel định kỳ để lưu trữ dữ liệu an toàn</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-6 flex flex-wrap gap-3">
                <button onclick="switchView('bookings')" class="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                    <i class="fas fa-calendar-check mr-2"></i>Xem Đặt Lịch
                </button>
                <button onclick="switchView('statistics')" class="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center">
                    <i class="fas fa-chart-bar mr-2"></i>Xem Thống Kê
                </button>
                <button onclick="switchView('vehicles')" class="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center">
                    <i class="fas fa-car mr-2"></i>Quản Lý Xe
                </button>
                <button onclick="switchView('posts')" class="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center">
                    <i class="fas fa-newspaper mr-2"></i>Đăng Bài Viết
                </button>
            </div>
        </div>
    `;
}

// ============ BOOKINGS ============
async function loadBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/bookings`);
        const result = await response.json();

        if (result.success) {
            displayBookings(result.data);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function displayBookings(bookings) {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold text-gray-800">Quản Lý Đặt Lịch</h2>
        </div>
        
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách Hàng</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện Thoại</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm Đón</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Đón</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${bookings.map(booking => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">#${booking.booking_id}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${booking.customer_name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">${booking.customer_phone}</td>
                            <td class="px-6 py-4 text-sm">${booking.pickup_location}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">${formatDate(booking.pickup_date)}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <select onchange="updateBookingStatus(${booking.booking_id}, this.value)" 
                                        class="border rounded px-2 py-1 text-sm ${getStatusClass(booking.status)}">
                                    <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Chờ Xác Nhận</option>
                                    <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Đã Xác Nhận</option>
                                    <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Hoàn Thành</option>
                                    <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Đã Hủy</option>
                                </select>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <button onclick="viewBookingDetail(${booking.booking_id})" 
                                        class="text-blue-600 hover:text-blue-800 mr-3" title="Xem chi tiết">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="deleteBooking(${booking.booking_id})" 
                                        class="text-red-600 hover:text-red-800" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function viewBookingDetail(bookingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
        const result = await response.json();

        if (result.success) {
            const booking = result.data;
            showModal('Chi Tiết Đặt Lịch', `
                <div class="space-y-4">
                    <div><strong>Mã đặt lịch:</strong> #${booking.booking_id}</div>
                    <div><strong>Khách hàng:</strong> ${booking.customer_name}</div>
                    <div><strong>Điện thoại:</strong> ${booking.customer_phone}</div>
                    <div><strong>Email:</strong> ${booking.customer_email || 'N/A'}</div>
                    <div><strong>Điểm đón:</strong> ${booking.pickup_location}</div>
                    <div><strong>Điểm trả:</strong> ${booking.dropoff_location || 'N/A'}</div>
                    <div><strong>Ngày đón:</strong> ${formatDate(booking.pickup_date)}</div>
                    <div><strong>Giờ đón:</strong> ${booking.pickup_time}</div>
                    <div><strong>Số hành khách:</strong> ${booking.number_of_passengers || 'N/A'}</div>
                    <div><strong>Loại dịch vụ:</strong> ${booking.service_type || 'N/A'}</div>
                    <div><strong>Ghi chú:</strong> ${booking.notes || 'Không có'}</div>
                    <div><strong>Trạng thái:</strong> <span class="px-2 py-1 text-xs rounded-full ${getStatusClass(booking.status)}">${getStatusText(booking.status)}</span></div>
                </div>
            `);
        }
    } catch (error) {
        console.error('Error viewing booking:', error);
        showNotification('Lỗi khi xem chi tiết', 'error');
    }
}

async function deleteBooking(bookingId) {
    if (!confirm('Bạn có chắc chắn muốn xóa đặt lịch này?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Xóa đặt lịch thành công', 'success');
            loadBookings();
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        showNotification('Lỗi khi xóa đặt lịch', 'error');
    }
}

window.viewBookingDetail = viewBookingDetail;
window.deleteBooking = deleteBooking;

async function updateBookingStatus(bookingId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Cập nhật trạng thái thành công', 'success');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Lỗi cập nhật trạng thái', 'error');
    }
}

window.updateBookingStatus = updateBookingStatus;

// ============ VEHICLES ============
async function loadVehicles() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/vehicles`);
        const result = await response.json();

        if (result.success) {
            displayVehicles(result.data);
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
    }
}

function displayVehicles(vehicles) {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold text-gray-800">Quản Lý Xe</h2>
            <button onclick="showAddVehicleForm()" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                <i class="fas fa-plus mr-2"></i>Thêm Xe Mới
            </button>
        </div>
        
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Xe</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá/Ngày</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh Giá</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${vehicles.map(vehicle => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                ${vehicle.image ? `<img src="${vehicle.image}" alt="${vehicle.name}" class="w-16 h-16 object-cover rounded" onerror="this.src='https://via.placeholder.com/64?text=No+Image'">` : '<div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center"><i class="fas fa-car text-gray-400"></i></div>'}
                            </td>
                            <td class="px-6 py-4 text-sm font-medium">
                                <div>${vehicle.name}</div>
                                <div class="text-xs text-gray-500">#${vehicle.vehicle_id}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">${vehicle.type}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <div>${formatPrice(vehicle.price_per_day)}</div>
                                <div class="text-xs text-gray-500">${formatPrice(vehicle.price_per_km)}/km</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                ${vehicle.rating ? `<span class="text-yellow-500"><i class="fas fa-star"></i> ${vehicle.rating}</span>` : 'N/A'}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 text-xs rounded-full ${vehicle.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                    ${vehicle.status === 'available' ? 'Sẵn Sàng' : 'Không Sẵn Sàng'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <button onclick="viewVehicleDetail(${vehicle.vehicle_id})" 
                                        class="text-green-600 hover:text-green-800 mr-3" title="Xem">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="editVehicle(${vehicle.vehicle_id})" 
                                        class="text-blue-600 hover:text-blue-800 mr-3" title="Sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteVehicle(${vehicle.vehicle_id})" 
                                        class="text-red-600 hover:text-red-800" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showAddVehicleForm() {
    showModal('Thêm Xe Mới', `
        <form id="vehicleForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tên Xe *</label>
                <input type="text" name="name" required class="w-full px-3 py-2 border rounded-lg" placeholder="VD: Toyota Vios 2023">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Loại Xe *</label>
                <select name="type" required class="w-full px-3 py-2 border rounded-lg">
                    <option value="">-- Chọn loại xe --</option>
                    <option value="4 chỗ">4 chỗ</option>
                    <option value="7 chỗ">7 chỗ</option>
                    <option value="16 chỗ">16 chỗ</option>
                    <option value="29 chỗ">29 chỗ</option>
                    <option value="45 chỗ">45 chỗ</option>
                    <option value="4 chỗ VIP">4 chỗ VIP</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hình Ảnh *</label>
                <input type="file" id="vehicleImageFile" accept="image/*" class="w-full px-3 py-2 border rounded-lg">
                <p class="text-xs text-gray-500 mt-1">Chọn file ảnh từ máy tính (JPEG, PNG, GIF, WEBP - tối đa 5MB)</p>
                <div id="imagePreview" class="mt-2 hidden">
                    <img src="" alt="Preview" class="w-32 h-32 object-cover rounded-lg border">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mô Tả</label>
                <textarea name="description" rows="3" class="w-full px-3 py-2 border rounded-lg" placeholder="Mô tả chi tiết về xe..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Giá/Ngày (VNĐ) *</label>
                    <input type="number" name="price_per_day" required class="w-full px-3 py-2 border rounded-lg" placeholder="800000">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Giá/Km (VNĐ) *</label>
                    <input type="number" name="price_per_km" required class="w-full px-3 py-2 border rounded-lg" placeholder="8000">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                    <select name="status" class="w-full px-3 py-2 border rounded-lg">
                        <option value="available">Sẵn Sàng</option>
                        <option value="unavailable">Không Sẵn Sàng</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Đánh Giá (1-5)</label>
                    <input type="number" name="rating" min="1" max="5" step="0.1" class="w-full px-3 py-2 border rounded-lg" placeholder="4.8">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Thông Tin Tài Xế</label>
                <textarea name="driver_info" rows="2" class="w-full px-3 py-2 border rounded-lg" placeholder="VD: Tài xế: Nguyễn Văn A - 10 năm kinh nghiệm"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Thông Tin Bảo Hiểm</label>
                <textarea name="insurance_info" rows="2" class="w-full px-3 py-2 border rounded-lg" placeholder="VD: Bảo hiểm vật chất, bảo hiểm thân vỏ, bảo hiểm người ngồi trên xe"></textarea>
            </div>
            <div class="flex justify-end gap-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
                <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                    <i class="fas fa-plus mr-2"></i>Thêm Xe
                </button>
            </div>
        </form>
    `);

    // Image preview
    document.getElementById('vehicleImageFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                preview.querySelector('img').src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Upload image first
        const imageFile = document.getElementById('vehicleImageFile').files[0];
        const imageUrl = await uploadImage(imageFile);

        if (imageFile && !imageUrl) {
            // Upload failed, stop here
            return;
        }

        // Create vehicle with image URL
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.image = imageUrl;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/vehicles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                showNotification('Thêm xe thành công', 'success');
                closeModal();
                loadVehicles();
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
            showNotification('Lỗi khi thêm xe', 'error');
        }
    });
}

async function viewVehicleDetail(vehicleId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/vehicles`);
        const result = await response.json();

        if (result.success) {
            const vehicle = result.data.find(v => v.vehicle_id === vehicleId);
            if (vehicle) {
                showModal('Chi Tiết Xe', `
                    <div class="space-y-4">
                        ${vehicle.image ? `<img src="${vehicle.image}" alt="${vehicle.name}" class="w-full h-48 object-cover rounded-lg mb-4" onerror="this.style.display='none'">` : ''}
                        <div><strong>Mã xe:</strong> #${vehicle.vehicle_id}</div>
                        <div><strong>Tên xe:</strong> ${vehicle.name}</div>
                        <div><strong>Loại:</strong> ${vehicle.type}</div>
                        <div><strong>Mô tả:</strong> ${vehicle.description || 'Không có'}</div>
                        <div><strong>Giá thuê/ngày:</strong> ${formatPrice(vehicle.price_per_day)}</div>
                        <div><strong>Giá thuê/km:</strong> ${formatPrice(vehicle.price_per_km)}</div>
                        <div><strong>Đánh giá:</strong> ${vehicle.rating ? `⭐ ${vehicle.rating}/5` : 'Chưa có'}</div>
                        <div><strong>Trạng thái:</strong> <span class="px-2 py-1 text-xs rounded-full ${vehicle.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${vehicle.status === 'available' ? 'Sẵn Sàng' : 'Không Sẵn Sàng'}</span></div>
                        <div><strong>Thông tin tài xế:</strong> ${vehicle.driver_info || 'Không có'}</div>
                        <div><strong>Thông tin bảo hiểm:</strong> ${vehicle.insurance_info || 'Không có'}</div>
                        <div><strong>Ngày tạo:</strong> ${formatDate(vehicle.created_at)}</div>
                    </div>
                `);
            }
        }
    } catch (error) {
        console.error('Error viewing vehicle:', error);
        showNotification('Lỗi khi xem chi tiết', 'error');
    }
}

async function editVehicle(vehicleId) {
    try {
        // Fetch vehicle data
        const response = await fetch(`${API_BASE_URL}/admin/vehicles`);
        const result = await response.json();

        if (!result.success) {
            showNotification('Lỗi khi tải dữ liệu xe', 'error');
            return;
        }

        const vehicle = result.data.find(v => v.vehicle_id === vehicleId);
        if (!vehicle) {
            showNotification('Không tìm thấy xe', 'error');
            return;
        }

        // Show edit form with pre-filled data
        showModal('Chỉnh Sửa Xe', `
            <form id="editVehicleForm" class="space-y-4">
                <input type="hidden" name="vehicle_id" value="${vehicle.vehicle_id}">
                <input type="hidden" name="current_image" value="${vehicle.image || ''}">
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tên Xe *</label>
                    <input type="text" name="name" required value="${vehicle.name}" class="w-full px-3 py-2 border rounded-lg">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Loại Xe *</label>
                    <select name="type" required class="w-full px-3 py-2 border rounded-lg">
                        <option value="4 chỗ" ${vehicle.type === '4 chỗ' ? 'selected' : ''}>4 chỗ</option>
                        <option value="7 chỗ" ${vehicle.type === '7 chỗ' ? 'selected' : ''}>7 chỗ</option>
                        <option value="16 chỗ" ${vehicle.type === '16 chỗ' ? 'selected' : ''}>16 chỗ</option>
                        <option value="29 chỗ" ${vehicle.type === '29 chỗ' ? 'selected' : ''}>29 chỗ</option>
                        <option value="45 chỗ" ${vehicle.type === '45 chỗ' ? 'selected' : ''}>45 chỗ</option>
                        <option value="4 chỗ VIP" ${vehicle.type === '4 chỗ VIP' ? 'selected' : ''}>4 chỗ VIP</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Hình Ảnh</label>
                    ${vehicle.image ? `
                        <div class="mb-2">
                            <img src="${vehicle.image}" alt="Current" class="w-32 h-32 object-cover rounded-lg border">
                            <p class="text-xs text-gray-500 mt-1">Ảnh hiện tại</p>
                        </div>
                    ` : ''}
                    <input type="file" id="editVehicleImageFile" accept="image/*" class="w-full px-3 py-2 border rounded-lg">
                    <p class="text-xs text-gray-500 mt-1">Chọn file ảnh mới từ máy tính (để trống nếu không đổi)</p>
                    <div id="editImagePreview" class="mt-2 hidden">
                        <img src="" alt="Preview" class="w-32 h-32 object-cover rounded-lg border">
                        <p class="text-xs text-gray-500 mt-1">Ảnh mới</p>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mô Tả</label>
                    <textarea name="description" rows="3" class="w-full px-3 py-2 border rounded-lg">${vehicle.description || ''}</textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Giá/Ngày (VNĐ) *</label>
                        <input type="number" name="price_per_day" required value="${vehicle.price_per_day}" class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Giá/Km (VNĐ) *</label>
                        <input type="number" name="price_per_km" required value="${vehicle.price_per_km}" class="w-full px-3 py-2 border rounded-lg">
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                        <select name="status" class="w-full px-3 py-2 border rounded-lg">
                            <option value="available" ${vehicle.status === 'available' ? 'selected' : ''}>Sẵn Sàng</option>
                            <option value="unavailable" ${vehicle.status === 'unavailable' ? 'selected' : ''}>Không Sẵn Sàng</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Đánh Giá (1-5)</label>
                        <input type="number" name="rating" min="1" max="5" step="0.1" value="${vehicle.rating || ''}" class="w-full px-3 py-2 border rounded-lg">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Thông Tin Tài Xế</label>
                    <textarea name="driver_info" rows="2" class="w-full px-3 py-2 border rounded-lg">${vehicle.driver_info || ''}</textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Thông Tin Bảo Hiểm</label>
                    <textarea name="insurance_info" rows="2" class="w-full px-3 py-2 border rounded-lg">${vehicle.insurance_info || ''}</textarea>
                </div>
                
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-save mr-2"></i>Lưu Thay Đổi
                    </button>
                </div>
            </form>
        `);

        // Image preview for edit
        const editImageInput = document.getElementById('editVehicleImageFile');
        if (editImageInput) {
            editImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const preview = document.getElementById('editImagePreview');
                        preview.querySelector('img').src = e.target.result;
                        preview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Handle form submission
        document.getElementById('editVehicleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            const vehicleId = data.vehicle_id;
            const currentImage = data.current_image;
            delete data.vehicle_id;
            delete data.current_image;

            // Upload new image if selected
            const imageFile = document.getElementById('editVehicleImageFile').files[0];
            if (imageFile) {
                const newImageUrl = await uploadImage(imageFile);
                if (!newImageUrl) {
                    // Upload failed, stop here
                    return;
                }
                data.image = newImageUrl;
            } else {
                // Keep current image if no new image selected
                data.image = currentImage;
            }

            try {
                const updateResponse = await fetch(`${API_BASE_URL}/admin/vehicles/${vehicleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const updateResult = await updateResponse.json();
                if (updateResult.success) {
                    showNotification('Cập nhật xe thành công', 'success');
                    closeModal();
                    loadVehicles();
                } else {
                    showNotification(updateResult.message || 'Lỗi khi cập nhật xe', 'error');
                }
            } catch (error) {
                console.error('Error updating vehicle:', error);
                showNotification('Lỗi khi cập nhật xe', 'error');
            }
        });

    } catch (error) {
        console.error('Error editing vehicle:', error);
        showNotification('Lỗi khi tải dữ liệu xe', 'error');
    }
}

async function deleteVehicle(vehicleId) {
    if (!confirm('Bạn có chắc chắn muốn xóa xe này?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/vehicles/${vehicleId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Xóa xe thành công', 'success');
            loadVehicles();
        }
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        showNotification('Lỗi khi xóa xe', 'error');
    }
}

window.showAddVehicleForm = showAddVehicleForm;
window.viewVehicleDetail = viewVehicleDetail;
window.editVehicle = editVehicle;
window.deleteVehicle = deleteVehicle;

// ============ SERVICES ============
async function loadServices() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/services`);
        const result = await response.json();

        if (result.success) {
            displayServices(result.data);
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

function displayServices(services) {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold text-gray-800">Quản Lý Dịch Vụ</h2>
            <button onclick="showAddServiceForm()" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                <i class="fas fa-plus mr-2"></i>Thêm Dịch Vụ Mới
            </button>
        </div>
        
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Dịch Vụ</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô Tả</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${services.map(service => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                ${service.image ? `<img src="${service.image}" alt="${service.service_name}" class="w-16 h-16 object-cover rounded" onerror="this.src='https://via.placeholder.com/64?text=No+Image'">` : '<div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center"><i class="fas fa-concierge-bell text-gray-400"></i></div>'}
                            </td>
                            <td class="px-6 py-4 text-sm font-medium">
                                <div>${service.service_name}</div>
                                <div class="text-xs text-gray-500">#${service.service_id}</div>
                            </td>
                            <td class="px-6 py-4 text-sm max-w-xs truncate">${service.description || 'N/A'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                ${service.price ? formatPrice(service.price) : 'Liên hệ'}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <button onclick="viewServiceDetail(${service.service_id})" 
                                        class="text-green-600 hover:text-green-800 mr-3" title="Xem">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="editService(${service.service_id})" 
                                        class="text-blue-600 hover:text-blue-800 mr-3" title="Sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteService(${service.service_id})" 
                                        class="text-red-600 hover:text-red-800" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showAddServiceForm() {
    showModal('Thêm Dịch Vụ Mới', `
        <form id="serviceForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tên Dịch Vụ *</label>
                <input type="text" name="service_name" required class="w-full px-3 py-2 border rounded-lg" placeholder="VD: Đưa đón sân bay">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mô Tả</label>
                <textarea name="description" rows="4" class="w-full px-3 py-2 border rounded-lg" placeholder="Mô tả chi tiết về dịch vụ..."></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                <input type="number" name="price" class="w-full px-3 py-2 border rounded-lg" placeholder="Để trống nếu giá liên hệ">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hình Ảnh</label>
                <input type="file" id="serviceImageFile" accept="image/*" class="w-full px-3 py-2 border rounded-lg">
                <p class="text-xs text-gray-500 mt-1">Chọn file ảnh từ máy tính (tùy chọn)</p>
                <div id="serviceImagePreview" class="mt-2 hidden">
                    <img src="" alt="Preview" class="w-32 h-32 object-cover rounded-lg border">
                </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
                <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                    <i class="fas fa-plus mr-2"></i>Thêm Dịch Vụ
                </button>
            </div>
        </form>
    `);

    // Image preview
    document.getElementById('serviceImageFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('serviceImagePreview');
                preview.querySelector('img').src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('serviceForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Upload image if selected
        const imageFile = document.getElementById('serviceImageFile').files[0];
        const imageUrl = await uploadImage(imageFile);

        if (imageFile && !imageUrl) {
            return;
        }

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.image = imageUrl;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                showNotification('Thêm dịch vụ thành công', 'success');
                closeModal();
                loadServices();
            }
        } catch (error) {
            console.error('Error adding service:', error);
            showNotification('Lỗi khi thêm dịch vụ', 'error');
        }
    });
}

async function viewServiceDetail(serviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/services`);
        const result = await response.json();

        if (result.success) {
            const service = result.data.find(s => s.service_id === serviceId);
            if (service) {
                showModal('Chi Tiết Dịch Vụ', `
                    <div class="space-y-4">
                        ${service.image ? `<img src="${service.image}" alt="${service.service_name}" class="w-full h-48 object-cover rounded-lg mb-4" onerror="this.style.display='none'">` : ''}
                        <div><strong>Mã dịch vụ:</strong> #${service.service_id}</div>
                        <div><strong>Tên dịch vụ:</strong> ${service.service_name}</div>
                        <div><strong>Mô tả:</strong> ${service.description || 'Không có'}</div>
                        <div><strong>Giá:</strong> ${service.price ? formatPrice(service.price) : 'Liên hệ'}</div>
                        <div><strong>Ngày tạo:</strong> ${formatDate(service.created_at)}</div>
                    </div>
                `);
            }
        }
    } catch (error) {
        console.error('Error viewing service:', error);
        showNotification('Lỗi khi xem chi tiết', 'error');
    }
}

async function editService(serviceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/services`);
        const result = await response.json();

        if (!result.success) {
            showNotification('Lỗi khi tải dữ liệu dịch vụ', 'error');
            return;
        }

        const service = result.data.find(s => s.service_id === serviceId);
        if (!service) {
            showNotification('Không tìm thấy dịch vụ', 'error');
            return;
        }

        showModal('Chỉnh Sửa Dịch Vụ', `
            <form id="editServiceForm" class="space-y-4">
                <input type="hidden" name="service_id" value="${service.service_id}">
                <input type="hidden" name="current_image" value="${service.image || ''}">
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tên Dịch Vụ *</label>
                    <input type="text" name="service_name" required value="${service.service_name}" class="w-full px-3 py-2 border rounded-lg">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mô Tả</label>
                    <textarea name="description" rows="4" class="w-full px-3 py-2 border rounded-lg">${service.description || ''}</textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                    <input type="number" name="price" value="${service.price || ''}" class="w-full px-3 py-2 border rounded-lg">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Hình Ảnh</label>
                    ${service.image ? `
                        <div class="mb-2">
                            <img src="${service.image}" alt="Current" class="w-32 h-32 object-cover rounded-lg border">
                            <p class="text-xs text-gray-500 mt-1">Ảnh hiện tại</p>
                        </div>
                    ` : ''}
                    <input type="file" id="editServiceImageFile" accept="image/*" class="w-full px-3 py-2 border rounded-lg">
                    <p class="text-xs text-gray-500 mt-1">Chọn file ảnh mới (để trống nếu không đổi)</p>
                    <div id="editServiceImagePreview" class="mt-2 hidden">
                        <img src="" alt="Preview" class="w-32 h-32 object-cover rounded-lg border">
                        <p class="text-xs text-gray-500 mt-1">Ảnh mới</p>
                    </div>
                </div>
                
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-save mr-2"></i>Lưu Thay Đổi
                    </button>
                </div>
            </form>
        `);

        // Image preview
        const editImageInput = document.getElementById('editServiceImageFile');
        if (editImageInput) {
            editImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const preview = document.getElementById('editServiceImagePreview');
                        preview.querySelector('img').src = e.target.result;
                        preview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        document.getElementById('editServiceForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            const serviceId = data.service_id;
            const currentImage = data.current_image;
            delete data.service_id;
            delete data.current_image;

            // Upload new image if selected
            const imageFile = document.getElementById('editServiceImageFile').files[0];
            if (imageFile) {
                const newImageUrl = await uploadImage(imageFile);
                if (!newImageUrl) {
                    return;
                }
                data.image = newImageUrl;
            } else {
                data.image = currentImage;
            }

            try {
                const updateResponse = await fetch(`${API_BASE_URL}/admin/services/${serviceId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const updateResult = await updateResponse.json();
                if (updateResult.success) {
                    showNotification('Cập nhật dịch vụ thành công', 'success');
                    closeModal();
                    loadServices();
                } else {
                    showNotification(updateResult.message || 'Lỗi khi cập nhật dịch vụ', 'error');
                }
            } catch (error) {
                console.error('Error updating service:', error);
                showNotification('Lỗi khi cập nhật dịch vụ', 'error');
            }
        });

    } catch (error) {
        console.error('Error editing service:', error);
        showNotification('Lỗi khi tải dữ liệu dịch vụ', 'error');
    }
}

async function deleteService(serviceId) {
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/services/${serviceId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Xóa dịch vụ thành công', 'success');
            loadServices();
        }
    } catch (error) {
        console.error('Error deleting service:', error);
        showNotification('Lỗi khi xóa dịch vụ', 'error');
    }
}

window.showAddServiceForm = showAddServiceForm;
window.viewServiceDetail = viewServiceDetail;
window.editService = editService;
window.deleteService = deleteService;

// ============ POSTS ============
async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/posts`);
        const result = await response.json();

        if (result.success) {
            displayPosts(result.data);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function displayPosts(posts) {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold text-gray-800">Quản Lý Bài Viết</h2>
            <button onclick="showAddPostForm()" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                <i class="fas fa-plus mr-2"></i>Thêm Bài Viết
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${posts.map(post => `
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="font-bold text-lg mb-2">${post.title}</h3>
                    <p class="text-gray-600 text-sm mb-4">${post.content ? post.content.substring(0, 100) + '...' : ''}</p>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-xs text-gray-500">${formatDate(post.created_at)}</span>
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${post.category || 'Chung'}</span>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button onclick="editPost(${post.post_id})" class="text-blue-600 hover:text-blue-800" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deletePost(${post.post_id})" class="text-red-600 hover:text-red-800" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function showAddPostForm() {
    showModal('Thêm Bài Viết Mới', `
        <form id="postForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu Đề</label>
                <input type="text" name="title" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nội Dung</label>
                <textarea name="content" rows="6" required class="w-full px-3 py-2 border rounded-lg"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Danh Mục</label>
                <select name="category" class="w-full px-3 py-2 border rounded-lg">
                    <option value="Tin tức">Tin tức</option>
                    <option value="Khuyến mãi">Khuyến mãi</option>
                    <option value="Hướng dẫn">Hướng dẫn</option>
                    <option value="Chung">Chung</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hình Ảnh</label>
                <input type="file" id="postImageFile" accept="image/*" class="w-full px-3 py-2 border rounded-lg">
                <p class="text-xs text-gray-500 mt-1">Chọn file ảnh từ máy tính (tùy chọn)</p>
                <div id="postImagePreview" class="mt-2 hidden">
                    <img src="" alt="Preview" class="w-32 h-32 object-cover rounded-lg border">
                </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
                <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">Thêm Bài Viết</button>
            </div>
        </form>
    `);

    // Image preview for post
    document.getElementById('postImageFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('postImagePreview');
                preview.querySelector('img').src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('postForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Upload image if selected
        const imageFile = document.getElementById('postImageFile').files[0];
        const imageUrl = await uploadImage(imageFile);

        if (imageFile && !imageUrl) {
            // Upload failed, stop here
            return;
        }

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.image = imageUrl;
        data.created_by = 1; // TODO: Get from logged in user

        try {
            const response = await fetch(`${API_BASE_URL}/admin/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                showNotification('Thêm bài viết thành công', 'success');
                closeModal();
                loadPosts();
            }
        } catch (error) {
            console.error('Error adding post:', error);
            showNotification('Lỗi khi thêm bài viết', 'error');
        }
    });
}

async function editPost(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/posts`);
        const result = await response.json();

        if (!result.success) {
            showNotification('Lỗi khi tải dữ liệu bài viết', 'error');
            return;
        }

        const post = result.data.find(p => p.post_id === postId);
        if (!post) {
            showNotification('Không tìm thấy bài viết', 'error');
            return;
        }

        showModal('Chỉnh Sửa Bài Viết', `
            <form id="editPostForm" class="space-y-4">
                <input type="hidden" name="post_id" value="${post.post_id}">
                <input type="hidden" name="current_image" value="${post.image || ''}">
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu Đề *</label>
                    <input type="text" name="title" required value="${post.title}" class="w-full px-3 py-2 border rounded-lg">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nội Dung *</label>
                    <textarea name="content" rows="6" required class="w-full px-3 py-2 border rounded-lg">${post.content || ''}</textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Danh Mục</label>
                    <select name="category" class="w-full px-3 py-2 border rounded-lg">
                        <option value="Tin tức" ${post.category === 'Tin tức' ? 'selected' : ''}>Tin tức</option>
                        <option value="Khuyến mãi" ${post.category === 'Khuyến mãi' ? 'selected' : ''}>Khuyến mãi</option>
                        <option value="Hướng dẫn" ${post.category === 'Hướng dẫn' ? 'selected' : ''}>Hướng dẫn</option>
                        <option value="Chung" ${post.category === 'Chung' ? 'selected' : ''}>Chung</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Hình Ảnh</label>
                    ${post.image ? `
                        <div class="mb-2">
                            <img src="${post.image}" alt="Current" class="w-32 h-32 object-cover rounded-lg border">
                            <p class="text-xs text-gray-500 mt-1">Ảnh hiện tại</p>
                        </div>
                    ` : ''}
                    <input type="file" id="editPostImageFile" accept="image/*" class="w-full px-3 py-2 border rounded-lg">
                    <p class="text-xs text-gray-500 mt-1">Chọn file ảnh mới (để trống nếu không đổi)</p>
                    <div id="editPostImagePreview" class="mt-2 hidden">
                        <img src="" alt="Preview" class="w-32 h-32 object-cover rounded-lg border">
                        <p class="text-xs text-gray-500 mt-1">Ảnh mới</p>
                    </div>
                </div>
                
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-save mr-2"></i>Lưu Thay Đổi
                    </button>
                </div>
            </form>
        `);

        // Image preview
        const editImageInput = document.getElementById('editPostImageFile');
        if (editImageInput) {
            editImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const preview = document.getElementById('editPostImagePreview');
                        preview.querySelector('img').src = e.target.result;
                        preview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        document.getElementById('editPostForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            const postId = data.post_id;
            const currentImage = data.current_image;
            delete data.post_id;
            delete data.current_image;

            // Upload new image if selected
            const imageFile = document.getElementById('editPostImageFile').files[0];
            if (imageFile) {
                const newImageUrl = await uploadImage(imageFile);
                if (!newImageUrl) {
                    return;
                }
                data.image = newImageUrl;
            } else {
                data.image = currentImage;
            }

            try {
                const updateResponse = await fetch(`${API_BASE_URL}/admin/posts/${postId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const updateResult = await updateResponse.json();
                if (updateResult.success) {
                    showNotification('Cập nhật bài viết thành công', 'success');
                    closeModal();
                    loadPosts();
                } else {
                    showNotification(updateResult.message || 'Lỗi khi cập nhật bài viết', 'error');
                }
            } catch (error) {
                console.error('Error updating post:', error);
                showNotification('Lỗi khi cập nhật bài viết', 'error');
            }
        });

    } catch (error) {
        console.error('Error editing post:', error);
        showNotification('Lỗi khi tải dữ liệu bài viết', 'error');
    }
}

async function deletePost(postId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/posts/${postId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Xóa bài viết thành công', 'success');
            loadPosts();
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        showNotification('Lỗi khi xóa bài viết', 'error');
    }
}

window.showAddPostForm = showAddPostForm;
window.editPost = editPost;
window.deletePost = deletePost;

// ============ CONTACTS ============
async function loadContacts() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contacts`);
        const result = await response.json();

        if (result.success) {
            displayContacts(result.data);
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

function displayContacts(contacts) {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <h2 class="text-3xl font-bold text-gray-800 mb-8">Quản Lý Liên Hệ</h2>
        
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện Thoại</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tin Nhắn</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${contacts.map(contact => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">#${contact.contact_id}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${contact.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">${contact.phone}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">${contact.email || 'N/A'}</td>
                            <td class="px-6 py-4 text-sm max-w-xs truncate">${contact.message || 'N/A'}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <select onchange="updateContactStatus(${contact.contact_id}, this.value)" 
                                        class="border rounded px-2 py-1 text-sm ${contact.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                                    <option value="new" ${contact.status === 'new' ? 'selected' : ''}>Mới</option>
                                    <option value="replied" ${contact.status === 'replied' ? 'selected' : ''}>Đã Trả Lời</option>
                                </select>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <button onclick="viewContactDetail(${contact.contact_id})" 
                                        class="text-blue-600 hover:text-blue-800 mr-3" title="Xem chi tiết">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="deleteContact(${contact.contact_id})" 
                                        class="text-red-600 hover:text-red-800" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function updateContactStatus(contactId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contacts/${contactId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Cập nhật trạng thái thành công', 'success');
        }
    } catch (error) {
        console.error('Error updating contact status:', error);
        showNotification('Lỗi cập nhật trạng thái', 'error');
    }
}

async function viewContactDetail(contactId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contacts`);
        const result = await response.json();

        if (result.success) {
            const contact = result.data.find(c => c.contact_id === contactId);
            if (contact) {
                showModal('Chi Tiết Liên Hệ', `
                    <div class="space-y-4">
                        <div><strong>Mã liên hệ:</strong> #${contact.contact_id}</div>
                        <div><strong>Tên:</strong> ${contact.name}</div>
                        <div><strong>Điện thoại:</strong> ${contact.phone}</div>
                        <div><strong>Email:</strong> ${contact.email || 'N/A'}</div>
                        <div><strong>Tin nhắn:</strong><br>${contact.message || 'Không có'}</div>
                        <div><strong>Ngày gửi:</strong> ${formatDate(contact.created_at)}</div>
                        <div><strong>Trạng thái:</strong> <span class="px-2 py-1 text-xs rounded-full ${contact.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">${contact.status === 'new' ? 'Mới' : 'Đã Trả Lời'}</span></div>
                    </div>
                `);
            }
        }
    } catch (error) {
        console.error('Error viewing contact:', error);
        showNotification('Lỗi khi xem chi tiết', 'error');
    }
}

async function deleteContact(contactId) {
    if (!confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/contacts/${contactId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Xóa liên hệ thành công', 'success');
            loadContacts();
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        showNotification('Lỗi khi xóa liên hệ', 'error');
    }
}

window.updateContactStatus = updateContactStatus;
window.viewContactDetail = viewContactDetail;
window.deleteContact = deleteContact;

// ============ ACCOUNTS MANAGEMENT ============
async function loadAccounts() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`);
        const result = await response.json();

        if (result.success) {
            displayAccounts(result.data);
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
    }
}

function displayAccounts(accounts) {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold text-gray-800">Quản Lý Tài Khoản</h2>
            <button onclick="showAddAccountForm()" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                <i class="fas fa-plus mr-2"></i>Thêm Tài Khoản
            </button>
        </div>
        
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Đăng Nhập</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện Thoại</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai Trò</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Tạo</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${accounts.map(account => `
                        <tr class="${account.is_active === false ? 'bg-gray-50 opacity-60' : ''}">
                            <td class="px-6 py-4 whitespace-nowrap text-sm">#${account.user_id}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${account.username}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">${account.email || 'N/A'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">${account.phone || 'N/A'}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 text-xs rounded-full ${getRoleClass(account.role)}">
                                    ${getRoleText(account.role)}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 text-xs rounded-full ${account.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                    ${account.is_active !== false ? 'Hoạt động' : 'Vô hiệu hóa'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">${formatDate(account.created_at)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <button onclick="toggleAccountStatus(${account.user_id}, ${account.is_active !== false})" 
                                        class="${account.is_active !== false ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'} mr-3" 
                                        title="${account.is_active !== false ? 'Vô hiệu hóa' : 'Kích hoạt'}">
                                    <i class="fas fa-${account.is_active !== false ? 'ban' : 'check-circle'}"></i>
                                </button>
                                <button onclick="editAccount(${account.user_id})" 
                                        class="text-blue-600 hover:text-blue-800 mr-3" title="Sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteAccount(${account.user_id})" 
                                        class="text-red-600 hover:text-red-800" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showAddAccountForm() {
    showModal('Thêm Tài Khoản Mới', `
        <form id="accountForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tên Đăng Nhập *</label>
                <input type="text" name="username" required class="w-full px-3 py-2 border rounded-lg" placeholder="VD: admin123">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mật Khẩu *</label>
                <input type="password" name="password" required class="w-full px-3 py-2 border rounded-lg" placeholder="Nhập mật khẩu">
                <p class="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" class="w-full px-3 py-2 border rounded-lg" placeholder="email@example.com">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Điện Thoại</label>
                <input type="tel" name="phone" class="w-full px-3 py-2 border rounded-lg" placeholder="0912345678">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Vai Trò *</label>
                <select name="role" required class="w-full px-3 py-2 border rounded-lg">
                    <option value="admin">Admin - Quản trị viên</option>
                    <option value="business">Business - Doanh nghiệp</option>
                    <option value="customer" selected>Customer - Khách hàng</option>
                </select>
            </div>
            <div class="flex justify-end gap-3 mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
                <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                    <i class="fas fa-plus mr-2"></i>Thêm Tài Khoản
                </button>
            </div>
        </form>
    `);

    document.getElementById('accountForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Validate password length
        if (data.password.length < 6) {
            showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                showNotification('Thêm tài khoản thành công', 'success');
                closeModal();
                loadAccounts();
            } else {
                showNotification(result.message || 'Lỗi khi thêm tài khoản', 'error');
            }
        } catch (error) {
            console.error('Error adding account:', error);
            showNotification('Lỗi khi thêm tài khoản', 'error');
        }
    });
}

async function editAccount(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`);
        const result = await response.json();

        if (!result.success) {
            showNotification('Lỗi khi tải dữ liệu tài khoản', 'error');
            return;
        }

        const account = result.data.find(u => u.user_id === userId);
        if (!account) {
            showNotification('Không tìm thấy tài khoản', 'error');
            return;
        }

        showModal('Chỉnh Sửa Tài Khoản', `
            <form id="editAccountForm" class="space-y-4">
                <input type="hidden" name="user_id" value="${account.user_id}">
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tên Đăng Nhập *</label>
                    <input type="text" name="username" required value="${account.username}" class="w-full px-3 py-2 border rounded-lg">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mật Khẩu Mới</label>
                    <input type="password" name="password" class="w-full px-3 py-2 border rounded-lg" placeholder="Để trống nếu không đổi">
                    <p class="text-xs text-gray-500 mt-1">Chỉ nhập nếu muốn thay đổi mật khẩu</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value="${account.email || ''}" class="w-full px-3 py-2 border rounded-lg">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Điện Thoại</label>
                    <input type="tel" name="phone" value="${account.phone || ''}" class="w-full px-3 py-2 border rounded-lg">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Vai Trò *</label>
                    <select name="role" required class="w-full px-3 py-2 border rounded-lg">
                        <option value="admin" ${account.role === 'admin' ? 'selected' : ''}>Admin - Quản trị viên</option>
                        <option value="business" ${account.role === 'business' ? 'selected' : ''}>Business - Doanh nghiệp</option>
                        <option value="customer" ${account.role === 'customer' ? 'selected' : ''}>Customer - Khách hàng</option>
                    </select>
                </div>
                
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-save mr-2"></i>Lưu Thay Đổi
                    </button>
                </div>
            </form>
        `);

        document.getElementById('editAccountForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            const userId = data.user_id;
            delete data.user_id;

            // Validate password if provided
            if (data.password && data.password.length < 6) {
                showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
                return;
            }

            try {
                const updateResponse = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const updateResult = await updateResponse.json();
                if (updateResult.success) {
                    showNotification('Cập nhật tài khoản thành công', 'success');
                    closeModal();
                    loadAccounts();
                } else {
                    showNotification(updateResult.message || 'Lỗi khi cập nhật tài khoản', 'error');
                }
            } catch (error) {
                console.error('Error updating account:', error);
                showNotification('Lỗi khi cập nhật tài khoản', 'error');
            }
        });

    } catch (error) {
        console.error('Error editing account:', error);
        showNotification('Lỗi khi tải dữ liệu tài khoản', 'error');
    }
}

async function toggleAccountStatus(userId, isCurrentlyActive) {
    const action = isCurrentlyActive ? 'vô hiệu hóa' : 'kích hoạt';
    if (!confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
            method: 'PUT'
        });

        const result = await response.json();
        if (result.success) {
            showNotification(result.message, 'success');
            loadAccounts();
        } else {
            showNotification(result.message || `Lỗi khi ${action} tài khoản`, 'error');
        }
    } catch (error) {
        console.error('Error toggling account status:', error);
        showNotification(`Lỗi khi ${action} tài khoản`, 'error');
    }
}

async function deleteAccount(userId) {
    if (!confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này?\n\nLưu ý: Nếu tài khoản có đơn đặt xe, bạn nên VÔ HIỆU HÓA thay vì xóa.')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Xóa tài khoản thành công', 'success');
            loadAccounts();
        } else {
            showNotification(result.message || 'Lỗi khi xóa tài khoản', 'error');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        showNotification('Lỗi khi xóa tài khoản', 'error');
    }
}

function getRoleClass(role) {
    const classes = {
        'admin': 'bg-red-100 text-red-800',
        'business': 'bg-blue-100 text-blue-800',
        'customer': 'bg-green-100 text-green-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
}

function getRoleText(role) {
    const texts = {
        'admin': 'Admin',
        'business': 'Doanh Nghiệp',
        'customer': 'Khách Hàng'
    };
    return texts[role] || role;
}

window.showAddAccountForm = showAddAccountForm;
window.editAccount = editAccount;
window.toggleAccountStatus = toggleAccountStatus;
window.deleteAccount = deleteAccount;

// ============ STATISTICS ============
async function loadStatistics() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">Thống Kê Đơn Đặt Xe</h2>
            
            <!-- Filter Form -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                        <input type="date" id="statsStartDate" class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                        <input type="date" id="statsEndDate" class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nhóm theo</label>
                        <select id="statsGroupBy" class="w-full px-3 py-2 border rounded-lg">
                            <option value="day">Ngày</option>
                            <option value="month">Tháng</option>
                            <option value="year">Năm</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="updateStatistics()" class="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-search mr-2"></i>Lọc
                        </button>
                    </div>
                </div>
            </div>

            <!-- Summary Cards -->
            <div id="statsSummary" class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div class="bg-white rounded-lg shadow p-4 text-center">
                    <div class="text-gray-500 text-sm mb-1">Tổng đơn</div>
                    <div class="text-2xl font-bold text-gray-800">-</div>
                </div>
                <div class="bg-white rounded-lg shadow p-4 text-center">
                    <div class="text-gray-500 text-sm mb-1">Chờ xác nhận</div>
                    <div class="text-2xl font-bold text-yellow-600">-</div>
                </div>
                <div class="bg-white rounded-lg shadow p-4 text-center">
                    <div class="text-gray-500 text-sm mb-1">Đã xác nhận</div>
                    <div class="text-2xl font-bold text-blue-600">-</div>
                </div>
                <div class="bg-white rounded-lg shadow p-4 text-center">
                    <div class="text-gray-500 text-sm mb-1">Hoàn thành</div>
                    <div class="text-2xl font-bold text-green-600">-</div>
                </div>
                <div class="bg-white rounded-lg shadow p-4 text-center">
                    <div class="text-gray-500 text-sm mb-1">Đã hủy</div>
                    <div class="text-2xl font-bold text-red-600">-</div>
                </div>
            </div>

            <!-- Export Buttons -->
            <div class="bg-white rounded-lg shadow p-4 mb-6">
                <div class="flex flex-wrap gap-4">
                    <button onclick="exportToExcel('all')" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 inline-flex items-center">
                        <i class="fas fa-file-excel mr-2"></i>Xuất Excel (Tất cả)
                    </button>
                    <button onclick="exportToExcel('pending')" class="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 inline-flex items-center">
                        <i class="fas fa-file-excel mr-2"></i>Xuất Excel (Chờ xác nhận)
                    </button>
                    <button onclick="exportToExcel('confirmed')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center">
                        <i class="fas fa-file-excel mr-2"></i>Xuất Excel (Đã xác nhận)
                    </button>
                    <button onclick="exportToExcel('completed')" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 inline-flex items-center">
                        <i class="fas fa-file-excel mr-2"></i>Xuất Excel (Hoàn thành)
                    </button>
                </div>
            </div>

            <!-- Statistics Table -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tổng</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Chờ xác nhận</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Đã xác nhận</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hoàn thành</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Đã hủy</th>
                        </tr>
                    </thead>
                    <tbody id="statsTableBody" class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin mr-2"></i>Đang tải dữ liệu...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    document.getElementById('statsStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('statsEndDate').value = endDate.toISOString().split('T')[0];

    // Load initial statistics
    updateStatistics();
}

async function updateStatistics() {
    const startDate = document.getElementById('statsStartDate').value;
    const endDate = document.getElementById('statsEndDate').value;
    const groupBy = document.getElementById('statsGroupBy').value;

    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('groupBy', groupBy);

        const response = await fetch(`${API_BASE_URL}/admin/bookings/stats?${params}`);
        const result = await response.json();

        if (result.success) {
            displayStatistics(result.data);
        } else {
            showNotification('Lỗi khi tải thống kê', 'error');
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

function displayStatistics(data) {
    // Update summary cards
    const summaryHTML = `
        <div class="bg-white rounded-lg shadow p-4 text-center">
            <div class="text-gray-500 text-sm mb-1">Tổng đơn</div>
            <div class="text-2xl font-bold text-gray-800">${data.summary.total || 0}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
            <div class="text-gray-500 text-sm mb-1">Chờ xác nhận</div>
            <div class="text-2xl font-bold text-yellow-600">${data.summary.pending || 0}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
            <div class="text-gray-500 text-sm mb-1">Đã xác nhận</div>
            <div class="text-2xl font-bold text-blue-600">${data.summary.confirmed || 0}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
            <div class="text-gray-500 text-sm mb-1">Hoàn thành</div>
            <div class="text-2xl font-bold text-green-600">${data.summary.completed || 0}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
            <div class="text-gray-500 text-sm mb-1">Đã hủy</div>
            <div class="text-2xl font-bold text-red-600">${data.summary.cancelled || 0}</div>
        </div>
    `;
    document.getElementById('statsSummary').innerHTML = summaryHTML;

    // Update statistics table
    const tbody = document.getElementById('statsTableBody');
    
    if (!data.statistics || data.statistics.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Không có dữ liệu
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.statistics.map(row => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-800">${row.period}</td>
            <td class="px-6 py-4 text-center font-bold text-gray-800">${row.total}</td>
            <td class="px-6 py-4 text-center text-yellow-600">${row.pending || 0}</td>
            <td class="px-6 py-4 text-center text-blue-600">${row.confirmed || 0}</td>
            <td class="px-6 py-4 text-center text-green-600">${row.completed || 0}</td>
            <td class="px-6 py-4 text-center text-red-600">${row.cancelled || 0}</td>
        </tr>
    `).join('');
}

async function exportToExcel(status) {
    const startDate = document.getElementById('statsStartDate').value;
    const endDate = document.getElementById('statsEndDate').value;

    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (status !== 'all') params.append('status', status);

        // Show loading notification
        showNotification('Đang xuất file Excel...', 'info');

        const response = await fetch(`${API_BASE_URL}/admin/bookings/export?${params}`);
        
        if (!response.ok) {
            throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        const statusText = {
            'all': 'tat-ca',
            'pending': 'cho-xac-nhan',
            'confirmed': 'da-xac-nhan',
            'completed': 'hoan-thanh'
        };
        
        a.download = `don-dat-xe-${statusText[status]}-${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('✅ Xuất file Excel thành công!', 'success');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showNotification('❌ Lỗi khi xuất file Excel', 'error');
    }
}

// Make functions global
window.updateStatistics = updateStatistics;
window.exportToExcel = exportToExcel;

// ============ UTILITY FUNCTIONS ============
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatPrice(price) {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function getStatusClass(status) {
    const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Chờ Xác Nhận',
        'confirmed': 'Đã Xác Nhận',
        'completed': 'Hoàn Thành',
        'cancelled': 'Đã Hủy'
    };
    return texts[status] || status;
}

function showNotification(message, type = 'success') {
    const colors = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'info': 'bg-blue-500'
    };
    const bgColor = colors[type] || colors['success'];
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}


// ============ MODAL FUNCTIONS ============
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.id = 'adminModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-bold text-gray-800">${title}</h3>
                <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <div class="p-6">
                ${content}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

window.closeModal = closeModal;
