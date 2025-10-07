/**
 * Mental Health Facilities API Service
 * Provides methods for facility search, nearby lookup, and data retrieval
 */

class FacilitiesAPI {
    constructor(baseURL = '/api/facilities') {
        this.baseURL = baseURL;
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
        this.maxCacheSize = 100;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Request statistics
        this.stats = {
            totalRequests: 0,
            cacheHits: 0,
            errors: 0,
            averageResponseTime: 0
        };
    }

    /**
     * Get nearby mental health facilities using location
     * @param {number} latitude - Search center latitude
     * @param {number} longitude - Search center longitude
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Facilities response
     */
    async getNearbyFacilities(latitude, longitude, options = {}) {
        const startTime = performance.now();
        
        try {
            const params = new URLSearchParams({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                radius: (options.radius || 10).toString(),
                limit: (options.limit || 50).toString(),
                verified_only: (options.verifiedOnly || false).toString()
            });

            // Add optional filters
            if (options.facilityType) params.append('facility_type', options.facilityType);
            if (options.services?.length) params.append('services', options.services.join(','));
            if (options.paymentTypes?.length) params.append('payment_types', options.paymentTypes.join(','));
            if (options.languages?.length) params.append('languages', options.languages.join(','));

            const cacheKey = `nearby_${params.toString()}`;
            
            // Check cache first
            const cachedResult = this.getFromCache(cacheKey);
            if (cachedResult) {
                this.stats.cacheHits++;
                return cachedResult;
            }

            const response = await fetch(`${this.baseURL}/nearby?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache successful results
            this.setCache(cacheKey, data);
            
            this.updateStats(performance.now() - startTime, true);
            
            return data;

        } catch (error) {
            this.stats.errors++;
            this.updateStats(performance.now() - startTime, false);
            
            console.error('Error fetching nearby facilities:', error);
            
            // Return fallback data if available
            return this.getFallbackData(latitude, longitude, options);
        }
    }

    /**
     * Search facilities by text query
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Search results
     */
    async searchFacilities(query, options = {}) {
        const startTime = performance.now();
        
        try {
            const params = new URLSearchParams({
                q: query,
                limit: (options.limit || 50).toString(),
                active_only: (options.activeOnly !== false).toString()
            });

            // Add optional filters
            if (options.state) params.append('state', options.state);
            if (options.city) params.append('city', options.city);
            if (options.facilityType) params.append('facility_type', options.facilityType);
            if (options.services?.length) params.append('services', options.services.join(','));

            const cacheKey = `search_${params.toString()}`;
            
            // Check cache first
            const cachedResult = this.getFromCache(cacheKey);
            if (cachedResult) {
                this.stats.cacheHits++;
                return cachedResult;
            }

            const response = await fetch(`${this.baseURL}/search?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache successful results
            this.setCache(cacheKey, data);
            
            this.updateStats(performance.now() - startTime, true);
            
            return data;

        } catch (error) {
            this.stats.errors++;
            this.updateStats(performance.now() - startTime, false);
            
            console.error('Error searching facilities:', error);
            
            // Return empty results on error
            return {
                facilities: [],
                total_count: 0,
                filters_applied: { query, ...options },
                error: error.message
            };
        }
    }

    /**
     * Get facility details by ID
     * @param {string} facilityId - Facility identifier
     * @returns {Promise<Object>} Facility details
     */
    async getFacilityDetails(facilityId) {
        const startTime = performance.now();
        
        try {
            const cacheKey = `facility_${facilityId}`;
            
            // Check cache first
            const cachedResult = this.getFromCache(cacheKey);
            if (cachedResult) {
                this.stats.cacheHits++;
                return cachedResult;
            }

            const response = await fetch(`${this.baseURL}/${facilityId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache successful results
            this.setCache(cacheKey, data);
            
            this.updateStats(performance.now() - startTime, true);
            
            return data;

        } catch (error) {
            this.stats.errors++;
            this.updateStats(performance.now() - startTime, false);
            
            console.error('Error fetching facility details:', error);
            throw error;
        }
    }

    /**
     * Get facilities by state
     * @param {string} state - State abbreviation
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Facilities in state
     */
    async getFacilitiesByState(state, options = {}) {
        const startTime = performance.now();
        
        try {
            const params = new URLSearchParams({
                limit: (options.limit || 100).toString()
            });

            const cacheKey = `state_${state}_${params.toString()}`;
            
            // Check cache first
            const cachedResult = this.getFromCache(cacheKey);
            if (cachedResult) {
                this.stats.cacheHits++;
                return cachedResult;
            }

            const response = await fetch(`${this.baseURL}/by-state/${state}?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache successful results
            this.setCache(cacheKey, data);
            
            this.updateStats(performance.now() - startTime, true);
            
            return data;

        } catch (error) {
            this.stats.errors++;
            this.updateStats(performance.now() - startTime, false);
            
            console.error('Error fetching facilities by state:', error);
            
            return {
                facilities: [],
                total_count: 0,
                filters_applied: { state },
                error: error.message
            };
        }
    }

    /**
     * Get facility statistics
     * @returns {Promise<Object>} Facility statistics
     */
    async getFacilityStatistics() {
        const startTime = performance.now();
        
        try {
            const cacheKey = 'statistics_overview';
            
            // Check cache first
            const cachedResult = this.getFromCache(cacheKey);
            if (cachedResult) {
                this.stats.cacheHits++;
                return cachedResult;
            }

            const response = await fetch(`${this.baseURL}/statistics/overview`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache for shorter time (1 minute)
            this.setCache(cacheKey, data, 60000);
            
            this.updateStats(performance.now() - startTime, true);
            
            return data;

        } catch (error) {
            this.stats.errors++;
            this.updateStats(performance.now() - startTime, false);
            
            console.error('Error fetching facility statistics:', error);
            throw error;
        }
    }

    /**
     * Get request headers with authentication
     * @returns {Object} Headers object
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Get authentication token from storage
     * @returns {string|null} Auth token
     */
    getAuthToken() {
        // Try sessionStorage first, then localStorage
        return sessionStorage.getItem('auth_token') || 
               localStorage.getItem('auth_token') || 
               null;
    }

    /**
     * Cache management
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    setCache(key, data, customExpiry = null) {
        // Manage cache size
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            data,
            expiry: Date.now() + (customExpiry || this.cacheExpiry)
        });
    }

    clearCache() {
        this.cache.clear();
    }

    /**
     * Update API statistics
     */
    updateStats(responseTime, success) {
        this.stats.totalRequests++;
        
        if (success) {
            const totalTime = (this.stats.averageResponseTime * (this.stats.totalRequests - 1)) + responseTime;
            this.stats.averageResponseTime = totalTime / this.stats.totalRequests;
        }
    }

    /**
     * Get API usage statistics
     * @returns {Object} Usage statistics
     */
    getStats() {
        const successRate = this.stats.totalRequests > 0 
            ? ((this.stats.totalRequests - this.stats.errors) / this.stats.totalRequests * 100).toFixed(2)
            : 0;
        
        const cacheHitRate = this.stats.totalRequests > 0
            ? (this.stats.cacheHits / this.stats.totalRequests * 100).toFixed(2)
            : 0;

        return {
            ...this.stats,
            successRate: `${successRate}%`,
            cacheHitRate: `${cacheHitRate}%`,
            averageResponseTime: Math.round(this.stats.averageResponseTime)
        };
    }

    /**
     * Fallback data for when API is unavailable
     */
    getFallbackData(latitude, longitude, options = {}) {
        const fallbackFacilities = [
            {
                facility_id: 'emergency_988',
                name: '988 Suicide & Crisis Lifeline',
                phone: '988',
                facility_type: 'crisis_center',
                services: ['Crisis Support', '24/7 Helpline'],
                description: '24/7 crisis support and suicide prevention',
                is_active: true,
                is_verified: true
            },
            {
                facility_id: 'samhsa_helpline',
                name: 'SAMHSA National Helpline',
                phone: '1-800-662-4357',
                facility_type: 'community_center',
                services: ['Information', 'Referral', 'Treatment'],
                description: 'National helpline for mental health and substance abuse',
                is_active: true,
                is_verified: true
            },
            {
                facility_id: 'crisis_text',
                name: 'Crisis Text Line',
                phone: 'Text HOME to 741741',
                facility_type: 'crisis_center',
                services: ['Crisis Support', 'Text Support'],
                description: '24/7 crisis support via text message',
                is_active: true,
                is_verified: true
            }
        ];

        return {
            facilities: fallbackFacilities,
            total_count: fallbackFacilities.length,
            search_center: { latitude, longitude },
            search_radius_miles: options.radius || 10,
            filters_applied: options,
            fallback: true,
            message: 'Showing emergency mental health resources. Full facility search temporarily unavailable.'
        };
    }

    /**
     * Health check for the facilities API
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health/status`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Health check failed: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Facilities API health check failed:', error);
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Create singleton instance with backend URL
const facilitiesAPI = new FacilitiesAPI('http://127.0.0.1:8000/api/facilities');

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FacilitiesAPI, facilitiesAPI };
} else if (typeof window !== 'undefined') {
    window.facilitiesAPI = facilitiesAPI;
    window.FacilitiesAPI = FacilitiesAPI;
}