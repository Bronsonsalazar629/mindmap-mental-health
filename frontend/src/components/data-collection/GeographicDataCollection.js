/**
 * Geographic Data Collection System
 * Automatic coordinate capture with manual override and privacy controls
 */

class GeographicDataCollection {
    constructor() {
        this.currentLocation = null;
        this.locationAccuracy = null;
        this.locationTimestamp = null;
        this.manualOverride = false;
        this.privacyLevel = 'precise'; // precise, approximate, area_only, none
        this.locationHistory = [];
        this.isTracking = false;
        this.watchId = null;
        this.geocodingCache = new Map();
        
        this.initializeLocationServices();
    }

    // Initialize location services
    async initializeLocationServices() {
        try {
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by this browser');
            }

            // Check permissions
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            this.handlePermissionState(permission.state);

            // Listen for permission changes
            permission.addEventListener('change', () => {
                this.handlePermissionState(permission.state);
            });

        } catch (error) {
            console.error('Failed to initialize location services:', error);
            this.showLocationError(error.message);
        }
    }

    // Handle permission state changes
    handlePermissionState(state) {
        const statusElement = document.getElementById('location-status');
        if (!statusElement) return;

        switch (state) {
            case 'granted':
                statusElement.innerHTML = '✅ Location access granted';
                statusElement.className = 'location-status granted';
                this.startLocationTracking();
                break;
            case 'denied':
                statusElement.innerHTML = '❌ Location access denied';
                statusElement.className = 'location-status denied';
                this.showManualLocationInput();
                break;
            case 'prompt':
                statusElement.innerHTML = '❓ Location permission needed';
                statusElement.className = 'location-status prompt';
                break;
        }
    }

    // Start automatic location tracking
    startLocationTracking() {
        if (this.isTracking) return;

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // 1 minute
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handleLocationUpdate(position),
            (error) => this.handleLocationError(error),
            options
        );

        this.isTracking = true;
    }

    // Stop location tracking
    stopLocationTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
    }

    // Handle location updates
    async handleLocationUpdate(position) {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toISOString(),
            source: 'gps'
        };

        // Apply privacy filtering
        const filteredLocation = this.applyPrivacyFilter(location);
        
        this.currentLocation = filteredLocation;
        this.locationAccuracy = position.coords.accuracy;
        this.locationTimestamp = location.timestamp;

        // Update UI
        this.updateLocationDisplay(filteredLocation);

        // Reverse geocode if needed
        try {
            const addressInfo = await this.reverseGeocode(filteredLocation.latitude, filteredLocation.longitude);
            this.updateAddressDisplay(addressInfo);
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
        }

        // Store in location history
        this.addToLocationHistory(filteredLocation);
    }

    // Handle location errors
    handleLocationError(error) {
        let message = 'Unknown location error';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Location access denied by user';
                this.showManualLocationInput();
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Location information unavailable';
                break;
            case error.TIMEOUT:
                message = 'Location request timed out';
                break;
        }

        this.showLocationError(message);
    }

    // Apply privacy filtering based on user preferences
    applyPrivacyFilter(location) {
        const filtered = { ...location };

        switch (this.privacyLevel) {
            case 'precise':
                // No filtering - full precision
                break;
            case 'approximate':
                // Round to ~100m precision
                filtered.latitude = Math.round(location.latitude * 1000) / 1000;
                filtered.longitude = Math.round(location.longitude * 1000) / 1000;
                filtered.accuracy = Math.max(filtered.accuracy, 100);
                break;
            case 'area_only':
                // Round to ~1km precision
                filtered.latitude = Math.round(location.latitude * 100) / 100;
                filtered.longitude = Math.round(location.longitude * 100) / 100;
                filtered.accuracy = Math.max(filtered.accuracy, 1000);
                break;
            case 'none':
                // Remove coordinates entirely
                delete filtered.latitude;
                delete filtered.longitude;
                filtered.privacy_applied = true;
                break;
        }

        filtered.privacy_level = this.privacyLevel;
        return filtered;
    }

    // Reverse geocode coordinates to address
    async reverseGeocode(latitude, longitude) {
        const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
        
        // Check cache first
        if (this.geocodingCache.has(cacheKey)) {
            return this.geocodingCache.get(cacheKey);
        }

        try {
            // Use multiple geocoding services for reliability
            let result = null;

            // Try OpenStreetMap Nominatim first (free)
            try {
                result = await this.geocodeWithNominatim(latitude, longitude);
            } catch (error) {
                console.warn('Nominatim geocoding failed:', error);
            }

            // Fallback to browser's built-in geocoding if available
            if (!result && window.google && window.google.maps) {
                result = await this.geocodeWithGoogle(latitude, longitude);
            }

            // Cache the result
            if (result) {
                this.geocodingCache.set(cacheKey, result);
            }

            return result;
        } catch (error) {
            console.error('All geocoding services failed:', error);
            return null;
        }
    }

    // Geocode with OpenStreetMap Nominatim
    async geocodeWithNominatim(latitude, longitude) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'MindMap Research Platform'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        return {
            formatted_address: data.display_name,
            components: {
                street_number: data.address?.house_number,
                street_name: data.address?.road,
                neighborhood: data.address?.neighbourhood || data.address?.suburb,
                city: data.address?.city || data.address?.town || data.address?.village,
                state: data.address?.state,
                postal_code: data.address?.postcode,
                country: data.address?.country
            },
            place_type: data.type,
            confidence: data.importance || 0.5,
            source: 'nominatim'
        };
    }

    // Geocode with Google Maps (if available)
    async geocodeWithGoogle(latitude, longitude) {
        return new Promise((resolve, reject) => {
            const geocoder = new google.maps.Geocoder();
            const latlng = { lat: latitude, lng: longitude };

            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const result = results[0];
                    const components = {};
                    
                    result.address_components.forEach(component => {
                        const types = component.types;
                        if (types.includes('street_number')) {
                            components.street_number = component.long_name;
                        } else if (types.includes('route')) {
                            components.street_name = component.long_name;
                        } else if (types.includes('neighborhood')) {
                            components.neighborhood = component.long_name;
                        } else if (types.includes('locality')) {
                            components.city = component.long_name;
                        } else if (types.includes('administrative_area_level_1')) {
                            components.state = component.short_name;
                        } else if (types.includes('postal_code')) {
                            components.postal_code = component.long_name;
                        } else if (types.includes('country')) {
                            components.country = component.long_name;
                        }
                    });

                    resolve({
                        formatted_address: result.formatted_address,
                        components,
                        place_type: result.types[0],
                        confidence: 1.0,
                        source: 'google'
                    });
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
    }

    // Create geographic data collection UI
    createGeographicUI() {
        const container = document.createElement('div');
        container.className = 'geographic-collection-container';
        container.innerHTML = `
            <div class="geo-header">
                <h3>Location Information</h3>
                <div class="privacy-controls">
                    <label for="privacy-level">Privacy Level:</label>
                    <select id="privacy-level" class="privacy-selector">
                        <option value="precise">Precise (research quality)</option>
                        <option value="approximate">Approximate (~100m)</option>
                        <option value="area_only">General area (~1km)</option>
                        <option value="none">No location data</option>
                    </select>
                </div>
            </div>

            <div id="location-status" class="location-status">
                🔄 Detecting location...
            </div>

            <div class="location-display">
                <div class="current-location">
                    <h4>Current Location</h4>
                    <div id="coordinates-display" class="coordinates">
                        <span class="coord-label">Coordinates:</span>
                        <span id="coord-text">Acquiring...</span>
                    </div>
                    <div id="address-display" class="address">
                        <span class="address-label">Address:</span>
                        <span id="address-text">Looking up...</span>
                    </div>
                    <div id="accuracy-display" class="accuracy">
                        <span class="accuracy-label">Accuracy:</span>
                        <span id="accuracy-text">Unknown</span>
                    </div>
                </div>

                <div class="manual-override" id="manual-override" style="display: none;">
                    <h4>Manual Location Entry</h4>
                    <div class="manual-inputs">
                        <div class="input-group">
                            <label for="manual-latitude">Latitude:</label>
                            <input type="number" id="manual-latitude" step="any" 
                                   placeholder="e.g., 40.7128" class="coord-input">
                        </div>
                        <div class="input-group">
                            <label for="manual-longitude">Longitude:</label>
                            <input type="number" id="manual-longitude" step="any" 
                                   placeholder="e.g., -74.0060" class="coord-input">
                        </div>
                        <div class="input-group">
                            <label for="manual-address">Address (optional):</label>
                            <input type="text" id="manual-address" 
                                   placeholder="Enter address or landmark" class="address-input">
                        </div>
                        <button id="set-manual-location" class="set-location-btn">
                            Set Location
                        </button>
                        <button id="use-auto-location" class="auto-location-btn">
                            Use Automatic Location
                        </button>
                    </div>
                </div>
            </div>

            <div class="location-validation" id="location-validation">
                <!-- Validation feedback will appear here -->
            </div>

            <div class="location-options">
                <label class="checkbox-option">
                    <input type="checkbox" id="save-location-history">
                    <span>Save location history for longitudinal analysis</span>
                </label>
                <label class="checkbox-option">
                    <input type="checkbox" id="background-tracking">
                    <span>Allow background location tracking during study period</span>
                </label>
            </div>
        `;

        this.attachEventListeners(container);
        return container;
    }

    // Attach event listeners
    attachEventListeners(container) {
        // Privacy level selector
        const privacySelector = container.querySelector('#privacy-level');
        privacySelector.addEventListener('change', (e) => {
            this.privacyLevel = e.target.value;
            this.handlePrivacyLevelChange();
        });

        // Manual location inputs
        const setLocationBtn = container.querySelector('#set-manual-location');
        setLocationBtn.addEventListener('click', () => {
            this.setManualLocation();
        });

        const useAutoBtn = container.querySelector('#use-auto-location');
        useAutoBtn.addEventListener('click', () => {
            this.enableAutomaticLocation();
        });

        // Coordinate inputs validation
        const latInput = container.querySelector('#manual-latitude');
        const lonInput = container.querySelector('#manual-longitude');
        
        [latInput, lonInput].forEach(input => {
            input.addEventListener('input', () => {
                this.validateCoordinateInputs();
            });
        });

        // Location history checkbox
        const historyCheckbox = container.querySelector('#save-location-history');
        historyCheckbox.addEventListener('change', (e) => {
            this.saveLocationHistory = e.target.checked;
        });
    }

    // Handle privacy level changes
    handlePrivacyLevelChange() {
        if (this.currentLocation) {
            const filteredLocation = this.applyPrivacyFilter(this.currentLocation);
            this.updateLocationDisplay(filteredLocation);
        }

        // Show/hide manual override based on privacy level
        const manualOverride = document.getElementById('manual-override');
        if (this.privacyLevel === 'none') {
            manualOverride.style.display = 'block';
        }
    }

    // Set manual location
    setManualLocation() {
        const latInput = document.getElementById('manual-latitude');
        const lonInput = document.getElementById('manual-longitude');
        const addressInput = document.getElementById('manual-address');

        const latitude = parseFloat(latInput.value);
        const longitude = parseFloat(lonInput.value);

        if (this.validateCoordinates(latitude, longitude)) {
            this.currentLocation = {
                latitude,
                longitude,
                accuracy: null,
                timestamp: new Date().toISOString(),
                source: 'manual',
                manual_address: addressInput.value
            };

            this.manualOverride = true;
            this.updateLocationDisplay(this.currentLocation);
            this.showLocationSuccess('Manual location set successfully');
        }
    }

    // Enable automatic location
    enableAutomaticLocation() {
        this.manualOverride = false;
        document.getElementById('manual-override').style.display = 'none';
        this.startLocationTracking();
    }

    // Show manual location input
    showManualLocationInput() {
        const manualOverride = document.getElementById('manual-override');
        if (manualOverride) {
            manualOverride.style.display = 'block';
        }
    }

    // Validate coordinates
    validateCoordinates(latitude, longitude) {
        const errors = [];

        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            errors.push('Latitude must be between -90 and 90');
        }

        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            errors.push('Longitude must be between -180 and 180');
        }

        this.showValidationFeedback(errors);
        return errors.length === 0;
    }

    // Validate coordinate inputs in real-time
    validateCoordinateInputs() {
        const latInput = document.getElementById('manual-latitude');
        const lonInput = document.getElementById('manual-longitude');
        
        const latitude = parseFloat(latInput.value);
        const longitude = parseFloat(lonInput.value);

        const isValid = this.validateCoordinates(latitude, longitude);
        
        const setBtn = document.getElementById('set-manual-location');
        setBtn.disabled = !isValid;
    }

    // Update location display
    updateLocationDisplay(location) {
        const coordText = document.getElementById('coord-text');
        const accuracyText = document.getElementById('accuracy-text');

        if (location.latitude && location.longitude) {
            coordText.textContent = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
        } else {
            coordText.textContent = 'Privacy level: No coordinates';
        }

        if (location.accuracy) {
            accuracyText.textContent = `±${Math.round(location.accuracy)}m`;
        } else {
            accuracyText.textContent = location.source === 'manual' ? 'Manual entry' : 'Unknown';
        }
    }

    // Update address display
    updateAddressDisplay(addressInfo) {
        const addressText = document.getElementById('address-text');
        if (addressInfo && addressInfo.formatted_address) {
            addressText.textContent = addressInfo.formatted_address;
        } else {
            addressText.textContent = 'Address lookup failed';
        }
    }

    // Show location error
    showLocationError(message) {
        this.showValidationFeedback([message], 'error');
    }

    // Show location success
    showLocationSuccess(message) {
        this.showValidationFeedback([message], 'success');
    }

    // Show validation feedback
    showValidationFeedback(messages, type = 'error') {
        const feedbackElement = document.getElementById('location-validation');
        if (!feedbackElement) return;

        if (messages.length === 0) {
            feedbackElement.style.display = 'none';
            return;
        }

        const className = type === 'error' ? 'validation-error' : 'validation-success';
        const icon = type === 'error' ? '❌' : '✅';

        feedbackElement.innerHTML = messages.map(message => 
            `<div class="${className}">${icon} ${message}</div>`
        ).join('');
        feedbackElement.style.display = 'block';
    }

    // Add to location history
    addToLocationHistory(location) {
        if (!this.saveLocationHistory) return;

        this.locationHistory.push({
            ...location,
            session_timestamp: new Date().toISOString()
        });

        // Limit history size to prevent memory issues
        if (this.locationHistory.length > 100) {
            this.locationHistory = this.locationHistory.slice(-100);
        }

        // Save to localStorage
        localStorage.setItem('location_history', JSON.stringify(this.locationHistory));
    }

    // Get location data for submission
    getLocationData() {
        return {
            current_location: this.currentLocation,
            location_accuracy: this.locationAccuracy,
            location_timestamp: this.locationTimestamp,
            manual_override: this.manualOverride,
            privacy_level: this.privacyLevel,
            location_history: this.saveLocationHistory ? this.locationHistory : [],
            metadata: {
                geolocation_supported: !!navigator.geolocation,
                permission_state: this.getPermissionState(),
                tracking_duration: this.getTrackingDuration()
            }
        };
    }

    // Get current permission state
    async getPermissionState() {
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            return permission.state;
        } catch (error) {
            return 'unknown';
        }
    }

    // Get tracking duration
    getTrackingDuration() {
        if (!this.locationTimestamp) return 0;
        
        const start = new Date(this.locationTimestamp);
        const now = new Date();
        return now.getTime() - start.getTime();
    }

    // Clean up resources
    destroy() {
        this.stopLocationTracking();
        this.geocodingCache.clear();
    }
}

// Export for use in other modules
window.GeographicDataCollection = GeographicDataCollection;