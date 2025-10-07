/**
 * Social Determinants of Health (SDOH) Questionnaire
 * Standardized demographic categories and comprehensive health determinants assessment
 */

class SDOHQuestionnaire {
    constructor() {
        this.responses = {};
        this.validationErrors = [];
        this.currentSection = 0;
        this.sections = this.initializeSections();
        this.isComplete = false;
    }

    // Initialize questionnaire sections
    initializeSections() {
        return [
            {
                id: 'demographics',
                title: 'Demographics',
                description: 'Basic demographic information',
                questions: this.getDemographicQuestions()
            },
            {
                id: 'socioeconomic',
                title: 'Socioeconomic Factors',
                description: 'Income, employment, and education',
                questions: this.getSocioeconomicQuestions()
            },
            {
                id: 'housing',
                title: 'Housing & Environment',
                description: 'Living situation and neighborhood factors',
                questions: this.getHousingQuestions()
            },
            {
                id: 'healthcare_access',
                title: 'Healthcare Access',
                description: 'Access to medical care and insurance',
                questions: this.getHealthcareAccessQuestions()
            },
            {
                id: 'social_support',
                title: 'Social Support',
                description: 'Family, community, and social connections',
                questions: this.getSocialSupportQuestions()
            },
            {
                id: 'lifestyle',
                title: 'Lifestyle Factors',
                description: 'Diet, exercise, and health behaviors',
                questions: this.getLifestyleQuestions()
            }
        ];
    }

    // Demographic questions with standardized categories
    getDemographicQuestions() {
        return [
            {
                id: 'age_group',
                text: 'What is your age group?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: '18-24', label: '18-24 years' },
                    { value: '25-34', label: '25-34 years' },
                    { value: '35-44', label: '35-44 years' },
                    { value: '45-54', label: '45-54 years' },
                    { value: '55-64', label: '55-64 years' },
                    { value: '65-74', label: '65-74 years' },
                    { value: '75+', label: '75+ years' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ]
            },
            {
                id: 'gender_identity',
                text: 'What is your gender identity?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'woman', label: 'Woman' },
                    { value: 'man', label: 'Man' },
                    { value: 'non_binary', label: 'Non-binary' },
                    { value: 'transgender_woman', label: 'Transgender woman' },
                    { value: 'transgender_man', label: 'Transgender man' },
                    { value: 'genderqueer', label: 'Genderqueer' },
                    { value: 'two_spirit', label: 'Two-Spirit' },
                    { value: 'other', label: 'Other (please specify)', hasOther: true },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ]
            },
            {
                id: 'race_ethnicity',
                text: 'What is your race/ethnicity? (Select all that apply)',
                type: 'multiple_choice',
                required: true,
                options: [
                    { value: 'american_indian_alaska_native', label: 'American Indian or Alaska Native' },
                    { value: 'asian', label: 'Asian' },
                    { value: 'black_african_american', label: 'Black or African American' },
                    { value: 'hispanic_latino', label: 'Hispanic or Latino' },
                    { value: 'middle_eastern_north_african', label: 'Middle Eastern or North African' },
                    { value: 'native_hawaiian_pacific_islander', label: 'Native Hawaiian or Other Pacific Islander' },
                    { value: 'white', label: 'White' },
                    { value: 'other', label: 'Other (please specify)', hasOther: true },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ]
            },
            {
                id: 'sexual_orientation',
                text: 'What is your sexual orientation?',
                type: 'single_choice',
                required: false,
                options: [
                    { value: 'straight_heterosexual', label: 'Straight/Heterosexual' },
                    { value: 'gay', label: 'Gay' },
                    { value: 'lesbian', label: 'Lesbian' },
                    { value: 'bisexual', label: 'Bisexual' },
                    { value: 'pansexual', label: 'Pansexual' },
                    { value: 'asexual', label: 'Asexual' },
                    { value: 'queer', label: 'Queer' },
                    { value: 'questioning', label: 'Questioning' },
                    { value: 'other', label: 'Other (please specify)', hasOther: true },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ]
            },
            {
                id: 'relationship_status',
                text: 'What is your current relationship status?',
                type: 'single_choice',
                required: false,
                options: [
                    { value: 'single', label: 'Single' },
                    { value: 'in_relationship', label: 'In a relationship' },
                    { value: 'married', label: 'Married' },
                    { value: 'domestic_partnership', label: 'Domestic partnership' },
                    { value: 'separated', label: 'Separated' },
                    { value: 'divorced', label: 'Divorced' },
                    { value: 'widowed', label: 'Widowed' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ]
            }
        ];
    }

