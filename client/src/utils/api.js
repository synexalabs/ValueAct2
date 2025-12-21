import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 120000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    // Check if we are in browser environment
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const calculations = {
    runIFRS17: (portfolio, assumptions) =>
        api.post('/api/calculations/start', {
            calculationType: 'ifrs17',
            inputParams: { portfolio, assumptions }
        }),

    runSolvency: (portfolio, assumptions) =>
        api.post('/api/calculations/start', {
            calculationType: 'solvency',
            inputParams: { portfolio, assumptions }
        }),

    getHistory: (params) => api.get('/api/calculations/history', { params }),

    getResult: (calculationId) =>
        api.get(`/api/calculations/${calculationId}/results`),
};

export const data = {
    uploadPortfolio: (files) => {
        const formData = new FormData();
        // Handle array of files or single file
        if (Array.isArray(files)) {
            files.forEach(file => formData.append('files', file));
        } else {
            formData.append('files', files);
        }
        return api.post('/api/data-management/upload', formData);
    },

    validateData: (parsedFiles) =>
        api.post('/api/data-management/validate', { parsedFiles }),

    convertData: (parsedFiles) =>
        api.post('/api/data-management/convert', { parsedFiles }),

    saveRun: (unifiedJson) =>
        api.post('/api/data-management/save', { unifiedJson }),

    runValuation: (runId) =>
        api.post('/api/data-management/run-valuation', { runId }),

    getRuns: (userId) => api.get(`/api/data-management/runs/${userId}`),

    getRunStatus: (runId) => api.get(`/api/data-management/status/${runId}`),
};

export default api;
