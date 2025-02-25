class SitesManager {
   constructor() {
       this.table = document.getElementById('sitesTableBody');
       this.searchInput = document.getElementById('searchInput');
       this.entriesSelect = document.getElementById('entriesCount');
       this.newSiteBtn = document.getElementById('newSite');
       this.init();
   }

   init() {
       this.bindEvents();
       this.loadSites();
   }

   bindEvents() {
       this.searchInput.addEventListener('input', () => this.filterSites());
       this.entriesSelect.addEventListener('change', () => this.loadSites());
       this.newSiteBtn.addEventListener('click', () => this.showNewSiteForm());
   }

   async loadSites() {
       try {
           const response = await fetch('/api/sites');
           const sites = await response.json();
           this.renderSites(sites);
       } catch (error) {
           console.error('Error loading sites:', error);
       }
   }

   renderSites(sites) {
       this.table.innerHTML = sites.map(site => `
           <tr>
               <td>${site.id}</td>
               <td><a href="brands.html?id=${site.brandId}">${site.brand}</a></td>
               <td>${site.label}</td>
               <td><img src="${site.logo}" alt="logo" class="site-logo"></td>
               <td>${site.name}</td>
               <td>${site.domainsInUse}</td>
               <td>${site.domainReserve}</td>
               <td>${site.created}</td>
               <td class="actions">
                   <button onclick="sitesManager.viewSite(${site.id})" class="btn btn-info">View</button>
                   <button onclick="sitesManager.editSite(${site.id})" class="btn btn-primary">Edit</button>
                   <button onclick="sitesManager.deleteSite(${site.id})" class="btn btn-danger">Delete</button>
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

   async deleteSite(id) {
       if (confirm('Are you sure you want to delete this site?')) {
           try {
               await fetch(`/api/sites/${id}`, { method: 'DELETE' });
               this.loadSites();
           } catch (error) {
               console.error('Error deleting site:', error);
           }
       }
   }

   viewSite(id) {
       // Просмотр деталей сайта
   }

   editSite(id) {
       // Редактирование сайта
   }

   showNewSiteForm() {
       // Форма создания нового сайта
   }
}

const sitesManager = new SitesManager();
