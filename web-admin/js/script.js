// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    checkAuth();
    
    // Инициализация графиков
    initCharts();
    
    // Обработчики событий для кнопок действий в таблице бронирований
    setupTableButtons();
    
    // Настройка интерактивности боковой панели на мобильных устройствах
    setupMobileNav();
    
    // Инициализация форм для работы с данными
    setupForms();
    
    // Инициализация таблиц данных
    initDataTables();
});

// Проверка авторизации пользователя
async function checkAuth() {
    try {
        if (!API.auth.isAuthenticated()) {
            // Если пользователь не авторизован, перенаправляем на страницу входа
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
            return;
        }
        
        // Получение профиля пользователя
        const userData = await API.auth.getProfile();
        
        // Обновление UI с данными пользователя
        updateUserUI(userData.data);
        
        // Настройка кнопки выхода
        setupLogout();
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        
        // Если ошибка авторизации, перенаправляем на страницу входа
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Обновление UI с данными пользователя
function updateUserUI(user) {
    const userNameElements = document.querySelectorAll('.user-name');
    const userRoleElements = document.querySelectorAll('.user-role');
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    
    if (user) {
        // Обновление имени пользователя
        userNameElements.forEach(element => {
            element.textContent = user.name;
        });
        
        // Обновление роли пользователя
        userRoleElements.forEach(element => {
            element.textContent = user.role === 'admin' ? 'Администратор' : 
                                  user.role === 'manager' ? 'Менеджер' : 'Пользователь';
        });
        
        // Обновление аватара пользователя
        userAvatarElements.forEach(element => {
            if (user.avatar) {
                element.src = `${API_BASE_URL}/${user.avatar}`;
            }
        });
    }
}

// Настройка кнопки выхода
function setupLogout() {
    const logoutButtons = document.querySelectorAll('.btn-logout');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                await API.auth.logout();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Ошибка при выходе:', error);
            }
        });
    });
}

// Инициализация графиков с использованием Chart.js
function initCharts() {
    // График посещаемости ресторанов
    if(document.getElementById('visitorsChart')) {
        const ctx = document.getElementById('visitorsChart').getContext('2d');
        const visitorsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
                datasets: [{
                    label: "The Pivo на Невском",
                    lineTension: 0.3,
                    backgroundColor: "rgba(78, 115, 223, 0.05)",
                    borderColor: "rgba(78, 115, 223, 1)",
                    pointRadius: 3,
                    pointBackgroundColor: "rgba(78, 115, 223, 1)",
                    pointBorderColor: "rgba(78, 115, 223, 1)",
                    pointHoverRadius: 3,
                    pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                    pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Пустые данные, будут заполнены при получении с API
                }]
            },
            options: {
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 10,
                        right: 25,
                        top: 25,
                        bottom: 0
                    }
                },
                scales: {
                    x: {
                        time: {
                            unit: 'date'
                        },
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        ticks: {
                            maxTicksLimit: 5,
                            padding: 10
                        },
                        grid: {
                            color: "rgb(234, 236, 244)",
                            zeroLineColor: "rgb(234, 236, 244)",
                            drawBorder: false,
                            borderDash: [2],
                            zeroLineBorderDash: [2]
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        backgroundColor: "rgb(255,255,255)",
                        bodyColor: "#858796",
                        titleMarginBottom: 10,
                        titleColor: '#6e707e',
                        titleFontSize: 14,
                        borderColor: '#dddfeb',
                        borderWidth: 1,
                        xPadding: 15,
                        yPadding: 15,
                        displayColors: false,
                        intersect: false,
                        mode: 'index',
                        caretPadding: 10
                    }
                }
            }
        });
        
        // Загрузка данных для графика
        loadChartData(visitorsChart);
    }

    // График категорий бронирований
    if(document.getElementById('bookingsChart')) {
        const ctx = document.getElementById('bookingsChart').getContext('2d');
        const bookingsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ["Подтверждено", "Ожидание", "Отменено"],
                datasets: [{
                    data: [0, 0, 0], // Пустые данные, будут заполнены при получении с API
                    backgroundColor: ['#1cc88a', '#f6c23e', '#e74a3b'],
                    hoverBackgroundColor: ['#17a673', '#dda20a', '#c23b2c'],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }],
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        backgroundColor: "rgb(255,255,255)",
                        bodyColor: "#858796",
                        borderColor: '#dddfeb',
                        borderWidth: 1,
                        xPadding: 15,
                        yPadding: 15,
                        displayColors: false,
                        caretPadding: 10,
                    }
                },
                cutout: '70%',
            },
        });
        
        // Загрузка данных для графика
        loadBookingsChartData(bookingsChart);
    }
}

