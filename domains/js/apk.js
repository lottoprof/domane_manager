
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Файл apk.js загружен!");

    const userRole = await checkUserRole();
    if (!userRole) {
        window.location.href = "../index.html";
        return;
    }

    await loadCdnAccounts();
    await loadRegistrars();

    if (userRole === "admin" || userRole === "editor") {
        document.getElementById("addCdnAccountBtn").addEventListener("click", () => openModal("cdnAccountModal"));
        document.getElementById("addRegistrarBtn").addEventListener("click", () => openModal("registrarModal"));

        document.getElementById("cdnAccountForm").addEventListener("submit", createCdnAccount);
        document.getElementById("registrarForm").addEventListener("submit", createRegistrar);
    } else {
        document.getElementById("addCdnAccountBtn").style.display = "none";
        document.getElementById("addRegistrarBtn").style.display = "none";
    }

    setupModalEventListeners();
    document.body.style.visibility = "visible";
});

async function checkUserRole() {
    try {
        const response = await fetch("/api/auth/me", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
        });
        if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
        const userData = await response.json();
        return userData.role;
    } catch (error) {
        console.error("Ошибка проверки пользователя:", error);
        return null;
    }
}

async function loadCdnAccounts() {
    const tableBody = document.querySelector("#cdnAccountsTable");
    if (!tableBody) return console.error("Ошибка: таблица CDN не найдена!");

    try {
        const response = await fetch("/api/cdnaccounts", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
        });
        if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
        
        const data = await response.json();
        tableBody.innerHTML = data.map(account => `
            <tr>
                <td>${account.account_id}</td>
                <td>${account.brand_id}</td>
                <td>${account.provider_name}</td>
                <td>${account.api_url || '-'}</td>
                <td>${account.api_key}</td>
                <td>${account.email || '-'}</td>
                <td>${account.created_at}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Ошибка загрузки CDN аккаунтов:", error);
    }
}

async function loadRegistrars() {
    const tableBody = document.querySelector("#registrarsTable");
    if (!tableBody) return console.error("Ошибка: таблица регистраторов не найдена!");

    try {
        const response = await fetch("/api/registrars", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
        });
        if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
        
        const data = await response.json();
        tableBody.innerHTML = data.map(registrar => `
            <tr>
                <td>${registrar.registrar_id}</td>
                <td>${registrar.name}</td>
                <td>${registrar.api_url || '-'}</td>
                <td>${registrar.api_key || '-'}</td>
                <td>${registrar.contact_email || '-'}</td>
                <td>${registrar.created_at}</td>
                <td>${registrar.active ? 'Да' : 'Нет'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Ошибка загрузки регистраторов:", error);
    }
}

async function loadBrands() {
    const brandSelect = document.getElementById("brandId");
    if (!brandSelect) return console.error("Ошибка: выпадающий список брендов не найден!");

    try {
        const response = await fetch("/api/brands", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
        });

        if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);

        const brands = await response.json();
        brandSelect.innerHTML = '<option value="">Выберите бренд</option>'; // Очищаем список перед загрузкой

        brands.forEach(brand => {
            const option = document.createElement("option");
            option.value = brand.brand_id;
            option.textContent = brand.name; // Можно использовать другое поле, если name не существует
            brandSelect.appendChild(option);
        });

        console.log("Бренды загружены:", brands);
    } catch (error) {
        console.error("Ошибка загрузки брендов:", error);
    }
}

async function createCdnAccount(event) {
    event.preventDefault();
    const formData = {
        brand_id: document.getElementById("brandId").value,
        provider_name: document.getElementById("providerName").value,
        api_url: document.getElementById("apiUrl").value || null,
        api_key: document.getElementById("apiKey").value,
        email: document.getElementById("email").value || null
    };

    try {
        const response = await fetch("/api/cdnaccounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
        const data = await response.json();
        console.log("CDN Account Created:", data);
        closeModal("cdnAccountModal");
        await loadCdnAccounts();  // Перезагрузить таблицу после создания
    } catch (error) {
        console.error("Ошибка при создании CDN аккаунта:", error);
    }
}

async function createRegistrar(event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById("registrarName").value,
        api_url: document.getElementById("registrarApiUrl").value || null,
        api_key: document.getElementById("registrarApiKey").value || null,
        contact_email: document.getElementById("registrarEmail").value || null
    };

    try {
        const response = await fetch("/api/registrars", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
        const data = await response.json();
        console.log("Registrar Created:", data);
        closeModal("registrarModal");
        await loadRegistrars();  // Перезагрузить таблицу после создания
    } catch (error) {
        console.error("Ошибка при создании регистратора:", error);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Ошибка: модальное окно ${modalId} не найдено!`);
        return;
    }

    // Загружаем бренды перед открытием окна
    if (modalId === "cdnAccountModal") {
        console.log("Вызываем loadBrands() перед открытием окна");
        loadBrands();
    }

    modal.style.display = "flex";
    modal.classList.add("show");
    console.log(`Открываем модальное окно: ${modalId}`);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = "none";
    modal.classList.remove("show");

    if (modalId === "cdnAccountModal") {
        loadBrands();
    } 
}

function setupModalEventListeners() {
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            document.querySelectorAll(".modal").forEach(modal => modal.style.display = "none");
        }
    });

    document.addEventListener("click", (event) => {
        document.querySelectorAll(".modal").forEach(modal => {
            if (event.target === modal) modal.style.display = "none";
        });
    });
}

