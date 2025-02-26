class SitesManager {
   constructor() {
       this.table = document.getElementById('sitesTableBody');
       this.searchInput = document.getElementById('searchInput');
       this.entriesSelect = document.getElementById('entriesCount');
       this.newSiteBtn = document.getElementById('newSite');
       this.siteModal = document.getElementById('siteModal');
       this.deleteModal = document.getElementById('deleteModal');
       this.siteIdToDelete = null;
       this.brandSelect = document.getElementById('siteBrand');
       this.brandMap = {};
       this.init();
   }

   init() {
       this.bindEvents();
       this.loadBrands();
       this.loadSites();
   }

   bindEvents() {
       this.searchInput.addEventListener('input', () => this.filterSites());
       this.entriesSelect.addEventListener('change', () => this.loadSites());
       this.newSiteBtn.addEventListener('click', () => this.showNewSiteForm());
       
       document.getElementById('saveSiteBtn').addEventListener('click', () => this.saveSite());
       document.getElementById('confirmDelete').addEventListener('click', () => this.confirmDelete());
       
       // Закрытие модальных окон по клику вне окна
       window.addEventListener('click', (event) => {
           if (event.target === this.siteModal) {
               this.closeModal();
           }
           if (event.target === this.deleteModal) {
               this.closeDeleteModal();
           }
       });
       
       // Закрытие по Escape
       document.addEventListener("keydown", (event) => {
           if (event.key === "Escape") {
               this.closeModal();
               this.closeDeleteModal();
           }
       });
   }

   async loadBrands() {
       try {
           const response = await fetch('/api/brands', {
               headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
           });

           if (response.ok) {
               const brands = await response.json();
               this.brandSelect.innerHTML = brands.map(brand => {
                   this.brandMap[brand.brand_id] = brand.name;
                   return `<option value="${brand.brand_id}">${brand.name}</option>`;
               }).join('');
           }
       } catch (error) {
           console.error('Error loading brands:', error);
       }
   }

   async loadSites() {
       try {
           const response = await fetch('/api/sites', {
               headers: {
                   'Authorization': `Bearer ${localStorage.getItem('access_token')}`
               }
           });

           if (response.ok) {
               const sites = await response.json();
               this.renderSites(sites);
           }
       } catch (error) {
           console.error('Error loading sites:', error);
       }
   }

   renderSites(sites) {
       this.table.innerHTML = sites.map(site => `
           <tr class="${site.active ? 'row-active' : 'row-inactive'}">
               <td>${site.id}</td>
               <td><a href="brands.html?id=${site.brandId}">${this.brandMap[site.brandId] || site.brand || 'Unknown'}</a></td>
               <td>${site.label || '-'}</td>
               <td>${site.logo ? `<img src="${site.logo}" alt="logo" class="site-logo">` : '-'}</td>
               <td>${site.name}</td>
               <td>${site.domainsInUse || 0}</td>
               <td>${site.domainReserve || 0}</td>
               <td>${site.created || '-'}</td>
               <td class="actions">
                   <button onclick="sitesManager.editSite(${site.id})" class="btn btn-primary">Edit</button>
                   <button onclick="sitesManager.showDeleteModal(${site.id})" class="btn btn-danger">Delete</button>
               </td>
           </tr>
       `).join('');
   }

   filterSites() {
       const searchTerm = this.searchInput.value.toLowerCase();
       const rows = this.table.getElementsByTagName('tr');
       Array.from(rows).forEach(row => {
           const text = row.textContent.toLowerCase();
           row.style.display = text.includes(searchTerm) ? '' : 'none';
       });
   }

   showDeleteModal(id) {
       this.siteIdToDelete = id;
       this.deleteModal.classList.add('show');
   }

   closeDeleteModal() {
       this.deleteModal.classList.remove('show');
       this.siteIdToDelete = null;
   }

   async confirmDelete() {
       if (this.siteIdToDelete) {
           try {
               const response = await fetch(`/api/sites/${this.siteIdToDelete}`, { 
                   method: 'DELETE',
                   headers: {
                       'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                   }
               });
               
               if (response.ok) {
                   this.loadSites();
               } else {
                   console.error('Error deleting site:', await response.json());
               }
           } catch (error) {
               console.error('Error deleting site:', error);
           } finally {
               this.closeDeleteModal();
           }
       }
   }

   editSite(id) {
       this.showSiteForm(id);
   }

   async showSiteForm(siteId = null) {
       document.getElementById('siteModalTitle').textContent = siteId ? 'Редактировать сайт' : 'Новый сайт';
       
       // Сброс формы
       document.getElementById('siteForm').reset();
       
       if (siteId) {
           // Загрузка данных для редактирования
           try {
               const response = await fetch(`/api/sites/${siteId}`, {
                   headers: {
                       'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                   }
               });
               
               if (response.ok) {
                   const site = await response.json();
                   document.getElementById('siteBrand').value = site.brandId;
                   document.getElementById('siteName').value = site.name;
                   document.getElementById('siteLabel').value = site.label || '';
                   document.getElementById('siteLogo').value = site.logo || '';
                   
                   this.siteModal.dataset.siteId = siteId;
               }
           } catch (error) {
               console.error('Error fetching site details:', error);
           }
       } else {
           this.siteModal.dataset.siteId = '';
       }
       
       this.siteModal.classList.add('show');
   }

   showNewSiteForm() {
       this.showSiteForm();
   }

   closeModal() {
       this.siteModal.classList.remove('show');
   }

   async saveSite() {
       const siteId = this.siteModal.dataset.siteId;
       const formData = {
           brandId: document.getElementById('siteBrand').value,
           name: document.getElementById('siteName').value.trim(),
           label: document.getElementById('siteLabel').value.trim() || null,
           logo: document.getElementById('siteLogo').value.trim() || null,
       };
       
       try {
           const response = await fetch(siteId ? `/api/sites/${siteId}` : '/api/sites', {
               method: siteId ? 'PUT' : 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${localStorage.getItem('access_token')}`
               },
               body: JSON.stringify(formData)
           });
           
           if (response.ok) {
               this.loadSites();
               this.closeModal();
           } else {
               console.error('Error saving site:', await response.json());
           }
       } catch (error) {
           console.error('Error saving site:', error);
       }
   }
}

const sitesManager = new SitesManager();

