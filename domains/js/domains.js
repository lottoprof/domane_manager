/**
 * Класс DomainsManager для управления и отображения доменов
 */
class DomainsManager {
    constructor() {
        // DOM-элементы
        this.tableBody = document.getElementById('domainsTableBody');
        this.syncModal = document.getElementById('syncModal');
        this.redirectModal = document.getElementById('redirectModal');
        this.confirmSyncBtn = document.getElementById('confirmSyncBtn');
        this.cancelSyncBtn = document.getElementById('cancelSyncBtn');
        this.confirmRedirectBtn = document.getElementById('confirmRedirectBtn');
        this.cancelRedirectBtn = document.getElementById('cancelRedirectBtn');
        this.redirectModalTitle = document.getElementById('redirectModalTitle');
        this.syncModalDomainName = document.getElementById('syncModalDomainName');
        this.redirectModalDomainName = document.getElementById('redirectModalDomainName');
        
        // Данные
        this.domains = [];
        this.currentDomainId = null;
        this.currentRedirectType = null;
        
        // Инициализация
        this.init();
    }
    
    /**
     * Инициализация менеджера
     */
    init() {
        this.bindEventListeners();
        this.loadDomains();
    }
    
    /**
     * Привязка обработчиков событий
     */
    bindEventListeners() {
        // Кнопки модальных окон
        if (this.confirmSyncBtn) {
            this.confirmSyncBtn.addEventListener('click', () => this.executeSync());
        }
        if (this.cancelSyncBtn) {
            this.cancelSyncBtn.addEventListener('click', () => this.closeSyncModal());
        }
        if (this.confirmRedirectBtn) {
            this.confirmRedirectBtn.addEventListener('click', () => this.executeRedirect());
        }
        if (this.cancelRedirectBtn) {
            this.cancelRedirectBtn.addEventListener('click', () => this.closeRedirectModal());
        }
        
        // Закрытие модальных окон по Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSyncModal();
                this.closeRedirectModal();
            }
        });
        
        // Закрытие по клику вне модальных окон
        window.onclick = (e) => {
            if (e.target === this.syncModal) {
                this.closeSyncModal();
            }
            if (e.target === this.redirectModal) {
                this.closeRedirectModal();
            }
        };
    }
    
    /**
     * Загрузка доменов с сервера
     */
    async loadDomains() {
        try {
            const response = await fetch('/api/domains', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            
            if (response.ok) {
                this.domains = await response.json();
            } else {
                console.error('Ошибка при загрузке доменов:', response.statusText);
                this.domains = this.getDemoData(); // Демо-данные при ошибке
            }
        } catch (error) {
            console.error('Ошибка при загрузке доменов:', error);
            this.domains = this.getDemoData(); // Демо-данные при ошибке
        }
        
        this.renderDomains();
    }
    
    /**
     * Отрисовка доменов в таблице
     */
    renderDomains() {
        if (!this.tableBody) return;
        
        this.tableBody.innerHTML = this.domains.map((domain, index) => {
            const domainId = domain.id || index;
            const detailsRowId = `domain-details-${domainId}`;
            const rowClass = domain.cdnStatus === 'Active' ? 'row-active' : 'row-inactive';
            
            return `
                <tr class="${rowClass}">
                    <td><button onclick="domainsManager.toggleRow('${detailsRowId}')">+</button></td>
                    <td>${domain.project || '-'}</td>
                    <td>${domain.website || '-'}</td>
                    <td>${domain.domain} <button class="sync-btn" onclick="domainsManager.showSyncModal(${domainId})">Sync</button></td>
                    <td>${domain.cdnStatus || '-'}</td>
                    <td>${domain.google || '0'}</td>
                    <td>${domain.yandex || '0'}</td>
                    <td><span class="block-status">${this.getBlockStatus(domain.blockCDN)}</span></td>
                    <td><span class="block-status">${this.getBlockStatus(domain.blockProvider)}</span></td>
                    <td><span class="block-status">${this.getBlockStatus(domain.blockWhoIsNS)}</span></td>
                    <td><span class="block-status">${this.getBlockStatus(domain.blockGovernment)}</span></td>
                </tr>
                <tr id="${detailsRowId}" class="hidden">
                    <td colspan="11">
                        <table class="nested-table">
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
                                        <button onclick="domainsManager.showRedirectModal(${domainId}, 'pageToPage')">PageToPageRedirect</button>
                                        <button onclick="domainsManager.showRedirectModal(${domainId}, 'pagesToHeader')">PagesToHeaderRedirect</button>
                                        <button onclick="domainsManager.showRedirectModal(${domainId}, 'robots')">RedirectRobots</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Получить HTML для статуса блокировки
     * @param {boolean} isBlocked - Статус блокировки
     * @return {string} HTML для статуса
     */
    getBlockStatus(isBlocked) {
        return isBlocked ? '❌' : '✅';
    }
    
    /**
     * Переключить видимость строки с подробностями
     * @param {string} rowId - ID строки
     */
    toggleRow(rowId) {
        const row = document.getElementById(rowId);
        if (!row) return;
        
        if (row.classList.contains('hidden')) {
            row.classList.remove('hidden');
            // Найти кнопку в предыдущей строке и изменить текст
            const button = row.previousElementSibling.querySelector('button');
            if (button) button.textContent = '-';
        } else {
            row.classList.add('hidden');
            // Найти кнопку в предыдущей строке и изменить текст
            const button = row.previousElementSibling.querySelector('button');
            if (button) button.textContent = '+';
        }
    }
    
    /**
     * Показать модальное окно синхронизации
     * @param {number} domainId - ID домена
     */
    showSyncModal(domainId) {
        this.currentDomainId = domainId;
        const domain = this.findDomainById(domainId);
        
        if (this.syncModalDomainName) {
            this.syncModalDomainName.textContent = domain ? domain.domain : `Domain ID ${domainId}`;
        }
        
        if (this.syncModal) {
            this.syncModal.classList.add('show');
        }
    }
    
    /**
     * Закрыть модальное окно синхронизации
     */
    closeSyncModal() {
        if (this.syncModal) {
            this.syncModal.classList.remove('show');
        }
    }
    
    /**
     * Выполнить синхронизацию домена
     */
    async executeSync() {
        if (!this.currentDomainId) {
            this.closeSyncModal();
            return;
        }
        
        try {
            // В реальном приложении здесь будет запрос к API
            console.log(`Синхронизация домена ${this.currentDomainId}`);
            
            // После успешной синхронизации перезагружаем данные
            await this.loadDomains();
        } catch (error) {
            console.error('Ошибка при синхронизации:', error);
        }
        
        this.closeSyncModal();
    }
    
    /**
     * Показать модальное окно редиректа
     * @param {number} domainId - ID домена
     * @param {string} redirectType - Тип редиректа
     */
    showRedirectModal(domainId, redirectType) {
        this.currentDomainId = domainId;
        this.currentRedirectType = redirectType;
        
        const domain = this.findDomainById(domainId);
        const domainName = domain ? domain.domain : `Domain ID ${domainId}`;
        
        if (this.redirectModalDomainName) {
            this.redirectModalDomainName.textContent = domainName;
        }
        
        if (this.redirectModalTitle) {
            let title;
            switch (redirectType) {
                case 'pageToPage':
                    title = 'Page To Page Redirect';
                    break;
                case 'pagesToHeader':
                    title = 'Pages To Header Redirect';
                    break;
                case 'robots':
                    title = 'Redirect Robots';
                    break;
                default:
                    title = 'Redirect';
            }
            this.redirectModalTitle.textContent = title;
        }
        
        if (this.redirectModal) {
            this.redirectModal.classList.add('show');
        }
    }
    
    /**
     * Закрыть модальное окно редиректа
     */
    closeRedirectModal() {
        if (this.redirectModal) {
            this.redirectModal.classList.remove('show');
        }
    }
    
    /**
     * Выполнить редирект
     */
    async executeRedirect() {
        if (!this.currentDomainId || !this.currentRedirectType) {
            this.closeRedirectModal();
            return;
        }
        
        try {
            // В реальном приложении здесь будет запрос к API
            console.log(`Выполнение ${this.currentRedirectType} для домена ${this.currentDomainId}`);
            
            // После успешного редиректа можно перезагрузить данные
            // await this.loadDomains();
        } catch (error) {
            console.error('Ошибка при выполнении редиректа:', error);
        }
        
        this.closeRedirectModal();
    }
    
    /**
     * Найти домен по ID
     * @param {number} domainId - ID домена
     * @return {Object|null} Данные домена или null
     */
    findDomainById(domainId) {
        return this.domains.find(domain => domain.id === domainId || domain.id === Number(domainId));
    }
    
    /**
     * Получить демо-данные для тестирования
     * @return {Array} Массив тестовых доменов
     */
    getDemoData() {
        return [
            {
                id: 1,
                project: 'Project Name',
                website: 'WebSite (EN)',
                domain: 'example.com',
                cdnStatus: 'Active',
                google: 300,
                yandex: 1000,
                blockCDN: true,
                blockProvider: false,
                blockWhoIsNS: false,
                blockGovernment: true,
                provider: 'Namecheap',
                redirect: 'Configured',
                expiration: '2025-12-31'
            }
        ];
    }
}

// Инициализация менеджера доменов
const domainsManager = new DomainsManager();