// Загрузка данных для графика посещаемости
async function loadChartData(chart) {
    try {
        // В реальном приложении здесь будет запрос к API для получения статистики
        // const response = await API.statistics.getVisitorsStats();
        // const data = response.data;
        
        // Временные данные, в реальном приложении будут заменены данными от API
        const data = {
            restaurants: [
                {
                    name: "The Pivo на Невском",
                    data: [215, 250, 280, 305, 350, 390, 410, 400, 385, 340, 290, 310]
                },
                {
                    name: "The Pivo на Московском",
                    data: [180, 200, 220, 250, 280, 320, 350, 340, 330, 300, 260, 270]
                },
                {
                    name: "The Pivo в Озерках",
                    data: [120, 140, 160, 180, 200, 230, 260, 270, 250, 210, 170, 180]
                }
            ]
        };
        
        // Обновление данных графика
        chart.data.datasets = data.restaurants.map((restaurant, index) => {
            const colors = [
                { bg: "rgba(78, 115, 223, 0.05)", border: "rgba(78, 115, 223, 1)" },
                { bg: "rgba(28, 200, 138, 0.05)", border: "rgba(28, 200, 138, 1)" },
                { bg: "rgba(246, 194, 62, 0.05)", border: "rgba(246, 194, 62, 1)" }
            ];
            
            return {
                label: restaurant.name,
                lineTension: 0.3,
                backgroundColor: colors[index].bg,
                borderColor: colors[index].border,
                pointRadius: 3,
                pointBackgroundColor: colors[index].border,
                pointBorderColor: colors[index].border,
                pointHoverRadius: 3,
                pointHoverBackgroundColor: colors[index].border,
                pointHoverBorderColor: colors[index].border,
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: restaurant.data
            };
        });
        
        chart.update();
    } catch (error) {
        console.error('Ошибка при загрузке данных для графика:', error);
    }
}

// Загрузка данных для графика бронирований
async function loadBookingsChartData(chart) {
    try {
        // В реальном приложении здесь будет запрос к API для получения статистики
        // const response = await API.statistics.getBookingsStats();
        // const data = response.data;
        
        // Временные данные, в реальном приложении будут заменены данными от API
        const data = {
            confirmed: 55,
            pending: 30,
            cancelled: 15
        };
        
        // Обновление данных графика
        chart.data.datasets[0].data = [
            data.confirmed,
            data.pending,
            data.cancelled
        ];
        
        chart.update();
    } catch (error) {
        console.error('Ошибка при загрузке данных для графика бронирований:', error);
    }
}

// Настройка обработчиков событий для кнопок в таблицах
function setupTableButtons() {
    // Делегирование событий для таблицы бронирований
    if (document.getElementById('reservationsTable')) {
        document.getElementById('reservationsTable').addEventListener('click', async function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            
            const row = target.closest('tr');
            const id = row.dataset.id;
            
            if (target.classList.contains('btn-confirm-reservation')) {
                try {
                    await API.reservations.update(id, { status: 'confirmed' });
                    // Обновление UI
                    row.querySelector('.reservation-status').innerHTML = '<span class="badge bg-success">Подтверждено</span>';
                    showAlert('Бронирование подтверждено', 'success');
                } catch (error) {
                    console.error('Ошибка при подтверждении бронирования:', error);
                    showAlert('Ошибка при подтверждении бронирования', 'danger');
                }
            } else if (target.classList.contains('btn-cancel-reservation')) {
                if (confirm('Вы уверены, что хотите отменить это бронирование?')) {
                    try {
                        await API.reservations.update(id, { status: 'cancelled' });
                        // Обновление UI
                        row.querySelector('.reservation-status').innerHTML = '<span class="badge bg-danger">Отменено</span>';
                        showAlert('Бронирование отменено', 'success');
                    } catch (error) {
                        console.error('Ошибка при отмене бронирования:', error);
                        showAlert('Ошибка при отмене бронирования', 'danger');
                    }
                }
            } else if (target.classList.contains('btn-edit-reservation')) {
                // Открытие модального окна для редактирования бронирования
                // Код для заполнения формы данными бронирования будет добавлен позже
            }
        });
    }
    
    // Делегирование событий для таблицы пользователей
    if (document.getElementById('usersTable')) {
        document.getElementById('usersTable').addEventListener('click', async function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            
            const row = target.closest('tr');
            const id = row.dataset.id;
            
            if (target.classList.contains('btn-delete-user')) {
                if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                    try {
                        await API.users.delete(id);
                        // Удаление строки из таблицы
                        row.remove();
                        showAlert('Пользователь успешно удален', 'success');
                    } catch (error) {
                        console.error('Ошибка при удалении пользователя:', error);
                        showAlert('Ошибка при удалении пользователя', 'danger');
                    }
                }
            } else if (target.classList.contains('btn-edit-user')) {
                // Открытие модального окна для редактирования пользователя
                // Код для заполнения формы данными пользователя будет добавлен позже
            }
        });
    }
    
    // Делегирование событий для таблицы новостей
    if (document.getElementById('newsTable')) {
        document.getElementById('newsTable').addEventListener('click', async function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            
            const row = target.closest('tr');
            const id = row.dataset.id;
            
            if (target.classList.contains('btn-delete-news')) {
                if (confirm('Вы уверены, что хотите удалить эту новость?')) {
                    try {
                        await API.news.delete(id);
                        // Удаление строки из таблицы
                        row.remove();
                        showAlert('Новость успешно удалена', 'success');
                    } catch (error) {
                        console.error('Ошибка при удалении новости:', error);
                        showAlert('Ошибка при удалении новости', 'danger');
                    }
                }
            } else if (target.classList.contains('btn-edit-news')) {
                // Заполнение формы редактирования данными новости
                await fillNewsEditForm(id);
            } else if (target.classList.contains('btn-view-news')) {
                // Заполнение модального окна просмотра данными новости
                await fillNewsViewModal(id);
            }
        });
    }
}

