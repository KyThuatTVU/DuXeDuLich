/**
 * Component Loader - Load HTML components into pages
 */

// Load component từ file HTML
async function loadComponent(componentPath, targetElement) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        
        if (targetElement) {
            targetElement.innerHTML = html;
        }
        return html;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        return '';
    }
}

// Load header component
async function loadHeader(activePage = 'index') {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    await loadComponent('components/header.html', headerPlaceholder);
    
    // Set active menu item
    const menuItems = [
        { name: 'Trang chủ', link: 'index.html', page: 'index' },
        { name: 'Giới thiệu', link: 'about.html', page: 'about' },
        { name: 'Dịch vụ', link: 'services.html', page: 'services' },
        { name: 'Đặt lịch', link: 'booking.html', page: 'booking' },
        { name: 'Liên hệ', link: 'contact.html', page: 'contact' }
    ];

    // Desktop menu
    const desktopMenu = document.getElementById('desktopMenu');
    if (desktopMenu) {
        desktopMenu.innerHTML = menuItems.map(item => `
            <li>
                <a href="${item.link}" 
                   class="nav-link ${item.page === activePage ? 'text-secondary bg-gray-700' : 'text-white hover:text-secondary hover:bg-gray-700'} 
                   transition-all px-4 py-2 rounded font-semibold">
                    ${item.name}
                </a>
            </li>
        `).join('');
    }

    // Mobile menu
    const mobileMenu = document.querySelector('#mobileMenu ul');
    if (mobileMenu) {
        mobileMenu.innerHTML = menuItems.map(item => `
            <li>
                <a href="${item.link}" 
                   class="block ${item.page === activePage ? 'text-secondary bg-gray-700' : 'text-white hover:text-secondary hover:bg-gray-700'} 
                   transition-all px-4 py-2 rounded font-semibold">
                    ${item.name}
                </a>
            </li>
        `).join('');
    }

    // Initialize mobile menu after header is loaded
    if (typeof window.initMobileMenu === 'function') {
        window.initMobileMenu();
    }
}

// Load footer component
async function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        await loadComponent('components/footer.html', footerPlaceholder);
    }
}

// Load floating buttons component
async function loadFloatingButtons() {
    const fabPlaceholder = document.getElementById('fab-placeholder');
    if (fabPlaceholder) {
        await loadComponent('components/floating-buttons.html', fabPlaceholder);
    }
}

// Load success modal component
async function loadSuccessModal() {
    const modalPlaceholder = document.getElementById('modal-placeholder');
    if (modalPlaceholder) {
        await loadComponent('components/success-modal.html', modalPlaceholder);
    }
}

// Load contact cards component
async function loadContactCards() {
    const contactCardsPlaceholder = document.getElementById('contact-cards-placeholder');
    if (contactCardsPlaceholder) {
        await loadComponent('components/contact-cards.html', contactCardsPlaceholder);
    }
}

// Load CTA section component
async function loadCTASection() {
    const ctaPlaceholder = document.getElementById('cta-placeholder');
    if (ctaPlaceholder) {
        await loadComponent('components/cta-section.html', ctaPlaceholder);
    }
}

// Create service card từ template
function createServiceCard(data) {
    return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
            <img src="${data.image}" alt="${data.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <div class="flex items-center mb-4">
                    <i class="${data.icon} text-3xl text-primary mr-3"></i>
                    <h3 class="text-2xl font-bold text-gray-800">${data.title}</h3>
                </div>
                <p class="text-gray-600 mb-4">${data.description}</p>
                <a href="${data.link || 'services.html'}" class="text-primary font-semibold hover:underline">
                    Xem chi tiết <i class="fas fa-arrow-right ml-1"></i>
                </a>
            </div>
        </div>
    `;
}

// Create feature card từ template
function createFeatureCard(data) {
    return `
        <div class="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div class="${data.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="${data.icon} text-3xl ${data.iconColor}"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">${data.title}</h3>
            <p class="text-gray-600">${data.description}</p>
        </div>
    `;
}

// Load all common components
async function loadAllComponents(activePage = 'index') {
    await Promise.all([
        loadHeader(activePage),
        loadFooter(),
        loadFloatingButtons(),
        loadSuccessModal(),
        loadContactCards(),
        loadCTASection()
    ]);
    
    // Initialize settings after components are loaded
    if (typeof SettingsManager !== 'undefined') {
        SettingsManager.init();
    }
}

// Export functions
window.ComponentLoader = {
    loadComponent,
    loadHeader,
    loadFooter,
    loadFloatingButtons,
    loadSuccessModal,
    loadContactCards,
    loadCTASection,
    createServiceCard,
    createFeatureCard,
    loadAllComponents
};
