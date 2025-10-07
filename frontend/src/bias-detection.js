/**
 * Bias Detection System for MindMap Mental Health Platform
 * 
 * This module detects algorithmic bias in resource recommendations,
 * focusing on fairness across demographics and geographic areas.
 * 
 * Educational Focus: Code is designed to be understandable for 
 * high school students learning about algorithmic fairness in healthcare.
 */

class BiasDetectionSystem {
    constructor() {
        this.biasMetrics = {
            demographic: {
                age: new Map(),
                gender: new Map(), 
                insurance: new Map(),
                race: new Map()
            },
            geographic: {
                urban: { searches: 0, results: 0, quality: [] },
                rural: { searches: 0, results: 0, quality: [] },
                suburban: { searches: 0, results: 0, quality: [] }
            },
            resources: {
                distribution: new Map(),
                qualityByArea: new Map(),
                accessibilityIssues: []
            }
        };
        
        this.fairnessThresholds = {
            demographicParity: 0.8,  // 80% minimum success rate ratio between groups
            geographicEquity: 0.75,  // 75% minimum for rural vs urban
            resourceQuality: 3.0     // Minimum average rating
        };
        
        this.detectionEnabled = true;
        this.debugMode = window.location.hostname === 'localhost';
        this.logBiasEvents();
    }

    /**
     * CORE BIAS DETECTION FUNCTIONS
     * These are the essential functions for monitoring algorithmic fairness
     */

    /**
     * Demographic Parity: Ensures equal success rates across user groups
     * 
     * This measures if different demographic groups (age, gender, race, insurance)
     * receive similar rates of successful resource recommendations.
     * 
     * For example: Do elderly users get as many quality resources as young users?
     * 
     * @param {Object} userDemographics - User's demographic info
     * @param {Array} searchResults - Resources found for this user
     * @returns {Object} Bias detection results
     */
    calculateDemographicParity(userDemographics, searchResults) {
        if (!this.detectionEnabled || !userDemographics) return null;

        const successfulResults = searchResults.filter(r => 
            !r.isFallback && (r.rating || 0) >= this.fairnessThresholds.resourceQuality
        );
        
        const successRate = searchResults.length > 0 ? 
            successfulResults.length / searchResults.length : 0;

        // Update metrics for each demographic category
        Object.keys(userDemographics).forEach(category => {
            if (!this.biasMetrics.demographic[category]) {
                this.biasMetrics.demographic[category] = new Map();
            }
            
            const value = userDemographics[category];
            const current = this.biasMetrics.demographic[category].get(value) || 
                { searches: 0, successes: 0, totalResults: 0 };
            
            current.searches += 1;
            current.successes += successfulResults.length;
            current.totalResults += searchResults.length;
            current.successRate = current.successes / Math.max(current.totalResults, 1);
            
            this.biasMetrics.demographic[category].set(value, current);
        });

        // Detect bias by comparing success rates between groups
        const biasAlerts = this.detectDemographicBias();
        
        if (this.debugMode) {
            console.log('Demographic Parity Check:', {
                userDemographics,
                successRate: (successRate * 100).toFixed(1) + '%',
                totalResults: searchResults.length,
                qualityResults: successfulResults.length,
                biasAlerts: biasAlerts.length
            });
        }

        return {
            successRate,
            totalResults: searchResults.length,
            qualityResults: successfulResults.length,
            biasDetected: biasAlerts.length > 0,
            alerts: biasAlerts
        };
    }