// Заполнение формы редактирования новости
async function fillNewsEditForm(id) {
    try {
        // Получение данных новости
        const response = await API.news.getById(id);
        const news = response.data;
        
        // Заполнение формы
        const form = document.getElementById('editNewsForm');
        if (!form) return;
        
        form.elements['id'].value = news._id;
        form.elements['title'].value = news.title;
        form.elements['category'].value = news.category;
        form.elements['status'].value = news.status;
        form.elements['summary'].value = news.summary;
        form.elements['content'].value = news.content;
        form.elements['tags'].value = news.tags ? news.tags.join(', ') : '';
        
        if (news.restaurant) {
            form.elements['restaurant'].value = news.restaurant;
        }
        
        // Показ текущего изображения
        const imagePreview = document.querySelector('#editNewsForm .image-preview');
        if (imagePreview && news.image) {
            imagePreview.src = `${API_BASE_URL}/${news.image}`;
            imagePreview.style.display = 'block';
        } else if (imagePreview) {
            imagePreview.style.display = 'none';
        }
        
        // Заполнение данных видео
        if (news.video) {
            if (news.video.type === 'url' && news.video.url) {
                document.getElementById('edit-video-url-tab').click();
                form.elements['video_url'].value = news.video.url;
            } else if (news.video.type === 'file' && news.video.file) {
                document.getElementById('edit-video-upload-tab').click();
                // Показать информацию о текущем видео
                const videoInfo = document.querySelector('#editNewsForm .video-info');
                if (videoInfo) {
                    videoInfo.textContent = 'Текущее видео: ' + news.video.file;
                    videoInfo.style.display = 'block';
                }
            }
        }
        
        // Открытие модального окна
        const modal = new bootstrap.Modal(document.getElementById('editNewsModal'));
        modal.show();
    } catch (error) {
        console.error('Ошибка при получении данных новости:', error);
        showAlert('Ошибка при получении данных новости', 'danger');
    }
}

