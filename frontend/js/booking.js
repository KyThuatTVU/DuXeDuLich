// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Load vehicles for selection
async function loadVehicles() {
    try {
        console.log('🚗 Loading vehicles...');
        const response = await fetch(`${API_BASE_URL}/vehicles`);
        const result = await response.json();

        if (result.success) {
            console.log('✅ Loaded vehicles:', result.data.length);
            populateVehicleSelect(result.data);
        } else {
            console.error('❌ Error loading vehicles:', result.message);
        }
    } catch (error) {
        console.error('❌ Error fetching vehicles:', error);
    }
}

// Populate vehicle select dropdown
function populateVehicleSelect(vehicles) {
    const vehicleSelect = document.getElementById('vehicle');

    if (!vehicleSelect) return;

    // Clear existing options except the first one
    vehicleSelect.innerHTML = '<option value="">-- Chọn loại xe --</option>';

    // Group vehicles by type
    const vehiclesByType = {};
    vehicles.forEach(vehicle => {
        if (vehicle.status === 'available') {
            if (!vehiclesByType[vehicle.type]) {
                vehiclesByType[vehicle.type] = [];
            }
            vehiclesByType[vehicle.type].push(vehicle);
        }
    });

    // Add options grouped by type
    Object.keys(vehiclesByType).forEach(type => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = type;

        vehiclesByType[type].forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.name} - ${formatPrice(vehicle.price_per_day)}/ngày`;
            optgroup.appendChild(option);
        });

        vehicleSelect.appendChild(optgroup);
    });
}

// Format price to VND
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Handle booking form submission
async function handleBookingSubmit(event) {
    event.preventDefault();

    console.log('📝 Submitting booking form...');

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    // Disable submit button
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang xử lý...';

    // Get form data
    const formData = new FormData(form);
    const bookingData = {
        customer_name: formData.get('name'),
        customer_phone: formData.get('phone'),
        customer_email: formData.get('email'),
        vehicle_id: formData.get('vehicle') || null,
        pickup_location: formData.get('pickup'),
        dropoff_location: formData.get('dropoff'),
        pickup_date: formData.get('date'),
        pickup_time: formData.get('time'),
        number_of_passengers: parseInt(formData.get('passengers')) || null,
        service_type: formData.get('service') || null,
        notes: formData.get('notes')
    };

    console.log('📊 Booking data:', bookingData);

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        console.log('📊 API Response:', result);

        if (result.success) {
            console.log('✅ Booking created successfully');

            // Show success modal
            showSuccessModal(result.bookingId);

            // Reset form
            form.reset();
        } else {
            console.error('❌ Booking failed:', result.message);
            showError(result.message || 'Có lỗi xảy ra khi đặt lịch');
        }
    } catch (error) {
        console.error('❌ Error submitting booking:', error);
        showError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Show success modal
function showSuccessModal(bookingId) {
    const modal = document.getElementById('successModal');
    if (modal) {
        const messageElement = modal.querySelector('.modal-message');
        if (messageElement) {
            messageElement.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Đặt Lịch Thành Công!</h3>
                    <p class="text-gray-600 mb-4">Mã đặt lịch của bạn: <strong>#${bookingId}</strong></p>
                    <p class="text-gray-600">Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận.</p>
                </div>
            `;
        }
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    errorDiv.innerHTML = `
        <div class="flex items-start">
            <i class="fas fa-exclamation-circle text-2xl mr-3"></i>
            <div>
                <p class="font-bold mb-1">Lỗi</p>
                <p class="text-sm">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Set minimum date to today
function setMinDate() {
    const dateInput = document.querySelector('input[name="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        dateInput.value = today;
    }
}

// Phone number validation
function initPhoneValidation() {
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Remove non-numeric characters
            e.target.value = e.target.value.replace(/[^0-9]/g, '');

            // Limit to 10-11 digits
            if (e.target.value.length > 11) {
                e.target.value = e.target.value.slice(0, 11);
            }
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Booking page initialized');

    // Load vehicles
    loadVehicles();

    // Set minimum date
    setMinDate();

    // Initialize phone validation
    initPhoneValidation();

    // Handle form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // Get service from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
        const serviceInput = document.querySelector('input[name="service"]');
        if (serviceInput) {
            serviceInput.value = serviceParam;
        }
    }
});
