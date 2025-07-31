// --- Ultra-Robust Search Service ---
class RobustSearchService {
    constructor(placesService) {
        this.placesService = placesService;
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
        this.lastRequestTime = 0;
        this.minRequestInterval = 2000; // 2 seconds minimum between requests
        this.circuitBreaker = {
            failures: 0,
            lastFailure: 0,
            isOpen: false,
            threshold: 3, // Reduced threshold
            timeout: 120000 // 2 minutes
        };
        this.fallbackData = this.initializeFallbackData();
        this.requestStats = {
            total: 0,
            successful: 0,
            failed: 0,
            cached: 0
        };
    }

    // Initialize fallback data for when API completely fails
    initializeFallbackData() {
        return {
            mentalHealth: [
                { name: "Crisis Text Line", type: "Emergency Support", contact: "Text HOME to 741741" },
                { name: "National Suicide Prevention Lifeline", type: "Crisis Support", contact: "988" },
                { name: "SAMHSA National Helpline", type: "24/7 Support", contact: "1-800-662-HELP" },
                { name: "NAMI HelpLine", type: "Information & Support", contact: "1-800-950-NAMI" }
            ],
            wellness: [
                { name: "Local Parks", type: "Outdoor Activity", suggestion: "Search for 'parks near me' on Google Maps" },
                { name: "Walking Trails", type: "Exercise", suggestion: "Look for nature trails in your area" },
                { name: "Community Centers", type: "Social Activity", suggestion: "Check local community center websites" },
                { name: "Public Libraries", type: "Quiet Space", suggestion: "Libraries often have peaceful reading areas" }
            ]
        };
    }

    // Cache key generator
    generateCacheKey(request) {
        return JSON.stringify({
            location: request.location,
            radius: request.radius,
            type: request.type,
            keyword: request.keyword
        });
    }

    // Check if cache entry is still valid (30 minutes)
    isCacheValid(timestamp) {
        return Date.now() - timestamp < 30 * 60 * 1000;
    }

    // Circuit breaker check
    isCircuitBreakerOpen() {
        if (this.circuitBreaker.isOpen) {
            if (Date.now() - this.circuitBreaker.lastFailure > this.circuitBreaker.timeout) {
                this.circuitBreaker.isOpen = false;
                this.circuitBreaker.failures = 0;
                console.log('Circuit breaker reset');
            }
        }
        return this.circuitBreaker.isOpen;
    }

