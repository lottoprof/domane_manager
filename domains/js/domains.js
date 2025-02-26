class DomainsManager {
   constructor() {
       this.table = document.getElementById('domainsTableBody');
       this.domainModal = document.getElementById('domainModal');
       this.syncModal = document.getElementById('syncModal');
       this.redirectModal = document.getElementById('redirectModal');
       this.saveDomainBtn = document.getElementById('saveDomainBtn');
       this.addDomainBtn = document.getElementById('addDomainBtn');
       this.domainProject = document.getElementById('domainProject');
       this.domainWebsite = document.getElementById('domainWebsite');
       this.projectMap = {};
       this.websiteMap = {};
       this.expandedRows = new Set();
       this.init();
   }

   init() {
       this.bindEvents();
       this.loadProjects();
       this.loadDomains();
   }

   bindEvents() {       
       if (this.addDomainBtn) {
           this.addDomainBtn.addEventListener('click', () => this.showNewDomainForm());
       }
       
       if (this.saveDomainBtn) {
           this.saveDomainBtn.addEventListener('click', () => this.saveDomain());
       }
       
       // Закрытие модального окна по клику вне его
       window.addEventListener('click', (event) => {
           if (event.target === this.domainModal) {
               this.closeModal();
           }
       });
       
       // Закрытие по Escape
       document.addEventListener('keydown', (event) => {
           if (event.key === 'Escape') {
               this.closeModal();
           }
       });
       
       // Событие для изменения выбора проекта
       if (this.domainProject) {
           this.domainProject.addEventListener('change', () => this.loadWebsitesForProject());
       }
   }

   async loadProjects() {
       try {
           const response = await fetch('/api/brands', {
               headers: {
                   'Authorization': `Bearer ${localStorage.getItem('access_token')}`
               }
           });
           
           if (response.ok) {
               const projects = await response.json();
               
               if (this.domainProject) {
                   this.domainProject.innerHTML = projects.map(project => {
                       this.projectMap[project.brand_id] = project.name;
                       return `<option value="${project.brand_id}">${project.name}</option>`;
                   }).join('');
                   
                   // Загрузка сайтов для выбранного проекта
                   this.loadWebsitesForProject();
               }
           }
       } catch (error) {
           console.error('Error loading projects:', error);
       }
   }

   async loadWebsitesForProject() {
       if (!this.domainProject || !this.domainWebsite) return;
       
       const projectId = this.domainProject.value;
       if (!projectId) return;
       
       try {
           const response = await fetch(`/api/sites?brandId=${projectId}`, {
               headers: {
                   'Authorization': `Bearer ${localStorage.getItem('access_token')}`
               }
           });
           
           if (response.ok) {
               const websites = await response.json();
               
               this.domainWebsite.innerHTML = websites.map(site => {
                   this.websiteMap[site.id] = `${site.name} (${site.lang || 'N/A'})`;
                   return `<option value="${site.id}">${site.name} (${site.lang || 'N/A'})</option>`;
               }).join('');
           }
       } catch (error) {
           console.error('Error loading websites for project:', error);
       }
   }

   async loadDomains() {
       try {
           const response = await fetch(`/api/domains`, {
               headers: {
                   'Authorization': `Bearer ${localStorage.getItem('access_token')}`
               }
           });
           
           if (response.ok) {
               const domains = await response.json();
               this.renderDomains(domains);
           }
       } catch (error) {
           console.error('Error loading domains:', error);
       }
   }

   renderDomains(domains) {
       this.table.innerHTML = domains.map((domain, index) => {
           const isExpanded = this.expandedRows.has(domain.id);
           const rowId = `domain-details-${domain.id}`;
           
           return `
               <tr class="${domain.cdnStatus === 'Active' ? 'row-active' : 'row-inactive'}">
                   <td><button onclick="domainsManager.toggleDetails(${domain.id})" class="btn">${isExpanded ? '-' : '+'}</button></td>
                   <td>${this.projectMap[domain.projectId] || domain.projectId || '-'}</td>
                   <td>${this.websiteMap[domain.websiteId] || domain.websiteId || '-'}</td>
                   <td>${domain.domain} <button class="btn btn-primary btn-sm" onclick="domainsManager.showSyncModal(${domain.id})">Sync</button></td>
                   <td>${domain.cdnStatus || '-'}</td>
                   <td>${domain.google || '0'}</td>
                   <td>${domain.yandex || '0'}</td>
                   <td>${this.renderBlockStatus(domain.blockCDN)}</td>
                   <td>${this.renderBlockStatus(domain.blockProvider)}</td>
                   <td>${this.renderBlockStatus(domain.blockWhoIsNS)}</td>
                   <td>${this.renderBlockStatus(domain.blockGovernment)}</td>
               </tr>
               <tr id="${rowId}" class="${isExpanded ? '' : 'hidden'}">
                   <td colspan="11">
                       <table class="data-table">
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
                                       <button onclick="domainsManager.showRedirectModal(${domain.id}, 'pageToPage')" class="btn btn-sm">PageToPageRedirect</button>
                                       <button onclick="domainsManager.showRedirectModal(${domain.id}, 'pagesToHeader')" class="btn btn-sm">PagesToHeaderRedirect</button>
                                       <button onclick="domainsManager.showRedirectModal(${domain.id}, 'robots')" class="btn btn-sm">RedirectRobots</button>
                                   </td>
                               </tr>
                           </tbody>
                       </table>
                   </td>
               </tr>
           `;
       }).join('');
   }
                   </td>
               </tr>
           `;
       }).join('');
   }

   renderBlockStatus(status) {
       return status ? '❌' : '✅';
   }

   toggleDetails(domainId) {
       const rowId = `domain-details-${domainId}`;
       const detailsRow = document.getElementById(rowId);
       
       if (detailsRow) {
           if (detailsRow.classList.contains('hidden')) {
               detailsRow.classList.remove('hidden');
               this.expandedRows.add(domainId);
           } else {
               detailsRow.classList.add('hidden');
               this.expandedRows.delete(domainId);
           }
           
           // Перерисовать домены для обновления кнопок развертывания
           this.loadDomains();
       }
   }

   toggleDetails(domainId) {
       const rowId = `domain-details-${domainId}`;
       const detailsRow = document.getElementById(rowId);
       
       if (detailsRow) {
           if (detailsRow.classList.contains('hidden')) {
               detailsRow.classList.remove('hidden');
               this.expandedRows.add(domainId);
           } else {
               detailsRow.classList.add('hidden');
               this.expandedRows.delete(domainId);
           }
       }
   }

   showSyncModal(domainId) {
       // Заполняем информацию о домене в модальном окне
       document.getElementById('syncModalDomainName').textContent = 
           this.findDomainById(domainId)?.domain || domainId;
       
       // Сохраняем ID домена для использования при подтверждении
       document.getElementById('confirmSyncBtn').setAttribute('data-domain-id', domainId);
       
       // Отображаем модальное окно
       this.syncModal.classList.add('show');
   }

   closeSyncModal() {
       if (this.syncModal) {
           this.syncModal.classList.remove('show');
       }
   }

   confirmSync() {
       const domainId = document.getElementById('confirmSyncBtn').getAttribute('data-domain-id');
       this.syncDomain(domainId);
       this.closeSyncModal();
   }

   showRedirectModal(domainId, redirectType) {
       // Сохраняем информацию о типе редиректа и домене
       const domain = this.findDomainById(domainId);
       document.getElementById('redirectModalDomainName').textContent = domain?.domain || domainId;
       
       let actionTitle = "";
       switch(redirectType) {
           case 'pageToPage':
               actionTitle = "Page To Page Redirect";
               break;
           case 'pagesToHeader':
               actionTitle = "Pages To Header Redirect";
               break;
           case 'robots':
               actionTitle = "Redirect Robots";
               break;
       }
       
       document.getElementById('redirectModalTitle').textContent = actionTitle;
       
       // Сохраняем ID домена и тип редиректа для использования при подтверждении
       const confirmBtn = document.getElementById('confirmRedirectBtn');
       confirmBtn.setAttribute('data-domain-id', domainId);
       confirmBtn.setAttribute('data-redirect-type', redirectType);
       
       // Отображаем модальное окно
       this.redirectModal.classList.add('show');
   }

   closeRedirectModal() {
       if (this.redirectModal) {
           this.redirectModal.classList.remove('show');
       }
   }

   confirmRedirect() {
       const confirmBtn = document.getElementById('confirmRedirectBtn');
       const domainId = confirmBtn.getAttribute('data-domain-id');
       const redirectType = confirmBtn.getAttribute('data-redirect-type');
       
       switch(redirectType) {
           case 'pageToPage':
               this.pageToPageRedirect(domainId);
               break;
           case 'pagesToHeader':
               this.pagesToHeaderRedirect(domainId);
               break;
           case 'robots':
               this.redirectRobots(domainId);
               break;
       }
       
       this.closeRedirectModal();
   }

   findDomainById(domainId) {
       // Эта функция будет реализована после того, как у нас будет хранилище доменов
       return { domain: `Domain ID ${domainId}` }; // Заглушка
   }

   showNewDomainForm() {
       // Очистка формы
       document.getElementById('domainForm').reset();
       document.getElementById('domainModalTitle').textContent = 'Новый домен';
       this.domainModal.dataset.domainId = '';
       
       // Отображение модального окна
       this.domainModal.classList.add('show');
   }

   async editDomain(domainId) {
       document.getElementById('domainModalTitle').textContent = 'Редактировать домен';
       this.domainModal.dataset.domainId = domainId;
       
       try {
           const response = await fetch(`/api/domains/${domainId}`, {
               headers: {
                   'Authorization': `Bearer ${localStorage.getItem('access_token')}`
               }
           });
           
           if (response.ok) {
               const domain = await response.json();
               
               // Заполнение формы данными домена
               document.getElementById('domainProject').value = domain.projectId;
               await this.loadWebsitesForProject(); // Загрузить сайты для выбранного проекта
               document.getElementById('domainWebsite').value = domain.websiteId;
               document.getElementById('domainName').value = domain.domain;
               
               // Отображение модального окна
               this.domainModal.classList.add('show');
           }
       } catch (error) {
           console.error('Error fetching domain details:', error);
       }
   }

   closeModal() {
       this.domainModal.classList.remove('show');
   }

   async saveDomain() {
       const domainId = this.domainModal.dataset.domainId;
       const formData = {
           projectId: document.getElementById('domainProject').value,
           websiteId: document.getElementById('domainWebsite').value,
           domain: document.getElementById('domainName').value.trim()
       };
       
       try {
           const response = await fetch(domainId ? `/api/domains/${domainId}` : '/api/domains', {
               method: domainId ? 'PUT' : 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${localStorage.getItem('access_token')}`
               },
               body: JSON.stringify(formData)
           });
           
           if (response.ok) {
               this.loadDomains();
               this.closeModal();
           } else {
               console.error('Error saving domain:', await response.json());
           }
       } catch (error) {
           console.error('Error saving domain:', error);
       }
   }

   // Domain action methods
   async syncDomain(domainId) {
       try {
           const response = await fetch(`/api/domains/${domainId}/sync`, {
               method: 'POST',
               headers: {
                   'Authorization': `Bearer ${localStorage.getItem('access_token')}`
               }
           });
           
           if (response.ok) {
               this.loadDomains();
           } else {
               console.error('Error syncing domain:', await response.json());
           }
       } catch (error) {
           console.error('Error syncing domain:', error);
       }
   }

   // Redirect methods
   async pageToPageRedirect(domainId) {
       console.log(`Page to page redirect for domain ID: ${domainId}`);
       // Implement page to page redirect logic
   }

   async pagesToHeaderRedirect(domainId) {
       console.log(`Pages to header redirect for domain ID: ${domainId}`);
       // Implement pages to header redirect logic
   }

   async redirectRobots(domainId) {
       console.log(`Redirect robots for domain ID: ${domainId}`);
       // Implement redirect robots logic
   }
}

const domainsManager = new DomainsManager();