    // Socioeconomic questions
    getSocioeconomicQuestions() {
        return [
            {
                id: 'education_level',
                text: 'What is the highest level of education you have completed?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'less_than_high_school', label: 'Less than high school' },
                    { value: 'high_school_ged', label: 'High school diploma or GED' },
                    { value: 'some_college', label: 'Some college, no degree' },
                    { value: 'associate_degree', label: 'Associate degree' },
                    { value: 'bachelor_degree', label: 'Bachelor\'s degree' },
                    { value: 'master_degree', label: 'Master\'s degree' },
                    { value: 'professional_degree', label: 'Professional degree (JD, MD, etc.)' },
                    { value: 'doctoral_degree', label: 'Doctoral degree' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ]
            },
            {
                id: 'employment_status',
                text: 'What is your current employment status?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'employed_full_time', label: 'Employed full-time' },
                    { value: 'employed_part_time', label: 'Employed part-time' },
                    { value: 'self_employed', label: 'Self-employed' },
                    { value: 'unemployed_looking', label: 'Unemployed, looking for work' },
                    { value: 'unemployed_not_looking', label: 'Unemployed, not looking for work' },
                    { value: 'retired', label: 'Retired' },
                    { value: 'student', label: 'Student' },
                    { value: 'homemaker', label: 'Homemaker' },
                    { value: 'unable_to_work', label: 'Unable to work' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ]
            },
            {
                id: 'household_income',
                text: 'What is your annual household income?',
                type: 'single_choice',
                required: false,
                options: [
                    { value: 'under_15000', label: 'Under $15,000' },
                    { value: '15000_24999', label: '$15,000 - $24,999' },
                    { value: '25000_34999', label: '$25,000 - $34,999' },
                    { value: '35000_49999', label: '$35,000 - $49,999' },
                    { value: '50000_74999', label: '$50,000 - $74,999' },
                    { value: '75000_99999', label: '$75,000 - $99,999' },
                    { value: '100000_149999', label: '$100,000 - $149,999' },
                    { value: '150000_plus', label: '$150,000 or more' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ]
            },
            {
                id: 'financial_strain',
                text: 'In the past 12 months, how often have you worried about having enough money to pay for basic needs?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'never', label: 'Never' },
                    { value: 'rarely', label: 'Rarely' },
                    { value: 'sometimes', label: 'Sometimes' },
                    { value: 'often', label: 'Often' },
                    { value: 'always', label: 'Always' }
                ]
            }
        ];
    }