    // Record failure for circuit breaker
    recordFailure() {
        this.circuitBreaker.failures++;
        this.circuitBreaker.lastFailure = Date.now();
        
        if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
            this.circuitBreaker.isOpen = true;
            console.warn('Circuit breaker opened - too many failures');
        }
    }

    // Exponential backoff delay
    calculateDelay(attempt) {
        const baseDelay = 1000; // 1 second
        const maxDelay = 10000; // 10 seconds
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        // Add jitter to prevent thundering herd
        return delay + Math.random() * 1000;
    }

    // Single search request with retry logic
    async performSingleSearch(request, maxRetries = 3) {
        if (this.isCircuitBreakerOpen()) {
            throw new Error('Circuit breaker is open - service temporarily unavailable');
        }

        const cacheKey = this.generateCacheKey(request);
        const cached = this.cache.get(cacheKey);
        
        if (cached && this.isCacheValid(cached.timestamp)) {
            console.log('Returning cached result for:', request.keyword);
            return cached.results;
        }

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const results = await this.makeApiRequest(request);
                
                // Cache successful results
                this.cache.set(cacheKey, {
                    results,
                    timestamp: Date.now()
                });
                
                // Reset circuit breaker on success
                if (this.circuitBreaker.failures > 0) {
                    this.circuitBreaker.failures = Math.max(0, this.circuitBreaker.failures - 1);
                }
                
                return results;
                
            } catch (error) {
                console.warn(`Search attempt ${attempt + 1} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    this.recordFailure();
                    throw error;
                }
                
                // Wait before retry with exponential backoff
                const delay = this.calculateDelay(attempt);
                console.log(`Retrying in ${delay}ms...`);
                await this.sleep(delay);
            }
        }
    }

    // Promise wrapper for Google Places API with aggressive rate limiting protection
    async makeApiRequest(request) {
        // Enforce minimum interval between requests
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
            await this.sleep(waitTime);
        }
        
        this.lastRequestTime = Date.now();
        this.requestStats.total++;

        return new Promise((resolve, reject) => {
            // Much longer timeout for problematic APIs
            const timeout = setTimeout(() => {
                console.warn('API request timed out after 30 seconds');
                reject(new Error('Request timeout - API took too long to respond'));
            }, 30000); // 30 second timeout

            try {
                this.placesService.nearbySearch(request, (results, status) => {
                    clearTimeout(timeout);
                    
                    console.log(`Places API response: ${status}, Results: ${results?.length || 0}`);
                    
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        this.requestStats.successful++;
                        resolve(results || []);
                    } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                        this.requestStats.successful++;
                        resolve([]);
                    } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                        this.requestStats.failed++;
                        reject(new Error('API quota exceeded - try again later'));
                    } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                        this.requestStats.failed++;
                        reject(new Error('API access denied - check API key permissions'));
                    } else if (status === google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
                        this.requestStats.failed++;
                        reject(new Error('Invalid search parameters'));
                    } else {
                        this.requestStats.failed++;
                        reject(new Error(`Places API error: ${status}`));
                    }
                });
            } catch (error) {
                clearTimeout(timeout);
                this.requestStats.failed++;
                reject(new Error(`API call failed: ${error.message}`));
            }
        });
    }

    // Sequential processing of multiple search requests
    async performSequentialSearch(requests) {
        const allResults = [];
        
        for (let i = 0; i < requests.length; i++) {
            try {
                console.log(`Processing search ${i + 1}/${requests.length}:`, requests[i].keyword);
                const results = await this.performSingleSearch(requests[i]);
                allResults.push(...results);
                
                // Add delay between requests to avoid rate limiting
                if (i < requests.length - 1) {
                    await this.sleep(800); // 800ms delay between requests
                }
                
            } catch (error) {
                console.warn(`Search failed for: ${requests[i].keyword}`, error.message);
                // Continue with other searches even if one fails
            }
        }
        
        return this.removeDuplicates(allResults);
    }

    // Remove duplicate places by place_id
    removeDuplicates(results) {
        const seen = new Set();
        return results.filter(place => {
            if (seen.has(place.place_id)) {
                return false;
            }
            seen.add(place.place_id);
            return true;
        });
    }

    // Fallback search strategies with offline support
    async searchWithFallbacks(baseLocation, searchType) {
        const strategies = this.getFallbackStrategies(baseLocation, searchType);
        
        for (let i = 0; i < strategies.length; i++) {
            console.log(`Trying search strategy ${i + 1}/${strategies.length}`);
            
            try {
                const results = await this.performSequentialSearch(strategies[i]);
                
                if (results.length > 0) {
                    console.log(`Strategy ${i + 1} succeeded with ${results.length} results`);
                    return results;
                }
                
            } catch (error) {
                console.warn(`Strategy ${i + 1} failed:`, error.message);
                
                // If API is completely failing, show fallback data
                if (error.message.includes('quota exceeded') || 
                    error.message.includes('access denied') ||
                    error.message.includes('Circuit breaker')) {
                    console.warn('API issues detected, providing fallback data');
                    return this.getFallbackDataAsResults(searchType);
                }
            }
            
            // Small delay before trying next strategy
            if (i < strategies.length - 1) {
                await this.sleep(2000); // Increased delay to 2 seconds
            }
        }
        
        // Final fallback: return offline data
        console.warn('All API strategies failed, returning offline fallback data');
        return this.getFallbackDataAsResults(searchType);
    }

    // Convert fallback data to result format
    getFallbackDataAsResults(searchType) {
        const fallbackItems = this.fallbackData[searchType] || [];
        return fallbackItems.map((item, index) => ({
            place_id: `fallback_${searchType}_${index}`,
            name: item.name,
            vicinity: item.type,
            rating: null,
            geometry: { location: null }, // No specific location
            isFallback: true,
            fallbackData: item
        }));
    }

    // Define fallback strategies for different search types
    getFallbackStrategies(location, searchType) {
        const baseStrategies = {
            mentalHealth: [
                // Strategy 1: Specific terms, smaller radius
                [
                    { location, radius: 5000, type: ['health'], keyword: 'mental health clinic' },
                    { location, radius: 5000, type: ['health'], keyword: 'therapist' },
                    { location, radius: 5000, type: ['health'], keyword: 'counseling center' }
                ],
                // Strategy 2: Broader terms, medium radius
                [
                    { location, radius: 10000, type: ['health'], keyword: 'psychology' },
                    { location, radius: 10000, type: ['health'], keyword: 'psychiatry' },
                    { location, radius: 10000, type: ['health'], keyword: 'counselor' }
                ],
                // Strategy 3: Generic health search, larger radius
                [
                    { location, radius: 15000, type: ['health'], keyword: 'health center' },
                    { location, radius: 15000, type: ['hospital'], keyword: 'mental health' }
                ]
            ],
            
            wellness: [
                // Strategy 1: Parks and recreation
                [
                    { location, radius: 3000, type: ['park'], keyword: 'park' },
                    { location, radius: 5000, keyword: 'recreation area' }
                ],
                // Strategy 2: Nature and trails
                [
                    { location, radius: 8000, keyword: 'trail walking hiking' },
                    { location, radius: 8000, keyword: 'nature reserve' }
                ],
                // Strategy 3: General outdoor spaces
                [
                    { location, radius: 10000, keyword: 'outdoor recreation' },
                    { location, radius: 10000, keyword: 'green space' }
                ]
            ]
        };
        
        return baseStrategies[searchType] || [[]];
    }

    // Utility function for delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Clear cache (useful for testing or manual refresh)
    clearCache() {
        this.cache.clear();
        console.log('Search cache cleared');
    }

    // Get cache statistics
    getCacheStats() {
        return {
            size: this.cache.size,
            circuitBreakerStatus: this.circuitBreaker.isOpen ? 'OPEN' : 'CLOSED',
            failures: this.circuitBreaker.failures
        };
    }
}

// --- Global State ---
let map;
let userLocation;
let placesService;
let moodChart = null;
let moodHeatmap = null;
let allMarkers = [];
let moodData = [];
let searchService;

// Initialize the map
async function initMap() {
    // Default to a major city (you can change this)
    const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultLocation,
        styles: [
            // Clean, modern map styling
            {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [{"weight": "2.00"}]
            },
            {
                "featureType": "all",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#9c9c9c"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text",
                "stylers": [{"visibility": "on"}]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [{"color": "#f2f2f2"}]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#ffffff"}]
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#ffffff"}]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [{"saturation": -100}, {"lightness": 45}]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#eeeeee"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#7b7b7b"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#ffffff"}]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [{"visibility": "simplified"}]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#dbeafe"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#070707"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#ffffff"}]
            }
        ]
    });

    placesService = new google.maps.places.PlacesService(map);
    
    // Initialize robust search service
    searchService = new RobustSearchService(placesService);
    
    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(userLocation);
            
            // Add user location marker with modern styling
            new google.maps.Marker({
                position: userLocation,
                map: map,
                title: 'Your Location',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeWeight: 3,
                    strokeColor: '#ffffff'
                }
            });
            
            // Load previous moods after location is set
            loadPreviousMoods();
        }, (error) => {
            console.warn('Geolocation error:', error);
            showNotification('Please enable location access to use all features.', 'error');
            // Load moods even if location is denied
            loadPreviousMoods();
        });
    } else {
        // Geolocation not supported by browser
        showNotification('Geolocation is not supported by your browser.', 'error');
        loadPreviousMoods();
    }
    
    setupEventListeners();
}

// --- UI & Notifications ---

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    const iconMap = { info: 'info', success: 'check-circle', error: 'alert-circle' };
    toast.innerHTML = `<i data-lucide="${iconMap[type]}"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    lucide.createIcons({ nodes: [toast.querySelector('i')] });

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.5s forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, 4000);
}