    /**
     * Geographic Bias Detection: Identifies urban vs rural disparities
     * 
     * This function checks if users in rural areas get fewer or lower-quality
     * resources compared to urban users. This is critical in healthcare where
     * geographic access can be a life-or-death issue.
     * 
     * @param {Object} userLocation - User's geographic coordinates
     * @param {Array} searchResults - Resources found
     * @param {string} areaType - 'urban', 'rural', or 'suburban'
     * @returns {Object} Geographic bias assessment
     */
    detectGeographicBias(userLocation, searchResults, areaType = null) {
        if (!this.detectionEnabled || !userLocation) return null;

        // Determine area type if not provided
        if (!areaType) {
            areaType = this.classifyGeographicArea(userLocation);
        }

        const qualityResults = searchResults.filter(r => 
            !r.isFallback && (r.rating || 0) >= this.fairnessThresholds.resourceQuality
        );
        
        const avgRating = searchResults.length > 0 ? 
            searchResults.reduce((sum, r) => sum + (r.rating || 0), 0) / searchResults.length : 0;

        // Update geographic metrics
        const geoData = this.biasMetrics.geographic[areaType];
        geoData.searches += 1;
        geoData.results += searchResults.length;
        geoData.quality.push(avgRating);

        // Calculate bias indicators
        const biasIndicators = this.calculateGeographicBiasIndicators();
        
        if (this.debugMode) {
            console.log('Geographic Bias Check:', {
                areaType,
                userLocation,
                totalResults: searchResults.length,
                qualityResults: qualityResults.length,
                avgRating: avgRating.toFixed(1),
                biasIndicators
            });
        }

        return {
            areaType,
            totalResults: searchResults.length,
            qualityResults: qualityResults.length,
            averageRating: avgRating,
            biasDetected: biasIndicators.length > 0,
            indicators: biasIndicators
        };
    }

    /**
     * Resource Distribution Monitor: Tracks fairness in what resources are shown
     * 
     * This monitors whether certain demographic groups consistently get shown
     * different types of resources. For example, do uninsured users only see
     * free clinics while insured users see private practices?
     * 
     * @param {Object} userProfile - User's complete profile
     * @param {Array} searchResults - Resources recommended to user
     * @returns {Object} Resource distribution analysis
     */
    checkResourceDistribution(userProfile, searchResults) {
        if (!this.detectionEnabled || !userProfile) return null;

        // Categorize resources by type and quality
        const resourceCategories = this.categorizeResources(searchResults);
        
        // Track distribution patterns by user characteristics
        const distributionKey = this.generateUserProfileKey(userProfile);
        
        if (!this.biasMetrics.resources.distribution.has(distributionKey)) {
            this.biasMetrics.resources.distribution.set(distributionKey, {
                profile: userProfile,
                resourceTypes: new Map(),
                totalSearches: 0,
                avgResourceQuality: []
            });
        }

        const userData = this.biasMetrics.resources.distribution.get(distributionKey);
        userData.totalSearches += 1;
        
        // Update resource type counts
        Object.entries(resourceCategories).forEach(([type, resources]) => {
            const current = userData.resourceTypes.get(type) || 0;
            userData.resourceTypes.set(type, current + resources.length);
        });

        // Track quality distribution
        const avgQuality = searchResults.length > 0 ?
            searchResults.reduce((sum, r) => sum + (r.rating || 0), 0) / searchResults.length : 0;
        userData.avgResourceQuality.push(avgQuality);

        // Detect distribution bias
        const distributionBias = this.analyzeResourceDistributionBias();

        if (this.debugMode) {
            console.log('Resource Distribution Check:', {
                userProfile: distributionKey,
                resourceCategories,
                avgQuality: avgQuality.toFixed(1),
                distributionBias: distributionBias.length
            });
        }

        return {
            resourceCategories,
            averageQuality: avgQuality,
            biasDetected: distributionBias.length > 0,
            biasIndicators: distributionBias,
            userProfileKey: distributionKey
        };
    }

    /**
     * HELPER FUNCTIONS FOR BIAS DETECTION
     */

