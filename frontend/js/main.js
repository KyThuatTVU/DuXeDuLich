// Mobile Menu Toggle - Initialize after DOM is loaded
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        // Toggle mobile menu
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            
            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (mobileMenu.classList.contains('hidden')) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                } else {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            }
        });

        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    const icon = mobileMenuBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    }
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Header Scroll Effect
function initHeaderScrollEffect() {
    const header = document.getElementById('header');
    
    if (header) {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.classList.add('shadow-xl');
            } else {
                header.classList.remove('shadow-xl');
            }

            lastScroll = currentScroll;
        });
    }
}

// Scroll to Top Button
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');

    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.remove('hidden');
                scrollToTopBtn.classList.add('flex');
            } else {
                scrollToTopBtn.classList.add('hidden');
                scrollToTopBtn.classList.remove('flex');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Form Handling
function initBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    const successModal = document.getElementById('successModal');

    if (bookingForm && successModal) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData);

            console.log('Booking Data:', data);

            // TODO: Send data to backend API
            // try {
            //     const response = await fetch('/api/bookings', {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify(data)
            //     });
            //     
            //     if (response.ok) {
            //         showSuccessModal();
            //         bookingForm.reset();
            //     }
            // } catch (error) {
            //     console.error('Error:', error);
            //     alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
            // }

            // For demo purposes, show success modal immediately
            showSuccessModal();
            bookingForm.reset();
        });
    }
}

// Modal Functions
function showSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Initialize modal event listeners
function initModalListeners() {
    const successModal = document.getElementById('successModal');
    
    if (successModal) {
        // Close modal when clicking outside
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !successModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
}

// Set minimum date for booking to today
function initDateInput() {
    const dateInput = document.querySelector('input[name="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

// Active Navigation Link
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length > 0 && navLinks.length > 0) {
        function highlightNavigation() {
            const scrollY = window.pageYOffset;

            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('text-primary', 'font-bold');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('text-primary', 'font-bold');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', highlightNavigation);
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

// Animation on Scroll (Simple Implementation)
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all service cards and feature items
    const animatedElements = document.querySelectorAll('.grid > div');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Loading Animation for Images
function initImageLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
    });
}

// Initialize all functions when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for components to load
    setTimeout(() => {
        try {
            initMobileMenu();
            initScrollToTop();
            initBookingForm();
            initModalListeners();
            initScrollAnimations();
            initDateInput();
            initActiveNavigation();
            initPhoneValidation();
            initSmoothScrolling();
            initHeaderScrollEffect();
            initImageLoading();
        } catch (error) {
            console.error('Error initializing page:', error);
        }
    }, 100);
});

// Make closeModal available globally for modal buttons
window.closeModal = closeModal;

// Console welcome message
console.log('%c🚗 Hoàng Long Travel', 'color: #2563eb; font-size: 24px; font-weight: bold;');
console.log('%cDịch vụ thuê xe uy tín, chuyên nghiệp', 'color: #10b981; font-size: 14px;');