function setupEventListeners() {
    // Sidebar buttons
    document.getElementById('find-resources').addEventListener('click', findMentalHealthResources);
    document.getElementById('track-mood').addEventListener('click', openMoodTracker);
    document.getElementById('wellness-walk').addEventListener('click', findWellnessWalk);
    document.getElementById('emergency').addEventListener('click', showEmergencyResources);
    document.getElementById('toggle-heatmap').addEventListener('click', toggleMoodHeatmap);
    
    // Analytics Panel
    document.getElementById('view-insights').addEventListener('click', showAnalytics);
    document.getElementById('close-analytics-panel').addEventListener('click', closeAnalytics);
    
    // Add search service debug console (for development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.searchDebug = {
            getStats: () => searchService?.getCacheStats(),
            clearCache: () => searchService?.clearCache(),
            service: () => searchService,
            testConnection: testConnectionSpeed,
            forceSimpleSearch: forceSimpleSearch,
            testBasicAPI: testBasicPlacesAPI,
            useLegacySearch: () => { useLegacySearch = true; console.log('Enabled legacy search mode'); },
            testSimpleSearch: () => simpleWorkingSearch(userLocation, 'mentalHealth'),
            testAPIKey: testAPIKeyDirectly,
            runDiagnostic: runFullDiagnostic
        };
        console.log('Search debug tools available: window.searchDebug');
    }
    
    // Test connection speed on startup
    testConnectionSpeed();
    
    // Add immediate API key test
    setTimeout(() => {
        testAPIKeyDirectly();
    }, 2000);
    
    lucide.createIcons();
}

// --- Mood Tracker ---
let selectedMood = null;

