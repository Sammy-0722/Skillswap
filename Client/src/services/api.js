import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('usertoken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const userLogin = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('usertoken', response.data.token);
        localStorage.setItem('userId', response.data.id);
    }
    return response.data;
};

export const userLogout = () => {
    localStorage.removeItem('usertoken');
    localStorage.removeItem('userId');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('usertoken');
};

export const registerUser = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.token) {
        localStorage.setItem('usertoken', response.data.token);
        localStorage.setItem('userId', response.data.id);
    }
    return response.data;
};

export const setupProfile = async (bio, location, skillsToTeach, skillsToLearn, availability, sessionType, hourlyRate) => {
    const response = await api.post('/profile/setup', { bio, location, skillsToTeach, skillsToLearn, availability, sessionType, hourlyRate });
    return response.data;
};

export const getAllProfiles = async () => {
    const response = await api.get('/profile/all');
    return response.data;
};
export const getMatches = async () => {
    const response = await api.get('/matches');
    return response.data;
};
export const getProfile = async (userId) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
};

export const getOwnProfile = async () => {
    const response = await api.get('/profile/me');
    return response.data;
};

export const updateProfile = async (bio, location, skillsToTeach, skillsToLearn, availability, sessionType, hourlyRate) => {
    const response = await api.put('/profile/update', { bio, location, skillsToTeach, skillsToLearn, availability, sessionType, hourlyRate });
    return response.data;
};
export const requestSession = async (receiverId, skillToLearn, proposedDateTime, sessionType, message) => {
    const response = await api.post('/sessions/request', {
        receiverId, skillToLearn, proposedDateTime, sessionType, message
    });
    return response.data;
};

export const confirmSession = async (sessionId) => {
    const response = await api.put(`/sessions/${sessionId}/confirm`);
    return response.data;
};
export const getSessionRequests = async () => {
    const response = await api.get('/sessions/requests');
    return response.data; // { incoming: [...], outgoing: [...] }
};
export const withdrawSession=async(sessionId)=>{
    const response = await api.put(`/sessions/${sessionId}/withdraw`)
}
export const cancelSession = async (sessionId) => {
    const response = await api.put(`/sessions/${sessionId}/cancel`);
    return response.data;
};
 
export const createOrder = async (sessionId) => {
    const response = await api.post(`/sessions/${sessionId}/create-order`);
    return response.data;
};

export const verifyPayment = async (sessionId, paymentData) => {
    const response = await api.post(`/sessions/${sessionId}/verify-payment`, paymentData);
    return response.data;
};

export const getUpcomingSessions = async () => {
    const response = await api.get('/sessions/upcoming');
    return response.data;
};
export const getChatHistory = async (sessionId) => {
    const response = await api.get(`/messages/${sessionId}`);
    return response.data;
};
export const getConversations = async () => {
    const response = await api.get('/messages/conversations/list');
    return response.data;
};

export const deleteChat = async (sessionId) => {
    const response = await api.delete(`/messages/${sessionId}`);
    return response.data;
};
export default api;