// Заполнение модального окна просмотра новости
async function fillNewsViewModal(id) {
    try {
        // Получение данных новости
        const response = await API.news.getById(id);
        const news = response.data;
        
        const modal = document.getElementById('viewNewsModal');
        if (!modal) return;
        
        // Заполнение данных в модальном окне
        modal.querySelector('h2').textContent = news.title;
        
        // Категория
        const categoryBadge = modal.querySelector('.category-badge');
        if (categoryBadge) {
            categoryBadge.textContent = getCategoryName(news.category);
            categoryBadge.className = `badge me-2 ${getCategoryBadgeClass(news.category)}`;
        }
        
        // Автор и дата
        const authorElement = modal.querySelector('.news-author');
        if (authorElement && news.author) {
            authorElement.textContent = `Автор: ${news.author.name}`;
        }
        
        const dateElement = modal.querySelector('.news-date');
        if (dateElement && news.publishedAt) {
            dateElement.textContent = `Опубликовано: ${formatDate(news.publishedAt)}`;
        }
        
        // Краткое описание
        const summaryElement = modal.querySelector('.news-summary');
        if (summaryElement) {
            summaryElement.innerHTML = `<strong>Краткое описание:</strong> ${news.summary}`;
        }
        
        // Полное содержание
        const contentElement = modal.querySelector('.news-content');
        if (contentElement) {
            contentElement.innerHTML = news.content;
        }
        
        // Изображение
        const imageElement = modal.querySelector('.news-image');
        if (imageElement) {
            if (news.image) {
                imageElement.src = `${API_BASE_URL}/${news.image}`;
                imageElement.style.display = 'block';
            } else {
                imageElement.style.display = 'none';
            }
        }
        
        // Видео
        const videoContainer = modal.querySelector('.video-container');
        if (videoContainer) {
            if (news.video) {
                if (news.video.type === 'url' && news.video.url) {
                    // Создание iframe для видео по URL
                    const iframe = document.createElement('iframe');
                    iframe.src = getEmbedUrl(news.video.url);
                    iframe.title = 'Video';
                    iframe.allowFullscreen = true;
                    iframe.className = 'embed-responsive-item';
                    
                    videoContainer.innerHTML = '';
                    videoContainer.appendChild(iframe);
                    videoContainer.style.display = 'block';
                } else if (news.video.type === 'file' && news.video.file) {
                    // Создание видео-плеера для загруженного файла
                    const video = document.createElement('video');
                    video.src = `${API_BASE_URL}/${news.video.file}`;
                    video.controls = true;
                    video.className = 'img-fluid';
                    
                    videoContainer.innerHTML = '';
                    videoContainer.appendChild(video);
                    videoContainer.style.display = 'block';
                } else {
                    videoContainer.style.display = 'none';
                }
            } else {
                videoContainer.style.display = 'none';
            }
        }
        
        // Теги
        const tagsContainer = modal.querySelector('.news-tags');
        if (tagsContainer && news.tags && news.tags.length > 0) {
            tagsContainer.innerHTML = '';
            news.tags.forEach(tag => {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary me-1';
                badge.textContent = tag;
                tagsContainer.appendChild(badge);
            });
            tagsContainer.closest('.col-md-6').style.display = 'block';
        } else if (tagsContainer) {
            tagsContainer.closest('.col-md-6').style.display = 'none';
        }
        
        // Статистика
        const viewsElement = modal.querySelector('.news-views');
        if (viewsElement) {
            viewsElement.textContent = `${news.views} просмотров`;
        }
        
        const sharesElement = modal.querySelector('.news-shares');
        if (sharesElement) {
            sharesElement.textContent = `${news.shares || 0} репостов`;
        }
        
        const likesElement = modal.querySelector('.news-likes');
        if (likesElement) {
            likesElement.textContent = `${news.likes || 0} лайков`;
        }
        
        // Открытие модального окна
        const viewModal = new bootstrap.Modal(modal);
        viewModal.show();
    } catch (error) {
        console.error('Ошибка при получении данных новости:', error);
        showAlert('Ошибка при получении данных новости', 'danger');
    }
}

// Получение названия категории
function getCategoryName(category) {
    const categories = {
        'events': 'События',
        'promo': 'Акции',
        'new_menu': 'Новое меню',
        'restaurant': 'О ресторане'
    };
    
    return categories[category] || category;
}

// Получение класса для бейджа категории
function getCategoryBadgeClass(category) {
    const classes = {
        'events': 'bg-info',
        'promo': 'bg-warning',
        'new_menu': 'bg-primary',
        'restaurant': 'bg-dark'
    };
    
    return classes[category] || 'bg-secondary';
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Получение URL для встраивания видео
function getEmbedUrl(url) {
    // Поддержка YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Поддержка Vimeo
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
}

// Настройка мобильной навигации
function setupMobileNav() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('show');
        });
    }
}

// Инициализация таблиц данных
function initDataTables() {
    // Инициализация таблицы новостей
    if (document.getElementById('newsTable')) {
        loadNews();
    }
    
    // Инициализация таблицы пользователей
    if (document.getElementById('usersTable')) {
        loadUsers();
    }
    
    // Инициализация таблицы бронирований
    if (document.getElementById('reservationsTable')) {
        loadReservations();
    }
    
    // Инициализация таблицы ресторанов
    if (document.getElementById('restaurantsTable')) {
        loadRestaurants();
    }
}

