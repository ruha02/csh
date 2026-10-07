import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Интерцептор для добавления токена в каждый запрос
api.interceptors.request.use(
    async (config) => {
        if (keycloak.authenticated && keycloak.token) {
            // Проверяем, не истек ли токен, и обновляем его при необходимости
            try {
                await keycloak.updateToken(5); // Обновляем, если токен истекает через 5 секунд
            } catch (error) {
                console.error('Failed to update token:', error);
                keycloak.logout();
            }

            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Интерцептор для обработки ошибок авторизации
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            keycloak.logout();
        }
        return Promise.reject(error);
    }
);

export default api;