/**
 * Facility Map Markers Component
 * Manages mental health facility markers on Google Maps
 */

class FacilityMapMarkers {
    constructor(map, facilitiesAPI) {
        this.map = map;
        this.facilitiesAPI = facilitiesAPI;
        this.facilityMarkers = [];
        this.facilityInfoWindows = [];
        this.currentInfoWindow = null;
        
        // Marker clustering for better performance
        this.markerCluster = null;
        this.clustererOptions = {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            gridSize: 50,
            maxZoom: 15
        };

        this.facilityIcons = {
            hospital: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#dc2626', // Red for hospitals
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 8
            },
            outpatient: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#2563eb', // Blue for outpatient
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 8
            },
            crisis_center: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#ea580c', // Orange for crisis centers
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 10
            },
            community_center: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#16a34a', // Green for community centers
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 8
            },
            residential: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#7c3aed', // Purple for residential
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 8
            },
            default: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#6b7280', // Gray for default
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 8
            }
        };
    }

    /**
     * Add facility markers to the map
     * @param {Array} facilities - Array of facility objects
     */
    addFacilityMarkers(facilities) {
        this.clearFacilityMarkers();

        facilities.forEach(facility => {
            if (facility.coordinates && facility.coordinates.length === 2) {
                this.createFacilityMarker(facility);
            }
        });

        // Initialize marker clustering if we have many markers
        if (this.facilityMarkers.length > 10) {
            this.initializeMarkerClustering();
        }

        console.log(`Added ${this.facilityMarkers.length} facility markers to map`);
    }

    /**
     * Create a single facility marker
     * @param {Object} facility - Facility data
     */
    createFacilityMarker(facility) {
        const position = {
            lat: facility.coordinates[0],
            lng: facility.coordinates[1]
        };

        // Select appropriate icon based on facility type
        const icon = this.facilityIcons[facility.facility_type] || this.facilityIcons.default;

        const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: facility.name,
            icon: icon,
            animation: google.maps.Animation.DROP,
            zIndex: this.getFacilityPriority(facility)
        });

        // Create info window content
        const infoWindow = this.createFacilityInfoWindow(facility);

        // Add click listener
        marker.addListener('click', () => {
            // Close any existing info window
            if (this.currentInfoWindow) {
                this.currentInfoWindow.close();
            }
            
            infoWindow.open(this.map, marker);
            this.currentInfoWindow = infoWindow;
            
            // Track interaction analytics
            this.trackFacilityInteraction(facility, 'marker_click');
        });

        // Add hover listeners for better UX
        marker.addListener('mouseover', () => {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        });

        marker.addListener('mouseout', () => {
            marker.setAnimation(null);
        });

        this.facilityMarkers.push(marker);
        this.facilityInfoWindows.push(infoWindow);

        return marker;
    }

    /**
     * Create info window content for facility
     * @param {Object} facility - Facility data
     * @returns {google.maps.InfoWindow} Info window instance
     */
    createFacilityInfoWindow(facility) {
        const content = `
            <div class="facility-info-window" style="padding: 1rem; font-family: 'Inter', sans-serif; max-width: 320px; line-height: 1.4;">
                <div style="margin-bottom: 0.75rem;">
                    <h3 style="margin: 0 0 0.5rem 0; color: #1f2937; font-size: 1.125rem; font-weight: 600;">
                        ${this.escapeHtml(facility.name)}
                    </h3>
                    ${facility.facility_type ? `<span class="facility-type-badge" style="display: inline-block; background: ${this.getFacilityTypeColor(facility.facility_type)}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; text-transform: capitalize;">
                        ${facility.facility_type.replace('_', ' ')}
                    </span>` : ''}
                </div>
                
                ${facility.full_address ? `<p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;">
                    <i data-lucide="map-pin" style="width: 14px; height: 14px; vertical-align: text-top; margin-right: 4px;"></i>
                    ${this.escapeHtml(facility.full_address)}
                </p>` : ''}
                
                ${facility.phone ? `<p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;">
                    <i data-lucide="phone" style="width: 14px; height: 14px; vertical-align: text-top; margin-right: 4px;"></i>
                    <a href="tel:${facility.phone}" style="color: #2563eb; text-decoration: none;">${facility.phone}</a>
                </p>` : ''}
                
                ${facility.distance_miles ? `<p style="margin: 0 0 0.75rem 0; color: #6b7280; font-size: 0.875rem;">
                    <i data-lucide="navigation" style="width: 14px; height: 14px; vertical-align: text-top; margin-right: 4px;"></i>
                    ${facility.distance_miles.toFixed(1)} miles away
                </p>` : ''}
                
                ${facility.services && facility.services.length > 0 ? `<div style="margin: 0 0 0.75rem 0;">
                    <p style="margin: 0 0 0.25rem 0; color: #374151; font-size: 0.875rem; font-weight: 500;">Services:</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
                        ${facility.services.slice(0, 3).map(service => 
                            `<span style="background: #f3f4f6; color: #374151; padding: 0.125rem 0.375rem; border-radius: 3px; font-size: 0.75rem;">${this.escapeHtml(service)}</span>`
                        ).join('')}
                        ${facility.services.length > 3 ? `<span style="color: #6b7280; font-size: 0.75rem;">+${facility.services.length - 3} more</span>` : ''}
                    </div>
                </div>` : ''}
                
                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <button onclick="window.facilityMapMarkers.getDirectionsToFacility('${facility.facility_id}')" 
                        class="btn-directions"
                        style="flex: 1; background: #2563eb; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                        <i data-lucide="navigation" style="width: 14px; height: 14px;"></i>
                        Get Directions
                    </button>
                    ${facility.phone ? `<button onclick="window.open('tel:${facility.phone}')" 
                        style="background: #16a34a; color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;">
                        <i data-lucide="phone" style="width: 16px; height: 16px;"></i>
                    </button>` : ''}
                    ${facility.website ? `<button onclick="window.open('${facility.website}', '_blank')" 
                        style="background: #6b7280; color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;">
                        <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>
                    </button>` : ''}
                </div>
            </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
            content: content,
            maxWidth: 320
        });

        // Add event listener to initialize Lucide icons when info window opens
        infoWindow.addListener('domready', () => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });

        return infoWindow;
    }

    /**
     * Get facility type color
     * @param {string} facilityType - Facility type
     * @returns {string} Color code
     */
    getFacilityTypeColor(facilityType) {
        const colors = {
            hospital: '#dc2626',
            outpatient: '#2563eb',
            crisis_center: '#ea580c',
            community_center: '#16a34a',
            residential: '#7c3aed',
            default: '#6b7280'
        };
        return colors[facilityType] || colors.default;
    }

    /**
     * Get facility priority for z-index
     * @param {Object} facility - Facility data
     * @returns {number} Priority value
     */
    getFacilityPriority(facility) {
        const priorities = {
            crisis_center: 1000,
            hospital: 900,
            outpatient: 800,
            community_center: 700,
            residential: 600
        };
        
        let priority = priorities[facility.facility_type] || 500;
        
        // Boost priority for verified facilities
        if (facility.is_verified) {
            priority += 50;
        }
        
        return priority;
    }

    /**
     * Clear all facility markers from the map
     */
    clearFacilityMarkers() {
        // Clear marker cluster
        if (this.markerCluster) {
            this.markerCluster.clearMarkers();
            this.markerCluster = null;
        }

        // Close any open info windows
        if (this.currentInfoWindow) {
            this.currentInfoWindow.close();
            this.currentInfoWindow = null;
        }

        // Remove all markers
        this.facilityMarkers.forEach(marker => {
            marker.setMap(null);
        });

        // Clear arrays
        this.facilityMarkers = [];
        this.facilityInfoWindows = [];
    }

    /**
     * Initialize marker clustering
     */
    initializeMarkerClustering() {
        if (typeof MarkerClusterer !== 'undefined' && this.facilityMarkers.length > 0) {
            this.markerCluster = new MarkerClusterer(this.map, this.facilityMarkers, this.clustererOptions);
        }
    }

    /**
     * Filter markers by facility type
     * @param {string|null} facilityType - Facility type to show (null for all)
     */
    filterMarkersByType(facilityType) {
        this.facilityMarkers.forEach(marker => {
            const shouldShow = !facilityType || marker.facilityType === facilityType;
            marker.setVisible(shouldShow);
        });
    }

    /**
     * Get directions to a specific facility
     * @param {string} facilityId - Facility ID
     */
    async getDirectionsToFacility(facilityId) {
        try {
            // Get user's current location
            const userLocation = await this.getCurrentLocation();
            
            // Find the facility
            const facility = await this.facilitiesAPI.getFacilityDetails(facilityId);
            
            if (!facility || !facility.coordinates) {
                throw new Error('Facility location not available');
            }

            // Open Google Maps with directions
            const directionsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${facility.coordinates[0]},${facility.coordinates[1]}`;
            
            window.open(directionsUrl, '_blank');
            
            // Track the directions request
            this.trackFacilityInteraction(facility, 'directions_requested');

        } catch (error) {
            console.error('Error getting directions:', error);
            
            // Fallback: open Google Maps search
            const searchQuery = encodeURIComponent(`${facility.name} ${facility.full_address || ''}`);
            const fallbackUrl = `https://www.google.com/maps/search/${searchQuery}`;
            window.open(fallbackUrl, '_blank');
        }
    }

    /**
     * Get user's current location
     * @returns {Promise<Object>} Location coordinates
     */
    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                error => {
                    console.warn('Could not get current location:', error);
                    // Fallback to map center
                    const center = this.map.getCenter();
                    resolve({
                        lat: center.lat(),
                        lng: center.lng()
                    });
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        });
    }

    /**
     * Track facility interaction for analytics
     * @param {Object} facility - Facility data
     * @param {string} action - Action type
     */
    trackFacilityInteraction(facility, action) {
        if (typeof gtag === 'function') {
            gtag('event', 'facility_interaction', {
                facility_id: facility.facility_id,
                facility_name: facility.name,
                facility_type: facility.facility_type,
                action: action
            });
        }

        // Also log for debugging
        console.log('Facility interaction:', {
            facility: facility.name,
            action: action,
            type: facility.facility_type
        });
    }

    /**
     * Utility function to escape HTML
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show facilities within a specific radius of a point
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {number} radius - Radius in miles
     */
    async showNearbyFacilities(lat, lng, radius = 10) {
        try {
            const response = await this.facilitiesAPI.getNearbyFacilities(lat, lng, { radius });
            
            if (response.facilities && response.facilities.length > 0) {
                this.addFacilityMarkers(response.facilities);
                
                // Fit map bounds to show all facilities
                if (response.facilities.length > 1) {
                    const bounds = new google.maps.LatLngBounds();
                    response.facilities.forEach(facility => {
                        if (facility.coordinates) {
                            bounds.extend(new google.maps.LatLng(facility.coordinates[0], facility.coordinates[1]));
                        }
                    });
                    this.map.fitBounds(bounds);
                }
            } else {
                console.log('No facilities found in the area');
            }
            
            return response.facilities || [];

        } catch (error) {
            console.error('Error showing nearby facilities:', error);
            return [];
        }
    }
}

// Global reference for access from info window buttons
if (typeof window !== 'undefined') {
    window.facilityMapMarkers = null; // Will be set when component is initialized
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FacilityMapMarkers;
}