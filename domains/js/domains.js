class DomainsManager {
   constructor() {
       this.table = document.getElementById('domainsTableBody');
       this.searchInput = document.getElementById('searchInput');
       this.entriesSelect = document.getElementById('entriesCount');
       this.init();
   }

   init() {
       this.bindEvents();
       this.loadDomains();
   }

   bindEvents() {
       this.searchInput.addEventListener('input', () => this.filterDomains());
       this.entriesSelect.addEventListener('change', () => this.loadDomains());
   }

   async loadDomains() {
       try {
           const response = await fetch('/api/domains');
           const domains = await response.json();
           this.renderDomains(domains);
       } catch (error) {
           console.error('Error loading domains:', error);
       }
   }

   renderDomains(domains) {
       this.table.innerHTML = domains.map(domain => `
           <tr>
               <td>${domain.id}</td>
               <td><a href="sites.html?id=${domain.siteId}">${domain.siteId}</a></td>
               <td>
                   <a href="${domain.url}" target="_blank">${domain.url}</a>
                   <span class="status-icon ${domain.status}"></span>
               </td>
               <td>${domain.lang}</td>
               <td>${this.renderServerStatus(domain.serverStatus)}</td>
               <td>${this.renderStatus(domain.search)}</td>
               <td>${this.renderStatus(domain.spin)}</td>
               <td>${this.renderStatus(domain.gsa)}</td>
               <td>${this.renderStatus(domain.ping)}</td>
               <td>${domain.banDate || '-'}</td>
               <td>${this.renderPositions(domain.positions)}</td>
               <td>${domain.views}</td>
               <td>${domain.clicks}</td>
               <td>${domain.created}</td>
               <td class="actions">
                   <button onclick="domainsManager.searchDomain(${domain.id})" class="btn btn-info">Search</button>
                   <button onclick="domainsManager.gsaDomain(${domain.id})" class="btn">GSA</button>
                   <button onclick="domainsManager.spinDomain(${domain.id})" class="btn">Spin</button>
                   <button onclick="domainsManager.keywordsDomain(${domain.id})" class="btn">KeyWords</button>
                   <button onclick="domainsManager.moveDomain(${domain.id})" class="btn">Move</button>
               </td>
           </tr>
       `).join('');
   }

   renderServerStatus(status) {
       return `<span class="server-status ${status.toLowerCase()}">${status}</span>`;
   }

   renderStatus(status) {
       return `<span class="status-indicator ${status ? 'active' : 'inactive'}"></span>`;
   }

   renderPositions(positions) {
       const change = positions.change;
       const className = change > 0 ? 'up' : change < 0 ? 'down' : 'no-change';
       return `<span class="position-change ${className}">${positions.current} ${change !== 0 ? `(${change})` : ''}</span>`;
   }

   filterDomains() {
       const searchTerm = this.searchInput.value.toLowerCase();
       const rows = this.table.getElementsByTagName('tr');
       Array.from(rows).forEach(row => {
           const text = row.textContent.toLowerCase();
           row.style.display = text.includes(searchTerm) ? '' : 'none';
       });
   }

   // Action methods
   searchDomain(id) {
       // Implementation for Search action
   }

   gsaDomain(id) {
       // Implementation for GSA action
   }

   spinDomain(id) {
       // Implementation for Spin action
   }

   keywordsDomain(id) {
       // Implementation for Keywords action
   }

   moveDomain(id) {
       // Implementation for Move action
   }
}

const domainsManager = new DomainsManager();