function openMoodTracker() {
    if (document.getElementById('mood-tracker-modal')) return;

    const modalHTML = `
        <div class="modal-backdrop visible" id="mood-tracker-modal">
            <div class="modal-content">
                <button class="modal-close-btn" id="close-mood-modal"><i data-lucide="x"></i></button>
                <h3>How are you feeling right now?</h3>
                <div id="mood-buttons">
                    <button class="mood-btn" data-mood="1" title="Very Sad">😢</button>
                    <button class="mood-btn" data-mood="2" title="Sad">😔</button>
                    <button class="mood-btn" data-mood="3" title="Neutral">😐</button>
                    <button class="mood-btn" data-mood="4" title="Good">🙂</button>
                    <button class="mood-btn" data-mood="5" title="Great">😊</button>
                </div>
                <textarea id="mood-note" placeholder="Optional: What's on your mind?"></textarea>
                <button id="save-mood" class="primary-btn">Save Mood Entry</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    lucide.createIcons({ nodes: [document.getElementById('close-mood-modal')] });

    // Add event listeners for the new modal
    const modal = document.getElementById('mood-tracker-modal');
    modal.querySelector('#close-mood-modal').addEventListener('click', closeMoodTracker);
    modal.querySelector('#save-mood').addEventListener('click', saveMoodData);
    modal.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', (e) => selectMood(e.currentTarget.dataset.mood, e.currentTarget));
    });
    modal.addEventListener('click', (e) => {
        if (e.target.id === 'mood-tracker-modal') closeMoodTracker();
    });
}

function closeMoodTracker() {
    const modal = document.getElementById('mood-tracker-modal');
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.remove();
            selectedMood = null;
        }, 300);
    }
}

function selectMood(mood, element) {
    selectedMood = mood;
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    element.classList.add('selected');
}

async function saveMoodData() {
    if (!selectedMood) {
        return showNotification('Please select a mood before saving.', 'error');
    }
    if (!userLocation) {
        return showNotification('Cannot save mood without your location.', 'error');
    }

    const moodEntry = {
        mood: parseInt(selectedMood, 10),
        note: document.getElementById('mood-note').value,
        location: new firebase.firestore.GeoPoint(userLocation.lat, userLocation.lng),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    const saveButton = document.getElementById('save-mood');
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    try {
        await db.collection('moods').add(moodEntry);
        showNotification('Mood entry saved successfully!', 'success');
        closeMoodTracker();
        loadPreviousMoods(); // Refresh data
    } catch (error) {
        console.error("Error saving mood data: ", error);
        if (error.code === 'permission-denied') {
            showNotification('Firebase permission denied. Check your security rules.', 'error');
        } else {
            showNotification('Failed to save mood entry. Please try again.', 'error');
        }
        saveButton.disabled = false;
        saveButton.textContent = 'Save Mood Entry';
    }
}

async function loadPreviousMoods() {
    try {
        const snapshot = await db.collection('moods').orderBy('timestamp', 'desc').limit(50).get();
        moodData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateAnalytics();
        updateMoodHeatmap();
    } catch (error) {
        console.error("Error loading mood data: ", error);
        if (error.code === 'permission-denied') {
            showNotification('Cannot load mood data. Check Firebase permissions.', 'error');
        } else {
            showNotification('Could not load previous mood data.', 'error');
        }
    }
}

// --- Resource Finding ---

async function findMentalHealthResources() {
    if (!userLocation) {
        showNotification('Please allow location access to find nearby resources', 'error');
        return;
    }
    
    const btn = document.getElementById('find-resources');
    const timeoutWarning = document.getElementById('timeout-warning');
    
    // Add loading state
    btn.classList.remove('error');
    btn.classList.add('loading');
    btn.innerHTML = '<i data-lucide="loader-2"></i> <span>Searching...</span>';
    lucide.createIcons({ nodes: [btn.querySelector('i')] });

    // Clear existing markers
    clearMarkers();

    // Show timeout warning after 8 seconds
    const timeoutTimer = setTimeout(() => {
        timeoutWarning.classList.add('visible');
        lucide.createIcons({ nodes: [timeoutWarning.querySelector('i')] });
    }, 8000);

    try {
        // Use optimized search based on connection quality
        const results = await performOptimizedSearch(userLocation, 'mentalHealth');
        
        // Clear timeout warning
        clearTimeout(timeoutTimer);
        timeoutWarning.classList.remove('visible');

        if (results.length === 0) {
            showNotification('No mental health resources found nearby. Try expanding your search area.', 'info');
        } else {
            // Sort by rating for better results
            const sortedResults = results
                .filter(place => !place.rating || place.rating >= 3.0)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 15); // Limit to top 15 results
            
            const finalResults = sortedResults.length > 0 ? sortedResults : results.slice(0, 10);
            finalResults.forEach(place => createResourceMarker(place));
            
            const hasFallback = finalResults.some(r => r.isFallback);
            const message = hasFallback ? 
                `Showing ${finalResults.length} emergency resources (API temporarily unavailable)` :
                `Found ${finalResults.length} mental health resources nearby.`;
            showNotification(message, hasFallback ? 'info' : 'success');
        }
    } catch (error) {
        console.error('Error finding resources:', error);
        clearTimeout(timeoutTimer);
        timeoutWarning.classList.remove('visible');
        
        if (error.message.includes('Circuit breaker')) {
            showNotification('Service temporarily unavailable. Please try again in a few minutes.', 'error');
        } else {
            showNotification('Error finding resources. Please try again.', 'error');
        }
    } finally {
        // Reset button state
        btn.classList.remove('loading', 'error');
        btn.innerHTML = '<i data-lucide="search"></i> <span>Find Resources</span>';
        lucide.createIcons({ nodes: [btn.querySelector('i')] });
    }
}

function createResourceMarker(place) {
    // Handle fallback data differently
    if (place.isFallback) {
        createFallbackResourceInfo(place);
        return;
    }

    // Use modern AdvancedMarkerElement if available, fallback to Marker
    let marker;
    try {
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            marker = new google.maps.marker.AdvancedMarkerElement({
                position: place.geometry.location,
                map: map,
                title: place.name
            });
        } else {
            marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: '#ef4444',
                    fillOpacity: 0.8,
                    strokeWeight: 2,
                    strokeColor: '#ffffff'
                }
            });
        }
    } catch (error) {
        // Fallback to old marker
        marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: '#ef4444',
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: '#ffffff'
            }
        });
    }
    
    allMarkers.push(marker);
    
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 1rem; font-family: 'Inter', sans-serif; max-width: 300px;">
                <h3 style="margin: 0 0 0.75rem 0; color: #1f2937; font-size: 1.125rem;">${place.name}</h3>
                <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;"><strong>Address:</strong> ${place.vicinity}</p>
                <p style="margin: 0 0 0.75rem 0; color: #6b7280; font-size: 0.875rem;"><strong>Rating:</strong> ${place.rating || 'N/A'} ⭐</p>
                ${place.opening_hours ? `<p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem;"><strong>Status:</strong> ${place.opening_hours.open_now ? '✅ Open Now' : '⏰ Closed'}</p>` : ''}
                <button onclick="getDirections('${place.place_id}')" 
                    style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500;">
                    Get Directions
                </button>
            </div>
        `
    });
    
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
}

function createFallbackResourceInfo(place) {
    // Create an info panel instead of map markers for fallback data
    const infoPanel = document.createElement('div');
    infoPanel.className = 'fallback-resource-panel';
    infoPanel.style.cssText = `
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        background: white;
        border: 2px solid #ef4444;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        max-width: 350px;
        z-index: 1000;
        font-family: 'Inter', sans-serif;
    `;
    
    infoPanel.innerHTML = `
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0; color: #1f2937; font-size: 1.25rem;">Emergency Resources</h3>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">×</button>
        </div>
        <div style="background: #fef2f2; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <p style="margin: 0 0 0.5rem 0; color: #dc2626; font-weight: 600;">API temporarily unavailable</p>
            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Showing emergency mental health resources:</p>
        </div>
        ${searchService.fallbackData.mentalHealth.map(resource => `
            <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem;">
                <h4 style="margin: 0 0 0.5rem 0; color: #1f2937; font-size: 1rem;">${resource.name}</h4>
                <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;"><strong>Type:</strong> ${resource.type}</p>
                <p style="margin: 0; color: #dc2626; font-weight: 500;">${resource.contact}</p>
            </div>
        `).join('')}
        <p style="margin: 1rem 0 0 0; text-align: center; color: #6b7280; font-size: 0.75rem; font-style: italic;">These resources are always available regardless of location services.</p>
    `;
    
    document.body.appendChild(infoPanel);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (infoPanel.parentElement) {
            infoPanel.remove();
        }
    }, 30000);
}

function getDirections(placeId) {
    if (!placeId) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination_place_id=${placeId}&travelmode=driving`;
    window.open(url, '_blank');
}