// Загрузка данных новостей
async function loadNews() {
    try {
        const table = document.getElementById('newsTable');
        if (!table) return;
        
        // Получение данных с API
        const response = await API.news.getAll();
        const newsList = response.data || [];
        
        // Очистка существующих данных
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        
        // Заполнение таблицы данными
        newsList.forEach(news => {
            const row = document.createElement('tr');
            row.dataset.id = news._id;
            
            row.innerHTML = `
                <td>${news._id}</td>
                <td>${news.title}</td>
                <td><span class="badge ${getCategoryBadgeClass(news.category)}">${getCategoryName(news.category)}</span></td>
                <td>${news.author ? news.author.name : 'Неизвестно'}</td>
                <td>${news.publishedAt ? formatDate(news.publishedAt) : '-'}</td>
                <td><span class="badge ${getStatusBadgeClass(news.status)}">${getStatusName(news.status)}</span></td>
                <td>${news.views}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-view-news"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-warning btn-edit-news"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger btn-delete-news"><i class="bi bi-trash"></i></button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Инициализация DataTable
        if ($.fn.DataTable.isDataTable('#newsTable')) {
            $(table).DataTable().destroy();
        }
        
        $(table).DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.24/i18n/Russian.json'
            },
            order: [[4, 'desc']]
        });
    } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
        showAlert('Ошибка при загрузке данных новостей', 'danger');
    }
}

// Получение имени статуса
function getStatusName(status) {
    const statuses = {
        'published': 'Опубликовано',
        'draft': 'Черновик',
        'archived': 'В архиве'
    };
    
    return statuses[status] || status;
}

// Получение класса для бейджа статуса
function getStatusBadgeClass(status) {
    const classes = {
        'published': 'bg-success',
        'draft': 'bg-secondary',
        'archived': 'bg-dark'
    };
    
    return classes[status] || 'bg-secondary';
}

// Показ уведомления
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        // Создание контейнера для уведомлений, если его нет
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.getElementById('alertContainer').appendChild(alertElement);
    
    // Автоматическое скрытие уведомления через 5 секунд
    setTimeout(() => {
        alertElement.classList.remove('show');
        setTimeout(() => {
            alertElement.remove();
        }, 300);
    }, 5000);
}

// Настройка форм
function setupForms() {
    // Форма добавления новости
    setupNewsForm();
    
    // Форма редактирования новости
    setupNewsEditForm();
    
    // Форма добавления пользователя
    setupUserForm();
    
    // Форма добавления ресторана
    setupRestaurantForm();
    
    // Форма бронирования
    setupReservationForm();
}

// Настройка формы новости
function setupNewsForm() {
    const form = document.getElementById('addNewsForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
        try {
            // Сбор данных формы
            const formData = new FormData(form);
            const newsData = {};
            
            for (const [key, value] of formData.entries()) {
                if (key === 'image') {
                    if (value instanceof File && value.name) {
                        newsData.image = value;
                    }
                } else if (key === 'video_file') {
                    if (value instanceof File && value.name) {
                        newsData.video_file = value;
                    }
                } else {
                    newsData[key] = value;
                }
            }
            
            // Отправка данных на сервер
            await API.news.create(newsData);
            
            // Сброс формы и закрытие модального окна
            form.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addNewsModal'));
            modal.hide();
            
            // Обновление таблицы новостей
            loadNews();
            
            showAlert('Новость успешно добавлена', 'success');
        } catch (error) {
            console.error('Ошибка при добавлении новости:', error);
            showAlert('Ошибка при добавлении новости', 'danger');
        }
    });
}

// Настройка формы редактирования новости
function setupNewsEditForm() {
    const form = document.getElementById('editNewsForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Получение ID новости
            const id = form.elements['id'].value;
            
            // Сбор данных формы
            const formData = new FormData(form);
            const newsData = {};
            
            for (const [key, value] of formData.entries()) {
                if (key === 'id') continue;
                
                if (key === 'image') {
                    if (value instanceof File && value.name) {
                        newsData.image = value;
                    }
                } else if (key === 'video_file') {
                    if (value instanceof File && value.name) {
                        newsData.video_file = value;
                    }
                } else {
                    newsData[key] = value;
                }
            }
            
            // Отправка данных на сервер
            await API.news.update(id, newsData);
            
            // Закрытие модального окна
            const modal = bootstrap.Modal.getInstance(document.getElementById('editNewsModal'));
            modal.hide();
            
            // Обновление таблицы новостей
            loadNews();
            
            showAlert('Новость успешно обновлена', 'success');
    } catch (error) {
            console.error('Ошибка при обновлении новости:', error);
            showAlert('Ошибка при обновлении новости', 'danger');
    }
    });
}

// Экспорт функций для использования в других скриптах
window.adminUtils = {
    loadNews,
    formatDate,
    showAlert,
    getCategoryName,
    getStatusName
}; 