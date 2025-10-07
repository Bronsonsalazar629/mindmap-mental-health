/**
 * Research-Grade Mood Tracking Components
 * PHQ-9 and GAD-7 compatible scales with validation
 */

class MoodTrackingSystem {
    constructor() {
        this.currentStep = 0;
        this.responses = {};
        this.validationErrors = [];
        this.isOffline = !navigator.onLine;
        this.setupOfflineDetection();
    }

    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOffline = false;
            this.syncOfflineData();
        });
        window.addEventListener('offline', () => {
            this.isOffline = true;
        });
    }

    // PHQ-9 Depression Scale
    getPHQ9Questions() {
        return [
            {
                id: 'phq9_1',
                text: 'Little interest or pleasure in doing things',
                scale: 'phq9',
                domain: 'anhedonia',
                required: true
            },
            {
                id: 'phq9_2',
                text: 'Feeling down, depressed, or hopeless',
                scale: 'phq9',
                domain: 'depressed_mood',
                required: true
            },
            {
                id: 'phq9_3',
                text: 'Trouble falling or staying asleep, or sleeping too much',
                scale: 'phq9',
                domain: 'sleep_disturbance',
                required: true
            },
            {
                id: 'phq9_4',
                text: 'Feeling tired or having little energy',
                scale: 'phq9',
                domain: 'fatigue',
                required: true
            },
            {
                id: 'phq9_5',
                text: 'Poor appetite or overeating',
                scale: 'phq9',
                domain: 'appetite_changes',
                required: true
            },
            {
                id: 'phq9_6',
                text: 'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
                scale: 'phq9',
                domain: 'self_worth',
                required: true
            },
            {
                id: 'phq9_7',
                text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
                scale: 'phq9',
                domain: 'concentration',
                required: true
            },
            {
                id: 'phq9_8',
                text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite being so fidgety or restless that you have been moving around a lot more than usual',
                scale: 'phq9',
                domain: 'psychomotor',
                required: true
            },
            {
                id: 'phq9_9',
                text: 'Thoughts that you would be better off dead, or of hurting yourself in some way',
                scale: 'phq9',
                domain: 'suicidal_ideation',
                required: true,
                critical: true
            }
        ];
    }

    // GAD-7 Anxiety Scale
    getGAD7Questions() {
        return [
            {
                id: 'gad7_1',
                text: 'Feeling nervous, anxious or on edge',
                scale: 'gad7',
                domain: 'nervousness',
                required: true
            },
            {
                id: 'gad7_2',
                text: 'Not being able to stop or control worrying',
                scale: 'gad7',
                domain: 'worry_control',
                required: true
            },
            {
                id: 'gad7_3',
                text: 'Worrying too much about different things',
                scale: 'gad7',
                domain: 'excessive_worry',
                required: true
            },
            {
                id: 'gad7_4',
                text: 'Trouble relaxing',
                scale: 'gad7',
                domain: 'relaxation_difficulty',
                required: true
            },
            {
                id: 'gad7_5',
                text: 'Being so restless that it is hard to sit still',
                scale: 'gad7',
                domain: 'restlessness',
                required: true
            },
            {
                id: 'gad7_6',
                text: 'Becoming easily annoyed or irritable',
                scale: 'gad7',
                domain: 'irritability',
                required: true
            },
            {
                id: 'gad7_7',
                text: 'Feeling afraid as if something awful might happen',
                scale: 'gad7',
                domain: 'fear_catastrophe',
                required: true
            }
        ];
    }

    // Response scale options
    getResponseScale(scaleType) {
        if (scaleType === 'phq9' || scaleType === 'gad7') {
            return [
                { value: 0, label: 'Not at all', description: 'Never experienced this' },
                { value: 1, label: 'Several days', description: '1-6 days in the past 2 weeks' },
                { value: 2, label: 'More than half the days', description: '7+ days in the past 2 weeks' },
                { value: 3, label: 'Nearly every day', description: '11+ days in the past 2 weeks' }
            ];
        }
        return [];
    }

    // Create question component
    createQuestionComponent(question, questionIndex, totalQuestions) {
        const container = document.createElement('div');
        container.className = 'mood-question-container';
        container.setAttribute('data-question-id', question.id);

        // Progressive disclosure header
        const header = document.createElement('div');
        header.className = 'question-header';
        header.innerHTML = `
            <div class="question-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((questionIndex + 1) / totalQuestions) * 100}%"></div>
                </div>
                <span class="progress-text">${questionIndex + 1} of ${totalQuestions}</span>
            </div>
            <h3 class="question-title">
                Over the last 2 weeks, how often have you been bothered by:
            </h3>
        `;

        // Question text
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.innerHTML = `
            <p class="question-prompt">${question.text}</p>
            ${question.critical ? '<div class="critical-warning">⚠️ This question helps assess safety concerns</div>' : ''}
        `;

        // Response options
        const responseContainer = document.createElement('div');
        responseContainer.className = 'response-container';
        
        const scale = this.getResponseScale(question.scale);
        scale.forEach((option, index) => {
            const optionElement = document.createElement('label');
            optionElement.className = 'response-option';
            optionElement.innerHTML = `
                <input type="radio" 
                       name="${question.id}" 
                       value="${option.value}" 
                       class="response-input"
                       ${question.required ? 'required' : ''}>
                <div class="response-label">
                    <span class="response-value">${option.label}</span>
                    <span class="response-description">${option.description}</span>
                </div>
            `;

            // Add validation feedback
            optionElement.addEventListener('change', (e) => {
                this.validateResponse(question.id, e.target.value);
                this.saveResponse(question.id, {
                    value: parseInt(e.target.value),
                    text: option.label,
                    timestamp: new Date().toISOString(),
                    domain: question.domain
                });
            });

            responseContainer.appendChild(optionElement);
        });

        // Validation feedback
        const feedback = document.createElement('div');
        feedback.className = 'validation-feedback';
        feedback.setAttribute('data-question-id', question.id);

        container.appendChild(header);
        container.appendChild(questionText);
        container.appendChild(responseContainer);
        container.appendChild(feedback);

        return container;
    }

    // Validate individual response
    validateResponse(questionId, value) {
        const errors = [];
        
        if (value === undefined || value === null || value === '') {
            errors.push('This question is required');
        }

        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 3) {
            errors.push('Please select a valid response option');
        }

        // Update validation state
        this.validationErrors = this.validationErrors.filter(e => e.questionId !== questionId);
        if (errors.length > 0) {
            this.validationErrors.push({ questionId, errors });
        }

        this.updateValidationFeedback(questionId, errors);
        return errors.length === 0;
    }

    // Update validation feedback UI
    updateValidationFeedback(questionId, errors) {
        const feedbackElement = document.querySelector(`[data-question-id="${questionId}"] .validation-feedback`);
        if (!feedbackElement) return;

        if (errors.length > 0) {
            feedbackElement.innerHTML = errors.map(error => 
                `<div class="validation-error">❌ ${error}</div>`
            ).join('');
            feedbackElement.style.display = 'block';
        } else {
            feedbackElement.innerHTML = '<div class="validation-success">✅ Response recorded</div>';
            feedbackElement.style.display = 'block';
            setTimeout(() => {
                feedbackElement.style.display = 'none';
            }, 2000);
        }
    }

    // Save response to local storage (offline capability)
    saveResponse(questionId, response) {
        this.responses[questionId] = response;
        
        // Save to localStorage for offline persistence
        const savedData = localStorage.getItem('mood_tracking_data') || '{}';
        const allData = JSON.parse(savedData);
        
        if (!allData.currentSession) {
            allData.currentSession = {
                sessionId: this.generateSessionId(),
                startTime: new Date().toISOString(),
                responses: {}
            };
        }
        
        allData.currentSession.responses[questionId] = response;
        allData.currentSession.lastUpdated = new Date().toISOString();
        
        localStorage.setItem('mood_tracking_data', JSON.stringify(allData));

        // Auto-sync if online
        if (!this.isOffline) {
            this.syncToServer();
        }
    }

    // Generate unique session ID
    generateSessionId() {
        return 'mood_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Calculate PHQ-9 score
    calculatePHQ9Score() {
        const phq9Questions = this.getPHQ9Questions();
        let totalScore = 0;
        let completedQuestions = 0;

        phq9Questions.forEach(question => {
            const response = this.responses[question.id];
            if (response && response.value !== undefined) {
                totalScore += response.value;
                completedQuestions++;
            }
        });

        return {
            totalScore,
            completedQuestions,
            maxPossibleScore: phq9Questions.length * 3,
            percentComplete: (completedQuestions / phq9Questions.length) * 100,
            interpretation: this.interpretPHQ9Score(totalScore, completedQuestions)
        };
    }

    // Calculate GAD-7 score
    calculateGAD7Score() {
        const gad7Questions = this.getGAD7Questions();
        let totalScore = 0;
        let completedQuestions = 0;

        gad7Questions.forEach(question => {
            const response = this.responses[question.id];
            if (response && response.value !== undefined) {
                totalScore += response.value;
                completedQuestions++;
            }
        });

        return {
            totalScore,
            completedQuestions,
            maxPossibleScore: gad7Questions.length * 3,
            percentComplete: (completedQuestions / gad7Questions.length) * 100,
            interpretation: this.interpretGAD7Score(totalScore, completedQuestions)
        };
    }

    // Interpret PHQ-9 scores according to research standards
    interpretPHQ9Score(score, completedQuestions) {
        if (completedQuestions < 9) {
            return { level: 'incomplete', description: 'Assessment incomplete' };
        }

        if (score >= 0 && score <= 4) {
            return { level: 'minimal', description: 'Minimal depression', color: '#10b981' };
        } else if (score >= 5 && score <= 9) {
            return { level: 'mild', description: 'Mild depression', color: '#f59e0b' };
        } else if (score >= 10 && score <= 14) {
            return { level: 'moderate', description: 'Moderate depression', color: '#f97316' };
        } else if (score >= 15 && score <= 19) {
            return { level: 'moderately_severe', description: 'Moderately severe depression', color: '#ef4444' };
        } else if (score >= 20) {
            return { level: 'severe', description: 'Severe depression', color: '#dc2626' };
        }
    }

    // Interpret GAD-7 scores according to research standards
    interpretGAD7Score(score, completedQuestions) {
        if (completedQuestions < 7) {
            return { level: 'incomplete', description: 'Assessment incomplete' };
        }

        if (score >= 0 && score <= 4) {
            return { level: 'minimal', description: 'Minimal anxiety', color: '#10b981' };
        } else if (score >= 5 && score <= 9) {
            return { level: 'mild', description: 'Mild anxiety', color: '#f59e0b' };
        } else if (score >= 10 && score <= 14) {
            return { level: 'moderate', description: 'Moderate anxiety', color: '#f97316' };
        } else if (score >= 15) {
            return { level: 'severe', description: 'Severe anxiety', color: '#ef4444' };
        }
    }

    // Check for critical responses (suicidal ideation)
    checkCriticalResponses() {
        const criticalResponses = [];
        
        // Check PHQ-9 question 9 (suicidal ideation)
        const suicidalResponse = this.responses['phq9_9'];
        if (suicidalResponse && suicidalResponse.value > 0) {
            criticalResponses.push({
                type: 'suicidal_ideation',
                score: suicidalResponse.value,
                severity: suicidalResponse.value >= 2 ? 'high' : 'moderate'
            });
        }

        return criticalResponses;
    }

    // Sync offline data when connection restored
    async syncOfflineData() {
        const savedData = localStorage.getItem('mood_tracking_data');
        if (!savedData) return;

        try {
            const data = JSON.parse(savedData);
            if (data.currentSession && !data.currentSession.synced) {
                await this.syncToServer(data.currentSession);
                
                // Mark as synced
                data.currentSession.synced = true;
                localStorage.setItem('mood_tracking_data', JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    }

    // Sync to server
    async syncToServer(sessionData = null) {
        const dataToSync = sessionData || this.getCurrentSessionData();
        
        try {
            const response = await fetch('/api/v1/mood/entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    session_id: dataToSync.sessionId,
                    responses: dataToSync.responses,
                    scores: {
                        phq9: this.calculatePHQ9Score(),
                        gad7: this.calculateGAD7Score()
                    },
                    critical_responses: this.checkCriticalResponses(),
                    metadata: {
                        completion_time: new Date().toISOString(),
                        device_info: this.getDeviceInfo()
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Sync failed:', error);
            throw error;
        }
    }

    // Get current session data
    getCurrentSessionData() {
        const savedData = localStorage.getItem('mood_tracking_data') || '{}';
        const data = JSON.parse(savedData);
        return data.currentSession || { responses: {} };
    }

    // Get auth token
    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }

    // Get device info for metadata
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    // Validate complete assessment
    validateCompleteAssessment() {
        const errors = [];
        const phq9Questions = this.getPHQ9Questions();
        const gad7Questions = this.getGAD7Questions();
        const allQuestions = [...phq9Questions, ...gad7Questions];

        allQuestions.forEach(question => {
            if (question.required && !this.responses[question.id]) {
                errors.push(`Question "${question.text}" is required`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            completionRate: (Object.keys(this.responses).length / allQuestions.length) * 100
        };
    }

    // Create assessment summary
    createAssessmentSummary() {
        const phq9Score = this.calculatePHQ9Score();
        const gad7Score = this.calculateGAD7Score();
        const criticalResponses = this.checkCriticalResponses();
        const validation = this.validateCompleteAssessment();

        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'assessment-summary';
        summaryContainer.innerHTML = `
            <div class="summary-header">
                <h3>Assessment Summary</h3>
                <div class="completion-rate">
                    Completion: ${validation.completionRate.toFixed(1)}%
                </div>
            </div>
            
            <div class="score-cards">
                <div class="score-card phq9">
                    <h4>Depression (PHQ-9)</h4>
                    <div class="score-value" style="color: ${phq9Score.interpretation?.color}">
                        ${phq9Score.totalScore}/${phq9Score.maxPossibleScore}
                    </div>
                    <div class="score-interpretation">
                        ${phq9Score.interpretation?.description || 'Incomplete'}
                    </div>
                </div>
                
                <div class="score-card gad7">
                    <h4>Anxiety (GAD-7)</h4>
                    <div class="score-value" style="color: ${gad7Score.interpretation?.color}">
                        ${gad7Score.totalScore}/${gad7Score.maxPossibleScore}
                    </div>
                    <div class="score-interpretation">
                        ${gad7Score.interpretation?.description || 'Incomplete'}
                    </div>
                </div>
            </div>
            
            ${criticalResponses.length > 0 ? `
                <div class="critical-alert">
                    <h4>⚠️ Safety Alert</h4>
                    <p>Your responses indicate you may be experiencing thoughts of self-harm. Please consider reaching out for support.</p>
                    <div class="crisis-resources">
                        <a href="tel:988" class="crisis-button">Call 988 - Suicide Prevention Lifeline</a>
                        <a href="sms:741741" class="crisis-button">Text HOME to 741741</a>
                    </div>
                </div>
            ` : ''}
            
            ${validation.errors.length > 0 ? `
                <div class="validation-errors">
                    <h4>Please complete the following:</h4>
                    <ul>
                        ${validation.errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        return summaryContainer;
    }
}

// Export for use in other modules
window.MoodTrackingSystem = MoodTrackingSystem;