function clearMarkers() {
    allMarkers.forEach(marker => marker.setMap(null));
    allMarkers = [];
}

// --- Wellness Walk Feature ---
async function findWellnessWalk() {
    if (!userLocation) {
        showNotification('Please allow location access to find wellness walks', 'error');
        return;
    }
    
    const btn = document.getElementById('wellness-walk');
    const timeoutWarning = document.getElementById('timeout-warning');
    
    // Reset button state
    btn.classList.remove('error');
    btn.classList.add('loading');
    btn.innerHTML = '<i data-lucide="loader-2"></i> <span>Finding Walks...</span>';
    lucide.createIcons({ nodes: [btn.querySelector('i')] });
    
    clearMarkers();
    
    // Show timeout warning after 8 seconds
    const timeoutTimer = setTimeout(() => {
        timeoutWarning.classList.add('visible');
        lucide.createIcons({ nodes: [timeoutWarning.querySelector('i')] });
    }, 8000);

    try {
        // Use optimized search based on connection quality
        const results = await performOptimizedSearch(userLocation, 'wellness');
        
        // Clear timeout warning
        clearTimeout(timeoutTimer);
        timeoutWarning.classList.remove('visible');

        if (results.length === 0) {
            showNotification('No parks or wellness areas found nearby. Try expanding your search area.', 'info');
            // Suggest alternative
            setTimeout(() => {
                showNotification('Tip: You can also manually explore the map for green spaces!', 'info');
            }, 2000);
        } else {
            // Sort by rating for better results
            const sortedResults = results
                .filter(place => !place.rating || place.rating >= 3.0)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 12); // Limit to top 12 results
            
            const finalResults = sortedResults.length > 0 ? sortedResults : results.slice(0, 8);
            finalResults.forEach(place => createWellnessMarker(place));
            showNotification(`Found ${finalResults.length} wellness locations nearby.`, 'success');
        }
    } catch (error) {
        console.error('Error finding wellness walks:', error);
        clearTimeout(timeoutTimer);
        timeoutWarning.classList.remove('visible');
        
        if (error.message.includes('Circuit breaker')) {
            showNotification('Service temporarily unavailable. Please try again in a few minutes.', 'error');
        } else {
            showNotification('Error finding wellness walks. Please try again.', 'error');
        }
    } finally {
        // Reset button state
        btn.classList.remove('loading', 'error');
        btn.innerHTML = '<i data-lucide="map"></i> <span>Wellness Walk</span>';
        lucide.createIcons({ nodes: [btn.querySelector('i')] });
    }
}

