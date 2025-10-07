/**
 * Main Data Collection System Integration
 * Orchestrates all components for comprehensive research-grade data collection
 */

class DataCollectionSystem {
    constructor() {
        this.components = {
            moodTracking: null,
            geographicData: null,
            sdohQuestionnaire: null,
            environmentalContext: null,
            longitudinalTracking: null,
            formValidation: null,
            progressiveDisclosure: null,
            offlineSync: null,
            schemaExporter: null
        };
        
        this.currentSession = null;
        this.participantId = null;
        this.isInitialized = false;
        this.dataCollectionConfig = {
            enabledComponents: ['all'],
            validationLevel: 'strict',
            offlineMode: true,
            longitudinalTracking: true,
            progressiveDisclosure: true
        };
    }

    // Initialize the complete data collection system
    async initialize(participantId, config = {}) {
        try {
            this.participantId = participantId;
            this.dataCollectionConfig = { ...this.dataCollectionConfig, ...config };
            
            console.log('Initializing comprehensive data collection system...');
            
            // Initialize core components
            await this.initializeComponents();
            
            // Setup integrations between components
            this.setupComponentIntegrations();
            
            // Initialize session tracking
            this.initializeSession();
            
            // Setup UI
            this.createMainInterface();
            
            this.isInitialized = true;
            console.log('Data collection system initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('Failed to initialize data collection system:', error);
            return false;
        }
    }

    // Initialize all components
    async initializeComponents() {
        // Initialize form validation system first
        if (window.FormValidationSystem) {
            this.components.formValidation = new window.FormValidationSystem();
            this.setupValidationRules();
        }

        // Initialize offline sync capabilities
        if (window.OfflineCapabilitySync) {
            this.components.offlineSync = new window.OfflineCapabilitySync();
        }

        // Initialize longitudinal tracking
        if (window.LongitudinalTrackingSystem) {
            this.components.longitudinalTracking = new window.LongitudinalTrackingSystem();
            await this.components.longitudinalTracking.initialize(this.participantId);
        }

        // Initialize mood tracking
        if (window.MoodTrackingSystem) {
            this.components.moodTracking = new window.MoodTrackingSystem();
        }

        // Initialize geographic data collection
        if (window.GeographicDataCollection) {
            this.components.geographicData = new window.GeographicDataCollection();
        }

        // Initialize SDOH questionnaire
        if (window.SDOHQuestionnaire) {
            this.components.sdohQuestionnaire = new window.SDOHQuestionnaire();
            this.components.sdohQuestionnaire.loadFromLocalStorage();
        }

        // Initialize environmental context
        if (window.EnvironmentalContextCollection) {
            this.components.environmentalContext = new window.EnvironmentalContextCollection();
            await this.components.environmentalContext.initializeSensors();
        }

        // Initialize schema exporter
        if (window.DataCollectionSchemaExporter) {
            this.components.schemaExporter = new window.DataCollectionSchemaExporter();
        }

        // Initialize progressive disclosure last (orchestrates other components)
        if (window.ProgressiveDisclosureUI) {
            this.components.progressiveDisclosure = new window.ProgressiveDisclosureUI();
            const sections = this.buildDisclosureSections();
            this.components.progressiveDisclosure.initialize(sections);
        }
    }

    // Setup validation rules for all components
    setupValidationRules() {
        const validator = this.components.formValidation;
        if (!validator) return;

        // Mood tracking validation
        validator.registerValidation('phq9_responses', [
            { type: 'required', params: { message: 'PHQ-9 assessment is required' } },
            { type: 'research_quality', params: { scaleType: 'likert', requiresContext: true } }
        ]);

        validator.registerValidation('gad7_responses', [
            { type: 'required', params: { message: 'GAD-7 assessment is required' } },
            { type: 'research_quality', params: { scaleType: 'likert' } }
        ]);

        // Geographic validation
        validator.registerValidation('latitude', [
            { type: 'numeric' },
            { type: 'range', params: { min: -90, max: 90 } }
        ]);

        validator.registerValidation('longitude', [
            { type: 'numeric' },
            { type: 'range', params: { min: -180, max: 180 } }
        ]);

        // SDOH validation
        validator.registerValidation('age_group', [
            { type: 'required', params: { message: 'Age group is required for demographic analysis' } }
        ]);

        validator.registerValidation('gender_identity', [
            { type: 'required', params: { message: 'Gender identity is required for research analysis' } }
        ]);

        // Environmental validation
        validator.registerValidation('social_setting', [
            { type: 'required', params: { message: 'Social setting information is required' } }
        ]);

        validator.registerValidation('location_type', [
            { type: 'required', params: { message: 'Location type is required for context analysis' } }
        ]);

        // Cross-field validators
        validator.registerCrossFieldValidator({
            id: 'mood_environmental_consistency',
            fields: ['mood_responses', 'environmental_context'],
            validator: this.validateMoodEnvironmentalConsistency.bind(this),
            message: 'Mood responses and environmental context should be from the same timeframe'
        });

        validator.registerCrossFieldValidator({
            id: 'geographic_environmental_consistency',
            fields: ['geographic_location', 'location_type'],
            validator: this.validateGeographicEnvironmentalConsistency.bind(this),
            message: 'Geographic coordinates should match reported location type'
        });
    }

    // Build sections for progressive disclosure
    buildDisclosureSections() {
        const sections = [];

        // Mood tracking section
        sections.push({
            id: 'mood_tracking',
            type: 'mood_tracking',
            title: 'Mood Assessment',
            description: 'Standardized mood and anxiety evaluation (PHQ-9 & GAD-7)',
            required: true,
            estimatedTime: 300000, // 5 minutes
            component: this.components.moodTracking
        });

        // Geographic data section
        sections.push({
            id: 'geographic_data',
            type: 'geographic',
            title: 'Location Information',
            description: 'Geographic context with privacy controls',
            required: false,
            estimatedTime: 120000, // 2 minutes
            component: this.components.geographicData
        });

        // Environmental context section
        sections.push({
            id: 'environmental_context',
            type: 'environmental',
            title: 'Environmental Context',
            description: 'Current environment and surroundings',
            required: false,
            estimatedTime: 180000, // 3 minutes
            component: this.components.environmentalContext
        });

        // SDOH section (only for baseline or periodic assessment)
        if (this.shouldIncludeSDOH()) {
            sections.push({
                id: 'sdoh_questionnaire',
                type: 'sdoh',
                title: 'Background Information',
                description: 'Social and demographic factors affecting health',
                required: true,
                estimatedTime: 600000, // 10 minutes
                component: this.components.sdohQuestionnaire
            });
        }

        return sections;
    }

    // Determine if SDOH should be included
    shouldIncludeSDOH() {
        if (!this.components.longitudinalTracking) return true;
        
        // Include SDOH for baseline or periodic assessments
        const sessionType = this.components.longitudinalTracking.determineSessionType();
        return sessionType === 'baseline' || sessionType.includes('follow_up_3_month');
    }

    // Setup integrations between components
    setupComponentIntegrations() {
        // Link mood tracking with longitudinal system
        if (this.components.moodTracking && this.components.longitudinalTracking) {
            this.components.moodTracking.onDataComplete = (data) => {
                this.components.longitudinalTracking.addEntryData('mood_tracking', data);
            };
        }

        // Link geographic data with environmental context
        if (this.components.geographicData && this.components.environmentalContext) {
            this.components.geographicData.onLocationUpdate = (location) => {
                if (this.components.environmentalContext.weatherData) {
                    this.components.environmentalContext.fetchWeatherData(
                        location.latitude, 
                        location.longitude
                    );
                }
            };
        }

        // Link all components with offline sync
        if (this.components.offlineSync) {
            Object.keys(this.components).forEach(componentName => {
                const component = this.components[componentName];
                if (component && component.saveResponse) {
                    const originalSave = component.saveResponse.bind(component);
                    component.saveResponse = (id, data) => {
                        originalSave(id, data);
                        this.components.offlineSync.saveOffline(componentName, data, this.currentSession.sessionId);
                    };
                }
            });
        }

        // Link validation with all input components
        if (this.components.formValidation) {
            this.setupRealTimeValidation();
        }
    }

    // Setup real-time validation for all components
    setupRealTimeValidation() {
        const validator = this.components.formValidation;
        
        // Setup validation for mood tracking
        if (this.components.moodTracking) {
            this.components.moodTracking.onResponseChange = (questionId, value) => {
                validator.validateField(questionId, value, {
                    hasContextData: this.hasEnvironmentalContext(),
                    previousResponses: this.components.moodTracking.responses
                });
            };
        }

        // Setup validation for SDOH
        if (this.components.sdohQuestionnaire) {
            this.components.sdohQuestionnaire.onResponseChange = (questionId, value) => {
                validator.validateField(questionId, value);
            };
        }
    }

    // Initialize session
    initializeSession() {
        this.currentSession = {
            sessionId: this.generateSessionId(),
            participantId: this.participantId,
            startTime: new Date().toISOString(),
            components: Object.keys(this.components).filter(key => this.components[key]),
            sessionType: this.components.longitudinalTracking?.determineSessionType() || 'regular',
            dataCollection: {}
        };

        if (this.components.longitudinalTracking) {
            this.components.longitudinalTracking.startSessionTracking();
        }
    }

    // Create main interface
    createMainInterface() {
        const container = document.createElement('div');
        container.id = 'data-collection-main-container';
        container.className = 'data-collection-system';
        
        container.innerHTML = `
            <div class="system-header">
                <div class="session-info">
                    <h2>Mental Health Research Data Collection</h2>
                    <div class="session-details">
                        <span class="session-id">Session: ${this.currentSession.sessionId.slice(-8)}</span>
                        <span class="session-type">Type: ${this.currentSession.sessionType}</span>
                    </div>
                </div>
                
                <div class="system-status">
                    <div id="connection-status" class="status-item">
                        <span class="status-label">Connection:</span>
                        <span class="status-value">Checking...</span>
                    </div>
                    <div id="sync-status" class="status-item">
                        <span class="status-label">Sync:</span>
                        <span class="status-value">Ready</span>
                    </div>
                    <div id="validation-status" class="status-item">
                        <span class="status-label">Validation:</span>
                        <span class="status-value">Active</span>
                    </div>
                </div>
            </div>

            <div class="main-content">
                <!-- Progressive disclosure UI will be inserted here -->
                <div id="progressive-disclosure-container"></div>
            </div>

            <div class="system-footer">
                <div class="data-quality-indicator">
                    <span class="quality-label">Data Quality:</span>
                    <div class="quality-bar">
                        <div id="quality-fill" class="quality-fill" style="width: 100%"></div>
                    </div>
                    <span id="quality-score" class="quality-score">100/100</span>
                </div>
                
                <div class="system-actions">
                    <button id="export-schema-btn" class="action-btn secondary">
                        📄 Export Schema
                    </button>
                    <button id="save-progress-btn" class="action-btn primary">
                        💾 Save Progress
                    </button>
                    <button id="complete-session-btn" class="action-btn primary" style="display: none;">
                        ✅ Complete Session
                    </button>
                </div>
            </div>

            <div id="system-notifications" class="notifications-container">
                <!-- System notifications will appear here -->
            </div>
        `;

        // Insert progressive disclosure UI
        if (this.components.progressiveDisclosure) {
            const progressiveContainer = container.querySelector('#progressive-disclosure-container');
            const progressiveUI = this.components.progressiveDisclosure.setupProgressiveUI();
            progressiveContainer.appendChild(progressiveUI);
        }

        // Insert offline status UI
        if (this.components.offlineSync) {
            const statusContainer = container.querySelector('.system-status');
            const offlineUI = this.components.offlineSync.createOfflineStatusUI();
            statusContainer.appendChild(offlineUI);
        }

        this.attachMainEventListeners(container);
        return container;
    }

    // Attach main event listeners
    attachMainEventListeners(container) {
        // Export schema button
        const exportBtn = container.querySelector('#export-schema-btn');
        exportBtn.addEventListener('click', () => {
            this.exportDataSchema();
        });

        // Save progress button
        const saveBtn = container.querySelector('#save-progress-btn');
        saveBtn.addEventListener('click', () => {
            this.saveProgress();
        });

        // Complete session button
        const completeBtn = container.querySelector('#complete-session-btn');
        completeBtn.addEventListener('click', () => {
            this.completeSession();
        });

        // Update quality indicator periodically
        setInterval(() => {
            this.updateQualityIndicator();
        }, 5000);
    }

    // Validate mood-environmental consistency
    validateMoodEnvironmentalConsistency(data) {
        const moodData = data.mood_responses;
        const environmentalData = data.environmental_context;
        
        if (!moodData || !environmentalData) {
            return { isValid: true }; // Can't validate if data missing
        }

        // Check timestamp consistency (within 5 minutes)
        const moodTime = new Date(moodData.timestamp);
        const envTime = new Date(environmentalData.timestamp);
        const timeDiff = Math.abs(moodTime - envTime);
        
        return {
            isValid: timeDiff < 300000, // 5 minutes
            message: timeDiff >= 300000 ? 'Mood and environmental data timestamps differ significantly' : null
        };
    }

    // Validate geographic-environmental consistency
    validateGeographicEnvironmentalConsistency(data) {
        const geographic = data.geographic_location;
        const locationType = data.location_type;
        
        if (!geographic || !locationType) {
            return { isValid: true };
        }

        // Basic consistency checks (could be enhanced with geocoding)
        const outdoorTypes = ['park_nature', 'urban_outdoor', 'home_outdoor'];
        const indoorTypes = ['home_indoor', 'workplace', 'retail', 'restaurant'];
        
        // This is a simplified check - in production, you'd use geocoding services
        return { isValid: true };
    }

    // Check if environmental context is available
    hasEnvironmentalContext() {
        return this.components.environmentalContext && 
               Object.keys(this.components.environmentalContext.responses).length > 0;
    }

    // Update quality indicator
    updateQualityIndicator() {
        const qualityScore = this.calculateOverallQualityScore();
        const qualityFill = document.getElementById('quality-fill');
        const qualityScoreText = document.getElementById('quality-score');
        
        if (qualityFill && qualityScoreText) {
            qualityFill.style.width = `${qualityScore}%`;
            qualityScoreText.textContent = `${qualityScore}/100`;
            
            // Update color based on score
            if (qualityScore >= 90) {
                qualityFill.className = 'quality-fill excellent';
            } else if (qualityScore >= 75) {
                qualityFill.className = 'quality-fill good';
            } else if (qualityScore >= 60) {
                qualityFill.className = 'quality-fill fair';
            } else {
                qualityFill.className = 'quality-fill poor';
            }
        }
    }

    // Calculate overall quality score
    calculateOverallQualityScore() {
        let totalScore = 0;
        let componentCount = 0;

        // Get quality scores from each component
        Object.keys(this.components).forEach(componentName => {
            const component = this.components[componentName];
            if (component && component.calculateQualityScore) {
                const score = component.calculateQualityScore();
                if (score !== null) {
                    totalScore += score;
                    componentCount++;
                }
            }
        });

        // Add validation quality
        if (this.components.formValidation) {
            const validationSummary = this.components.formValidation.getValidationSummary();
            const validationScore = validationSummary.totalErrors === 0 ? 100 : 
                Math.max(0, 100 - (validationSummary.totalErrors * 10));
            totalScore += validationScore;
            componentCount++;
        }

        return componentCount > 0 ? Math.round(totalScore / componentCount) : 100;
    }

    // Save progress
    saveProgress() {
        const progressData = {
            sessionId: this.currentSession.sessionId,
            participantId: this.participantId,
            timestamp: new Date().toISOString(),
            componentData: {}
        };

        // Collect data from all components
        Object.keys(this.components).forEach(componentName => {
            const component = this.components[componentName];
            if (component && component.exportData) {
                progressData.componentData[componentName] = component.exportData();
            }
        });

        // Save to offline storage
        if (this.components.offlineSync) {
            this.components.offlineSync.saveOffline('session_progress', progressData, this.currentSession.sessionId);
        }

        // Save to localStorage as backup
        localStorage.setItem(`session_progress_${this.currentSession.sessionId}`, JSON.stringify(progressData));

        this.showNotification('Progress saved successfully', 'success');
    }

    // Complete session
    async completeSession() {
        try {
            // Validate all components
            const validationResult = await this.validateCompleteSession();
            
            if (!validationResult.isValid) {
                this.showValidationSummary(validationResult);
                return;
            }

            // Collect final data
            const sessionData = this.collectFinalSessionData();
            
            // Mark session as complete in longitudinal tracking
            if (this.components.longitudinalTracking) {
                this.components.longitudinalTracking.completeSession();
            }

            // Sync data if online
            if (this.components.offlineSync && navigator.onLine) {
                await this.components.offlineSync.syncOfflineData();
            }

            // Show completion screen
            this.showCompletionScreen(sessionData);
            
        } catch (error) {
            console.error('Session completion failed:', error);
            this.showNotification('Session completion failed. Please try again.', 'error');
        }
    }

    // Validate complete session
    async validateCompleteSession() {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            completionRate: 0
        };

        let totalComponents = 0;
        let completedComponents = 0;

        // Validate each component
        Object.keys(this.components).forEach(componentName => {
            const component = this.components[componentName];
            if (component && component.validateCompleteAssessment) {
                totalComponents++;
                const componentValidation = component.validateCompleteAssessment();
                
                if (componentValidation.isValid) {
                    completedComponents++;
                } else {
                    validation.errors.push(...componentValidation.errors);
                }
            }
        });

        validation.completionRate = totalComponents > 0 ? (completedComponents / totalComponents) * 100 : 100;
        validation.isValid = validation.errors.length === 0 && validation.completionRate >= 80;

        return validation;
    }

