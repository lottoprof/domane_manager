/**
 * Менеджер доменов - управляет отображением и взаимодействием с таблицей доменов
 */
class DomainsManager {
    constructor() {
        this.tableBody = document.getElementById('domainsTableBody');
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmTitle = document.getElementById('confirmModalTitle');
        this.confirmMessage = document.getElementById('confirmModalMessage');
        this.confirmYesBtn = document.getElementById('confirmYesBtn');
        this.confirmNoBtn = document.getElementById('confirmNoBtn');
        
        // Хранение текущей операции
        this.currentOperation = null;
        this.currentDomainId = null;
        
        // Кеш данных
        this.domains = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadDomains();
    }
    
    bindEvents() {
        // Обработчики для модального окна
        this.confirmYesBtn.addEventListener('click', () => this.handleConfirmation(true));
        this.confirmNoBtn.addEventListener('click', () => this.handleConfirmation(false));
        
        // Закрытие модального окна по Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.confirmModal) {
                this.closeConfirmModal();
            }
        });
        
        // Закрытие по клику вне модального окна
        window.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) {
                this.closeConfirmModal();
            }
        });
    }
    
    async loadDomains() {
        try {
            const response = await fetch('/api/domains', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            
            if (response.ok) {
                this.domains = await response.json();
                this.renderDomains();
            }
        } catch (error) {
            console.error('Ошибка загрузки доменов:', error);
            // Если API недоступен, показываем демо-данные
            this.domains = this.getDemoData();
            this.renderDomains();
        }
    }
    
    renderDomains() {
        this.tableBody.innerHTML = this.domains.map((domain, index) => {
            const rowId = `domain-details-${domain.id || index}`;
            const statusClass = this.getStatusClass(domain);
            
            return `
                <tr class="${statusClass}">
                    <td><button class="expand-btn" onclick="domainsManager.toggleDetails('${rowId}', ${index})">+</button></td>
                    <td>${domain.project || '-'}</td>
                    <td>${domain.website || '-'}</td>
                    <td>${domain.domain} <button class="sync-btn" onclick="domainsManager.showConfirm('sync', ${index})">Sync</button></td>
                    <td>${domain.cdnStatus || '-'}</td>
                    <td>${domain.google || '0'}</td>
                    <td>${domain.yandex || '0'}</td>
                    <td><span class="status-icon">${this.getStatusIcon(domain.blockCDN)}</span></td>
                    <td><span class="status-icon">${this.getStatusIcon(domain.blockProvider)}</span></td>
                    <td><span class="status-icon">${this.getStatusIcon(domain.blockWhoIs)}</span></td>
                    <td><span class="status-icon">${this.getStatusIcon(domain.blockGovernment)}</span></td>
                </tr>
                <tr id="${rowId}" class="hidden">
                    <td colspan="11">
                        <table class="details-table">
                            <tbody>
                                <tr>
                                    <th>Domain</th>
                                    <th>Provider</th>                            
                                    <th>Redirect</th>
                                    <th>Expiration</th>
                                    <th>Actions</th>
                                </tr>
                                <tr>
                                    <td>${domain.domain}</td>
                                    <td>${domain.provider || '-'}</td>
                                    <td>${domain.redirect || '-'}</td>
                                    <td>${domain.expiration || '-'}</td>
                                    <td>
                                        <button class="action-btn" onclick="domainsManager.showConfirm('pageToPage', ${index})">PageToPageRedirect</button>
                                        <button class="action-btn" onclick="domainsManager.showConfirm('pagesToHeader', ${index})">PagesToHeaderRedirect</button>
                                        <button class="action-btn" onclick="domainsManager.showConfirm('robots', ${index})">RedirectRobots</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // Определение класса для строки на основе статуса
    getStatusClass(domain) {
        return domain.active ? 'row-active' : 'row-inactive';
    }
    
    // Возвращает иконку для статуса блокировки
    getStatusIcon(isBlocked) {
        return isBlocked ? '❌' : '✅';
    }
    
    // Переключение видимости деталей домена
    toggleDetails(rowId, index) {
        const row = document.getElementById(rowId);
        if (!row) return;
        
        const button = row.previousElementSibling.querySelector('.expand-btn');
        
        if (row.classList.contains('hidden')) {
            row.classList.remove('hidden');
            if (button) button.textContent = '-';
        } else {
            row.classList.add('hidden');
            if (button) button.textContent = '+';
        }
    }
    
    // Показ модального окна подтверждения
    showConfirm(operation, domainIndex) {
        const domain = this.domains[domainIndex];
        if (!domain) return;
        
        this.currentOperation = operation;
        this.currentDomainId = domain.id;
        
        let title, message;
        
        switch(operation) {
            case 'sync':
                title = 'Подтверждение синхронизации';
                message = `Вы уверены, что хотите синхронизировать домен ${domain.domain}?`;
                break;
            case 'pageToPage':
                title = 'Подтверждение Page to Page Redirect';
                message = `Выполнить Page to Page Redirect для домена ${domain.domain}?`;
                break;
            case 'pagesToHeader':
                title = 'Подтверждение Pages to Header Redirect';
                message = `Выполнить Pages to Header Redirect для домена ${domain.domain}?`;
                break;
            case 'robots':
                title = 'Подтверждение Redirect Robots';
                message = `Выполнить Redirect Robots для домена ${domain.domain}?`;
                break;
            default:
                title = 'Подтверждение действия';
                message = 'Вы уверены, что хотите выполнить это действие?';
        }
        
        this.confirmTitle.textContent = title;
        this.confirmMessage.textContent = message;
        this.confirmModal.classList.add('show');
    }
    
    // Закрытие модального окна
    closeConfirmModal() {
        this.confirmModal.classList.remove('show');
    }
    
    // Обработка подтверждения
    handleConfirmation(confirmed) {
        if (!confirmed) {
            this.closeConfirmModal();
            return;
        }
        
        // Выполнение действия в зависимости от текущей операции
        switch(this.currentOperation) {
            case 'sync':
                this.syncDomain(this.currentDomainId);
                break;
            case 'pageToPage':
                this.pageToPageRedirect(this.currentDomainId);
                break;
            case 'pagesToHeader':
                this.pagesToHeaderRedirect(this.currentDomainId);
                break;
            case 'robots':
                this.redirectRobots(this.currentDomainId);
                break;
        }
        
        this.closeConfirmModal();
    }
    
    // Методы API
    async syncDomain(domainId) {
        console.log(`Синхронизация домена ${domainId}`);
        // Здесь будет вызов API
        
        // Перезагрузка данных после операции
        await this.loadDomains();
    }
    
    async pageToPageRedirect(domainId) {
        console.log(`Page to Page Redirect для домена ${domainId}`);
        // Здесь будет вызов API
    }
    
    async pagesToHeaderRedirect(domainId) {
        console.log(`Pages to Header Redirect для домена ${domainId}`);
        // Здесь будет вызов API
    }
    
    async redirectRobots(domainId) {
        console.log(`Redirect Robots для домена ${domainId}`);
        // Здесь будет вызов API
    }
    
    // Демо-данные для тестирования
    getDemoData() {
        return [
            {
                id: 1,
                project: 'Project 1',
                website: 'Website 1 (EN)',
                domain: 'example.com',
                cdnStatus: 'Active',
                google: 300,
                yandex: 1000,
                blockCDN: true,
                blockProvider: false,
                blockWhoIs: false,
                blockGovernment: true,
                provider: 'Namecheap',
                redirect: 'Configured',
                expiration: '2025-12-31',
                active: true
            },
            {
                id: 2,
                project: 'Project 2',
                website: 'Website 2 (RU)',
                domain: 'example.ru',
                cdnStatus: 'Inactive',
                google: 150,
                yandex: 800,
                blockCDN: false,
                blockProvider: true,
                blockWhoIs: true,
                blockGovernment: false,
                provider: 'REG.RU',
                redirect: 'Not Configured',
                expiration: '2024-10-15',
                active: false
            }
        ];
    }
}

// Инициализация
const domainsManager = new DomainsManager();