function createWellnessMarker(place) {
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#22c55e',
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#ffffff'
        }
    });
    
    allMarkers.push(marker);
    
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 1rem; font-family: 'Inter', sans-serif; max-width: 300px;">
                <h3 style="margin: 0 0 0.75rem 0; color: #1f2937; font-size: 1.125rem;">${place.name}</h3>
                <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;"><strong>Type:</strong> Wellness Location</p>
                <p style="margin: 0 0 0.75rem 0; color: #6b7280; font-size: 0.875rem;"><strong>Rating:</strong> ${place.rating || 'N/A'} ⭐</p>
                <button onclick="getDirections('${place.place_id}')" 
                    style="background: #22c55e; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500;">
                    Start Walking
                </button>
            </div>
        `
    });
    
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
}

// --- Emergency Resources ---
function showEmergencyResources() {
    const modalHTML = `
        <div class="modal-backdrop visible" id="emergency-modal">
            <div class="modal-content">
                <button class="modal-close-btn" id="close-emergency-modal"><i data-lucide="x"></i></button>
                <h3 style="color: #ef4444;">🚨 Emergency Mental Health Resources</h3>
                <div style="margin: 1.5rem 0;">
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        <h4 style="color: #dc2626; margin-bottom: 0.5rem;">Crisis Hotlines</h4>
                        <p><strong>National Suicide Prevention Lifeline:</strong> <a href="tel:988" style="color: #dc2626;">988</a></p>
                        <p><strong>Crisis Text Line:</strong> Text HOME to <a href="sms:741741" style="color: #dc2626;">741741</a></p>
                    </div>
                    <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        <h4 style="color: #d97706; margin-bottom: 0.5rem;">24/7 Support</h4>
                        <p><strong>SAMHSA National Helpline:</strong> <a href="tel:1-800-662-4357" style="color: #d97706;">1-800-662-HELP</a></p>
                        <p><strong>NAMI HelpLine:</strong> <a href="tel:1-800-950-6264" style="color: #d97706;">1-800-950-NAMI</a></p>
                    </div>
                    <div style="background: #dbeafe; border: 1px solid #bfdbfe; border-radius: 8px; padding: 1rem;">
                        <h4 style="color: #2563eb; margin-bottom: 0.5rem;">Online Resources</h4>
                        <p><a href="https://suicidepreventionlifeline.org" target="_blank" style="color: #2563eb;">Suicide Prevention Lifeline</a></p>
                        <p><a href="https://www.nami.org" target="_blank" style="color: #2563eb;">National Alliance on Mental Illness</a></p>
                    </div>
                </div>
                <p style="font-size: 0.875rem; color: #6b7280; text-align: center;">
                    If you're in immediate danger, please call 911 or go to your nearest emergency room.
                </p>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    lucide.createIcons({ nodes: [document.getElementById('close-emergency-modal')] });
    
    const modal = document.getElementById('emergency-modal');
    modal.querySelector('#close-emergency-modal').addEventListener('click', () => {
        modal.classList.remove('visible');
        setTimeout(() => modal.remove(), 300);
    });
    modal.addEventListener('click', (e) => {
        if (e.target.id === 'emergency-modal') {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// --- Analytics Functions ---
function showAnalytics() {
    const panel = document.getElementById('analytics-panel');
    panel.classList.remove('hidden');
    updateAnalytics();
}

function closeAnalytics() {
    const panel = document.getElementById('analytics-panel');
    panel.classList.add('hidden');
}

function updateAnalytics() {
    if (moodData.length === 0) {
        document.getElementById('insights-text').textContent = 'No mood data available yet. Start tracking your mood to see insights!';
        return;
    }
    
    // Create mood chart
    const ctx = document.getElementById('mood-chart').getContext('2d');
    if (moodChart) {
        moodChart.destroy();
    }
    
    const last7Days = moodData.slice(0, 7).reverse();
    const labels = last7Days.map(entry => {
        const date = entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp);
        return date.toLocaleDateString();
    });
    const data = last7Days.map(entry => entry.mood);
    
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood',
                data: data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Generate insights
    const avgMood = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(1);
    const trend = data.length > 1 ? (data[data.length - 1] - data[0] > 0 ? 'improving' : 'declining') : 'stable';
    
    document.getElementById('insights-text').innerHTML = `
        <p><strong>Average mood this week:</strong> ${avgMood}/5</p>
        <p><strong>Trend:</strong> Your mood appears to be ${trend} over the past week.</p>
        <p><strong>Total entries:</strong> ${moodData.length}</p>
        <p style="margin-top: 1rem; font-style: italic;">Keep tracking your mood to get more detailed insights about patterns and triggers.</p>
    `;
}

function updateMoodHeatmap() {
    // This would create a heatmap visualization
    console.log('Mood heatmap updated with', moodData.length, 'data points');
}

function toggleMoodHeatmap() {
    if (moodData.length === 0) {
        showNotification('No mood data available for heatmap.', 'info');
        return;
    }
    
    // Toggle heatmap visibility
    if (moodHeatmap) {
        moodHeatmap.setMap(moodHeatmap.getMap() ? null : map);
        const btn = document.getElementById('toggle-heatmap');
        btn.innerHTML = moodHeatmap.getMap() ? 
            '<i data-lucide="thermometer"></i> <span>Hide Heatmap</span>' : 
            '<i data-lucide="thermometer"></i> <span>Show Heatmap</span>';
        lucide.createIcons({ nodes: [btn.querySelector('i')] });
    } else {
        createMoodHeatmap();
    }
}

function createMoodHeatmap() {
    const heatmapData = moodData.map(entry => {
        if (entry.location && entry.location.latitude && entry.location.longitude) {
            return {
                location: new google.maps.LatLng(entry.location.latitude, entry.location.longitude),
                weight: entry.mood
            };
        }
        return null;
    }).filter(item => item !== null);
    
    if (heatmapData.length === 0) {
        showNotification('No location data available for heatmap.', 'info');
        return;
    }
    
    moodHeatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map
    });
    
    const btn = document.getElementById('toggle-heatmap');
    btn.innerHTML = '<i data-lucide="thermometer"></i> <span>Hide Heatmap</span>';
    lucide.createIcons({ nodes: [btn.querySelector('i')] });
    
    showNotification('Mood heatmap displayed!', 'success');
}

// --- Connection Testing & Simple Search Fallbacks ---

let connectionQuality = 'unknown';
let useSimpleSearch = false;
let useLegacySearch = false;

async function testConnectionSpeed() {
    console.log('Testing connection quality...');
    const startTime = performance.now();
    
    try {
        // Test with a small Google resource
        const response = await fetch('https://www.google.com/favicon.ico', { 
            method: 'HEAD',
            cache: 'no-cache'
        });
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (responseTime < 1000) {
            connectionQuality = 'good';
            console.log(`Connection quality: GOOD (${responseTime.toFixed(0)}ms)`);
        } else if (responseTime < 3000) {
            connectionQuality = 'slow';
            useSimpleSearch = true;
            console.log(`Connection quality: SLOW (${responseTime.toFixed(0)}ms) - enabling simplified search`);
        } else {
            connectionQuality = 'poor';
            useSimpleSearch = true;
            console.log(`Connection quality: POOR (${responseTime.toFixed(0)}ms) - enabling simplified search`);
        }
        
    } catch (error) {
        connectionQuality = 'offline';
        useSimpleSearch = true;
        console.log('Connection quality: OFFLINE - enabling simplified search');
    }
    
    // Adjust search service based on connection
    if (searchService && useSimpleSearch) {
        searchService.minRequestInterval = 5000; // 5 second delays for slow connections
        console.log('Adjusted search delays for slow connection');
    }
}

// Simple search that works with weak connections
async function forceSimpleSearch(location, searchType) {
    if (!placesService || !location) {
        return [];
    }
    
    console.log(`Performing simple ${searchType} search...`);
    
    // Single, simple request with longer timeout
    const simpleRequest = {
        location: location,
        radius: searchType === 'mentalHealth' ? 10000 : 5000,
        keyword: searchType === 'mentalHealth' ? 'health clinic' : 'park'
    };
    
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.log('Simple search timed out');
            resolve([]);
        }, 45000); // 45 second timeout for slow connections
        
        placesService.nearbySearch(simpleRequest, (results, status) => {
            clearTimeout(timeout);
            console.log(`Simple search result: ${status}, ${results?.length || 0} places`);
            
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results || []);
            } else {
                resolve([]);
            }
        });
    });
}

