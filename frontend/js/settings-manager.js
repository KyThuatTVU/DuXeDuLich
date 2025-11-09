// Settings Manager - Quản lý thông tin liên hệ (Lưu trong localStorage)
const SettingsManager = {
    STORAGE_KEY: 'company_contact_settings',
    
    // Default settings
    defaultSettings: {
        phone: '0123 456 789',
        zalo: '0123456789',
        facebook: 'https://facebook.com/soi.lang.bac.656678'
    },

    // Load settings from localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.settings = JSON.parse(saved);
            } else {
                this.settings = { ...this.defaultSettings };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = { ...this.defaultSettings };
        }
    },

    // Save settings to localStorage
    saveSettings(phone, zalo, facebook) {
        try {
            this.settings = { phone, zalo, facebook };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },

    // Get phone number
    getPhone() {
        return this.settings?.phone || this.defaultSettings.phone;
    },

    // Get Zalo number
    getZalo() {
        return this.settings?.zalo || this.defaultSettings.zalo;
    },

    // Get Facebook URL
    getFacebook() {
        return this.settings?.facebook || this.defaultSettings.facebook;
    },

    // Get phone number without spaces (for tel: links)
    getPhoneLink() {
        return this.getPhone().replace(/\s/g, '');
    },

    // Update all phone/zalo displays on page
    updateDisplays() {
        // Update phone displays
        document.querySelectorAll('[data-phone]').forEach(el => {
            el.textContent = this.getPhone();
        });

        // Update phone links
        document.querySelectorAll('[data-phone-link]').forEach(el => {
            el.href = `tel:${this.getPhoneLink()}`;
        });

        // Update Zalo links
        document.querySelectorAll('[data-zalo-link]').forEach(el => {
            el.href = `https://zalo.me/${this.getZalo()}`;
        });

        // Update Facebook links
        document.querySelectorAll('[data-facebook-link]').forEach(el => {
            el.href = this.getFacebook();
        });

        // Update combined displays (phone text + link)
        document.querySelectorAll('[data-phone-display]').forEach(el => {
            const phone = this.getPhone();
            const phoneLink = this.getPhoneLink();
            el.innerHTML = el.innerHTML.replace(/0\d{3}\s?\d{3}\s?\d{3}/g, phone);
            if (el.tagName === 'A') {
                el.href = `tel:${phoneLink}`;
            }
        });
    },

    // Initialize - load and update displays
    init() {
        this.loadSettings();
        this.updateDisplays();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SettingsManager.init());
} else {
    SettingsManager.init();
}
