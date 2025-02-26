class TemplatesManager {
    constructor() {
        this.tableBody = document.getElementById('templatesTableBody');
        this.modal = document.getElementById("templateModal");
        this.saveButton = document.getElementById("saveTemplateBtn");
        this.brandSelect = document.getElementById("templateBrand");
        this.brandMap = {}; 

        this.init();
    }

    async init() {
        await this.loadBrands();
        await this.loadTemplates();
        this.setupEventListeners(); 
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

    async loadTemplates() {
        try {
            const response = await fetch('/api/templates', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });

            if (response.ok) {
                const templates = await response.json();
                this.renderTemplates(templates);
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    renderTemplates(templates) {
        this.tableBody.innerHTML = templates.map(template => `
            <tr class="${template.active ? 'row-active' : 'row-inactive'}">
                <td>${template.template_id}</td>
                <td>${this.brandMap[template.brand_id] || 'Unknown'}</td>
                <td>${template.name}</td>
                <td>${template.description || '-'}</td>
                <td>${template.language}</td>
                <td>${template.created_at || '-'}</td>
                <td>${template.active ? 'Yes' : 'No'}</td>
                <td>${this.getActionButtons(template.template_id)}</td>
            </tr>
        `).join('');
    }

    getActionButtons(templateId) {
        return `<button onclick="templatesManager.openEditTemplateModal(${templateId})" class="btn btn-primary">Edit</button>`;
    }

    async openEditTemplateModal(templateId) {
        this.showModal(templateId); // Передаем ID, чтобы не очищать форму

        try {
            const response = await fetch(`/api/templates/${templateId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });

            if (response.ok) {
                const template = await response.json();
                this.brandSelect.value = template.brand_id;
                document.getElementById("templateName").value = template.name;
                document.getElementById("templateDescription").value = template.description || "";
                document.getElementById("templateLanguage").value = template.language;
                document.getElementById("templateActive").value = template.active ? "true" : "false";
            }
        } catch (error) {
            console.error("Error fetching template details:", error);
        }
    }

    async saveTemplate() {
        const templateId = this.modal.dataset.templateId;
        const templateData = {
            brand_id: this.brandSelect.value,
            name: document.getElementById("templateName").value.trim(),
            description: document.getElementById("templateDescription").value.trim(),
            language: document.getElementById("templateLanguage").value.trim(),
            active: document.getElementById("templateActive").value === "true"
        };

        try {
            const response = await fetch(templateId ? `/api/templates/${templateId}` : "/api/templates", {
                method: templateId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(templateData)
            });

            if (response.ok) {
                this.loadTemplates();
                this.closeModal();
            } else {
                console.error("Error saving template:", await response.json());
            }
        } catch (error) {
            console.error("Request error:", error);
        }
    }

    setupEventListeners() {
        const addButton = document.getElementById("addTemplateBtn");

        if (!addButton) {
            console.error("Button #addTemplateBtn not found");
            return;
        }

        addButton.addEventListener("click", () => {
            this.showModal();
        });

        if (this.saveButton) {
            this.saveButton.addEventListener("click", async () => {
                await this.saveTemplate();
            });
        }

        // Закрытие по клику вне окна
        window.addEventListener("click", (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });

        // Закрытие по Escape
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                this.closeModal();
            }
        });
    }

    showModal(templateId = "") {
        if (!this.modal) {
            console.error("Modal #templateModal not found");
            return;
        }

        if (!templateId) { // Если создание нового шаблона
            this.brandSelect.value = "";
            document.getElementById("templateName").value = "";
            document.getElementById("templateDescription").value = "";
            document.getElementById("templateLanguage").value = "";
            document.getElementById("templateActive").value = "true";
        }

        this.modal.dataset.templateId = templateId;
        this.modal.classList.add("show");
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove("show");
        }
    }
}

const templatesManager = new TemplatesManager();

