import { Capacitor } from '@capacitor/core';

/**
 * Dynamic Environment-Aware API Base URL Resolution
 * Handles:
 * - Web development & production (relative /api)
 * - Android Emulator (http://10.0.2.2:5001)
 * - Physical Android device over LAN / Custom Server
 * - Explicit VITE_API_URL environment configuration
 */
export function getApiBaseUrl() {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    }

    if (typeof localStorage !== 'undefined') {
        const customHost = localStorage.getItem('mystic_matrix_custom_api_host');
        if (customHost && customHost.trim()) {
            return customHost.trim().replace(/\/+$/, '');
        }
    }

    if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
        return 'http://10.0.2.2:5001';
    }

    return '';
}

export function setCustomApiHost(host) {
    if (typeof localStorage !== 'undefined') {
        if (host && host.trim()) {
            localStorage.setItem('mystic_matrix_custom_api_host', host.trim());
        } else {
            localStorage.removeItem('mystic_matrix_custom_api_host');
        }
    }
}

export function getCustomApiHost() {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('mystic_matrix_custom_api_host') || '';
    }
    return '';
}

export function getImageUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // In web browsers, serve local public assets directly from the frontend host/CDN
    if (typeof window !== 'undefined' && typeof Capacitor !== 'undefined' && !Capacitor.isNativePlatform()) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    const base = getApiBaseUrl();
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function getCookie(name) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