    /**
     * Detects demographic bias by comparing success rates between groups
     */
    detectDemographicBias() {
        const alerts = [];
        
        Object.entries(this.biasMetrics.demographic).forEach(([category, groups]) => {
            const groupRates = Array.from(groups.entries())
                .filter(([_, data]) => data.searches >= 3) // Need minimum data
                .map(([group, data]) => ({ group, rate: data.successRate }));

            if (groupRates.length < 2) return;

            // Find min and max success rates
            const rates = groupRates.map(g => g.rate);
            const minRate = Math.min(...rates);
            const maxRate = Math.max(...rates);
            
            // Check if ratio falls below fairness threshold
            const parity = minRate / Math.max(maxRate, 0.01); // Avoid division by zero
            
            if (parity < this.fairnessThresholds.demographicParity) {
                const minGroup = groupRates.find(g => g.rate === minRate);
                const maxGroup = groupRates.find(g => g.rate === maxRate);
                
                alerts.push({
                    type: 'demographic_disparity',
                    category,
                    severity: parity < 0.5 ? 'high' : 'medium',
                    message: `${category} bias detected: ${minGroup.group} group has ${(minRate * 100).toFixed(1)}% success rate vs ${maxGroup.group} at ${(maxRate * 100).toFixed(1)}%`,
                    parityRatio: parity,
                    affectedGroup: minGroup.group,
                    comparisonGroup: maxGroup.group
                });
            }
        });

        return alerts;
    }

    /**
     * Calculates geographic bias indicators comparing urban/rural/suburban
     */
    calculateGeographicBiasIndicators() {
        const indicators = [];
        const { urban, rural, suburban } = this.biasMetrics.geographic;

        // Need minimum data for comparison
        if (urban.searches < 2 && rural.searches < 2) return indicators;

        // Compare average results per search
        const urbanAvg = urban.searches > 0 ? urban.results / urban.searches : 0;
        const ruralAvg = rural.searches > 0 ? rural.results / rural.searches : 0;
        const suburbanAvg = suburban.searches > 0 ? suburban.results / suburban.searches : 0;

        // Compare quality ratings
        const urbanQuality = urban.quality.length > 0 ?
            urban.quality.reduce((a, b) => a + b, 0) / urban.quality.length : 0;
        const ruralQuality = rural.quality.length > 0 ?
            rural.quality.reduce((a, b) => a + b, 0) / rural.quality.length : 0;

        // Check for rural disadvantage (common in healthcare)
        if (ruralAvg > 0 && urbanAvg > 0) {
            const resultsEquity = ruralAvg / urbanAvg;
            if (resultsEquity < this.fairnessThresholds.geographicEquity) {
                indicators.push({
                    type: 'rural_resource_gap',
                    severity: resultsEquity < 0.5 ? 'high' : 'medium',
                    message: `Rural users get ${(resultsEquity * 100).toFixed(0)}% as many resources as urban users`,
                    ruralAvg: ruralAvg.toFixed(1),
                    urbanAvg: urbanAvg.toFixed(1),
                    equityRatio: resultsEquity
                });
            }
        }

        // Check quality differences
        if (ruralQuality > 0 && urbanQuality > 0) {
            const qualityGap = (urbanQuality - ruralQuality) / urbanQuality;
            if (qualityGap > 0.2) { // 20% quality difference threshold
                indicators.push({
                    type: 'geographic_quality_gap',
                    severity: qualityGap > 0.4 ? 'high' : 'medium',
                    message: `Rural resources are ${(qualityGap * 100).toFixed(0)}% lower quality than urban`,
                    ruralQuality: ruralQuality.toFixed(1),
                    urbanQuality: urbanQuality.toFixed(1),
                    qualityGap
                });
            }
        }

        return indicators;
    }

