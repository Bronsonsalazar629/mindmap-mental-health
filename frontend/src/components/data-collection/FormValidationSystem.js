/**
 * Comprehensive Form Validation System
 * Prevents incomplete or invalid submissions with research-grade validation
 */

class FormValidationSystem {
    constructor() {
        this.validationRules = new Map();
        this.validationErrors = new Map();
        this.validationWarnings = new Map();
        this.crossFieldValidators = [];
        this.validationHistory = [];
        this.realTimeValidation = true;
        this.validationStrategies = this.initializeValidationStrategies();
    }

    // Initialize validation strategies
    initializeValidationStrategies() {
        return {
            required: this.validateRequired.bind(this),
            email: this.validateEmail.bind(this),
            phone: this.validatePhone.bind(this),
            numeric: this.validateNumeric.bind(this),
            range: this.validateRange.bind(this),
            pattern: this.validatePattern.bind(this),
            length: this.validateLength.bind(this),
            date: this.validateDate.bind(this),
            consistency: this.validateConsistency.bind(this),
            research_quality: this.validateResearchQuality.bind(this)
        };
    }

    // Register validation rule for a field
    registerValidation(fieldId, rules) {
        this.validationRules.set(fieldId, {
            fieldId,
            rules: Array.isArray(rules) ? rules : [rules],
            lastValidated: null,
            validationCount: 0
        });
    }

    // Register cross-field validator
    registerCrossFieldValidator(validatorConfig) {
        this.crossFieldValidators.push({
            id: validatorConfig.id,
            fields: validatorConfig.fields,
            validator: validatorConfig.validator,
            message: validatorConfig.message,
            severity: validatorConfig.severity || 'error'
        });
    }

    // Validate single field
    validateField(fieldId, value, context = {}) {
        const fieldValidation = this.validationRules.get(fieldId);
        if (!fieldValidation) {
            return { isValid: true, errors: [], warnings: [] };
        }

        const errors = [];
        const warnings = [];

        fieldValidation.rules.forEach(rule => {
            try {
                const result = this.executeValidationRule(rule, value, context);
                
                if (!result.isValid) {
                    if (result.severity === 'warning') {
                        warnings.push(result.message);
                    } else {
                        errors.push(result.message);
                    }
                }
            } catch (error) {
                console.error(`Validation rule execution failed for field ${fieldId}:`, error);
                errors.push('Validation error occurred');
            }
        });

        // Update validation state
        fieldValidation.lastValidated = new Date().toISOString();
        fieldValidation.validationCount++;

        const validationResult = {
            fieldId,
            isValid: errors.length === 0,
            errors,
            warnings,
            timestamp: new Date().toISOString()
        };

        // Store results
        if (errors.length > 0) {
            this.validationErrors.set(fieldId, errors);
        } else {
            this.validationErrors.delete(fieldId);
        }

        if (warnings.length > 0) {
            this.validationWarnings.set(fieldId, warnings);
        } else {
            this.validationWarnings.delete(fieldId);
        }

        // Add to validation history
        this.validationHistory.push(validationResult);

        // Update UI
        this.updateFieldValidationUI(fieldId, validationResult);

        return validationResult;
    }

    // Execute individual validation rule
    executeValidationRule(rule, value, context) {
        const strategyName = rule.type || rule.strategy;
        const strategy = this.validationStrategies[strategyName];

        if (!strategy) {
            throw new Error(`Unknown validation strategy: ${strategyName}`);
        }

        return strategy(value, rule.params || {}, context);
    }

    // Validation strategy implementations
    validateRequired(value, params) {
        const isEmpty = value === null || value === undefined || 
                       (typeof value === 'string' && value.trim() === '') ||
                       (Array.isArray(value) && value.length === 0);

        return {
            isValid: !isEmpty,
            message: params.message || 'This field is required',
            severity: 'error'
        };
    }

    validateEmail(value, params) {
        if (!value) return { isValid: true }; // Optional unless required
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);

