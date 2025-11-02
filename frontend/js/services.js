// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Load services from API
async function loadServices() {
    try {
        console.log('📋 Loading services from API...');
        const response = await fetch(`${API_BASE_URL}/services`);
        const result = await response.json();
        
        console.log('📊 Services API Response:', result);
        console.log('📊 Services count:', result.data ? result.data.length : 0);
        
        if (result.success) {
            console.log('✅ Successfully loaded services');
            displayServices(result.data);
        } else {
            console.error('❌ Error loading services:', result.message);
            showError('Không thể tải dữ liệu dịch vụ');
        }
    } catch (error) {
        console.error('❌ Error fetching services:', error);
        showError('Lỗi kết nối đến server');
    }
}

// Display services on page
function displayServices(services) {
    console.log('🎨 Displaying services:', services.length);
    const servicesContainer = document.getElementById('services-container');
    
    if (!servicesContainer) {
        console.error('❌ services-container not found!');
        return;
    }
    
    if (!services || services.length === 0) {
        servicesContainer.innerHTML = '<div class="text-center py-12"><p class="text-gray-600">Không có dữ liệu dịch vụ</p></div>';
        return;
    }
    
    servicesContainer.innerHTML = services.map((service, index) => {
        console.log(`  - Rendering service ${index + 1}:`, service.name);
        
        // Features is already an array from backend
        const features = Array.isArray(service.features) ? service.features : [];
        const isReverse = index % 2 !== 0;
        
        return `
            <div class="mb-20">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div class="${isReverse ? 'order-2 md:order-1' : ''}">
                        ${isReverse ? '' : `<img src="${service.image_url}" alt="${service.name}" class="rounded-2xl shadow-xl" onerror="this.src='https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'">`}
                        ${!isReverse ? '' : createServiceContent(service, features)}
                    </div>
                    <div class="${isReverse ? 'order-1 md:order-2' : ''}">
                        ${isReverse ? `<img src="${service.image_url}" alt="${service.name}" class="rounded-2xl shadow-xl" onerror="this.src='https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'">` : createServiceContent(service, features)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('✅ Services displayed successfully');
}

// Create service content HTML
function createServiceContent(service, features) {
    const colors = ['blue', 'green', 'yellow', 'purple'];
    const colorIndex = service.display_order % colors.length;
    const color = colors[colorIndex];
    
    return `
        <div class="flex items-center mb-4">
            <div class="bg-${color}-100 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                <i class="fas ${service.icon} text-3xl text-${color === 'yellow' ? 'secondary' : color === 'blue' ? 'primary' : 'accent'}"></i>
            </div>
            <h2 class="text-3xl font-bold text-gray-800">${service.name}</h2>
        </div>
        <p class="text-gray-600 mb-6 leading-relaxed">
            ${service.description}
        </p>
        
        <div class="space-y-3 mb-6">
            ${features.map(feature => `
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-accent text-xl mr-3"></i>
                    <span class="text-gray-700">${feature}</span>
                </div>
            `).join('')}
        </div>

        <a href="booking.html?service=${service.slug}" class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center">
            <i class="fas fa-calendar-check mr-2"></i>
            Đặt xe ngay
        </a>
    `;
}

// Load vehicle types from API
async function loadVehicleTypes() {
    try {
        console.log('🚗 Loading vehicle types from API...');
        const response = await fetch(`${API_BASE_URL}/vehicles/types`);
        const result = await response.json();
        
        console.log('📊 API Response:', result);
        console.log('📊 Vehicle types count:', result.data ? result.data.length : 0);
        
        if (result.success) {
            console.log('✅ Successfully loaded vehicle types');
            displayVehicleTypes(result.data);
        } else {
            console.error('❌ Error loading vehicle types:', result.message);
            showError('Không thể tải dữ liệu loại xe');
        }
    } catch (error) {
        console.error('❌ Error fetching vehicle types:', error);
        showError('Lỗi kết nối đến server');
    }
}

// Display vehicle types on page
function displayVehicleTypes(vehicleTypes) {
    console.log('🎨 Displaying vehicle types:', vehicleTypes.length);
    const vehiclesContainer = document.getElementById('vehicles-container');
    
    if (!vehiclesContainer) {
        console.error('❌ vehicles-container not found!');
        return;
    }
    
    if (!vehicleTypes || vehicleTypes.length === 0) {
        vehiclesContainer.innerHTML = '<div class="col-span-3 text-center py-12"><p class="text-gray-600">Không có dữ liệu xe</p></div>';
        return;
    }
    
    vehiclesContainer.innerHTML = vehicleTypes.map((vehicle, index) => {
        console.log(`  - Rendering vehicle ${index + 1}:`, vehicle.name);
        
        // Handle features - it's already an array from MySQL JSON type
        const features = Array.isArray(vehicle.features) ? vehicle.features : [];
        const colors = ['blue', 'green', 'yellow', 'red', 'purple'];
        const colorIndex = (vehicle.display_order - 1) % colors.length;
        const color = colors[colorIndex];
        
        return `
            <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
                <div class="bg-${color}-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <i class="fas ${vehicle.icon} text-3xl text-${color === 'yellow' ? 'secondary' : color === 'blue' ? 'primary' : 'accent'}"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-3">${vehicle.name}</h3>
                <p class="text-gray-600 mb-4">${vehicle.description}</p>
                <ul class="space-y-2 text-gray-600 text-sm mb-4">
                    ${features.map(feature => `<li>• ${feature}</li>`).join('')}
                </ul>
                <div class="text-primary font-bold text-xl">
                    ${formatPrice(vehicle.price_per_day)}/ngày
                </div>
                <div class="text-gray-500 text-sm mt-1">
                    ${formatPrice(vehicle.price_per_km)}/km
                </div>
            </div>
        `;
    }).join('');
    
    console.log('✅ Vehicle types displayed successfully');
}

// Format price to VND
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Load available vehicles from API
async function loadAvailableVehicles() {
    try {
        console.log('🚙 Loading available vehicles from API...');
        const response = await fetch(`${API_BASE_URL}/vehicles`);
        const result = await response.json();
        
        console.log('📊 Vehicles API Response:', result);
        console.log('📊 Vehicles count:', result.data ? result.data.length : 0);
        
        if (result.success) {
            console.log('✅ Successfully loaded vehicles');
            displayAvailableVehicles(result.data);
        } else {
            console.error('❌ Error loading vehicles:', result.message);
            showError('Không thể tải dữ liệu xe');
        }
    } catch (error) {
        console.error('❌ Error fetching vehicles:', error);
        showError('Lỗi kết nối đến server');
    }
}

// Display available vehicles on page
function displayAvailableVehicles(vehicles) {
    console.log('🎨 Displaying available vehicles:', vehicles.length);
    const vehiclesContainer = document.getElementById('available-vehicles-container');
    
    if (!vehiclesContainer) {
        console.error('❌ available-vehicles-container not found!');
        return;
    }
    
    if (!vehicles || vehicles.length === 0) {
        vehiclesContainer.innerHTML = '<div class="col-span-3 text-center py-12"><p class="text-gray-600">Không có xe nào</p></div>';
        return;
    }
    
    vehiclesContainer.innerHTML = vehicles.map((vehicle, index) => {
        console.log(`  - Rendering vehicle ${index + 1}:`, vehicle.name);
        
        const statusBadge = vehicle.status === 'available' 
            ? '<span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Sẵn sàng</span>'
            : '<span class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">Đang thuê</span>';
        
        const stars = '⭐'.repeat(Math.floor(vehicle.rating || 5));
        
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                <div class="relative">
                    <img src="${vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'}" 
                         alt="${vehicle.name}" 
                         class="w-full h-48 object-cover"
                         onerror="this.src='https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'">
                    <div class="absolute top-4 right-4">
                        ${statusBadge}
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-xl font-bold text-gray-800">${vehicle.name}</h3>
                        <span class="text-sm font-semibold text-primary bg-blue-50 px-3 py-1 rounded-full">${vehicle.type}</span>
                    </div>
                    
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${vehicle.description || ''}</p>
                    
                    <div class="space-y-2 mb-4">
                        <div class="flex items-center text-sm text-gray-600">
                            <i class="fas fa-road text-primary mr-2"></i>
                            <span>${formatPrice(vehicle.price_per_km)}/km</span>
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <i class="fas fa-calendar-day text-primary mr-2"></i>
                            <span class="font-bold text-lg text-primary">${formatPrice(vehicle.price_per_day)}/ngày</span>
                        </div>
                    </div>
                    
                    ${vehicle.driver_info ? `
                        <div class="flex items-start text-sm text-gray-600 mb-3">
                            <i class="fas fa-user-tie text-accent mr-2 mt-1"></i>
                            <span>${vehicle.driver_info}</span>
                        </div>
                    ` : ''}
                    
                    ${vehicle.rating ? `
                        <div class="flex items-center mb-4">
                            <span class="text-yellow-400 mr-2">${stars}</span>
                            <span class="text-sm text-gray-600">${vehicle.rating}/5.0</span>
                        </div>
                    ` : ''}
                    
                    <a href="booking.html?vehicle=${vehicle.id}" 
                       class="block w-full text-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${vehicle.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''}">
                        ${vehicle.status === 'available' ? 'Đặt xe ngay' : 'Đang không có sẵn'}
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('✅ Available vehicles displayed successfully');
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadServices();
    await loadVehicleTypes();
    await loadAvailableVehicles();
});
