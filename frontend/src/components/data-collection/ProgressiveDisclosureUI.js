/**
 * Progressive Disclosure UI System
 * Reduces survey fatigue through intelligent step-by-step presentation
 */

class ProgressiveDisclosureUI {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 0;
        this.stepHistory = [];
        this.adaptiveOrder = [];
        this.userProgress = {};
        this.fatigueMetrics = {
            startTime: null,
            stepTimes: [],
            pauseTimes: [],
            backwardNavigations: 0,
            abandonmentScore: 0
        };
        this.adaptiveSettings = {
            enableAdaptiveOrdering: true,
            enableSmartSkipping: true,
            enableFatigueDetection: true,
            maxStepsBeforeBreak: 5,
            suggestedBreakDuration: 30000 // 30 seconds
        };
    }

    // Initialize progressive disclosure system
    initialize(sections, options = {}) {
        this.sections = sections;
        this.totalSteps = sections.length;
        this.adaptiveSettings = { ...this.adaptiveSettings, ...options };
        
        // Calculate adaptive ordering based on user context
        if (this.adaptiveSettings.enableAdaptiveOrdering) {
            this.calculateAdaptiveOrdering();
        } else {
            this.adaptiveOrder = sections.map((_, index) => index);
        }

        this.fatigueMetrics.startTime = Date.now();
        this.setupProgressiveUI();
        this.loadProgress();
    }

    // Calculate adaptive ordering based on various factors
    calculateAdaptiveOrdering() {
        const sectionPriorities = this.sections.map((section, index) => ({
            index,
            section,
            priority: this.calculateSectionPriority(section, index),
            estimatedTime: this.estimateSectionTime(section),
            complexity: this.assessComplexity(section),
            userPreference: this.getUserPreference(section.id)
        }));

        // Sort by priority, considering fatigue factors
        this.adaptiveOrder = sectionPriorities
            .sort((a, b) => {
                // High priority and low complexity sections first
                const scoreA = a.priority - (a.complexity * 0.3) + a.userPreference;
                const scoreB = b.priority - (b.complexity * 0.3) + b.userPreference;
                return scoreB - scoreA;
            })
            .map(item => item.index);
    }

    // Calculate section priority
    calculateSectionPriority(section, index) {
        let priority = 50; // Base priority

        // Critical sections (baseline, mood) get higher priority
        if (section.type === 'baseline' || section.id === 'mood_tracking') {
            priority += 30;
        }

        // Required sections get moderate boost
        if (section.required) {
            priority += 20;
        }

        // Earlier sections get slight boost for logical flow
        priority += (this.sections.length - index) * 2;

        // Previously incomplete sections get priority boost
        if (this.getPreviousCompletionRate(section.id) < 0.8) {
            priority += 15;
        }

        return priority;
    }

    // Estimate time needed for section
    estimateSectionTime(section) {
        const baseTime = 30000; // 30 seconds base
        const questionTime = 5000; // 5 seconds per question
        
        let estimatedTime = baseTime;
        
        if (section.questions) {
            estimatedTime += section.questions.length * questionTime;
        }

        // Complex sections take longer
        if (section.type === 'sdoh' || section.type === 'environmental') {
            estimatedTime *= 1.5;
        }

        return estimatedTime;
    }

    // Assess section complexity
    assessComplexity(section) {
        let complexity = 1; // Base complexity

        if (section.questions) {
            // More questions = higher complexity
            complexity += section.questions.length * 0.1;

            // Complex question types increase complexity
            section.questions.forEach(question => {
                if (question.type === 'multiple_choice') complexity += 0.2;
                if (question.conditional) complexity += 0.3;
                if (question.validation) complexity += 0.1;
            });
        }

        // Environmental data collection is inherently complex
        if (section.type === 'environmental' || section.type === 'geographic') {
            complexity += 0.5;
        }

        return Math.min(complexity, 3); // Cap at 3
    }

    // Get user preference for section type
    getUserPreference(sectionId) {
        const preferences = this.loadUserPreferences();
        return preferences[sectionId] || 0;
    }

    // Get previous completion rate for section
    getPreviousCompletionRate(sectionId) {
        const history = this.loadCompletionHistory();
        const sectionHistory = history.filter(entry => entry.sectionId === sectionId);
        
        if (sectionHistory.length === 0) return 0;
        
        const completions = sectionHistory.filter(entry => entry.completed);
        return completions.length / sectionHistory.length;
    }

    // Setup progressive UI structure
    setupProgressiveUI() {
        const container = document.createElement('div');
        container.id = 'progressive-disclosure-container';
        container.className = 'progressive-container';
        container.innerHTML = `
            <div class="progress-header">
                <div class="overall-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div id="progress-fill" class="progress-fill"></div>
                        </div>
                        <span id="progress-text" class="progress-text">Step 1 of ${this.totalSteps}</span>
                    </div>
                    <div class="time-estimate">
                        <span id="time-remaining">Estimated time: <span id="time-value">--</span></span>
                    </div>
                </div>
                
                <div class="step-indicators">
                    ${this.createStepIndicators()}
                </div>
            </div>

            <div class="content-area">
                <div id="current-step-content" class="step-content">
                    <!-- Current step content will be inserted here -->
                </div>
                
                <div class="step-sidebar">
                    <div class="completion-summary">
                        <h4>Your Progress</h4>
                        <div id="completion-stats"></div>
                    </div>
                    
                    <div class="navigation-help">
                        <h4>Navigation Tips</h4>
                        <ul>
                            <li>You can return to previous steps anytime</li>
                            <li>Your progress is automatically saved</li>
                            <li>Take breaks when needed</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="navigation-controls">
                <button id="prev-step" class="nav-btn prev-btn" disabled>
                    ← Previous
                </button>
                
                <div class="center-controls">
                    <button id="save-progress" class="save-btn">
                        💾 Save Progress
                    </button>
                    <button id="take-break" class="break-btn" style="display: none;">
                        ☕ Take a Break
                    </button>
                </div>
                
                <button id="next-step" class="nav-btn next-btn">
                    Next →
                </button>
            </div>

            <div id="fatigue-warning" class="fatigue-warning" style="display: none;">
                <div class="warning-content">
                    <h4>🧠 Survey Fatigue Detected</h4>
                    <p>You've been working for a while. Consider taking a short break to maintain data quality.</p>
                    <div class="warning-actions">
                        <button id="continue-anyway" class="continue-btn">Continue</button>
                        <button id="take-suggested-break" class="break-btn">Take Break (30s)</button>
                    </div>
                </div>
            </div>

            <div id="adaptive-suggestions" class="adaptive-suggestions" style="display: none;">
                <!-- Adaptive suggestions will appear here -->
            </div>
        `;

        this.attachProgressiveEventListeners(container);
        return container;
    }

    // Create step indicators
    createStepIndicators() {
        return this.adaptiveOrder.map((sectionIndex, stepIndex) => {
            const section = this.sections[sectionIndex];
            return `
                <div class="step-indicator ${stepIndex === this.currentStep ? 'current' : ''}" 
                     data-step="${stepIndex}" data-section-id="${section.id}">
                    <div class="step-number">${stepIndex + 1}</div>
                    <div class="step-label">${section.title}</div>
                    <div class="step-status">
                        <span class="status-icon">⚪</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Attach event listeners for progressive disclosure
    attachProgressiveEventListeners(container) {
        // Navigation buttons
        const prevBtn = container.querySelector('#prev-step');
        const nextBtn = container.querySelector('#next-step');
        const saveBtn = container.querySelector('#save-progress');
        const breakBtn = container.querySelector('#take-break');

        prevBtn.addEventListener('click', () => this.navigateToPreviousStep());
        nextBtn.addEventListener('click', () => this.navigateToNextStep());
        saveBtn.addEventListener('click', () => this.saveProgress());
        breakBtn.addEventListener('click', () => this.initiateBreak());

        // Step indicators
        const stepIndicators = container.querySelectorAll('.step-indicator');
        stepIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (this.canNavigateToStep(index)) {
                    this.navigateToStep(index);
                }
            });
        });

        // Fatigue warning controls
        const continueBtn = container.querySelector('#continue-anyway');
        const suggestedBreakBtn = container.querySelector('#take-suggested-break');

        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.dismissFatigueWarning());
        }
        if (suggestedBreakBtn) {
            suggestedBreakBtn.addEventListener('click', () => this.takeSuggestedBreak());
        }

        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveProgress();
            }
        });
    }

    // Navigate to specific step
    navigateToStep(stepIndex) {
        if (!this.canNavigateToStep(stepIndex)) {
            this.showNavigationWarning(stepIndex);
            return;
        }

        // Record navigation metrics
        this.recordNavigation(this.currentStep, stepIndex);

        // Update step
        this.currentStep = stepIndex;
        this.stepHistory.push({
            stepIndex,
            timestamp: Date.now(),
            direction: stepIndex > this.currentStep ? 'forward' : 'backward'
        });

        // Load step content
        this.loadStepContent();
        this.updateProgressUI();
        this.checkFatigueLevel();
        this.saveProgress();
    }

    // Navigate to next step
    navigateToNextStep() {
        // Validate current step before proceeding
        if (!this.validateCurrentStep()) {
            this.showValidationError();
            return;
        }

        if (this.currentStep < this.totalSteps - 1) {
            this.navigateToStep(this.currentStep + 1);
        } else {
            this.completeProgression();
        }
    }

    // Navigate to previous step
    navigateToPreviousStep() {
        if (this.currentStep > 0) {
            this.fatigueMetrics.backwardNavigations++;
            this.navigateToStep(this.currentStep - 1);
        }
    }

    // Check if user can navigate to step
    canNavigateToStep(stepIndex) {
        // Can always go back
        if (stepIndex <= this.currentStep) {
            return true;
        }

        // Can go forward if current step is valid
        if (stepIndex === this.currentStep + 1) {
            return this.validateCurrentStep();
        }

        // Check if skipping is allowed and step is eligible
        if (this.adaptiveSettings.enableSmartSkipping) {
            return this.canSkipToStep(stepIndex);
        }

        return false;
    }

    // Check if step can be skipped
    canSkipToStep(stepIndex) {
        const targetSection = this.sections[this.adaptiveOrder[stepIndex]];
        
        // Optional sections can be skipped
        if (!targetSection.required) {
            return true;
        }

        // Check if user has completed similar sections before
        const completionHistory = this.loadCompletionHistory();
        const similarSections = completionHistory.filter(entry => 
            entry.sectionType === targetSection.type && entry.completed
        );

        return similarSections.length > 0;
    }

    // Load content for current step
    loadStepContent() {
        const sectionIndex = this.adaptiveOrder[this.currentStep];
        const section = this.sections[sectionIndex];
        const contentContainer = document.getElementById('current-step-content');

        if (!contentContainer) return;

        // Record step start time
        this.fatigueMetrics.stepTimes.push({
            stepIndex: this.currentStep,
            startTime: Date.now()
        });

        // Generate content based on section type
        let content = '';
        
        switch (section.type) {
            case 'mood_tracking':
                content = this.createMoodTrackingStep(section);
                break;
            case 'geographic':
                content = this.createGeographicStep(section);
                break;
            case 'sdoh':
                content = this.createSDOHStep(section);
                break;
            case 'environmental':
                content = this.createEnvironmentalStep(section);
                break;
            default:
                content = this.createGenericStep(section);
        }

        contentContainer.innerHTML = content;
        
        // Initialize step-specific functionality
        this.initializeStepComponents(section);
        
        // Scroll to top
        contentContainer.scrollTop = 0;
    }

    // Create mood tracking step
    createMoodTrackingStep(section) {
        return `
            <div class="step-header">
                <h2>${section.title}</h2>
                <p class="step-description">${section.description}</p>
                <div class="step-progress">
                    Questions about your mood and mental health
                </div>
            </div>
            <div class="step-body">
                <div id="mood-tracking-container">
                    <!-- Mood tracking component will be inserted here -->
                </div>
            </div>
        `;
    }

    // Create geographic step
    createGeographicStep(section) {
        return `
            <div class="step-header">
                <h2>${section.title}</h2>
                <p class="step-description">${section.description}</p>
                <div class="privacy-notice">
                    🔒 Your location data is anonymized and used only for research
                </div>
            </div>
            <div class="step-body">
                <div id="geographic-container">
                    <!-- Geographic component will be inserted here -->
                </div>
            </div>
        `;
    }

    // Create SDOH step
    createSDOHStep(section) {
        return `
            <div class="step-header">
                <h2>${section.title}</h2>
                <p class="step-description">${section.description}</p>
                <div class="completion-incentive">
                    📊 Help us understand social factors that affect mental health
                </div>
            </div>
            <div class="step-body">
                <div id="sdoh-container">
                    <!-- SDOH component will be inserted here -->
                </div>
            </div>
        `;
    }

    // Create environmental step
    createEnvironmentalStep(section) {
        return `
            <div class="step-header">
                <h2>${section.title}</h2>
                <p class="step-description">${section.description}</p>
                <div class="auto-detection-notice">
                    🤖 We can automatically detect some environmental factors
                </div>
            </div>
            <div class="step-body">
                <div id="environmental-container">
                    <!-- Environmental component will be inserted here -->
                </div>
            </div>
        `;
    }

    // Create generic step
    createGenericStep(section) {
        return `
            <div class="step-header">
                <h2>${section.title}</h2>
                <p class="step-description">${section.description || 'Please complete this section'}</p>
            </div>
            <div class="step-body">
                <div class="generic-content">
                    ${section.content || 'Section content will appear here'}
                </div>
            </div>
        `;
    }

    // Initialize step-specific components
    initializeStepComponents(section) {
        switch (section.type) {
            case 'mood_tracking':
                if (window.MoodTrackingSystem) {
                    const moodTracker = new window.MoodTrackingSystem();
                    const container = document.getElementById('mood-tracking-container');
                    // Initialize mood tracking component
                }
                break;
            case 'geographic':
                if (window.GeographicDataCollection) {
                    const geoCollector = new window.GeographicDataCollection();
                    const container = document.getElementById('geographic-container');
                    container.appendChild(geoCollector.createGeographicUI());
                }
                break;
            case 'sdoh':
                if (window.SDOHQuestionnaire) {
                    const sdohQuest = new window.SDOHQuestionnaire();
                    const container = document.getElementById('sdoh-container');
                    // Initialize SDOH questionnaire
                }
                break;
            case 'environmental':
                if (window.EnvironmentalContextCollection) {
                    const envCollector = new window.EnvironmentalContextCollection();
                    const container = document.getElementById('environmental-container');
                    container.appendChild(envCollector.createEnvironmentalContextForm());
                }
                break;
        }
    }

    // Update progress UI
    updateProgressUI() {
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill && progressText) {
            const percentage = ((this.currentStep + 1) / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `Step ${this.currentStep + 1} of ${this.totalSteps}`;
        }

        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.remove('current', 'completed', 'available');
            
            if (index === this.currentStep) {
                indicator.classList.add('current');
            } else if (index < this.currentStep) {
                indicator.classList.add('completed');
                indicator.querySelector('.status-icon').textContent = '✅';
            } else if (this.canNavigateToStep(index)) {
                indicator.classList.add('available');
            }
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 0;
        }
        
        if (nextBtn) {
            if (this.currentStep === this.totalSteps - 1) {
                nextBtn.textContent = 'Complete';
                nextBtn.classList.add('complete-btn');
            } else {
                nextBtn.textContent = 'Next →';
                nextBtn.classList.remove('complete-btn');
            }
        }

        // Update time estimate
        this.updateTimeEstimate();
        
        // Update completion stats
        this.updateCompletionStats();
    }

    // Update time estimate
    updateTimeEstimate() {
        const timeValue = document.getElementById('time-value');
        if (!timeValue) return;

        const remainingSteps = this.totalSteps - this.currentStep - 1;
        const avgTimePerStep = this.calculateAverageStepTime();
        const estimatedMinutes = Math.ceil((remainingSteps * avgTimePerStep) / 60000);

        if (estimatedMinutes < 1) {
            timeValue.textContent = '< 1 minute';
        } else if (estimatedMinutes === 1) {
            timeValue.textContent = '1 minute';
        } else {
            timeValue.textContent = `${estimatedMinutes} minutes`;
        }
    }

    // Calculate average step time
    calculateAverageStepTime() {
        const completedSteps = this.fatigueMetrics.stepTimes.filter(step => step.endTime);
        
        if (completedSteps.length === 0) {
            return 60000; // Default 1 minute per step
        }

        const totalTime = completedSteps.reduce((sum, step) => 
            sum + (step.endTime - step.startTime), 0
        );

        return totalTime / completedSteps.length;
    }

    // Update completion stats
    updateCompletionStats() {
        const statsContainer = document.getElementById('completion-stats');
        if (!statsContainer) return;

        const completedSteps = this.currentStep;
        const completionPercentage = Math.round((completedSteps / this.totalSteps) * 100);

        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Completed:</span>
                <span class="stat-value">${completedSteps}/${this.totalSteps}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Progress:</span>
                <span class="stat-value">${completionPercentage}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Quality Score:</span>
                <span class="stat-value">${this.calculateCurrentQualityScore()}/100</span>
            </div>
        `;
    }

    // Calculate current quality score
    calculateCurrentQualityScore() {
        // Base score
        let score = 100;

        // Deduct for excessive backward navigation
        if (this.fatigueMetrics.backwardNavigations > 3) {
            score -= (this.fatigueMetrics.backwardNavigations - 3) * 5;
        }

        // Deduct for rapid completion (potential rushing)
        const avgStepTime = this.calculateAverageStepTime();
        if (avgStepTime < 15000) { // Less than 15 seconds per step
            score -= 20;
        }

        // Add bonus for thorough completion
        const timeSpent = Date.now() - this.fatigueMetrics.startTime;
        const expectedTime = this.totalSteps * 60000; // 1 minute per step
        if (timeSpent >= expectedTime * 0.8) {
            score += 10;
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // Check fatigue level
    checkFatigueLevel() {
        if (!this.adaptiveSettings.enableFatigueDetection) return;

        const timeSpent = Date.now() - this.fatigueMetrics.startTime;
        const stepsCompleted = this.currentStep;
        
        // Check if user has been working for too long
        const shouldSuggestBreak = 
            stepsCompleted > 0 && 
            stepsCompleted % this.adaptiveSettings.maxStepsBeforeBreak === 0;

        // Check for signs of fatigue
        const avgStepTime = this.calculateAverageStepTime();
        const recentStepTimes = this.fatigueMetrics.stepTimes.slice(-3);
        const showingFatigueSign = recentStepTimes.length >= 3 && 
            recentStepTimes.every(step => (step.endTime - step.startTime) < avgStepTime * 0.5);

        if (shouldSuggestBreak || showingFatigueSign) {
            this.showFatigueWarning();
        }
    }

    // Show fatigue warning
    showFatigueWarning() {
        const fatigueWarning = document.getElementById('fatigue-warning');
        if (fatigueWarning) {
            fatigueWarning.style.display = 'block';
            
            // Auto-hide after 10 seconds if no action taken
            setTimeout(() => {
                if (fatigueWarning.style.display === 'block') {
                    this.dismissFatigueWarning();
                }
            }, 10000);
        }
    }

    // Dismiss fatigue warning
    dismissFatigueWarning() {
        const fatigueWarning = document.getElementById('fatigue-warning');
        if (fatigueWarning) {
            fatigueWarning.style.display = 'none';
        }
    }

    // Take suggested break
    takeSuggestedBreak() {
        this.dismissFatigueWarning();
        this.initiateBreak(this.adaptiveSettings.suggestedBreakDuration);
    }

    // Initiate break
    initiateBreak(duration = 30000) {
        const breakBtn = document.getElementById('take-break');
        if (!breakBtn) return;

        const originalText = breakBtn.textContent;
        let remainingTime = duration / 1000;

        breakBtn.disabled = true;
        
        const breakInterval = setInterval(() => {
            breakBtn.textContent = `Break: ${remainingTime}s`;
            remainingTime--;

            if (remainingTime < 0) {
                clearInterval(breakInterval);
                breakBtn.textContent = originalText;
                breakBtn.disabled = false;
                
                // Record break in metrics
                this.fatigueMetrics.pauseTimes.push({
                    timestamp: Date.now(),
                    duration: duration
                });
            }
        }, 1000);
    }

    // Validate current step
    validateCurrentStep() {
        const sectionIndex = this.adaptiveOrder[this.currentStep];
        const section = this.sections[sectionIndex];

        // If section is not required, it's always valid
        if (!section.required) {
            return true;
        }

        // Check if step has validation system
        if (window.FormValidationSystem) {
            const validator = new window.FormValidationSystem();
            // Implement specific validation logic based on section type
            return this.validateSectionData(section);
        }

        return true; // Default to valid if no validation system
    }

    // Validate section data
    validateSectionData(section) {
        // This would integrate with the specific validation systems
        // for each section type
        return true; // Placeholder
    }

    // Show validation error
    showValidationError() {
        const adaptiveSuggestions = document.getElementById('adaptive-suggestions');
        if (adaptiveSuggestions) {
            adaptiveSuggestions.innerHTML = `
                <div class="validation-suggestion">
                    <h4>⚠️ Please Complete Required Fields</h4>
                    <p>Some required information is missing from this step. Please review and complete all required fields before proceeding.</p>
                    <button onclick="this.parentElement.parentElement.style.display='none'" class="close-btn">
                        ✖ Close
                    </button>
                </div>
            `;
            adaptiveSuggestions.style.display = 'block';
        }
    }

    // Complete progression
    completeProgression() {
        // Record completion time
        this.fatigueMetrics.endTime = Date.now();
        
        // Calculate final metrics
        const completionMetrics = {
            totalTime: this.fatigueMetrics.endTime - this.fatigueMetrics.startTime,
            stepsCompleted: this.totalSteps,
            backwardNavigations: this.fatigueMetrics.backwardNavigations,
            averageStepTime: this.calculateAverageStepTime(),
            qualityScore: this.calculateCurrentQualityScore(),
            breaksTaken: this.fatigueMetrics.pauseTimes.length
        };

        // Show completion screen
        this.showCompletionScreen(completionMetrics);
        
        // Save completion data
        this.saveCompletionData(completionMetrics);
    }

    // Show completion screen
    showCompletionScreen(metrics) {
        const contentContainer = document.getElementById('current-step-content');
        if (!contentContainer) return;

        contentContainer.innerHTML = `
            <div class="completion-screen">
                <div class="completion-header">
                    <h2>🎉 Survey Completed!</h2>
                    <p>Thank you for your thorough participation in this research study.</p>
                </div>
                
                <div class="completion-metrics">
                    <h3>Your Completion Summary</h3>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Total Time:</span>
                            <span class="metric-value">${Math.round(metrics.totalTime / 60000)} minutes</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Steps Completed:</span>
                            <span class="metric-value">${metrics.stepsCompleted}/${this.totalSteps}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Data Quality Score:</span>
                            <span class="metric-value">${metrics.qualityScore}/100</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Breaks Taken:</span>
                            <span class="metric-value">${metrics.breaksTaken}</span>
                        </div>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h3>What Happens Next?</h3>
                    <ul>
                        <li>Your data has been securely saved and anonymized</li>
                        <li>You may be contacted for follow-up assessments</li>
                        <li>Research findings will be made available to participants</li>
                    </ul>
                </div>
                
                <div class="completion-actions">
                    <button id="download-summary" class="action-btn">
                        📄 Download Summary
                    </button>
                    <button id="schedule-followup" class="action-btn">
                        📅 Schedule Follow-up
                    </button>
                </div>
            </div>
        `;

        // Hide navigation controls
        const navControls = document.querySelector('.navigation-controls');
        if (navControls) {
            navControls.style.display = 'none';
        }
    }

    // Save progress
    saveProgress() {
        const progressData = {
            currentStep: this.currentStep,
            totalSteps: this.totalSteps,
            adaptiveOrder: this.adaptiveOrder,
            stepHistory: this.stepHistory,
            fatigueMetrics: this.fatigueMetrics,
            userProgress: this.userProgress,
            lastSaved: Date.now()
        };

        localStorage.setItem('progressive_disclosure_progress', JSON.stringify(progressData));
    }

    // Load progress
    loadProgress() {
        const saved = localStorage.getItem('progressive_disclosure_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentStep = data.currentStep || 0;
                this.stepHistory = data.stepHistory || [];
                this.fatigueMetrics = { ...this.fatigueMetrics, ...data.fatigueMetrics };
                this.userProgress = data.userProgress || {};
            } catch (error) {
                console.error('Failed to load progress:', error);
            }
        }
    }

    // Record navigation
    recordNavigation(fromStep, toStep) {
        const navigation = {
            from: fromStep,
            to: toStep,
            timestamp: Date.now(),
            direction: toStep > fromStep ? 'forward' : 'backward'
        };

        if (!this.userProgress.navigations) {
            this.userProgress.navigations = [];
        }
        
        this.userProgress.navigations.push(navigation);
    }

    // Load user preferences
    loadUserPreferences() {
        const saved = localStorage.getItem('user_section_preferences');
        return saved ? JSON.parse(saved) : {};
    }

    // Load completion history
    loadCompletionHistory() {
        const saved = localStorage.getItem('section_completion_history');
        return saved ? JSON.parse(saved) : [];
    }

    // Save completion data
    saveCompletionData(metrics) {
        const completionData = {
            completionId: `completion_${Date.now()}`,
            metrics,
            fatigueMetrics: this.fatigueMetrics,
            userProgress: this.userProgress,
            adaptiveOrder: this.adaptiveOrder,
            timestamp: new Date().toISOString()
        };

        // Save to completion history
        const history = this.loadCompletionHistory();
        history.push(completionData);
        localStorage.setItem('completion_history', JSON.stringify(history));

        return completionData;
    }

    // Export progressive disclosure data
    exportProgressiveDisclosureData() {
        return {
            configuration: {
                totalSteps: this.totalSteps,
                adaptiveSettings: this.adaptiveSettings,
                adaptiveOrder: this.adaptiveOrder
            },
            userProgress: this.userProgress,
            fatigueMetrics: this.fatigueMetrics,
            stepHistory: this.stepHistory,
            navigationPatterns: this.analyzeNavigationPatterns(),
            completionMetrics: this.calculateFinalCompletionMetrics(),
            exportTimestamp: new Date().toISOString()
        };
    }

    // Analyze navigation patterns
    analyzeNavigationPatterns() {
        const navigations = this.userProgress.navigations || [];
        
        return {
            totalNavigations: navigations.length,
            forwardNavigations: navigations.filter(nav => nav.direction === 'forward').length,
            backwardNavigations: navigations.filter(nav => nav.direction === 'backward').length,
            averageStepTime: this.calculateAverageStepTime(),
            stepSkips: this.calculateStepSkips(),
            fatigueEvents: this.fatigueMetrics.pauseTimes.length
        };
    }

    // Calculate step skips
    calculateStepSkips() {
        const navigations = this.userProgress.navigations || [];
        return navigations.filter(nav => 
            nav.direction === 'forward' && (nav.to - nav.from) > 1
        ).length;
    }

    // Calculate final completion metrics
    calculateFinalCompletionMetrics() {
        return {
            completionRate: (this.currentStep + 1) / this.totalSteps,
            totalTime: this.fatigueMetrics.endTime - this.fatigueMetrics.startTime,
            qualityScore: this.calculateCurrentQualityScore(),
            efficiencyScore: this.calculateEfficiencyScore(),
            engagementScore: this.calculateEngagementScore()
        };
    }

    // Calculate efficiency score
    calculateEfficiencyScore() {
        const backwardNavs = this.fatigueMetrics.backwardNavigations;
        const totalSteps = this.totalSteps;
        
        // Penalize excessive backward navigation
        const efficiency = Math.max(0, 100 - (backwardNavs / totalSteps) * 50);
        return Math.round(efficiency);
    }

    // Calculate engagement score
    calculateEngagementScore() {
        const totalTime = Date.now() - this.fatigueMetrics.startTime;
        const expectedTime = this.totalSteps * 60000; // 1 minute per step
        
        // Optimal engagement is around the expected time
        const timeRatio = totalTime / expectedTime;
        let engagement = 100;
        
        if (timeRatio < 0.5) {
            engagement -= 30; // Too fast, possibly rushing
        } else if (timeRatio > 2) {
            engagement -= 20; // Too slow, possibly distracted
        }
        
        return Math.max(0, Math.round(engagement));
    }
}

// Export for use in other modules
window.ProgressiveDisclosureUI = ProgressiveDisclosureUI;