// Optimized search function for slow connections
async function performOptimizedSearch(location, searchType) {
    console.log(`Connection quality: ${connectionQuality}`);
    
    // For poor connections, use simple search immediately
    if (connectionQuality === 'poor' || connectionQuality === 'offline') {
        console.log('Using simple search due to poor connection');
        return await forceSimpleSearch(location, searchType);
    }
    
    // For slow connections, try simple search first, then fallback
    if (connectionQuality === 'slow' || useSimpleSearch) {
        console.log('Trying simple search first due to slow connection');
        const simpleResults = await forceSimpleSearch(location, searchType);
        
        if (simpleResults.length > 0) {
            return simpleResults;
        }
        
        console.log('Simple search failed, falling back to robust search');
    }
    
    // Use robust search for good connections or as fallback
    try {
        return await searchService.searchWithFallbacks(location, searchType);
    } catch (error) {
        console.warn('Robust search failed, trying simple search as last resort');
        return await forceSimpleSearch(location, searchType);
    }
}

// --- API Diagnostic and Legacy Search Functions ---

async function testBasicPlacesAPI() {
    if (!placesService || !userLocation) {
        console.error('Places service or user location not available');
        return false;
    }
    
    console.log('🔍 Testing basic Places API functionality...');
    console.log('User location:', userLocation);
    
    const testRequest = {
        location: userLocation,
        radius: 1000,
        type: ['store']
    };
    
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.error('❌ Basic API test timed out');
            resolve(false);
        }, 10000);
        
        placesService.nearbySearch(testRequest, (results, status) => {
            clearTimeout(timeout);
            
            console.log(`🔍 API Test Result: ${status}`);
            console.log(`📍 Results found: ${results?.length || 0}`);
            
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log('✅ Places API is working correctly');
                if (results && results.length > 0) {
                    console.log('📋 Sample result:', results[0].name);
                }
                resolve(true);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.log('⚠️ API working but no results found');
                resolve(true);
            } else {
                console.error(`❌ API Error: ${status}`);
                resolve(false);
            }
        });
    });
}

// Modern Places API search using the new google.maps.places.Place
async function modernPlacesAPISearch(location, searchType) {
    console.log(`🆕 Using NEW Google Places API for ${searchType}`);
    
    if (!google.maps.places.Place) {
        console.error('New Places API not available');
        return [];
    }
    
    const searchQueries = searchType === 'mentalHealth' ? 
        ['mental health clinic', 'therapist', 'counseling center'] :
        ['park', 'recreation area', 'walking trail'];
    
    const allResults = [];
    
    for (const query of searchQueries) {
        try {
            console.log(`🔍 Searching for: ${query}`);
            
            const request = {
                textQuery: query,
                fields: ['displayName', 'location', 'rating', 'formattedAddress', 'id', 'currentOpeningHours'],
                locationBias: {
                    center: location,
                    radius: 5000
                },
                maxResultCount: 10
            };
            
            const result = await google.maps.places.Place.searchByText(request);
            
            if (result.places && result.places.length > 0) {
                console.log(`✅ Found ${result.places.length} results for "${query}"`);
                
                // Convert new format to old format for compatibility
                const convertedResults = result.places.map(place => ({
                    place_id: place.id,
                    name: place.displayName?.text || place.displayName,
                    vicinity: place.formattedAddress,
                    rating: place.rating,
                    geometry: {
                        location: place.location
                    },
                    opening_hours: place.currentOpeningHours ? {
                        open_now: place.currentOpeningHours.openNow
                    } : null
                }));
                
                allResults.push(...convertedResults);
            } else {
                console.log(`⚠️ No results for "${query}"`);
            }
            
            // Small delay between searches
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`❌ Modern API search failed for "${query}":`, error.message);
        }
    }
    
    // Remove duplicates
    const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.place_id === result.place_id)
    );
    
    console.log(`🆕 Modern API search completed: ${uniqueResults.length} unique results`);
    return uniqueResults;
}

// Fallback to old API (will show deprecation warning but might still work)
async function legacyPlacesAPISearch(location, searchType) {
    console.log(`🔄 Using LEGACY Google Places API for ${searchType}`);
    
    if (!placesService) {
        console.error('PlacesService not available');
        return [];
    }
    
    const searchQuery = searchType === 'mentalHealth' ? 'health clinic' : 'park';
    
    const request = {
        location: location,
        radius: 5000,
        keyword: searchQuery
    };
    
    console.log('🔄 Making legacy search request:', request);
    
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.log('⏰ Legacy search timed out');
            resolve([]);
        }, 15000);
        
        try {
            placesService.nearbySearch(request, (results, status) => {
                clearTimeout(timeout);
                
                console.log(`🔄 Legacy search response: ${status}, ${results?.length || 0} results`);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    console.log('✅ Legacy search successful');
                    resolve(results);
                } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    console.log('⚠️ Legacy search: no results found');
                    resolve([]);
                } else {
                    console.error(`❌ Legacy search failed with status: ${status}`);
                    resolve([]);
                }
            });
        } catch (error) {
            clearTimeout(timeout);
            console.error('❌ Legacy search exception:', error);
            resolve([]);
        }
    });
}