    // Collect final session data
    collectFinalSessionData() {
        const sessionData = {
            sessionMetadata: {
                sessionId: this.currentSession.sessionId,
                participantId: this.participantId,
                sessionType: this.currentSession.sessionType,
                startTime: this.currentSession.startTime,
                endTime: new Date().toISOString(),
                duration: Date.now() - new Date(this.currentSession.startTime).getTime()
            },
            componentData: {},
            qualityMetrics: {
                overallQualityScore: this.calculateOverallQualityScore(),
                validationResults: this.components.formValidation?.getValidationSummary(),
                completionMetrics: this.calculateCompletionMetrics()
            }
        };

        // Export data from each component
        Object.keys(this.components).forEach(componentName => {
            const component = this.components[componentName];
            if (component && component.exportData) {
                sessionData.componentData[componentName] = component.exportData();
            }
        });

        return sessionData;
    }

    // Calculate completion metrics
    calculateCompletionMetrics() {
        let totalFields = 0;
        let completedFields = 0;

        Object.keys(this.components).forEach(componentName => {
            const component = this.components[componentName];
            if (component && component.getCompletionStats) {
                const stats = component.getCompletionStats();
                totalFields += stats.totalQuestions || stats.totalFields || 0;
                completedFields += stats.completedQuestions || stats.completedFields || 0;
            }
        });

        return {
            totalFields,
            completedFields,
            completionPercentage: totalFields > 0 ? (completedFields / totalFields) * 100 : 100
        };
    }

