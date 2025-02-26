class DomainsManager {
    constructor() {
        this.tableBody = document.getElementById('domainsTableBody');
        this.init();
    }

    init() {
        this.loadDomains();
        this.setupEventListeners();
    }

    loadDomains() {
        // Тестовые данные доменов (на основе структуры из domens.html)
        const domainsData = [
            {
                id: 1,
                project: "Project",
                website: "WebSite (EN)",
                domain: "example.com",
                cdn_status: "Active",
                google_index: 300,
                yandex_index: 1000,
                block_details: {
                    cdn: false,
                    provider: true,
                    whois_ns: true,
                    government: false
                },
                details: {
                    domain: "example.com",
                    provider: "Namecheap",
                    redirect: "Configured",
                    expiration: "2025-12-31"
                }
            },
            {
                id: 2,
                project: "Project 2",
                website: "WebSite (RU)",
                domain: "example.ru",
                cdn_status: "Inactive",
                google_index: 150,
                yandex_index: 2000,
                block_details: {
                    cdn: true,
                    provider: false,
                    whois_ns: true,
                    government: true
                },
                details: {
                    domain: "example.ru",
                    provider: "GoDaddy",
                    redirect: "Not Configured",
                    expiration: "2024-06-15"
                }
            }
        ];

        this.renderDomains(domainsData);
    }

    renderDomains(domains) {
        if (!this.tableBody) return;
        
        this.tableBody.innerHTML = '';
        
        domains.forEach((domain, index) => {
            // Определяем класс строки на основе статуса CDN
            const rowClass = domain.cdn_status === 'Active' ? 'row-active' : 'row-inactive';
            
            // Основная строка с данными домена
            const mainRow = document.createElement('tr');
            mainRow.className = rowClass;
            mainRow.innerHTML = `
                <td><button class="expand-btn" onclick="toggleRow('details${index}')">+</button></td>
                <td>${domain.project}</td>
                <td>${domain.website}</td>
                <td>${domain.domain} <button class="sync-btn" onclick="domainsManager.syncDomain(${domain.id})">Sync</button></td>
                <td>${domain.cdn_status}</td>
                <td class="${domain.google_index > 200 ? 'value-positive' : 'value-negative'}">${domain.google_index}</td>
                <td class="${domain.yandex_index > 1000 ? 'value-positive' : 'value-negative'}">${domain.yandex_index}</td>
                <td class="text-center">${this.getStatusIcon(domain.block_details.cdn)}</td>
                <td class="text-center">${this.getStatusIcon(domain.block_details.provider)}</td>
                <td class="text-center">${this.getStatusIcon(domain.block_details.whois_ns)}</td>
                <td class="text-center">${this.getStatusIcon(domain.block_details.government)}</td>
            `;
            
            this.tableBody.appendChild(mainRow);
            
            // Строка с деталями (скрытая по умолчанию)
            const detailsRow = document.createElement('tr');
            detailsRow.id = `details${index}`;
            detailsRow.className = 'hidden';
            detailsRow.innerHTML = `
                <td colspan="11">
                    <table class="details-table">
                        <tr>
                            <th>Domain</th>
                            <th>Provider</th>
                            <th>Redirect</th>
                            <th>Expiration</th>
                            <th>Actions</th>
                        </tr>
                        <tr>
                            <td>${domain.details.domain}</td>
                            <td>${domain.details.provider}</td>
                            <td>${domain.details.redirect}</td>
                            <td>${domain.details.expiration}</td>
                            <td>
                                <button class="action-btn" onclick="domainsManager.pageToPageRedirect(${domain.id})">PageToPageRedirect</button> 
                                <button class="action-btn" onclick="domainsManager.pagesToHeaderRedirect(${domain.id})">PagesToHeaderRedirect</button> 
                                <button class="action-btn" onclick="domainsManager.redirectRobots(${domain.id})">RedirectRobots</button>
                            </td>
                        </tr>
                    </table>
                </td>
            `;
            
            this.tableBody.appendChild(detailsRow);
        });
    }

    getStatusIcon(status) {
        return status ? 
            '<span class="status-icon cell-success">✅</span>' : 
            '<span class="status-icon cell-danger">❌</span>';
    }

    // Обработчики для кнопок
    syncDomain(domainId) {
        this.showConfirmModal('Sync Domain', 'Are you sure you want to sync this domain?', () => {
            console.log(`Syncing domain ID: ${domainId}`);
            // Здесь будет вызов API для синхронизации домена
        });
    }

    pageToPageRedirect(domainId) {
        this.showConfirmModal('Page to Page Redirect', 'Are you sure you want to configure page-to-page redirect?', () => {
            console.log(`Configuring page-to-page redirect for domain ID: ${domainId}`);
            // Здесь будет вызов API для настройки редиректа
        });
    }

    pagesToHeaderRedirect(domainId) {
        this.showConfirmModal('Pages to Header Redirect', 'Are you sure you want to configure pages-to-header redirect?', () => {
            console.log(`Configuring pages-to-header redirect for domain ID: ${domainId}`);
            // Здесь будет вызов API для настройки редиректа
        });
    }

    redirectRobots(domainId) {
        this.showConfirmModal('Redirect Robots', 'Are you sure you want to configure robots redirect?', () => {
            console.log(`Configuring robots redirect for domain ID: ${domainId}`);
            // Здесь будет вызов API для настройки редиректа
        });
    }

    // Модальное окно подтверждения
    showConfirmModal(title, message, onConfirm) {
        // Создаем модальное окно, если его еще нет
        let modal = document.getElementById('confirmModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'confirmModal';
            modal.className = 'modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            modalContent.innerHTML = `
                <h2 id="confirmTitle"></h2>
                <p id="confirmMessage"></p>
                <div>
                    <button id="confirmYes" class="btn-primary">Да</button>
                    <button id="confirmNo">Нет</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Обработчик клика по кнопке "Нет" и закрытия модального окна
            document.getElementById('confirmNo').addEventListener('click', () => {
                modal.classList.remove('show');
            });
            
            // Закрытие по клику вне модального окна
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
            
            // Закрытие по клавише Esc
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('show')) {
                    modal.classList.remove('show');
                }
            });
        }
        
        // Установка заголовка и сообщения
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        // Установка обработчика для кнопки "Да"
        const confirmYesBtn = document.getElementById('confirmYes');
        confirmYesBtn.onclick = () => {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
            modal.classList.remove('show');
        };
        
        // Отображение модального окна
        modal.classList.add('show');
    }

    setupEventListeners() {
        // Общие обработчики событий, если необходимо
        console.log('Event listeners set up');
    }
}

// Глобальная функция для переключения видимости строки деталей
function toggleRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        if (row.classList.contains("hidden")) {
            row.classList.remove("hidden");
            
            // Изменение текста кнопки с + на -
            const button = document.querySelector(`button[onclick="toggleRow('${rowId}')"]`);
            if (button) {
                button.textContent = '-';
            }
        } else {
            row.classList.add("hidden");
            
            // Изменение текста кнопки с - на +
            const button = document.querySelector(`button[onclick="toggleRow('${rowId}')"]`);
            if (button) {
                button.textContent = '+';
            }
        }
    }
}

// Инициализация менеджера доменов при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.domainsManager = new DomainsManager();
});

