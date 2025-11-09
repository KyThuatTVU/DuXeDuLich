// Settings View - Quản lý cài đặt thông tin liên hệ
async function renderSettingsView() {
    try {
        // Ensure SettingsManager is initialized
        if (typeof SettingsManager !== 'undefined' && !SettingsManager.settings) {
            SettingsManager.loadSettings();
        }
        
        // Load current settings from localStorage
        const settings = {
            phone: SettingsManager?.getPhone() || '0123 456 789',
            zalo: SettingsManager?.getZalo() || '0123456789',
            facebook: SettingsManager?.getFacebook() || 'https://facebook.com/soi.lang.bac.656678'
        };

        return `
            <div class="space-y-6">
                <!-- Page Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl md:text-3xl font-bold text-gray-800">
                            <i class="fas fa-cog text-primary mr-2"></i>
                            Cài Đặt Hệ Thống
                        </h2>
                        <p class="text-gray-600 mt-2">Quản lý thông tin liên hệ hiển thị trên website</p>
                    </div>
                </div>

                <!-- Settings Form -->
                <div class="bg-white rounded-xl shadow-md p-6 md:p-8">
                    <h3 class="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                        <i class="fas fa-phone-alt text-primary mr-2"></i>
                        Thông Tin Liên Hệ
                    </h3>

                    <form id="settingsForm" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Phone Number -->
                            <div>
                                <label class="block text-gray-700 font-semibold mb-2">
                                    <i class="fas fa-phone mr-2 text-primary"></i>
                                    Số Điện Thoại *
                                </label>
                                <input 
                                    type="text" 
                                    id="phone" 
                                    name="phone" 
                                    value="${settings.phone || ''}"
                                    required
                                    placeholder="0123 456 789"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                <p class="text-sm text-gray-500 mt-1">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Số điện thoại hiển thị trên website
                                </p>
                            </div>

                            <!-- Zalo Number -->
                            <div>
                                <label class="block text-gray-700 font-semibold mb-2">
                                    <i class="fab fa-whatsapp mr-2 text-green-500"></i>
                                    Số Zalo *
                                </label>
                                <input 
                                    type="text" 
                                    id="zalo" 
                                    name="zalo" 
                                    value="${settings.zalo || ''}"
                                    required
                                    placeholder="0123456789"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                <p class="text-sm text-gray-500 mt-1">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Số Zalo để khách hàng liên hệ nhanh
                                </p>
                            </div>

                            <!-- Facebook URL -->
                            <div class="md:col-span-2">
                                <label class="block text-gray-700 font-semibold mb-2">
                                    <i class="fab fa-facebook mr-2 text-blue-600"></i>
                                    Link Facebook *
                                </label>
                                <input 
                                    type="url" 
                                    id="facebook" 
                                    name="facebook" 
                                    value="${settings.facebook || ''}"
                                    required
                                    placeholder="https://facebook.com/soi.lang.bac.656678"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                <p class="text-sm text-gray-500 mt-1">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Link trang Facebook (copy từ thanh địa chỉ trình duyệt)
                                </p>
                            </div>
                        </div>

                        <!-- Preview Section -->
                        <div class="bg-blue-50 rounded-lg p-6 mt-6">
                            <h4 class="font-bold text-gray-800 mb-4">
                                <i class="fas fa-eye text-primary mr-2"></i>
                                Xem Trước
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="flex items-center">
                                    <i class="fas fa-phone text-primary mr-3 text-xl"></i>
                                    <div>
                                        <p class="text-xs text-gray-500">Hotline</p>
                                        <p class="font-bold text-gray-800" id="previewPhone">${settings.phone || '0123 456 789'}</p>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <i class="fab fa-whatsapp text-green-500 mr-3 text-xl"></i>
                                    <div>
                                        <p class="text-xs text-gray-500">Zalo</p>
                                        <p class="font-bold text-gray-800" id="previewZalo">${settings.zalo || '0123456789'}</p>
                                    </div>
                                </div>
                                <div class="flex items-center md:col-span-1">
                                    <i class="fab fa-facebook text-blue-600 mr-3 text-xl"></i>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs text-gray-500">Facebook</p>
                                        <p class="font-bold text-gray-800 text-xs truncate" id="previewFacebook">${settings.facebook || 'facebook.com/...'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex flex-col sm:flex-row gap-4 pt-4">
                            <button 
                                type="submit" 
                                class="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                            >
                                <i class="fas fa-save mr-2"></i>
                                Lưu Thay Đổi
                            </button>
                            <button 
                                type="button" 
                                onclick="resetSettingsForm()"
                                class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors inline-flex items-center justify-center"
                            >
                                <i class="fas fa-undo mr-2"></i>
                                Khôi Phục
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Info Box -->
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                    <div class="flex items-start">
                        <i class="fas fa-exclamation-triangle text-yellow-600 text-xl mr-3 mt-1"></i>
                        <div>
                            <h4 class="font-bold text-gray-800 mb-2">Lưu Ý Quan Trọng</h4>
                            <ul class="text-gray-700 space-y-1 text-sm">
                                <li>• Thông tin này sẽ hiển thị trên tất cả các trang của website</li>
                                <li>• Đảm bảo số điện thoại và Zalo luôn hoạt động để khách hàng có thể liên hệ</li>
                                <li>• Sau khi lưu, thay đổi sẽ có hiệu lực ngay lập tức</li>
                                <li>• Khách hàng đang truy cập có thể cần tải lại trang để thấy thông tin mới</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error rendering settings view:', error);
        return `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <p class="text-gray-600">Không thể tải cài đặt. Vui lòng thử lại.</p>
            </div>
        `;
    }
}

// Initialize settings form handlers
function initSettingsHandlers() {
    const form = document.getElementById('settingsForm');
    if (!form) return;

    // Real-time preview update
    const phoneInput = document.getElementById('phone');
    const zaloInput = document.getElementById('zalo');
    const facebookInput = document.getElementById('facebook');
    const previewPhone = document.getElementById('previewPhone');
    const previewZalo = document.getElementById('previewZalo');
    const previewFacebook = document.getElementById('previewFacebook');

    if (phoneInput && previewPhone) {
        phoneInput.addEventListener('input', (e) => {
            previewPhone.textContent = e.target.value || '0123 456 789';
        });
    }

    if (zaloInput && previewZalo) {
        zaloInput.addEventListener('input', (e) => {
            previewZalo.textContent = e.target.value || '0123456789';
        });
    }

    if (facebookInput && previewFacebook) {
        facebookInput.addEventListener('input', (e) => {
            previewFacebook.textContent = e.target.value || 'facebook.com/...';
        });
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const phone = phoneInput.value.trim();
        const zalo = zaloInput.value.trim();
        const facebook = facebookInput.value.trim();

        if (!phone || !zalo || !facebook) {
            showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        try {
            // Save to localStorage
            const success = SettingsManager.saveSettings(phone, zalo, facebook);
            
            if (success) {
                showNotification('Cập nhật thông tin liên hệ thành công!', 'success');
                SettingsManager.updateDisplays();
            } else {
                showNotification('Có lỗi khi lưu cài đặt', 'error');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            showNotification('Có lỗi xảy ra: ' + error.message, 'error');
        }
    });
}

// Reset form to original values
function resetSettingsForm() {
    try {
        SettingsManager.loadSettings();
        
        document.getElementById('phone').value = SettingsManager.getPhone();
        document.getElementById('zalo').value = SettingsManager.getZalo();
        document.getElementById('facebook').value = SettingsManager.getFacebook();
        document.getElementById('previewPhone').textContent = SettingsManager.getPhone();
        document.getElementById('previewZalo').textContent = SettingsManager.getZalo();
        document.getElementById('previewFacebook').textContent = SettingsManager.getFacebook();

        showNotification('Đã khôi phục giá trị hiện tại', 'info');
    } catch (error) {
        console.error('Error resetting form:', error);
        showNotification('Không thể tải lại dữ liệu', 'error');
    }
}
