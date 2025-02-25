
class Auth {
    static API_URL = "https://q-use.ru/api";

    // Базовый метод для авторизованных запросов
    static async fetchWithAuth(endpoint, options = {}) {
        const token = localStorage.getItem('access_token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            const response = await fetch(`${this.API_URL}${endpoint}`, {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers
                }
            });

            if (response.status === 401) {
                this.removeToken();
                window.location.href = this.getRedirectPath('index');
                return null;
            }

            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    static async login(username, password) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                alert("Invalid credentials");
                return false;
            }

            const data = await response.json();
            
            if (data.access_token) {
                localStorage.setItem("access_token", data.access_token);
                
                // Получаем данные пользователя
                const userData = await this.getUserData();
                if (userData) {
                    localStorage.setItem('user_role', userData.role);
                }
                
                window.location.href = this.getRedirectPath('dashboard');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed: Network error");
            return false;
        }
    }

    static async getUserData() {
        try {
            const response = await this.fetchWithAuth('/auth/me');
            if (response && response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    static async checkAuth() {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
            if (!this.isLoginPage()) {
                window.location.href = this.getRedirectPath('index');
            }
            return false;
        }
        
        try {
            const response = await this.fetchWithAuth('/auth/me');
            
            if (!response || !response.ok) {
                this.removeToken();
                window.location.href = this.getRedirectPath('index');
                return false;
            }

            const userData = await response.json();
            localStorage.setItem('user_role', userData.role);

            if (this.isLoginPage()) {
                window.location.href = this.getRedirectPath('dashboard');
            }
            
            return true;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }

    static logout() {
        this.removeToken();
        window.location.href = this.getRedirectPath('index');
    }

    static removeToken() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
    }

    static getRedirectPath(targetPage) {
        if (this.isProtectedPage()) {
            return targetPage === 'index' ? '../index.html' : `../templates/${targetPage}.html`;
        }
        return targetPage === 'index' ? 'index.html' : `templates/${targetPage}.html`;
    }

    static isLoginPage() {
        const path = window.location.pathname.toLowerCase();
        return path.endsWith('index.html') || 
               path === '/' || 
               path.endsWith('/');
    }

    static isProtectedPage() {
        return window.location.pathname.toLowerCase().includes('/templates/');
    }
}

// Initialization
document.addEventListener("DOMContentLoaded", async () => {
    const loginForm = document.getElementById("loginForm");
    
    if (Auth.isProtectedPage()) {
        await Auth.checkAuth();
    } else if (Auth.isLoginPage()) {
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const username = document.getElementById("username").value;
                const password = document.getElementById("password").value;
                await Auth.login(username, password);
            });
        }
        await Auth.checkAuth();
    }
});