    // Housing and environment questions
    getHousingQuestions() {
        return [
            {
                id: 'housing_type',
                text: 'What type of housing do you currently live in?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'own_house', label: 'House (own)' },
                    { value: 'rent_house', label: 'House (rent)' },
                    { value: 'own_condo', label: 'Condominium/Townhouse (own)' },
                    { value: 'rent_condo', label: 'Condominium/Townhouse (rent)' },
                    { value: 'apartment', label: 'Apartment' },
                    { value: 'mobile_home', label: 'Mobile home' },
                    { value: 'group_home', label: 'Group home' },
                    { value: 'transitional_housing', label: 'Transitional housing' },
                    { value: 'homeless', label: 'Currently homeless' },
                    { value: 'other', label: 'Other', hasOther: true }
                ]
            },
            {
                id: 'housing_stability',
                text: 'How stable is your current housing situation?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'very_stable', label: 'Very stable - no concerns' },
                    { value: 'mostly_stable', label: 'Mostly stable - minor concerns' },
                    { value: 'somewhat_unstable', label: 'Somewhat unstable - some concerns' },
                    { value: 'unstable', label: 'Unstable - major concerns' },
                    { value: 'very_unstable', label: 'Very unstable - at risk of losing housing' }
                ]
            },
            {
                id: 'neighborhood_safety',
                text: 'How safe do you feel in your neighborhood?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'very_safe', label: 'Very safe' },
                    { value: 'somewhat_safe', label: 'Somewhat safe' },
                    { value: 'neither_safe_nor_unsafe', label: 'Neither safe nor unsafe' },
                    { value: 'somewhat_unsafe', label: 'Somewhat unsafe' },
                    { value: 'very_unsafe', label: 'Very unsafe' }
                ]
            },
            {
                id: 'neighborhood_walkability',
                text: 'How walkable is your neighborhood? (access to stores, services, public transit)',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'very_walkable', label: 'Very walkable - daily errands do not require a car' },
                    { value: 'somewhat_walkable', label: 'Somewhat walkable - some errands can be accomplished on foot' },
                    { value: 'car_dependent', label: 'Car-dependent - most errands require a car' },
                    { value: 'not_applicable', label: 'Not applicable' }
                ]
            }
        ];
    }

    // Healthcare access questions
    getHealthcareAccessQuestions() {
        return [
            {
                id: 'health_insurance',
                text: 'Do you currently have health insurance?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'yes_employer', label: 'Yes, through employer' },
                    { value: 'yes_marketplace', label: 'Yes, purchased through marketplace' },
                    { value: 'yes_medicaid', label: 'Yes, Medicaid' },
                    { value: 'yes_medicare', label: 'Yes, Medicare' },
                    { value: 'yes_other', label: 'Yes, other type' },
                    { value: 'no', label: 'No' },
                    { value: 'unsure', label: 'Unsure' }
                ]
            },
            {
                id: 'healthcare_access',
                text: 'In the past 12 months, have you had difficulty accessing healthcare when needed?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'never', label: 'Never' },
                    { value: 'rarely', label: 'Rarely' },
                    { value: 'sometimes', label: 'Sometimes' },
                    { value: 'often', label: 'Often' },
                    { value: 'always', label: 'Always' }
                ]
            },
            {
                id: 'healthcare_barriers',
                text: 'What barriers have you experienced in accessing healthcare? (Select all that apply)',
                type: 'multiple_choice',
                required: false,
                conditional: { dependsOn: 'healthcare_access', notValues: ['never'] },
                options: [
                    { value: 'cost', label: 'Cost/affordability' },
                    { value: 'insurance', label: 'Insurance issues' },
                    { value: 'transportation', label: 'Transportation' },
                    { value: 'scheduling', label: 'Scheduling/availability' },
                    { value: 'location', label: 'Distance/location' },
                    { value: 'language', label: 'Language barriers' },
                    { value: 'cultural', label: 'Cultural barriers' },
                    { value: 'discrimination', label: 'Discrimination' },
                    { value: 'childcare', label: 'Childcare needs' },
                    { value: 'work_schedule', label: 'Work schedule conflicts' },
                    { value: 'other', label: 'Other', hasOther: true }
                ]
            },
            {
                id: 'regular_provider',
                text: 'Do you have a regular healthcare provider?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'yes_primary_care', label: 'Yes, primary care doctor' },
                    { value: 'yes_clinic', label: 'Yes, clinic or health center' },
                    { value: 'yes_specialist', label: 'Yes, specialist only' },
                    { value: 'no', label: 'No' }
                ]
            }
        ];
    }

    // Social support questions
    getSocialSupportQuestions() {
        return [
            {
                id: 'social_support_emotional',
                text: 'How often do you have someone available who you trust and can confide in?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'always', label: 'Always' },
                    { value: 'usually', label: 'Usually' },
                    { value: 'sometimes', label: 'Sometimes' },
                    { value: 'rarely', label: 'Rarely' },
                    { value: 'never', label: 'Never' }
                ]
            },
            {
                id: 'social_support_practical',
                text: 'How often do you have someone available to help with daily tasks if needed?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'always', label: 'Always' },
                    { value: 'usually', label: 'Usually' },
                    { value: 'sometimes', label: 'Sometimes' },
                    { value: 'rarely', label: 'Rarely' },
                    { value: 'never', label: 'Never' }
                ]
            },
            {
                id: 'community_involvement',
                text: 'How often do you participate in community, religious, or social activities?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'occasionally', label: 'Occasionally' },
                    { value: 'never', label: 'Never' }
                ]
            },
            {
                id: 'social_isolation',
                text: 'How often do you feel lonely or socially isolated?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'never', label: 'Never' },
                    { value: 'rarely', label: 'Rarely' },
                    { value: 'sometimes', label: 'Sometimes' },
                    { value: 'often', label: 'Often' },
                    { value: 'always', label: 'Always' }
                ]
            }
        ];
    }

    // Lifestyle factors questions
    getLifestyleQuestions() {
        return [
            {
                id: 'physical_activity',
                text: 'In a typical week, how many days do you engage in moderate to vigorous physical activity for at least 30 minutes?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: '0', label: '0 days' },
                    { value: '1', label: '1 day' },
                    { value: '2', label: '2 days' },
                    { value: '3', label: '3 days' },
                    { value: '4', label: '4 days' },
                    { value: '5', label: '5 days' },
                    { value: '6', label: '6 days' },
                    { value: '7', label: '7 days' }
                ]
            },
            {
                id: 'diet_quality',
                text: 'How would you rate the overall quality of your diet?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'excellent', label: 'Excellent' },
                    { value: 'very_good', label: 'Very good' },
                    { value: 'good', label: 'Good' },
                    { value: 'fair', label: 'Fair' },
                    { value: 'poor', label: 'Poor' }
                ]
            },
            {
                id: 'sleep_quality',
                text: 'How would you rate your overall sleep quality?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'excellent', label: 'Excellent' },
                    { value: 'very_good', label: 'Very good' },
                    { value: 'good', label: 'Good' },
                    { value: 'fair', label: 'Fair' },
                    { value: 'poor', label: 'Poor' }
                ]
            },
            {
                id: 'substance_use_tobacco',
                text: 'Do you currently use tobacco products?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'never_used', label: 'Never used' },
                    { value: 'former_user', label: 'Former user' },
                    { value: 'current_daily', label: 'Current daily user' },
                    { value: 'current_occasional', label: 'Current occasional user' }
                ]
            },
            {
                id: 'substance_use_alcohol',
                text: 'How often do you consume alcoholic beverages?',
                type: 'single_choice',
                required: true,
                options: [
                    { value: 'never', label: 'Never' },
                    { value: 'monthly_or_less', label: 'Monthly or less' },
                    { value: '2_4_times_month', label: '2-4 times a month' },
                    { value: '2_3_times_week', label: '2-3 times a week' },
                    { value: '4_or_more_times_week', label: '4 or more times a week' }
                ]
            }
        ];
    }

    // Create section UI
    createSectionUI(sectionIndex) {
        const section = this.sections[sectionIndex];
        const container = document.createElement('div');
        container.className = 'sdoh-section-container';
        container.setAttribute('data-section-id', section.id);

        // Section header
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <div class="section-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((sectionIndex + 1) / this.sections.length) * 100}%"></div>
                </div>
                <span class="progress-text">Section ${sectionIndex + 1} of ${this.sections.length}</span>
            </div>
            <h3 class="section-title">${section.title}</h3>
            <p class="section-description">${section.description}</p>
        `;

        // Questions container
        const questionsContainer = document.createElement('div');
        questionsContainer.className = 'questions-container';

        section.questions.forEach((question, questionIndex) => {
            const questionElement = this.createQuestionElement(question, questionIndex);
            questionsContainer.appendChild(questionElement);
        });

        // Section validation
        const validationContainer = document.createElement('div');
        validationContainer.className = 'section-validation';
        validationContainer.setAttribute('data-section-id', section.id);

        container.appendChild(header);
        container.appendChild(questionsContainer);
        container.appendChild(validationContainer);

        return container;
    }

    // Create individual question element
    createQuestionElement(question) {
        const container = document.createElement('div');
        container.className = 'sdoh-question-container';
        container.setAttribute('data-question-id', question.id);

        // Question text
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.innerHTML = `
            <label class="question-label">
                ${question.text}
                ${question.required ? '<span class="required-indicator">*</span>' : ''}
            </label>
        `;

        // Response container
        const responseContainer = document.createElement('div');
        responseContainer.className = `response-container ${question.type}`;

        if (question.type === 'single_choice') {
            this.createSingleChoiceOptions(responseContainer, question);
        } else if (question.type === 'multiple_choice') {
            this.createMultipleChoiceOptions(responseContainer, question);
        } else if (question.type === 'text') {
            this.createTextInput(responseContainer, question);
        }

        // Validation feedback
        const feedback = document.createElement('div');
        feedback.className = 'validation-feedback';
        feedback.setAttribute('data-question-id', question.id);

        container.appendChild(questionText);
        container.appendChild(responseContainer);
        container.appendChild(feedback);

        return container;
    }

    // Create single choice options
    createSingleChoiceOptions(container, question) {
        question.options.forEach((option) => {
            const optionElement = document.createElement('label');
            optionElement.className = 'response-option single-choice';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = question.id;
            input.value = option.value;
            input.className = 'response-input';
            if (question.required) input.required = true;

            const label = document.createElement('span');
            label.className = 'response-label';
            label.textContent = option.label;

            optionElement.appendChild(input);
            optionElement.appendChild(label);

            // Add "other" text input if needed
            if (option.hasOther) {
                const otherInput = document.createElement('input');
                otherInput.type = 'text';
                otherInput.className = 'other-input';
                otherInput.placeholder = 'Please specify...';
                otherInput.style.display = 'none';
                optionElement.appendChild(otherInput);

                input.addEventListener('change', () => {
                    if (input.checked) {
                        otherInput.style.display = 'block';
                        otherInput.focus();
                    }
                });
            }

            // Add validation
            input.addEventListener('change', () => {
                this.saveResponse(question.id, {
                    value: option.value,
                    label: option.label,
                    other_text: option.hasOther ? optionElement.querySelector('.other-input')?.value : null
                });
                this.validateQuestion(question);
            });

            container.appendChild(optionElement);
        });
    }

    // Create multiple choice options
    createMultipleChoiceOptions(container, question) {
        question.options.forEach((option) => {
            const optionElement = document.createElement('label');
            optionElement.className = 'response-option multiple-choice';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = question.id;
            input.value = option.value;
            input.className = 'response-input';

            const label = document.createElement('span');
            label.className = 'response-label';
            label.textContent = option.label;

            optionElement.appendChild(input);
            optionElement.appendChild(label);

            // Add "other" text input if needed
            if (option.hasOther) {
                const otherInput = document.createElement('input');
                otherInput.type = 'text';
                otherInput.className = 'other-input';
                otherInput.placeholder = 'Please specify...';
                otherInput.style.display = 'none';
                optionElement.appendChild(otherInput);

                input.addEventListener('change', () => {
                    otherInput.style.display = input.checked ? 'block' : 'none';
                    if (input.checked) otherInput.focus();
                });
            }

            // Add validation
            input.addEventListener('change', () => {
                this.saveMultipleChoiceResponse(question);
                this.validateQuestion(question);
            });

            container.appendChild(optionElement);
        });
    }

    // Save response
    saveResponse(questionId, response) {
        this.responses[questionId] = {
            ...response,
            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        this.saveToLocalStorage();
    }

    // Save multiple choice response
    saveMultipleChoiceResponse(question) {
        const checkboxes = document.querySelectorAll(`input[name="${question.id}"]:checked`);
        const values = Array.from(checkboxes).map(checkbox => {
            const option = question.options.find(opt => opt.value === checkbox.value);
            return {
                value: checkbox.value,
                label: option?.label,
                other_text: option?.hasOther ? checkbox.parentElement.querySelector('.other-input')?.value : null
            };
        });

        this.responses[question.id] = {
            values,
            timestamp: new Date().toISOString()
        };

        this.saveToLocalStorage();
    }

    // Validate individual question
    validateQuestion(question) {
        const errors = [];
        const response = this.responses[question.id];

        if (question.required && (!response || !this.hasValidResponse(question, response))) {
            errors.push('This question is required');
        }

        // Check conditional logic
        if (question.conditional && !this.evaluateConditional(question.conditional)) {
            // Question should be hidden, clear any existing response
            delete this.responses[question.id];
            errors.length = 0; // Clear validation errors for hidden questions
        }

        this.updateQuestionValidation(question.id, errors);
        return errors.length === 0;
    }

    // Check if response is valid
    hasValidResponse(question, response) {
        if (question.type === 'multiple_choice') {
            return response.values && response.values.length > 0;
        } else {
            return response.value && response.value !== '';
        }
    }

    // Evaluate conditional logic
    evaluateConditional(conditional) {
        const dependentResponse = this.responses[conditional.dependsOn];
        if (!dependentResponse) return false;

        if (conditional.values) {
            return conditional.values.includes(dependentResponse.value);
        } else if (conditional.notValues) {
            return !conditional.notValues.includes(dependentResponse.value);
        }

        return true;
    }

    // Update question validation UI
    updateQuestionValidation(questionId, errors) {
        const feedbackElement = document.querySelector(`[data-question-id="${questionId}"] .validation-feedback`);
        if (!feedbackElement) return;

        if (errors.length > 0) {
            feedbackElement.innerHTML = errors.map(error => 
                `<div class="validation-error">❌ ${error}</div>`
            ).join('');
            feedbackElement.style.display = 'block';
        } else {
            feedbackElement.style.display = 'none';
        }
    }

    // Validate entire section
    validateSection(sectionIndex) {
        const section = this.sections[sectionIndex];
        const errors = [];

        section.questions.forEach(question => {
            if (!this.validateQuestion(question)) {
                errors.push(`${question.text} is required`);
            }
        });

        this.updateSectionValidation(section.id, errors);
        return errors.length === 0;
    }

    // Update section validation UI
    updateSectionValidation(sectionId, errors) {
        const feedbackElement = document.querySelector(`[data-section-id="${sectionId}"] .section-validation`);
        if (!feedbackElement) return;

        if (errors.length > 0) {
            feedbackElement.innerHTML = `
                <div class="section-errors">
                    <h4>Please complete the following required questions:</h4>
                    <ul>
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            `;
            feedbackElement.style.display = 'block';
        } else {
            feedbackElement.innerHTML = '<div class="section-success">✅ Section completed</div>';
            feedbackElement.style.display = 'block';
            setTimeout(() => {
                feedbackElement.style.display = 'none';
            }, 2000);
        }
    }

    // Save to localStorage
    saveToLocalStorage() {
        const data = {
            responses: this.responses,
            currentSection: this.currentSection,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('sdoh_questionnaire_data', JSON.stringify(data));
    }

    // Load from localStorage
    loadFromLocalStorage() {
        const saved = localStorage.getItem('sdoh_questionnaire_data');
        if (saved) {
            const data = JSON.parse(saved);
            this.responses = data.responses || {};
            this.currentSection = data.currentSection || 0;
        }
    }

    // Get completion statistics
    getCompletionStats() {
        const totalQuestions = this.sections.reduce((sum, section) => sum + section.questions.length, 0);
        const completedQuestions = Object.keys(this.responses).length;
        
        return {
            totalQuestions,
            completedQuestions,
            percentComplete: (completedQuestions / totalQuestions) * 100,
            sectionsComplete: this.sections.filter((_, index) => this.validateSection(index)).length,
            totalSections: this.sections.length
        };
    }

    // Export responses as research data
    exportData() {
        return {
            questionnaire_type: 'SDOH',
            version: '1.0',
            completion_timestamp: new Date().toISOString(),
            responses: this.responses,
            completion_stats: this.getCompletionStats(),
            metadata: {
                sections: this.sections.map(section => ({
                    id: section.id,
                    title: section.title,
                    question_count: section.questions.length
                }))
            }
        };
    }
}

// Export for use in other modules
window.SDOHQuestionnaire = SDOHQuestionnaire;