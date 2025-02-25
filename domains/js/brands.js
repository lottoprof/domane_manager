
class BrandsManager {
    constructor() {
        this.tableBody = document.getElementById('brandsTableBody');
        this.userRole = null;
        this.modal = document.getElementById("brandModal");
        this.cancelButton = document.getElementById("cancelBrandBtn");
        this.saveButton = document.getElementById("saveBrandBtn");
        this.init();
    }

    async init() {
        await this.checkUserRole();
        this.loadBrands();
        this.setupEventListeners();
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = "none";
            this.modal.classList.remove("show");
            this.modal.dataset.brandId = "";
        }
    }

    async checkUserRole() {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                this.userRole = userData.role;
            }
        } catch (error) {
            console.error('Error checking user role:', error);
        }
    }

    async loadBrands() {
        try {
            const response = await fetch('/api/brands', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const brands = await response.json();
                this.renderBrands(brands);
            }
        } catch (error) {
            console.error('Error loading brands:', error);
        }
    }

    async saveBrand() {
        const brandId = this.modal.dataset.brandId;
        const brandData = {
            name: document.getElementById("brandName").value.trim(),
            description: document.getElementById("brandDescription").value.trim(),
            rs_percentage: document.getElementById("brandRsPercentage").value.trim(),
            ref_link: document.getElementById("brandRefLink").value.trim(),
            start_date: document.getElementById("brandStartDate").value.trim() || null,
            end_date: document.getElementById("brandEndDate").value.trim() || null,
            active: document.getElementById("brandActive").value === "true"
        };

        try {
            const response = await fetch(brandId ? `/api/brands/${brandId}` : "/api/brands", {
                method: brandId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(brandData)
            });

            if (response.ok) {
                this.loadBrands();
                this.closeModal();
            } else {
                console.error("Ошибка при сохранении бренда:", await response.json());
            }
        } catch (error) {
            console.error("Ошибка при выполнении запроса:", error);
        }
    }

    renderBrands(brands) {
        this.tableBody.innerHTML = brands.map(brand => `
            <tr>
                <td>${brand.id || brand.brand_id}</td>
                <td>${brand.name}</td>
                <td>${brand.description || '-'} </td>
                <td>${brand.rs_percentage || '-'} </td>
                <td>${brand.ref_link || '-'} </td>
                <td>${brand.start_date || '-'} </td>
                <td>${brand.end_date || '-'} </td>
                <td>${brand.created_at || '-'} </td>
                <td>${brand.created_by || '-'} </td>
                <td>
                    <select class="brand-status-select" onchange="brandsManager.updateBrandStatus(${brand.id || brand.brand_id}, this.value)">
                        <option value="true" ${brand.active ? 'selected' : ''}>Yes</option>
                        <option value="false" ${!brand.active ? 'selected' : ''}>No</option>
                    </select>
                </td>
                <td>${this.getActionButtons(brand.id || brand.brand_id)}</td>
            </tr>
        `).join('');
    }

    getActionButtons(brandId) {
        let buttons = [];
        if (this.userRole === 'admin' || this.userRole === 'editor') {
            buttons.push(`<button onclick="brandsManager.openEditBrandModal(${brandId})" class="btn btn-primary">Edit</button>`);
        }
        return buttons.join(' ');
    }

    async openEditBrandModal(brandId) {
        this.modal.style.display = "flex";
        this.modal.classList.add("show");
        this.modal.dataset.brandId = brandId;
        
        try {
            const response = await fetch(`/api/brands/${brandId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            if (response.ok) {
                const brand = await response.json();
                document.getElementById("brandName").value = brand.name || "";
                document.getElementById("brandDescription").value = brand.description || "";
                document.getElementById("brandRsPercentage").value = brand.rs_percentage || "";
                document.getElementById("brandRefLink").value = brand.ref_link || "";
                document.getElementById("brandStartDate").value = brand.start_date || "";
                document.getElementById("brandEndDate").value = brand.end_date || "";
                document.getElementById("brandActive").value = brand.active ? "true" : "false";
            }
        } catch (error) {
            console.error("Error fetching brand details:", error);
        }
    }

async updateBrandStatus(brandId, status) {
    try {
        // Загружаем текущие данные бренда
        const response = await fetch(`/api/brands/${brandId}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        });

        if (!response.ok) {
            console.error("Ошибка загрузки данных бренда:", await response.json());
            return;
        }

        const brandData = await response.json();

        // Обновляем поле active, сохраняя остальные данные
        brandData.active = status === "true";

        // Отправляем обновленные данные на сервер
        const updateResponse = await fetch(`/api/brands/${brandId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify(brandData)
        });

        if (updateResponse.ok) {
            this.loadBrands(); // Обновляем таблицу после успешного запроса
        } else {
            console.error("Ошибка обновления статуса бренда:", await updateResponse.json());
        }
    } catch (error) {
        console.error("Ошибка при выполнении запроса:", error);
    }
}


    setupEventListeners() {
        document.getElementById("addBrandBtn").addEventListener("click", () => {
            this.modal.style.display = "flex";
            this.modal.classList.add("show");
            this.modal.dataset.brandId = "";
        });

        if (this.cancelButton) {
            this.cancelButton.addEventListener("click", () => {
                this.closeModal();
            });
        }

        if (this.saveButton) {
            this.saveButton.addEventListener("click", async () => {
                await this.saveBrand();
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                this.closeModal();
            }
        });

        document.addEventListener("click", (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });
    }
}

const brandsManager = new BrandsManager();
