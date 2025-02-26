class UsersManager {
    constructor() {
        this.tableBody = document.getElementById('usersTableBody');
        this.userRole = null;
        this.init();
    }

    async init() {
        await this.checkUserRole();
        this.loadUsers();
        this.setupEventListeners();
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

    async loadUsers() {
        try {
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const users = await response.json();
                this.renderUsers(users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    renderUsers(users) {
        this.tableBody.innerHTML = users.map(user => `
            <tr class="${user.active ? 'row-active' : 'row-inactive'}">
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td class="${this.getRoleClass(user.role)}">${user.role}</td>
                <td>${user.created_at || '-'}</td>
                <td>${user.created_by || '-'}</td>
                <td>${user.last_login || '-'}</td>
                <td>${user.active ? 'Yes' : 'No'}</td>
                <td>${this.getActionButtons(user)}</td>
            </tr>
        `).join('');
    }

    getRoleClass(role) {
        switch(role) {
            case 'admin': return 'cell-danger';
            case 'editor': return 'cell-warning';
            default: return 'cell-info';
        }
    }

    getActionButtons(user) {
        let buttons = [];
        if (this.userRole === 'admin') {
            buttons.push(`<button onclick="usersManager.openEditUserModal(${user.id})" class="btn btn-primary">Edit</button>`);
            buttons.push(`<button onclick="usersManager.openDeleteModal(${user.id})" class="btn btn-danger">Delete</button>`);
        }
        return buttons.join(' ');
    }

    async deleteUser(userId) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            if (response.ok) {
                this.loadUsers();
                this.closeDeleteModal();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }

    openEditUserModal(userId) {
        if (this.userRole !== 'admin') {
            alert("You do not have permission to edit this user.");
            return;
        }

        fetch(`/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        }).then(res => res.json()).then(user => {
            console.log("User data from server:", user);
            
            // Сначала очищаем форму
            this.resetModalForm();

            // Заполняем поля формы данными пользователя
            document.getElementById("modalTitle").innerText = "Edit User";
            document.getElementById("userEmail").value = user.email;
            document.getElementById("userUsername").value = user.username;
            
            // Установка роли пользователя с использованием data-атрибутов
            try {
                const options = document.querySelectorAll('#userRole option');
                
                // Сначала снимаем выделение со всех опций
                options.forEach(option => {
                    option.selected = false;
                });
                
                // Находим опцию с нужным data-role и выбираем её
                let found = false;
                options.forEach(option => {
                    if (option.dataset.role === user.role) {
                        option.selected = true;
                        found = true;
                        console.log(`Found and selected option with data-role="${user.role}"`);
                    }
                });
                
                if (!found) {
                    console.warn(`Option with data-role="${user.role}" not found`);
                }
            } catch (error) {
                console.error("Error setting user role:", error);
            }
            
            // Устанавливаем атрибуты для кнопки сохранения
            document.getElementById("saveUserBtn").setAttribute("data-mode", "edit");
            document.getElementById("saveUserBtn").setAttribute("data-user-id", user.id);

            // Настраиваем блок смены пароля
            document.getElementById("changePasswordBlock").classList.remove("hidden");
            document.getElementById("newPassword").classList.add("hidden");
            document.getElementById("changePasswordCheckbox").checked = false;
            document.getElementById("userPassword").classList.add("hidden"); // Скрываем поле пароля при редактировании
            document.getElementById("userPassword").required = false; // Делаем поле необязательным при редактировании
            
            openModal();
        }).catch(err => {
            console.error("Error fetching user details:", err);
        });
    }

    resetModalForm() {
        // Очищаем поля формы
        document.getElementById("userEmail").value = "";
        document.getElementById("userUsername").value = "";
        document.getElementById("userPassword").value = "";
        document.getElementById("userPassword").classList.remove("hidden");
        document.getElementById("userPassword").required = true;
        
        // Сбрасываем селектор ролей на первую опцию
        try {
            const options = document.querySelectorAll('#userRole option');
            options.forEach((option, index) => {
                option.selected = index === 0;
            });
        } catch (error) {
            console.error("Error resetting role select:", error);
        }
    }

    openDeleteModal(userId) {
        const deleteModal = document.getElementById("deleteModal");
        const confirmDeleteBtn = document.getElementById("confirmDelete");
        
        if (deleteModal && confirmDeleteBtn) {
            confirmDeleteBtn.setAttribute("data-user-id", userId);
            
            // Используем классы вместо инлайн-стилей
            deleteModal.classList.add("show");
            
            console.log("Delete modal opened for user ID:", userId);
        } else {
            console.error("Delete modal elements not found");
        }
    }

    closeDeleteModal() {
        document.getElementById("deleteModal").classList.remove("show");
    }

    setupEventListeners() {
        document.getElementById("addUserBtn").addEventListener("click", () => {
            // Сначала очищаем форму
            this.resetModalForm();
            
            document.getElementById("modalTitle").innerText = "Add User";
            document.getElementById("saveUserBtn").setAttribute("data-mode", "add");
            document.getElementById("changePasswordBlock").classList.add("hidden");
            
            openModal();
        });

        // Обработчик для чекбокса смены пароля
        document.getElementById("changePasswordCheckbox").addEventListener("change", function() {
            const newPasswordField = document.getElementById("newPassword");
            if (this.checked) {
                newPasswordField.classList.remove("hidden");
                newPasswordField.required = true;
            } else {
                newPasswordField.classList.add("hidden");
                newPasswordField.required = false;
            }
        });

        document.getElementById("saveUserBtn").addEventListener("click", async () => {
            const mode = document.getElementById("saveUserBtn").getAttribute("data-mode");
            const userId = document.getElementById("saveUserBtn").getAttribute("data-user-id");
            const email = document.getElementById("userEmail").value;
            const username = document.getElementById("userUsername").value;
            const password = document.getElementById("userPassword").value;
            
            // Получение выбранной роли
            let role = "user"; // Значение по умолчанию
            try {
                const selectedOption = document.querySelector('#userRole option:checked');
                if (selectedOption) {
                    role = selectedOption.dataset.role || selectedOption.value;
                }
            } catch (error) {
                console.error("Error getting selected role:", error);
            }
            
            const changePassword = document.getElementById("changePasswordCheckbox").checked;
            const newPassword = document.getElementById("newPassword").value;

            const userData = {
                email,
                username,
                role
            };

            if (mode === "add") {
                userData.password_hash = password;
            } else if (changePassword) {
                userData.password_hash = newPassword;
            }

            console.log("Sending user data:", userData);

            try {
                const response = await fetch(`/api/users${mode === "edit" ? `/${userId}` : ""}`, {
                    method: mode === "add" ? "POST" : "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                    },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    this.loadUsers();
                    closeModal();
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    alert(`Error saving user: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error("Error:", error);
                alert(`Error: ${error.message}`);
            }
        });

        document.getElementById("confirmDelete").addEventListener("click", async () => {
            const userId = document.getElementById("confirmDelete").getAttribute("data-user-id");
            await this.deleteUser(userId);
        });

        // Закрытие по клику вне модального окна
        window.onclick = function(event) {
            if (event.target.classList.contains("modal")) {
                closeModal();
            }
        };

        // ✅ Закрытие по Esc
        document.addEventListener("keydown", function(event) {
            if (event.key === "Escape") {
                closeModal();
                closeDeleteModal();
            }
        });
    }
}

const usersManager = new UsersManager();

// Управление модальными окнами
function openModal() {
    const modal = document.getElementById("userModal");
    modal.classList.add("show");
}

function closeModal() {
    const modal = document.getElementById("userModal");
    modal.classList.remove("show");
}

function closeDeleteModal() {
    const modal = document.getElementById("deleteModal");
    modal.classList.remove("show");
}