    /**
     * Analyzes resource distribution for bias patterns
     */
    analyzeResourceDistributionBias() {
        const biasIndicators = [];
        const distributions = Array.from(this.biasMetrics.resources.distribution.entries());
        
        // Need multiple user profiles for comparison
        if (distributions.length < 2) return biasIndicators;

        // Group by key characteristics (insurance, age group, etc.)
        const insuranceGroups = this.groupUsersByCharacteristic(distributions, 'insurance');
        const ageGroups = this.groupUsersByCharacteristic(distributions, 'age');

        // Check for insurance-based resource segregation
        if (insuranceGroups.insured && insuranceGroups.uninsured) {
            const insuredQuality = this.calculateAverageResourceQuality(insuranceGroups.insured);
            const uninsuredQuality = this.calculateAverageResourceQuality(insuranceGroups.uninsured);
            
            const qualityGap = (insuredQuality - uninsuredQuality) / Math.max(insuredQuality, 0.01);
            
            if (qualityGap > 0.2) { // 20% quality gap
                biasIndicators.push({
                    type: 'insurance_based_segregation',
                    severity: qualityGap > 0.4 ? 'high' : 'medium',
                    message: `Uninsured users receive ${(qualityGap * 100).toFixed(0)}% lower quality resources`,
                    insuredQuality: insuredQuality.toFixed(1),
                    uninsuredQuality: uninsuredQuality.toFixed(1),
                    qualityGap
                });
            }
        }

        return biasIndicators;
    }

    /**
     * UTILITY FUNCTIONS
     */

