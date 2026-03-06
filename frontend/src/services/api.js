import axios from 'axios'

const api = axios.create({
    baseURL: '/',
    timeout: 10000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('cs_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auth
export const login = (email, password) =>
    api.post('/auth/login', { email, password })

// Issues
export const getIssues = () => api.get('/issues')
export const createIssue = (data) => api.post('/issues', data)
export const updateIssueStatus = (id, status) =>
    api.patch(`/issues/${id}/status`, { status })

// Admin
export const getUsers = () => api.get('/admin/users')

// Audit
export const getAuditLogs = (params = {}) =>
    api.get('/audit/logs', { params })
export const getSecurityAlerts = () => api.get('/audit/alerts')
export const acknowledgeAlert = (alertId) =>
    api.patch(`/audit/alerts/${alertId}/ack`)

// External
export const getExternalData = (apiKey) =>
    api.get('/external/data', { headers: { 'x-api-key': apiKey } })

// Health
export const getHealth = () => api.get('/health')

export default api