async function request(endpoint, options = {}) {
    const csrfToken = getCookie('mystic_csrf');
    const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('mystic_session_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (storedToken && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${storedToken}`;
    }

    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
        headers['x-csrf-token'] = csrfToken;
    }

    const config = {
        credentials: 'include', // Send and receive HTTP-only session cookies
        headers,
        ...options
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body);
    }

    const fullUrl = `${getApiBaseUrl()}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
        const response = await fetch(fullUrl, config);
        const data = await response.json();

        // Capture session ID on successful login/sync to support hybrid mobile auth
        if (response.ok && data && data.sessionId) {
            try {
                localStorage.setItem('mystic_session_token', data.sessionId);
            } catch (e) {
                // Non-fatal
            }
        }

        // Clear session ID on logout
        if (endpoint === '/auth/logout') {
            try {
                localStorage.removeItem('mystic_session_token');
            } catch (e) {
                // Non-fatal
            }
        }

        if (!response.ok) {
            const err = new Error(data.message || `API request failed with status ${response.status}`);
            err.status = response.status;
            err.error = data.error;
            err.data = data;
            throw err;
        }
        return data;
    } catch (err) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            const platformHint = Capacitor.isNativePlatform()
                ? ' Cannot connect to Mystic Matrix backend. Ensure backend is running and reachable.'
                : ' Backend connection error.';
            err.message = `Network Connection Error.${platformHint}`;
        }
        console.error(`API Error on ${endpoint}:`, err);
        throw err;
    }
}

export const api = {
    // ══════════════════════════════════════════════════════════
    // Authentication & Identity
    // ══════════════════════════════════════════════════════════
    getAuthConfig: () => request('/auth/config'),
    getMe: () => request('/auth/me'),
    login: (data) => request('/auth/login', { method: 'POST', body: data }),
    register: (data) => request('/auth/register', { method: 'POST', body: data }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: data }),
    resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: data }),
    devLogin: (data) => request('/auth/dev-login', { method: 'POST', body: data }),
    syncClerkUser: (data) => request('/auth/clerk-sync', { method: 'POST', body: data }),
    getGoogleLoginUrl: () => `${API_BASE}/auth/google`,

    // Health
    getHealth: () => request('/health'),

    // ══════════════════════════════════════════════════════════
    // Customer Shop & Discovery
    // ══════════════════════════════════════════════════════════
    getShopProducts: async (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.category) searchParams.set('category', params.category);
        if (params.search) searchParams.set('search', params.search);
        if (params.item_type) searchParams.set('item_type', params.item_type);
        if (params.in_stock) searchParams.set('in_stock', params.in_stock);
        if (params.sort) searchParams.set('sort', params.sort);
        if (params.limit) searchParams.set('limit', params.limit);
        if (params.offset) searchParams.set('offset', params.offset);
        const query = searchParams.toString();
        try {
            const data = await request(`/shop/products${query ? `?${query}` : ''}`);
            if (data) {
                try {
                    localStorage.setItem('mystic_cached_shop_products', JSON.stringify(data));
                } catch (e) {}
            }
            return data;
        } catch (err) {
            if (typeof localStorage !== 'undefined') {
                const cached = localStorage.getItem('mystic_cached_shop_products');
                if (cached) {
                    try {
                        const parsed = JSON.parse(cached);
                        parsed._isOfflineCached = true;
                        return parsed;
                    } catch (e) {}
                }
            }
            throw err;
        }
    },
    getShopProduct: (id) => request(`/shop/products/${id}`),
    getShopFeatured: () => request('/shop/featured'),

    // ══════════════════════════════════════════════════════════
    // Customer Cart
    // ══════════════════════════════════════════════════════════
    getCart: () => request('/cart'),
    addToCart: (productId, quantity = 1) => request('/cart/items', { method: 'POST', body: { productId, quantity } }),
    updateCartItem: (cartItemId, quantity) => request(`/cart/items/${cartItemId}`, { method: 'PATCH', body: { quantity } }),
    removeFromCart: (cartItemId) => request(`/cart/items/${cartItemId}`, { method: 'DELETE' }),
    clearCart: () => request('/cart', { method: 'DELETE' }),

    // ══════════════════════════════════════════════════════════
    // Customer Orders
    // ══════════════════════════════════════════════════════════
    checkout: (orderData = {}) => request('/orders', { method: 'POST', body: orderData }),
    getMyOrders: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/orders/my${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    },
    getOrderDetails: (id) => request(`/orders/${id}`),

    // ══════════════════════════════════════════════════════════
    // Customer Profile
    // ══════════════════════════════════════════════════════════
    getProfile: () => request('/profile'),
    updateProfile: (data) => request('/profile', { method: 'PATCH', body: data }),
    changePassword: (data) => request('/profile/change-password', { method: 'POST', body: data }),

    // ══════════════════════════════════════════════════════════
    // Admin Command Center & Governance
    // ══════════════════════════════════════════════════════════
    getAdminDashboard: () => request('/admin/dashboard'),
    getAdminOrders: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/admin/orders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    },
    getAdminOrderDetails: (id) => request(`/admin/orders/${id}`),
    getAdminUsers: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/admin/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    },
    updateAdminUser: (id, data) => request(`/admin/users/${id}`, { method: 'PATCH', body: data }),
    getAdminAuditLogs: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/admin/audit-logs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    },
    getAdminDatasets: () => request('/admin/datasets'),
    triggerDatasetImport: (options = {}) => request('/admin/datasets/import', { method: 'POST', body: options }),
    getAdminRetailTransactions: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/admin/datasets/retail${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    },
    getAdminDailyDemand: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/admin/datasets/daily-demand${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    },

    // ══════════════════════════════════════════════════════════
    // Apothecary Admin Inventory & Core Routes (Preserved)
    // ══════════════════════════════════════════════════════════
    getProducts: async (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.categoryId) searchParams.set('categoryId', params.categoryId);
        if (params.search) searchParams.set('search', params.search);
        if (params.status) searchParams.set('status', params.status);
        const query = searchParams.toString();
        try {
            const data = await request(`/products${query ? `?${query}` : ''}`);
            if (data) {
                try {
                    localStorage.setItem('mystic_cached_inventory', JSON.stringify(data));
                } catch (e) {}
            }
            return data;
        } catch (err) {
            if (typeof localStorage !== 'undefined') {
                const cached = localStorage.getItem('mystic_cached_inventory');
                if (cached) {
                    try {
                        const parsed = JSON.parse(cached);
                        parsed._isOfflineCached = true;
                        return parsed;
                    } catch (e) {}
                }
            }
            throw err;
        }
    },
    getProduct: (id) => request(`/products/${id}`),
    createProduct: (data) => request('/products', { method: 'POST', body: data }),
    updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
    deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
    adjustStock: (id, data) => request(`/products/${id}/adjust-stock`, { method: 'POST', body: data }),

    // Categories & Suppliers
    getCategories: () => request('/categories'),
    getSuppliers: () => request('/suppliers'),
    getPurchaseOrders: () => request('/suppliers/purchase-orders'),
    receivePurchaseOrder: (id) => request(`/suppliers/purchase-orders/${id}/receive`, { method: 'POST' }),

    // Sales & Transactions
    getSales: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/sales?${searchParams.toString()}`);
    },
    recordSale: (data) => request('/sales', { method: 'POST', body: data }),
    getTransactions: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/sales/transactions?${searchParams.toString()}`);
    },

    // Forecasts & Intelligence (with source support)
    getForecasts: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.halloweenMultiplier) searchParams.set('halloweenMultiplier', params.halloweenMultiplier);
        if (params.source) searchParams.set('source', params.source);
        const query = searchParams.toString();
        return request(`/forecasts${query ? `?${query}` : ''}`);
    },
    getProductForecast: (id, params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.halloweenMultiplier) searchParams.set('halloweenMultiplier', params.halloweenMultiplier);
        const query = searchParams.toString();
        return request(`/forecasts/${id}${query ? `?${query}` : ''}`);
    },
    getForecastEvaluations: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/forecasts/evaluations/leaderboard${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    },

    // Recommendations
    getRecommendations: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.halloweenMultiplier) searchParams.set('halloweenMultiplier', params.halloweenMultiplier);
        const query = searchParams.toString();
        return request(`/recommendations${query ? `?${query}` : ''}`);
    },
    applyRestock: (productId, data) => request(`/recommendations/${productId}/apply-restock`, { method: 'POST', body: data }),

    // Analytics
    getDashboardMetrics: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.halloweenMultiplier) searchParams.set('halloweenMultiplier', params.halloweenMultiplier);
        const query = searchParams.toString();
        return request(`/analytics/dashboard${query ? `?${query}` : ''}`);
    },
    getSalesAnalytics: (days = 30) => request(`/analytics/sales?days=${days}`),
    resetDemoData: () => request('/analytics/reset-demo', { method: 'POST' }),

    // ══════════════════════════════════════════════════════════
    // Mystic AI — The Inventory Oracle & Copilot
    // ══════════════════════════════════════════════════════════
    getAiNotifications: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/ai/notifications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    },
    getAiStats: () => request('/ai/notifications/stats'),
    markAiNotificationRead: (id) => request(`/ai/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAiNotificationsRead: () => request('/ai/notifications/read-all', { method: 'POST' }),
    dismissAiNotification: (id) => request(`/ai/notifications/${id}/dismiss`, { method: 'PATCH' }),
    triggerAiScan: () => request('/ai/analyze', { method: 'POST' }),

    getAiActions: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return request(`/ai/actions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    },
    createAiActionDraft: (data) => request('/ai/actions/draft', { method: 'POST', body: data }),
    approveAiAction: (id) => request(`/ai/actions/${id}/approve`, { method: 'POST' }),
    rejectAiAction: (id, reason) => request(`/ai/actions/${id}/reject`, { method: 'POST', body: { reason } }),

    sendAiChatMessage: (message, sessionId) => request('/ai/chat', { method: 'POST', body: { message, sessionId } }),
    getAiChatHistory: (sessionId) => request(`/ai/chat/history/${sessionId}`),
    clearAiChatHistory: (sessionId) => request(`/ai/chat/clear/${sessionId}`, { method: 'POST' }),

    getAiRestockDetails: (productId) => request(`/ai/restock-details/${productId}`),
    getAiAssortmentRankings: () => request('/ai/assortment-rankings'),

    // AI Diagnostics & Provider Management
    getAiDiagnostics: () => request('/ai/diagnostics'),
    pingAiProvider: () => request('/ai/diagnostics/ping', { method: 'POST' })
};

export default api;
