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
                    cdn: true,  // ❌
                    provider: false, // ✅
                    whois_ns: false, // ✅
                    government: true  // ❌
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
                    cdn: false, // ✅
                    provider: true, // ❌
                    whois_ns: false, // ✅
                    government: false // ✅
                },
                details: {
                    domain: "example.ru",
                    provider: "GoDaddy",
                    redirect: "Not Configured",
                    expiration: "2024-06-15"
                }
            },
            {
                id: 3,
                project: "Project 3",
                website: "WebSite (ES)",
                domain: "example.es",
                cdn_status: "Active",
                google_index: 250,
                yandex_index: 800,
                block_details: {
                    cdn: true, // ❌
                    provider: true, // ❌
                    whois_ns: true, // ❌
                    government: true // ❌
                },
                details: {
                    domain: "example.es",
                    provider: "Namecheap",
                    redirect: "Configured",
                    expiration: "2026-03-15"
                }
            },
            {
                id: 4,
                project: "Project 4",
                website: "WebSite (DE)",
                domain: "example.de",
                cdn_status: "Active",
                google_index: 280,
                yandex_index: 950,
                block_details: {
                    cdn: false, // ✅
                    provider: false, // ✅
                    whois_ns: false, // ✅
                    government: false // ✅
                },
                details: {
                    domain: "example.de",
                    provider: "Namecheap",
                    redirect: "Configured",
                    expiration: "2026-05-20"
                }
            }
        ];

        // Сортируем домены: сначала домены с блокировками, затем без блокировок
        // Внутри каждой группы сортируем по алфавиту (по имени домена)
        const sortedDomains = this.sortDomains(domainsData);
        
        this.renderDomains(sortedDomains);
    }

    // Метод для сортировки доменов
    sortDomains(domains) {
        return domains.sort((a, b) => {
            // Проверяем, есть ли у домена блокировки
            const aHasBlocks = a.block_details.cdn || 
                               a.block_details.provider || 
                               a.block_details.whois_ns || 
                               a.block_details.government;
            
            const bHasBlocks = b.block_details.cdn || 
                               b.block_details.provider || 
                               b.block_details.whois_ns || 
                               b.block_details.government;
            
            // Если у одного есть блокировки, а у другого нет
            if (aHasBlocks && !bHasBlocks) {
                return -1; // a идет перед b
            }
            
            if (!aHasBlocks && bHasBlocks) {
                return 1; // b идет перед a
            }
            
            // Если оба домена имеют одинаковый статус блокировки,
            // сортируем по алфавиту
            return a.project.localeCompare(b.project);
           // return a.domain.localeCompare(b.domain);
        });
    }

    renderDomains(domains) {
        if (!this.tableBody) return;
        
        this.tableBody.innerHTML = '';
        
        domains.forEach((domain, index) => {
            // Определяем класс строки на основе статусов блокировки
            const isAnyBlocked = domain.block_details.cdn || 
                                 domain.block_details.provider || 
                                 domain.block_details.whois_ns || 
                                 domain.block_details.government;
            
            const rowClass = isAnyBlocked ? 'row-inactive' : 'row-active';
            
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
            '<span class="status-icon cell-danger">❌</span>' : 
            '<span class="status-icon cell-success">✅</span>';
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
        // Получаем ссылку на модальное окно
        const modal = document.getElementById('confirmModal');
        const confirmTitle = document.getElementById('confirmTitle');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmYes = document.getElementById('confirmYes');
        const confirmNo = document.getElementById('confirmNo');
        
        if (!modal || !confirmTitle || !confirmMessage || !confirmYes || !confirmNo) {
            console.error('Modal elements not found');
            return;
        }
        
        // Установка заголовка и сообщения
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        
        // Установка обработчика для кнопки "Да"
        const yesClickHandler = () => {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
            this.closeModal(modal);
            // Удаляем обработчики событий после закрытия
            confirmYes.removeEventListener('click', yesClickHandler);
            confirmNo.removeEventListener('click', noClickHandler);
            document.removeEventListener('keydown', escKeyHandler);
            modal.removeEventListener('click', outsideClickHandler);
        };
        
        // Установка обработчика для кнопки "Нет"
        const noClickHandler = () => {
            this.closeModal(modal);
            // Удаляем обработчики событий после закрытия
            confirmYes.removeEventListener('click', yesClickHandler);
            confirmNo.removeEventListener('click', noClickHandler);
            document.removeEventListener('keydown', escKeyHandler);
            modal.removeEventListener('click', outsideClickHandler);
        };
        
        // Обработчик для клавиши ESC
        const escKeyHandler = (event) => {
            if (event.key === 'Escape') {
                this.closeModal(modal);
                // Удаляем обработчики событий после закрытия
                confirmYes.removeEventListener('click', yesClickHandler);
                confirmNo.removeEventListener('click', noClickHandler);
                document.removeEventListener('keydown', escKeyHandler);
                modal.removeEventListener('click', outsideClickHandler);
            }
        };
        
        // Обработчик для клика вне модального окна
        const outsideClickHandler = (event) => {
            if (event.target === modal) {
                this.closeModal(modal);
                // Удаляем обработчики событий после закрытия
                confirmYes.removeEventListener('click', yesClickHandler);
                confirmNo.removeEventListener('click', noClickHandler);
                document.removeEventListener('keydown', escKeyHandler);
                modal.removeEventListener('click', outsideClickHandler);
            }
        };
        
        // Привязываем обработчики событий
        confirmYes.addEventListener('click', yesClickHandler);
        confirmNo.addEventListener('click', noClickHandler);
        document.addEventListener('keydown', escKeyHandler);
        modal.addEventListener('click', outsideClickHandler);
        
        // Отображение модального окна
        modal.classList.add('show');
    }
    
    // Метод для закрытия модального окна
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
        }
    }

    setupEventListeners() {
        // Инициализация базовых обработчиков событий
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