        return {
            isValid,
            message: params.message || 'Please enter a valid email address',
            severity: 'error'
        };
    }

    validatePhone(value, params) {
        if (!value) return { isValid: true };
        
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanValue = value.replace(/[\s\-\(\)]/g, '');
        const isValid = phoneRegex.test(cleanValue);

        return {
            isValid,
            message: params.message || 'Please enter a valid phone number',
            severity: 'error'
        };
    }

    validateNumeric(value, params) {
        if (!value) return { isValid: true };
        
        const numValue = parseFloat(value);
        const isValid = !isNaN(numValue) && isFinite(numValue);

        return {
            isValid,
            message: params.message || 'Please enter a valid number',
            severity: 'error'
        };
    }

    validateRange(value, params) {
        if (!value) return { isValid: true };
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return {
                isValid: false,
                message: 'Value must be a number',
                severity: 'error'
            };
        }

        const { min, max } = params;
        let isValid = true;
        let message = '';

        if (min !== undefined && numValue < min) {
            isValid = false;
            message = `Value must be at least ${min}`;
        } else if (max !== undefined && numValue > max) {
            isValid = false;
            message = `Value must be no more than ${max}`;
        }

        return {
            isValid,
            message: params.message || message,
            severity: 'error'
        };
    }

    validatePattern(value, params) {
        if (!value) return { isValid: true };
        
        const pattern = new RegExp(params.pattern);
        const isValid = pattern.test(value);

        return {
            isValid,
            message: params.message || 'Value does not match required format',
            severity: 'error'
        };
    }

    validateLength(value, params) {
        if (!value) return { isValid: true };
        
        const length = value.length;
        const { min, max } = params;
        let isValid = true;
        let message = '';

        if (min !== undefined && length < min) {
            isValid = false;
            message = `Must be at least ${min} characters`;
        } else if (max !== undefined && length > max) {
            isValid = false;
            message = `Must be no more than ${max} characters`;
        }

        return {
            isValid,
            message: params.message || message,
            severity: 'error'
        };
    }

    validateDate(value, params) {
        if (!value) return { isValid: true };
        
        const date = new Date(value);
        const isValidDate = !isNaN(date.getTime());

        if (!isValidDate) {
            return {
                isValid: false,
                message: params.message || 'Please enter a valid date',
                severity: 'error'
            };
        }

        // Check date constraints
        const { minDate, maxDate, futureOnly, pastOnly } = params;
        const now = new Date();

        if (futureOnly && date <= now) {
            return {
                isValid: false,
                message: 'Date must be in the future',
                severity: 'error'
            };
        }

        if (pastOnly && date >= now) {
            return {
                isValid: false,
                message: 'Date must be in the past',
                severity: 'error'
            };
        }

        if (minDate && date < new Date(minDate)) {
            return {
                isValid: false,
                message: `Date must be after ${minDate}`,
                severity: 'error'
            };
        }

        if (maxDate && date > new Date(maxDate)) {
            return {
                isValid: false,
                message: `Date must be before ${maxDate}`,
                severity: 'error'
            };
        }

        return { isValid: true };
    }

    validateConsistency(value, params, context) {
        const { relatedField, relatedValue, comparison } = params;
        
        if (!relatedValue) {
            return { isValid: true }; // Can't validate consistency without related value
        }

        let isValid = true;
        let message = '';

        switch (comparison) {
            case 'equal':
                isValid = value === relatedValue;
                message = `Must match ${relatedField}`;
                break;
            case 'greater':
                isValid = parseFloat(value) > parseFloat(relatedValue);
                message = `Must be greater than ${relatedField}`;
                break;
            case 'less':
                isValid = parseFloat(value) < parseFloat(relatedValue);
                message = `Must be less than ${relatedField}`;
                break;
            case 'not_equal':
                isValid = value !== relatedValue;
                message = `Must be different from ${relatedField}`;
                break;
        }

        return {
            isValid,
            message: params.message || message,
            severity: 'error'
        };
    }

    validateResearchQuality(value, params, context) {
        const warnings = [];
        let qualityScore = 100;

        // Check for rushed responses (if timestamps available)
        if (context.responseTime && context.responseTime < 1000) {
            warnings.push('Response may have been rushed');
            qualityScore -= 10;
        }

        // Check for extreme values in scales
        if (params.scaleType === 'likert' && (value === params.min || value === params.max)) {
            warnings.push('Extreme scale values may indicate response bias');
            qualityScore -= 5;
        }

        // Check for pattern responses
        if (context.previousResponses && this.detectPatternResponse(value, context.previousResponses)) {
            warnings.push('Response pattern detected - please consider each question carefully');
            qualityScore -= 15;
        }

        // Check for missing context data
        if (params.requiresContext && !context.hasContextData) {
            warnings.push('Consider providing additional context for more accurate analysis');
            qualityScore -= 5;
        }

        return {
            isValid: qualityScore >= 70,
            message: warnings.join('; '),
            severity: qualityScore < 70 ? 'error' : 'warning',
            qualityScore
        };
    }

    // Detect pattern responses (e.g., all same values)
    detectPatternResponse(currentValue, previousResponses) {
        if (previousResponses.length < 3) return false;

        const recent = previousResponses.slice(-3);
        return recent.every(response => response.value === currentValue);
    }

    // Validate entire form
    validateForm(formData, formConfig = {}) {
        const validationResults = new Map();
        const formErrors = [];
        const formWarnings = [];

        // Validate individual fields
        for (const [fieldId, value] of Object.entries(formData)) {
            const result = this.validateField(fieldId, value, {
                formData,
                hasContextData: this.hasRequiredContext(formData),
                previousResponses: this.getPreviousResponses(fieldId)
            });
            
            validationResults.set(fieldId, result);
            
            if (!result.isValid) {
                formErrors.push(...result.errors.map(error => ({ fieldId, error })));
            }
            
            if (result.warnings.length > 0) {
                formWarnings.push(...result.warnings.map(warning => ({ fieldId, warning })));
            }
        }

        // Execute cross-field validations
        this.crossFieldValidators.forEach(validator => {
            try {
                const relevantData = {};
                validator.fields.forEach(fieldId => {
                    relevantData[fieldId] = formData[fieldId];
                });

                const result = validator.validator(relevantData, formData);
                if (!result.isValid) {
                    if (result.severity === 'warning') {
                        formWarnings.push({
                            type: 'cross_field',
                            validator: validator.id,
                            message: result.message
                        });
                    } else {
                        formErrors.push({
                            type: 'cross_field',
                            validator: validator.id,
                            message: result.message
                        });
                    }
                }
            } catch (error) {
                console.error(`Cross-field validator ${validator.id} failed:`, error);
                formErrors.push({
                    type: 'cross_field',
                    validator: validator.id,
                    message: 'Validation error occurred'
                });
            }
        });

        // Calculate form completion metrics
        const completionMetrics = this.calculateCompletionMetrics(formData, formConfig);

        const formValidationResult = {
            isValid: formErrors.length === 0,
            errors: formErrors,
            warnings: formWarnings,
            fieldResults: Object.fromEntries(validationResults),
            completionMetrics,
            qualityScore: this.calculateFormQualityScore(validationResults, completionMetrics),
            timestamp: new Date().toISOString()
        };

        // Update form-level UI
        this.updateFormValidationUI(formValidationResult);

        return formValidationResult;
    }

    // Calculate completion metrics
    calculateCompletionMetrics(formData, formConfig) {
        const totalFields = Object.keys(formData).length;
        const completedFields = Object.values(formData).filter(value => 
            value !== null && value !== undefined && value !== ''
        ).length;

        const requiredFields = formConfig.requiredFields || [];
        const completedRequired = requiredFields.filter(fieldId => {
            const value = formData[fieldId];
            return value !== null && value !== undefined && value !== '';
        }).length;

        return {
            totalFields,
            completedFields,
            completionPercentage: (completedFields / totalFields) * 100,
            requiredFields: requiredFields.length,
            completedRequired,
            requiredCompletionPercentage: requiredFields.length > 0 
                ? (completedRequired / requiredFields.length) * 100 
                : 100
        };
    }

    // Calculate form quality score
    calculateFormQualityScore(fieldResults, completionMetrics) {
        let totalScore = 0;
        let scoreCount = 0;

        // Base score from completion
        totalScore += completionMetrics.completionPercentage;
        scoreCount++;

        // Add scores from research quality validations
        for (const result of fieldResults.values()) {
            if (result.qualityScore) {
                totalScore += result.qualityScore;
                scoreCount++;
            }
        }

        // Penalize for validation errors
        const errorCount = Array.from(fieldResults.values()).reduce((count, result) => 
            count + result.errors.length, 0
        );
        
        const errorPenalty = Math.min(errorCount * 5, 30);

        const finalScore = scoreCount > 0 ? (totalScore / scoreCount) - errorPenalty : 0;
        return Math.max(0, Math.min(100, finalScore));
    }

    // Check if form has required context data
    hasRequiredContext(formData) {
        // Check for presence of environmental, geographic, or other context data
        const contextFields = ['location', 'environment', 'social_context'];
        return contextFields.some(field => formData[field]);
    }

    // Get previous responses for pattern detection
    getPreviousResponses(fieldId) {
        return this.validationHistory
            .filter(result => result.fieldId === fieldId)
            .slice(-5)
            .map(result => ({ value: result.value, timestamp: result.timestamp }));
    }

    // Update field validation UI
    updateFieldValidationUI(fieldId, validationResult) {
        const fieldElement = document.getElementById(fieldId);
        const feedbackElement = document.querySelector(`[data-field-id="${fieldId}"] .validation-feedback`) ||
                               document.querySelector(`#${fieldId}-feedback`);

        if (!fieldElement) return;

        // Update field styling
        fieldElement.classList.remove('valid', 'invalid', 'warning');
        
        if (!validationResult.isValid) {
            fieldElement.classList.add('invalid');
        } else if (validationResult.warnings.length > 0) {
            fieldElement.classList.add('warning');
        } else {
            fieldElement.classList.add('valid');
        }

        // Update feedback message
        if (feedbackElement) {
            let feedbackHTML = '';

            if (validationResult.errors.length > 0) {
                feedbackHTML += validationResult.errors.map(error => 
                    `<div class="error-message">❌ ${error}</div>`
                ).join('');
            }

            if (validationResult.warnings.length > 0) {
                feedbackHTML += validationResult.warnings.map(warning => 
                    `<div class="warning-message">⚠️ ${warning}</div>`
                ).join('');
            }

            if (validationResult.isValid && validationResult.warnings.length === 0) {
                feedbackHTML = '<div class="success-message">✅ Valid</div>';
            }

            feedbackElement.innerHTML = feedbackHTML;
            feedbackElement.style.display = feedbackHTML ? 'block' : 'none';
        }
    }

    // Update form validation UI
    updateFormValidationUI(formValidationResult) {
        const formFeedbackElement = document.getElementById('form-validation-feedback');
        if (!formFeedbackElement) return;

        let feedbackHTML = '';

        // Summary
        const { errors, warnings, completionMetrics, qualityScore } = formValidationResult;
        
        feedbackHTML += `
            <div class="validation-summary">
                <div class="completion-stats">
                    <span class="completion-percentage">${completionMetrics.completionPercentage.toFixed(1)}% Complete</span>
                    <span class="quality-score">Quality Score: ${qualityScore.toFixed(0)}/100</span>
                </div>
            </div>
        `;

        // Errors
        if (errors.length > 0) {
            feedbackHTML += `
                <div class="form-errors">
                    <h4>Please address the following issues:</h4>
                    <ul>
                        ${errors.map(error => `
                            <li class="error-item">
                                ${error.fieldId ? `<strong>${error.fieldId}:</strong> ` : ''}
                                ${error.error || error.message}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        // Warnings
        if (warnings.length > 0) {
            feedbackHTML += `
                <div class="form-warnings">
                    <h4>Please consider:</h4>
                    <ul>
                        ${warnings.map(warning => `
                            <li class="warning-item">
                                ${warning.fieldId ? `<strong>${warning.fieldId}:</strong> ` : ''}
                                ${warning.warning || warning.message}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        // Success message
        if (formValidationResult.isValid && qualityScore >= 80) {
            feedbackHTML += `
                <div class="form-success">
                    ✅ Form is ready for submission with high data quality
                </div>
            `;
        }

        formFeedbackElement.innerHTML = feedbackHTML;
        formFeedbackElement.style.display = feedbackHTML ? 'block' : 'none';
    }

    // Enable/disable real-time validation
    setRealTimeValidation(enabled) {
        this.realTimeValidation = enabled;
    }

    // Setup real-time validation for form
    setupRealTimeValidation(formSelector) {
        const formElement = document.querySelector(formSelector);
        if (!formElement) return;

        // Add event listeners for real-time validation
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', (event) => {
                if (this.realTimeValidation) {
                    this.validateField(event.target.id, event.target.value);
                }
            });

            input.addEventListener('input', (event) => {
                if (this.realTimeValidation) {
                    // Debounced validation for input events
                    clearTimeout(input.validationTimeout);
                    input.validationTimeout = setTimeout(() => {
                        this.validateField(event.target.id, event.target.value);
                    }, 500);
                }
            });
        });
    }

    // Clear all validation state
    clearValidation() {
        this.validationErrors.clear();
        this.validationWarnings.clear();
        this.validationHistory = [];

        // Clear UI
        document.querySelectorAll('.validation-feedback').forEach(element => {
            element.innerHTML = '';
            element.style.display = 'none';
        });

        document.querySelectorAll('.valid, .invalid, .warning').forEach(element => {
            element.classList.remove('valid', 'invalid', 'warning');
        });
    }

    // Get validation summary
    getValidationSummary() {
        return {
            totalErrors: this.validationErrors.size,
            totalWarnings: this.validationWarnings.size,
            validatedFields: this.validationRules.size,
            validationHistory: this.validationHistory.length,
            lastValidation: this.validationHistory.length > 0 
                ? this.validationHistory[this.validationHistory.length - 1].timestamp 
                : null
        };
    }

    // Export validation configuration
    exportValidationConfig() {
        return {
            validationRules: Array.from(this.validationRules.entries()),
            crossFieldValidators: this.crossFieldValidators,
            validationHistory: this.validationHistory,
            configuration: {
                realTimeValidation: this.realTimeValidation,
                strategies: Object.keys(this.validationStrategies)
            },
            exportTimestamp: new Date().toISOString()
        };
    }
}

// Export for use in other modules
window.FormValidationSystem = FormValidationSystem;