// Legacy search mode - like your working beta version
async function legacySearch(location, searchType) {
    console.log(`🔄 Using legacy search mode for ${searchType}`);
    
    const searchQueries = searchType === 'mentalHealth' ? 
        ['therapist', 'counseling', 'mental health'] :
        ['park', 'recreation', 'walking trail'];
    
    const allResults = [];
    
    for (const query of searchQueries) {
        const request = {
            location: location,
            radius: 5000,
            keyword: query
        };
        
        try {
            const results = await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.log(`⏰ Legacy search timeout for: ${query}`);
                    resolve([]);
                }, 15000); // Increased timeout
                
                placesService.nearbySearch(request, (results, status) => {
                    clearTimeout(timeout);
                    console.log(`🔍 Legacy search for "${query}": ${status}, ${results?.length || 0} results`);
                    
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        resolve(results || []);
                    } else {
                        console.warn(`Legacy search status: ${status}`);
                        resolve([]);
                    }
                });
            });
            
            allResults.push(...results);
            
            // Small delay between queries
            await new Promise(resolve => setTimeout(resolve, 1500));
            
        } catch (error) {
            console.warn(`Legacy search failed for ${query}:`, error);
        }
    }
    
    // Remove duplicates
    const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.place_id === result.place_id)
    );
    
    console.log(`🔄 Legacy search completed: ${uniqueResults.length} unique results`);
    return uniqueResults;
}

// Updated optimized search - prioritize simple working approach
async function performOptimizedSearch(location, searchType) {
    console.log(`🔍 Starting search for ${searchType} - Connection: ${connectionQuality}`);
    
    // If legacy mode is enabled, use it directly
    if (useLegacySearch) {
        console.log('🔄 Using legacy search mode (beta version style)');
        return await legacySearch(location, searchType);
    }
    
    // First try: Modern Places API (most likely to work with new API keys)
    try {
        console.log('🆕 Trying modern Places API first');
        const modernResults = await modernPlacesAPISearch(location, searchType);
        
        if (modernResults.length > 0) {
            console.log(`✅ Modern Places API success: ${modernResults.length} results`);
            return modernResults;
        } else {
            console.log('⚠️ Modern Places API returned no results');
        }
    } catch (error) {
        console.warn('🆕 Modern Places API failed:', error.message);
    }
    
    // Second try: Simple working search (fallback)
    try {
        console.log('🔧 Trying simple working search as fallback');
        const simpleResults = await simpleWorkingSearch(location, searchType);
        
        if (simpleResults.length > 0) {
            console.log(`✅ Simple working search success: ${simpleResults.length} results`);
            return simpleResults;
        } else {
            console.log('⚠️ Simple working search returned no results');
        }
    } catch (error) {
        console.warn('🔧 Simple working search failed:', error.message);
    }
    
    // Second try: Legacy search (your beta approach)
    try {
        console.log('🔄 Trying legacy search');
        const legacyResults = await legacySearch(location, searchType);
        
        if (legacyResults.length > 0) {
            console.log(`✅ Legacy search success: ${legacyResults.length} results`);
            return legacyResults;
        }
    } catch (error) {
        console.warn('🔄 Legacy search failed:', error.message);
    }
    
    // Third try: Force simple search (from original implementation)
    try {
        console.log('📶 Trying force simple search');
        const forceResults = await forceSimpleSearch(location, searchType);
        
        if (forceResults.length > 0) {
            console.log(`✅ Force simple search success: ${forceResults.length} results`);
            return forceResults;
        }
    } catch (error) {
        console.warn('📶 Force simple search failed:', error.message);
    }
    
    console.error('❌ All search methods failed');
    return [];
}

// Test the API key directly with REST API
async function testAPIKeyDirectly() {
    console.log('🔑 Testing API key directly...');
    
    const apiKey = 'AIzaSyDll2jvuvURfgbfs9JV4Iiuoh1IYBKsztU';
    const testLocation = userLocation || { lat: 40.7128, lng: -74.0060 };
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${testLocation.lat},${testLocation.lng}&radius=1000&type=store&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('🔑 Direct API test response:', data);
        
        if (data.status === 'OK') {
            console.log('✅ API key works! Found', data.results?.length || 0, 'results');
        } else if (data.status === 'ZERO_RESULTS') {
            console.log('✅ API key works but no results found');
        } else {
            console.error('❌ API Error:', data.status, data.error_message);
        }
    } catch (error) {
        console.error('❌ Direct API test failed:', error);
        console.log('⚠️ This might be a CORS issue - normal for browser requests');
    }
}

// Simple diagnostic function to check everything
async function runFullDiagnostic() {
    console.log('🔍 Running full diagnostic...');
    
    // Check if Google Maps loaded
    if (typeof google === 'undefined') {
        console.error('❌ Google Maps JavaScript API not loaded');
        return;
    }
    
    // Check if places service exists
    if (!placesService) {
        console.error('❌ Places service not initialized');
        return;
    }
    
    // Check user location
    if (!userLocation) {
        console.error('❌ User location not available');
        return;
    }
    
    console.log('✅ Google Maps API loaded');
    console.log('✅ Places service initialized');
    console.log('✅ User location available:', userLocation);
    
    // Test the actual search
    console.log('🔍 Testing actual search...');
    
    const testRequest = {
        location: userLocation,
        radius: 1000,
        type: ['store']
    };
    
    placesService.nearbySearch(testRequest, (results, status) => {
        console.log('🔍 Test search result:', {
            status: status,
            results: results?.length || 0,
            firstResult: results?.[0]?.name || 'None'
        });
        
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log('✅ Places API is working correctly!');
            console.log('🎯 The issue might be with your specific search terms or parameters');
        } else {
            console.error('❌ Places API error:', status);
        }
    });
}
