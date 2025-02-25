
// access.js
class AccessControl {
    // Права для пунктов меню и страниц
    static MENU_ACCESS = {
        "dashboard": ["admin", "editor", "user"],
        "brands": ["admin", "editor", "user"],
        "sites": ["admin", "editor", "user"],
        "domains": ["admin", "editor", "user"],
        "templates": ["admin", "editor", "user"],
        "apk": ["admin", "editor"],
        "users": ["admin"]
    };

    static getUserRole() {
        return localStorage.getItem('user_role') || 'user';
    }

    // Добавляем метод hasMenuAccess
    static hasMenuAccess(page) {
        const userRole = this.getUserRole();
        return this.MENU_ACCESS[page]?.includes(userRole) || false;
    }

    // Проверка доступа к элементам
    static checkElementsAccess() {
        const userRole = this.getUserRole();
        const elements = document.querySelectorAll('[data-role-access]');
        
        elements.forEach(element => {
            const allowedRoles = element.dataset.roleAccess.split(',');
            if (!allowedRoles.includes(userRole)) {
                element.style.display = 'none';
            }
        });
    }
}
