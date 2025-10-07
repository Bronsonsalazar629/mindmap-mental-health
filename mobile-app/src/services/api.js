// API service to connect to existing backend
const API_BASE_URL = 'http://localhost:5000'; // Adjust to your backend port

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Mental health data endpoints
  async getMentalHealthData() {
    return this.request('/api/mental-health');
  }

  async saveMentalHealthEntry(data) {
    return this.request('/api/mental-health', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User authentication
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Geographic data
  async getLocationData() {
    return this.request('/api/locations');
  }
}

export default new ApiService();