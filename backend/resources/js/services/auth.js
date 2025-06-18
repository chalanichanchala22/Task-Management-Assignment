import axios from 'axios';

const AuthService = {
    register(userData) {
        return axios.post('/api/register', userData);
    },
    
    login(credentials) {
        return axios.post('/api/login', credentials)
            .then(response => {
                // Store and set token automatically when login succeeds
                if (response.data.token) {
                    this.setToken(response.data.token);
                }
                return response;
            });
    },
    
    logout() {
        // Clear token from storage and headers
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        return axios.post('/api/logout');
    },
    
    getToken() {
        return localStorage.getItem('token');
    },
    
    setToken(token) {
        // Store token and set axios default header
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    
    isAuthenticated() {
        return this.getToken() !== null;
    }
};

export default AuthService;