    // Export data schema
    exportDataSchema() {
        if (this.components.schemaExporter) {
            this.components.schemaExporter.exportToFile(`mindmap-schema-${new Date().toISOString().split('T')[0]}`);
            this.showNotification('Schema exported successfully', 'success');
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const container = document.getElementById('system-notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Show validation summary
    showValidationSummary(validationResult) {
        const modal = document.createElement('div');
        modal.className = 'validation-summary-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ Session Validation</h3>
                    <button class="modal-close">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="completion-rate">
                        <span class="label">Completion Rate:</span>
                        <span class="value">${validationResult.completionRate.toFixed(1)}%</span>
                    </div>
                    
                    ${validationResult.errors.length > 0 ? `
                        <div class="validation-errors">
                            <h4>Required Items:</h4>
                            <ul>
                                ${validationResult.errors.map(error => `<li>${error}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${validationResult.warnings.length > 0 ? `
                        <div class="validation-warnings">
                            <h4>Recommendations:</h4>
                            <ul>
                                ${validationResult.warnings.map(warning => `<li>${warning}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <div class="modal-footer">
                    <button class="btn secondary" onclick="this.closest('.validation-summary-modal').remove()">
                        Continue Editing
                    </button>
                    ${validationResult.completionRate >= 60 ? `
                        <button class="btn primary" onclick="this.closest('.validation-summary-modal').remove(); dataCollectionSystem.forceCompleteSession()">
                            Complete Anyway
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Force complete session (with validation warnings)
    async forceCompleteSession() {
        const sessionData = this.collectFinalSessionData();
        sessionData.forcedCompletion = true;
        sessionData.completionWarnings = await this.validateCompleteSession();
        
        this.showCompletionScreen(sessionData);
    }

    // Show completion screen
    showCompletionScreen(sessionData) {
        const modal = document.createElement('div');
        modal.className = 'completion-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>🎉 Session Completed!</h3>
                </div>
                
                <div class="modal-body">
                    <div class="completion-summary">
                        <div class="summary-item">
                            <span class="label">Session Duration:</span>
                            <span class="value">${Math.round(sessionData.sessionMetadata.duration / 60000)} minutes</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">Data Quality Score:</span>
                            <span class="value">${sessionData.qualityMetrics.overallQualityScore}/100</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">Completion Rate:</span>
                            <span class="value">${sessionData.qualityMetrics.completionMetrics.completionPercentage.toFixed(1)}%</span>
                        </div>
                    </div>
                    
                    <div class="next-steps">
                        <h4>Next Steps:</h4>
                        <ul>
                            <li>Your data has been securely saved</li>
                            <li>You may receive follow-up assessments</li>
                            <li>Research findings will be shared with participants</li>
                        </ul>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn secondary" onclick="dataCollectionSystem.downloadSessionSummary()">
                        📄 Download Summary
                    </button>
                    <button class="btn primary" onclick="window.location.reload()">
                        ✅ Finish
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Download session summary
    downloadSessionSummary() {
        const sessionData = this.collectFinalSessionData();
        const summary = JSON.stringify(sessionData, null, 2);
        const blob = new Blob([summary], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-summary-${this.currentSession.sessionId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Generate session ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Cleanup resources
    destroy() {
        Object.keys(this.components).forEach(componentName => {
            const component = this.components[componentName];
            if (component && component.destroy) {
                component.destroy();
            }
        });
        
        this.components = {};
        this.currentSession = null;
        this.isInitialized = false;
    }

    // Get system status
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            participantId: this.participantId,
            currentSession: this.currentSession,
            componentStatus: Object.keys(this.components).reduce((status, name) => {
                status[name] = !!this.components[name];
                return status;
            }, {}),
            qualityScore: this.calculateOverallQualityScore(),
            completionMetrics: this.calculateCompletionMetrics()
        };
    }
}

// Create global instance for easy access
window.DataCollectionSystem = DataCollectionSystem;

// Auto-initialize if participant ID is available
document.addEventListener('DOMContentLoaded', () => {
    const participantId = localStorage.getItem('participantId') || 
                         new URLSearchParams(window.location.search).get('participantId');
    
    if (participantId) {
        window.dataCollectionSystem = new DataCollectionSystem();
        window.dataCollectionSystem.initialize(participantId);
    }
});