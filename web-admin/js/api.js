/**
 * API-клиент для взаимодействия с бэкендом The Pivo
 */
const API = (() => {
    // Базовый URL API
    const API_BASE_URL = 'http://localhost:5000/api';
    
    // Методы для работы с локальным хранилищем
    const storage = {
        setToken: (token) => localStorage.setItem('auth_token', token),
        getToken: () => localStorage.getItem('auth_token'),
        removeToken: () => localStorage.removeItem('auth_token'),
        setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
        getUser: () => {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        },
        removeUser: () => localStorage.removeItem('user'),
        clear: () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    };
    
    // Общая функция для выполнения запросов к API
    const fetchAPI = async (endpoint, options = {}) => {
        const token = storage.getToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при выполнении запроса');
            }
            
            return data;
        } catch (error) {
            console.error(`Ошибка API (${endpoint}):`, error);
            throw error;
        }
    };
    
    // Функция для загрузки файлов
    const uploadFile = async (endpoint, formData, options = {}) => {
        const token = storage.getToken();
        
        const defaultHeaders = {};
        
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            method: 'POST',
            body: formData,
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при загрузке файла');
            }
            
            return data;
        } catch (error) {
            console.error(`Ошибка загрузки файла (${endpoint}):`, error);
            throw error;
        }
    };
    
    // Аутентификация
    const auth = {
        login: async (email, password) => {
            const data = await fetchAPI('auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (data.success && data.token) {
                storage.setToken(data.token);
                storage.setUser(data.data);
            }
            
            return data;
        },
        
        logout: async () => {
            try {
                await fetchAPI('auth/logout');
            } finally {
                storage.clear();
            }
        },
        
        getProfile: async () => {
            const data = await fetchAPI('auth/me');
            
            if (data.success) {
                storage.setUser(data.data);
            }
            
            return data;
        },
        
        isAuthenticated: () => !!storage.getToken(),
        
        getUser: () => storage.getUser()
    };
    
    // Новости
    const news = {
        getAll: async (query = {}) => {
            const queryParams = new URLSearchParams();
            
            // Добавление параметров фильтрации
            if (query.category) queryParams.append('category', query.category);
            if (query.status) queryParams.append('status', query.status);
            if (query.search) queryParams.append('search', query.search);
            
            // Добавление пагинации
            if (query.page) queryParams.append('page', query.page);
            if (query.limit) queryParams.append('limit', query.limit);
            
            // Добавление сортировки
            if (query.sort) queryParams.append('sort', query.sort);
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            return fetchAPI(`news${queryString}`);
        },
        
        getById: async (id) => {
            return fetchAPI(`news/${id}`);
        },
        
        create: async (newsData) => {
            const formData = new FormData();
            
            // Добавляем текстовые поля
            Object.keys(newsData).forEach(key => {
                if (key !== 'image' && key !== 'video_file' && newsData[key] !== undefined) {
                    formData.append(key, newsData[key]);
                }
            });
            
            // Добавляем файлы
            if (newsData.image instanceof File) {
                formData.append('image', newsData.image);
            }
            
            if (newsData.video_file instanceof File) {
                formData.append('video', newsData.video_file);
            }
            
            return uploadFile('news', formData);
        },
        
        update: async (id, newsData) => {
            const formData = new FormData();
            
            // Добавляем текстовые поля
            Object.keys(newsData).forEach(key => {
                if (key !== 'image' && key !== 'video_file' && newsData[key] !== undefined) {
                    formData.append(key, newsData[key]);
                }
            });
            
            // Добавляем файлы
            if (newsData.image instanceof File) {
                formData.append('image', newsData.image);
            }
            
            if (newsData.video_file instanceof File) {
                formData.append('video', newsData.video_file);
            }
            
            return uploadFile(`news/${id}`, formData, { method: 'PUT' });
        },
        
        delete: async (id) => {
            return fetchAPI(`news/${id}`, { method: 'DELETE' });
        }
    };
    
    // Рестораны
    const restaurants = {
        getAll: async () => {
            return fetchAPI('restaurants');
        },
        
        getById: async (id) => {
            return fetchAPI(`restaurants/${id}`);
        },
        
        create: async (restaurantData) => {
            const formData = new FormData();
            
            // Добавляем текстовые поля
            Object.keys(restaurantData).forEach(key => {
                if (key !== 'images' && restaurantData[key] !== undefined) {
                    formData.append(key, restaurantData[key]);
                }
            });
            
            // Добавляем изображения
            if (restaurantData.images && restaurantData.images.length > 0) {
                for (let i = 0; i < restaurantData.images.length; i++) {
                    formData.append('images', restaurantData.images[i]);
                }
            }
            
            return uploadFile('restaurants', formData);
        },
        
        update: async (id, restaurantData) => {
            const formData = new FormData();
            
            // Добавляем текстовые поля
            Object.keys(restaurantData).forEach(key => {
                if (key !== 'images' && restaurantData[key] !== undefined) {
                    formData.append(key, restaurantData[key]);
                }
            });
            
            // Добавляем изображения
            if (restaurantData.images && restaurantData.images.length > 0) {
                for (let i = 0; i < restaurantData.images.length; i++) {
                    formData.append('images', restaurantData.images[i]);
                }
            }
            
            return uploadFile(`restaurants/${id}`, formData, { method: 'PUT' });
        },
        
        delete: async (id) => {
            return fetchAPI(`restaurants/${id}`, { method: 'DELETE' });
        }
    };
    
    // Пользователи
    const users = {
        getAll: async () => {
            return fetchAPI('users');
        },
        
        getById: async (id) => {
            return fetchAPI(`users/${id}`);
        },
        
        create: async (userData) => {
            return fetchAPI('users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },
        
        update: async (id, userData) => {
            return fetchAPI(`users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        },
        
        delete: async (id) => {
            return fetchAPI(`users/${id}`, { method: 'DELETE' });
        }
    };
    
    // Бронирования
    const reservations = {
        getAll: async () => {
            return fetchAPI('reservations');
        },
        
        getById: async (id) => {
            return fetchAPI(`reservations/${id}`);
        },
        
        create: async (reservationData) => {
            return fetchAPI('reservations', {
                method: 'POST',
                body: JSON.stringify(reservationData)
            });
        },
        
        update: async (id, reservationData) => {
            return fetchAPI(`reservations/${id}`, {
                method: 'PUT',
                body: JSON.stringify(reservationData)
            });
        },
        
        delete: async (id) => {
            return fetchAPI(`reservations/${id}`, { method: 'DELETE' });
        }
    };
    
    // Пункты меню
    const menuItems = {
        getAll: async () => {
            return fetchAPI('menu');
        },
        
        getById: async (id) => {
            return fetchAPI(`menu/${id}`);
        },
        
        create: async (menuItemData) => {
            const formData = new FormData();
            
            // Добавляем текстовые поля
            Object.keys(menuItemData).forEach(key => {
                if (key !== 'image' && menuItemData[key] !== undefined) {
                    formData.append(key, menuItemData[key]);
                }
            });
            
            // Добавляем изображение
            if (menuItemData.image instanceof File) {
                formData.append('image', menuItemData.image);
            }
            
            return uploadFile('menu', formData);
        },
        
        update: async (id, menuItemData) => {
            const formData = new FormData();
            
            // Добавляем текстовые поля
            Object.keys(menuItemData).forEach(key => {
                if (key !== 'image' && menuItemData[key] !== undefined) {
                    formData.append(key, menuItemData[key]);
                }
            });
            
            // Добавляем изображение
            if (menuItemData.image instanceof File) {
                formData.append('image', menuItemData.image);
            }
            
            return uploadFile(`menu/${id}`, formData, { method: 'PUT' });
        },
        
        delete: async (id) => {
            return fetchAPI(`menu/${id}`, { method: 'DELETE' });
        }
    };
    
    // Публичный API
    return {
        auth,
        news,
        restaurants,
        users,
        reservations,
        menuItems,
        storage
    };
})();

// Экспорт API
window.API = API; 