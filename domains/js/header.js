
class HeaderManager {   
    constructor() {
        if (window.headerManagerInstance) {
            return window.headerManagerInstance;
        }

        this.headerPlaceholder = document.getElementById('header-placeholder');
        this.availableLanguages = [
            { code: 'ru', flag: '🇷🇺', label: 'RU' },
            { code: 'en', flag: '🇬🇧', label: 'EN' }
        ];

        this.menuItems = [
            { path: 'dashboard.html', label: 'Home', icon: '🏠' },
            { path: 'sites.html', label: 'Sites', icon: '🌐' },
            { path: 'brands.html', label: 'Projects', icon: '🏢' },
            { path: 'templates.html', label: 'Templates', icon: '📝' },
            { path: 'domains.html', label: 'Domains', icon: '🔗' },
            { path: 'apk.html', label: 'Credentials', icon: '🔑' },
            { path: 'users.html', label: 'Users', icon: '👥' }
        ];

        window.headerManagerInstance = this;
        this.init();
    }

    async init() {
        if (this.isLoginPage()) {
            return;
        }
        await this.loadHeader();
    }

    async loadHeader() {
        try {
            const response = await fetch('../templates/header.html');
            if (!response.ok) {
                throw new Error(`Failed to load header: ${response.status}`);
            }
            const headerContent = await response.text();
            this.headerPlaceholder.innerHTML = headerContent;

            this.sidebar = document.getElementById('sidebar');
            this.overlay = document.getElementById('sidebar-overlay');
            this.burgerBtn = document.getElementById('burger-btn');

            await this.initializeSidebar();
            this.initializeLanguageSelector();
        } catch (error) {
            console.error("Error loading header:", error);
            Auth.checkAuth();
        }
    }

    async initializeSidebar() {
        if (!this.sidebar) return;

        const userRole = AccessControl.getUserRole();
        const sidebarNav = this.sidebar.querySelector('.sidebar-nav');
        const menuHtml = this.menuItems
            .filter(item => AccessControl.hasMenuAccess(item.path.split('.')[0]))
            .map(item => `
                <a href="../templates/${item.path}" class="nav-item">
                    <span class="nav-icon">${item.icon}</span>
                    <span>${item.label}</span>
                </a>
            `).join('');

        sidebarNav.innerHTML = menuHtml;

        // События для меню
        this.burgerBtn.addEventListener('click', () => this.toggleSidebar());
        this.overlay.addEventListener('click', () => this.closeSidebar());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeSidebar();
        });

        this.setActiveMenuItem();
    }

    initializeLanguageSelector() {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.innerHTML = '';

            this.availableLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.code;
                option.textContent = `${lang.flag} ${lang.label}`;
                languageSelect.appendChild(option);
            });

            const savedLanguage = localStorage.getItem('preferred_language') || 'ru';
            languageSelect.value = savedLanguage;

            languageSelect.addEventListener('change', (e) => {
                this.handleLanguageChange(e.target.value);
            });
        }
    }   

    toggleSidebar() {
        const isOpen = this.sidebar.classList.contains('open');
        if (isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    openSidebar() {
        this.sidebar.classList.add('open');
        this.overlay.classList.add('visible');
    	document.body.classList.add('body-no-scroll');
    }

    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.overlay.classList.remove('visible');
    	document.body.classList.remove('body-no-scroll');
    }

    handleLanguageChange(language) {
        localStorage.setItem('preferred_language', language);
        window.location.reload();
    }

    setActiveMenuItem() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href.split('/').pop())) {
                item.classList.add('active');
            }
        });
    }

    isLoginPage() {
        const path = window.location.pathname;
        return path.endsWith('index.html') ||
               path === '/' ||
               path.endsWith('/');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (!window.headerManagerInstance) {
        window.headerManagerInstance = new HeaderManager();
    }
});