    /**
     * Determines if an area is urban, rural, or suburban based on coordinates
     * This is a simplified classification for demonstration purposes
     */
    classifyGeographicArea(location) {
        // Simplified classification - in a real system, you'd use census data
        // or population density APIs
        
        // Major US cities (simplified check)
        const majorCities = [
            { lat: 40.7128, lng: -74.0060, name: 'New York' },
            { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
            { lat: 41.8781, lng: -87.6298, name: 'Chicago' },
            { lat: 29.7604, lng: -95.3698, name: 'Houston' },
            { lat: 33.4484, lng: -112.0740, name: 'Phoenix' }
        ];

        const isNearMajorCity = majorCities.some(city => {
            const distance = this.calculateDistance(location, city);
            return distance < 50; // Within 50km
        });

        if (isNearMajorCity) return 'urban';
        
        // Rough suburban check (within 100km of major city)
        const isSuburban = majorCities.some(city => {
            const distance = this.calculateDistance(location, city);
            return distance >= 50 && distance < 100;
        });

        return isSuburban ? 'suburban' : 'rural';
    }

    /**
     * Calculates distance between two geographic points (simplified)
     */
    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLng = (point2.lng - point1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Categorizes resources by type for distribution analysis
     */
    categorizeResources(resources) {
        const categories = {
            'emergency': [],
            'therapy': [],
            'medical': [],
            'community': [],
            'wellness': [],
            'fallback': []
        };

        resources.forEach(resource => {
            if (resource.isFallback) {
                categories.fallback.push(resource);
                return;
            }

            const name = (resource.name || '').toLowerCase();
            const types = resource.types || [];
            
            if (name.includes('emergency') || name.includes('crisis') || name.includes('hotline')) {
                categories.emergency.push(resource);
            } else if (name.includes('therapy') || name.includes('counseling') || name.includes('therapist')) {
                categories.therapy.push(resource);
            } else if (name.includes('hospital') || name.includes('clinic') || name.includes('medical')) {
                categories.medical.push(resource);
            } else if (name.includes('community') || name.includes('center') || name.includes('support')) {
                categories.community.push(resource);
            } else if (name.includes('park') || name.includes('recreation') || name.includes('wellness')) {
                categories.wellness.push(resource);
            } else {
                // Default to medical if unclear
                categories.medical.push(resource);
            }
        });

        return categories;
    }

    /**
     * Generates a user profile key for tracking distribution patterns
     */
    generateUserProfileKey(profile) {
        const keyParts = [];
        if (profile.age) keyParts.push(`age_${this.categorizeAge(profile.age)}`);
        if (profile.insurance) keyParts.push(`insurance_${profile.insurance}`);
        if (profile.gender) keyParts.push(`gender_${profile.gender}`);
        return keyParts.join('_') || 'unknown_profile';
    }

    /**
     * Categorizes age into groups for analysis
     */
    categorizeAge(age) {
        if (age < 18) return 'minor';
        if (age < 30) return 'young_adult';
        if (age < 50) return 'adult';
        if (age < 65) return 'middle_aged';
        return 'senior';
    }

    /**
     * Groups users by a specific characteristic for comparison
     */
    groupUsersByCharacteristic(distributions, characteristic) {
        const groups = {};
        
        distributions.forEach(([key, data]) => {
            const profile = data.profile;
            const value = profile[characteristic];
            
            if (value) {
                if (!groups[value]) groups[value] = [];
                groups[value].push(data);
            }
        });

        return groups;
    }

    /**
     * Calculates average resource quality for a group of users
     */
    calculateAverageResourceQuality(userDataArray) {
        let totalQuality = 0;
        let count = 0;

        userDataArray.forEach(userData => {
            userData.avgResourceQuality.forEach(quality => {
                totalQuality += quality;
                count++;
            });
        });

        return count > 0 ? totalQuality / count : 0;
    }

    /**
     * PUBLIC API METHODS
     */

    /**
     * Main function to check for bias in a search result
     * This is called after each resource search to monitor fairness
     */
    checkForBias(userProfile, userLocation, searchResults, searchType) {
        if (!this.detectionEnabled) return null;

        const biasReport = {
            timestamp: new Date().toISOString(),
            searchType,
            userProfile: this.anonymizeUserProfile(userProfile),
            checks: {
                demographic: null,
                geographic: null,
                distribution: null
            },
            overallBiasDetected: false,
            alerts: []
        };

        try {
            // Run all bias detection checks
            biasReport.checks.demographic = this.calculateDemographicParity(
                userProfile, searchResults
            );
            
            biasReport.checks.geographic = this.detectGeographicBias(
                userLocation, searchResults
            );
            
            biasReport.checks.distribution = this.checkResourceDistribution(
                userProfile, searchResults
            );

            // Aggregate alerts
            [biasReport.checks.demographic, biasReport.checks.geographic, biasReport.checks.distribution]
                .filter(check => check && check.biasDetected)
                .forEach(check => {
                    biasReport.alerts.push(...(check.alerts || check.indicators || check.biasIndicators || []));
                });

            biasReport.overallBiasDetected = biasReport.alerts.length > 0;

            // Log significant bias events
            if (biasReport.overallBiasDetected) {
                this.logBiasEvent(biasReport);
            }

        } catch (error) {
            console.error('Bias detection error:', error);
            biasReport.error = error.message;
        }

        return biasReport;
    }

    /**
     * Get current bias metrics summary
     */
    getBiasMetrics() {
        return {
            demographic: this.summarizeDemographicMetrics(),
            geographic: this.summarizeGeographicMetrics(),
            resources: this.summarizeResourceMetrics(),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Generate mock user data for testing bias detection
     * This helps demonstrate how the system would work with different user types
     */
    generateMockUserProfiles() {
        return [
            { age: 25, gender: 'female', insurance: 'insured', race: 'white', location: 'urban' },
            { age: 67, gender: 'male', insurance: 'medicare', race: 'black', location: 'rural' },
            { age: 32, gender: 'non-binary', insurance: 'uninsured', race: 'hispanic', location: 'suburban' },
            { age: 19, gender: 'female', insurance: 'insured', race: 'asian', location: 'urban' },
            { age: 45, gender: 'male', insurance: 'uninsured', race: 'white', location: 'rural' }
        ];
    }

    /**
     * LOGGING AND REPORTING METHODS
     */

    /**
     * Anonymize user profile for privacy-compliant logging
     */
    anonymizeUserProfile(profile) {
        if (!profile) return null;
        
        return {
            ageGroup: profile.age ? this.categorizeAge(profile.age) : null,
            gender: profile.gender || null,
            insurance: profile.insurance || null,
            race: profile.race || null,
            // Don't log exact location, just area type
            areaType: profile.location || null
        };
    }

    /**
     * Log bias events for review and system improvement
     */
    logBiasEvent(biasReport) {
        const event = {
            timestamp: biasReport.timestamp,
            type: 'bias_detected',
            severity: this.calculateBiasSeverity(biasReport.alerts),
            alertCount: biasReport.alerts.length,
            searchType: biasReport.searchType,
            // Store anonymized data only
            anonymizedProfile: biasReport.userProfile
        };

        if (this.debugMode) {
            console.warn('BIAS DETECTED:', event);
            console.table(biasReport.alerts);
        }

        // In a real system, you would send this to your analytics/logging service
        this.storeBiasEvent(event);
    }

    /**
     * Store bias event (placeholder for real implementation)
     */
    storeBiasEvent(event) {
        // In a real system, send to your logging/analytics service
        if (window.biasEventLog) {
            window.biasEventLog.push(event);
        } else {
            window.biasEventLog = [event];
        }
    }

    /**
     * Calculate overall bias severity from alerts
     */
    calculateBiasSeverity(alerts) {
        if (alerts.length === 0) return 'none';
        
        const highSeverityCount = alerts.filter(a => a.severity === 'high').length;
        const mediumSeverityCount = alerts.filter(a => a.severity === 'medium').length;
        
        if (highSeverityCount > 0) return 'high';
        if (mediumSeverityCount > 1) return 'high';
        if (mediumSeverityCount > 0) return 'medium';
        return 'low';
    }

    /**
     * Summarize demographic metrics for reporting
     */
    summarizeDemographicMetrics() {
        const summary = {};
        
        Object.entries(this.biasMetrics.demographic).forEach(([category, groups]) => {
            summary[category] = {};
            groups.forEach((data, group) => {
                summary[category][group] = {
                    searches: data.searches,
                    successRate: (data.successRate * 100).toFixed(1) + '%',
                    avgResults: (data.totalResults / Math.max(data.searches, 1)).toFixed(1)
                };
            });
        });
        
        return summary;
    }

    /**
     * Summarize geographic metrics for reporting
     */
    summarizeGeographicMetrics() {
        const summary = {};
        
        Object.entries(this.biasMetrics.geographic).forEach(([areaType, data]) => {
            summary[areaType] = {
                searches: data.searches,
                avgResults: data.searches > 0 ? (data.results / data.searches).toFixed(1) : '0',
                avgQuality: data.quality.length > 0 ? 
                    (data.quality.reduce((a, b) => a + b, 0) / data.quality.length).toFixed(1) : 'N/A'
            };
        });
        
        return summary;
    }

    /**
     * Summarize resource distribution metrics
     */
    summarizeResourceMetrics() {
        return {
            totalProfiles: this.biasMetrics.resources.distribution.size,
            distributionIssues: this.biasMetrics.resources.accessibilityIssues.length
        };
    }

    /**
     * Initialize bias event logging
     */
    logBiasEvents() {
        if (this.debugMode) {
            console.log('Bias Detection System initialized');
            console.log('Fairness thresholds:', this.fairnessThresholds);
            
            // Make debug info available globally
            window.biasDetection = this;
            console.log('Debug tools: window.biasDetection');
        }
    }

    /**
     * Enable or disable bias detection
     */
    setDetectionEnabled(enabled) {
        this.detectionEnabled = enabled;
        console.log(`Bias detection ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Reset all bias metrics (useful for testing)
     */
    resetMetrics() {
        this.biasMetrics = {
            demographic: {
                age: new Map(),
                gender: new Map(), 
                insurance: new Map(),
                race: new Map()
            },
            geographic: {
                urban: { searches: 0, results: 0, quality: [] },
                rural: { searches: 0, results: 0, quality: [] },
                suburban: { searches: 0, results: 0, quality: [] }
            },
            resources: {
                distribution: new Map(),
                qualityByArea: new Map(),
                accessibilityIssues: []
            }
        };
        
        console.log('Bias detection metrics reset');
    }
}

// Export for use in the main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiasDetectionSystem;
} else {
    window.BiasDetectionSystem = BiasDetectionSystem;
}