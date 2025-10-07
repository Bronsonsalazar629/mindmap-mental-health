/**
 * Data Collection Schema Exporter
 * Exports comprehensive schema documentation for research compliance and reproducibility
 */

class DataCollectionSchemaExporter {
    constructor() {
        this.schemaVersion = '2.0.0';
        this.exportFormat = 'json'; // json, yaml, xml
        this.includeExamples = true;
        this.includeValidationRules = true;
        this.includeMetadata = true;
        this.compressionLevel = 'none'; // none, gzip, br
    }

    // Export complete data collection schema
    exportCompleteSchema() {
        const schema = {
            schema_info: this.getSchemaInfo(),
            data_collection_components: this.getComponentSchemas(),
            validation_rules: this.getValidationSchemas(),
            longitudinal_structure: this.getLongitudinalSchema(),
            offline_capabilities: this.getOfflineSchema(),
            ui_configuration: this.getUISchema(),
            research_metadata: this.getResearchMetadata(),
            export_metadata: this.getExportMetadata()
        };

        return this.formatSchema(schema);
    }

    // Get schema information
    getSchemaInfo() {
        return {
            name: 'MindMap Mental Health Data Collection Schema',
            version: this.schemaVersion,
            description: 'Comprehensive schema for research-grade mental health data collection',
            created_date: new Date().toISOString(),
            last_modified: new Date().toISOString(),
            compliance_standards: [
                'HIPAA',
                'IRB',
                'GDPR',
                'FDA 21 CFR Part 11',
                'ISO 27001'
            ],
            data_quality_standards: [
                'Research-grade validation',
                'PHQ-9 compliance',
                'GAD-7 compliance',
                'SDOH standardized categories'
            ],
            supported_languages: ['en'],
            target_platforms: ['web', 'mobile_web', 'progressive_web_app']
        };
    }

    // Get component schemas
    getComponentSchemas() {
        return {
            mood_tracking: this.getMoodTrackingSchema(),
            geographic_data: this.getGeographicSchema(),
            sdoh_questionnaire: this.getSDOHSchema(),
            environmental_context: this.getEnvironmentalSchema(),
            longitudinal_tracking: this.getLongitudinalComponentSchema()
        };
    }

    // Get mood tracking schema
    getMoodTrackingSchema() {
        return {
            component_name: 'Mood Tracking System',
            component_version: '1.0.0',
            description: 'PHQ-9 and GAD-7 compatible mood assessment',
            data_structure: {
                session_metadata: {
                    session_id: {
                        type: 'string',
                        format: 'uuid',
                        required: true,
                        description: 'Unique session identifier'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'iso8601',
                        required: true,
                        description: 'Assessment completion timestamp'
                    },
                    completion_time_ms: {
                        type: 'integer',
                        minimum: 0,
                        description: 'Time taken to complete assessment'
                    }
                },
                phq9_assessment: {
                    type: 'object',
                    required: true,
                    properties: {
                        responses: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    question_id: {
                                        type: 'string',
                                        enum: ['phq9_1', 'phq9_2', 'phq9_3', 'phq9_4', 'phq9_5', 'phq9_6', 'phq9_7', 'phq9_8', 'phq9_9']
                                    },
                                    value: {
                                        type: 'integer',
                                        minimum: 0,
                                        maximum: 3,
                                        description: 'Response value (0=Not at all, 1=Several days, 2=More than half the days, 3=Nearly every day)'
                                    },
                                    domain: {
                                        type: 'string',
                                        enum: ['anhedonia', 'depressed_mood', 'sleep_disturbance', 'fatigue', 'appetite_changes', 'self_worth', 'concentration', 'psychomotor', 'suicidal_ideation']
                                    },
                                    response_time_ms: {
                                        type: 'integer',
                                        minimum: 0
                                    }
                                },
                                required: ['question_id', 'value', 'domain']
                            }
                        },
                        total_score: {
                            type: 'integer',
                            minimum: 0,
                            maximum: 27
                        },
                        severity_level: {
                            type: 'string',
                            enum: ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe']
                        },
                        critical_responses: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', enum: ['suicidal_ideation'] },
                                    score: { type: 'integer', minimum: 0, maximum: 3 },
                                    severity: { type: 'string', enum: ['moderate', 'high'] }
                                }
                            }
                        }
                    }
                },
                gad7_assessment: {
                    type: 'object',
                    required: true,
                    properties: {
                        responses: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    question_id: {
                                        type: 'string',
                                        enum: ['gad7_1', 'gad7_2', 'gad7_3', 'gad7_4', 'gad7_5', 'gad7_6', 'gad7_7']
                                    },
                                    value: {
                                        type: 'integer',
                                        minimum: 0,
                                        maximum: 3
                                    },
                                    domain: {
                                        type: 'string',
                                        enum: ['nervousness', 'worry_control', 'excessive_worry', 'relaxation_difficulty', 'restlessness', 'irritability', 'fear_catastrophe']
                                    }
                                },
                                required: ['question_id', 'value', 'domain']
                            }
                        },
                        total_score: {
                            type: 'integer',
                            minimum: 0,
                            maximum: 21
                        },
                        severity_level: {
                            type: 'string',
                            enum: ['minimal', 'mild', 'moderate', 'severe']
                        }
                    }
                }
            },
            validation_rules: this.getMoodTrackingValidation(),
            examples: this.getMoodTrackingExamples()
        };
    }

    // Get geographic data schema
    getGeographicSchema() {
        return {
            component_name: 'Geographic Data Collection',
            component_version: '1.0.0',
            description: 'Location data with privacy controls and accuracy metrics',
            data_structure: {
                location_data: {
                    type: 'object',
                    properties: {
                        coordinates: {
                            type: 'object',
                            properties: {
                                latitude: {
                                    type: 'number',
                                    minimum: -90,
                                    maximum: 90,
                                    description: 'Latitude in decimal degrees'
                                },
                                longitude: {
                                    type: 'number',
                                    minimum: -180,
                                    maximum: 180,
                                    description: 'Longitude in decimal degrees'
                                },
                                accuracy: {
                                    type: 'number',
                                    minimum: 0,
                                    description: 'Location accuracy in meters'
                                },
                                altitude: {
                                    type: 'number',
                                    description: 'Altitude in meters'
                                }
                            },
                            required: ['latitude', 'longitude']
                        },
                        privacy_settings: {
                            type: 'object',
                            properties: {
                                privacy_level: {
                                    type: 'string',
                                    enum: ['precise', 'approximate', 'area_only', 'none'],
                                    description: 'Level of location privacy applied'
                                },
                                geofencing_applied: {
                                    type: 'boolean',
                                    description: 'Whether geographic boundaries were applied'
                                },
                                anonymization_radius: {
                                    type: 'number',
                                    minimum: 0,
                                    description: 'Radius of location anonymization in meters'
                                }
                            },
                            required: ['privacy_level']
                        },
                        collection_metadata: {
                            type: 'object',
                            properties: {
                                source: {
                                    type: 'string',
                                    enum: ['gps', 'manual', 'ip_location', 'network'],
                                    description: 'Source of location data'
                                },
                                timestamp: {
                                    type: 'string',
                                    format: 'iso8601',
                                    description: 'Location capture timestamp'
                                },
                                manual_override: {
                                    type: 'boolean',
                                    description: 'Whether location was manually entered'
                                }
                            },
                            required: ['source', 'timestamp']
                        },
                        address_information: {
                            type: 'object',
                            properties: {
                                formatted_address: {
                                    type: 'string',
                                    description: 'Human-readable address'
                                },
                                components: {
                                    type: 'object',
                                    properties: {
                                        street_number: { type: 'string' },
                                        street_name: { type: 'string' },
                                        neighborhood: { type: 'string' },
                                        city: { type: 'string' },
                                        state: { type: 'string' },
                                        postal_code: { type: 'string' },
                                        country: { type: 'string' }
                                    }
                                },
                                geocoding_source: {
                                    type: 'string',
                                    enum: ['nominatim', 'google', 'manual']
                                }
                            }
                        }
                    },
                    required: ['collection_metadata', 'privacy_settings']
                }
            },
            validation_rules: this.getGeographicValidation(),
            examples: this.getGeographicExamples()
        };
    }

    // Get SDOH schema
    getSDOHSchema() {
        return {
            component_name: 'Social Determinants of Health Questionnaire',
            component_version: '1.0.0',
            description: 'Standardized SDOH assessment with demographic categories',
            data_structure: {
                demographics: {
                    type: 'object',
                    properties: {
                        age_group: {
                            type: 'string',
                            enum: ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+', 'prefer_not_to_say']
                        },
                        gender_identity: {
                            type: 'string',
                            enum: ['woman', 'man', 'non_binary', 'transgender_woman', 'transgender_man', 'genderqueer', 'two_spirit', 'other', 'prefer_not_to_say']
                        },
                        race_ethnicity: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['american_indian_alaska_native', 'asian', 'black_african_american', 'hispanic_latino', 'middle_eastern_north_african', 'native_hawaiian_pacific_islander', 'white', 'other', 'prefer_not_to_say']
                            }
                        },
                        sexual_orientation: {
                            type: 'string',
                            enum: ['straight_heterosexual', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'queer', 'questioning', 'other', 'prefer_not_to_say']
                        }
                    }
                },
                socioeconomic_factors: {
                    type: 'object',
                    properties: {
                        education_level: {
                            type: 'string',
                            enum: ['less_than_high_school', 'high_school_ged', 'some_college', 'associate_degree', 'bachelor_degree', 'master_degree', 'professional_degree', 'doctoral_degree', 'prefer_not_to_say']
                        },
                        employment_status: {
                            type: 'string',
                            enum: ['employed_full_time', 'employed_part_time', 'self_employed', 'unemployed_looking', 'unemployed_not_looking', 'retired', 'student', 'homemaker', 'unable_to_work', 'prefer_not_to_say']
                        },
                        household_income: {
                            type: 'string',
                            enum: ['under_15000', '15000_24999', '25000_34999', '35000_49999', '50000_74999', '75000_99999', '100000_149999', '150000_plus', 'prefer_not_to_say']
                        },
                        financial_strain: {
                            type: 'string',
                            enum: ['never', 'rarely', 'sometimes', 'often', 'always']
                        }
                    }
                },
                housing_environment: {
                    type: 'object',
                    properties: {
                        housing_type: {
                            type: 'string',
                            enum: ['own_house', 'rent_house', 'own_condo', 'rent_condo', 'apartment', 'mobile_home', 'group_home', 'transitional_housing', 'homeless', 'other']
                        },
                        housing_stability: {
                            type: 'string',
                            enum: ['very_stable', 'mostly_stable', 'somewhat_unstable', 'unstable', 'very_unstable']
                        },
                        neighborhood_safety: {
                            type: 'string',
                            enum: ['very_safe', 'somewhat_safe', 'neither_safe_nor_unsafe', 'somewhat_unsafe', 'very_unsafe']
                        }
                    }
                },
                healthcare_access: {
                    type: 'object',
                    properties: {
                        health_insurance: {
                            type: 'string',
                            enum: ['yes_employer', 'yes_marketplace', 'yes_medicaid', 'yes_medicare', 'yes_other', 'no', 'unsure']
                        },
                        healthcare_access_difficulty: {
                            type: 'string',
                            enum: ['never', 'rarely', 'sometimes', 'often', 'always']
                        },
                        healthcare_barriers: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['cost', 'insurance', 'transportation', 'scheduling', 'location', 'language', 'cultural', 'discrimination', 'childcare', 'work_schedule', 'other']
                            }
                        }
                    }
                },
                social_support: {
                    type: 'object',
                    properties: {
                        emotional_support_availability: {
                            type: 'string',
                            enum: ['always', 'usually', 'sometimes', 'rarely', 'never']
                        },
                        practical_support_availability: {
                            type: 'string',
                            enum: ['always', 'usually', 'sometimes', 'rarely', 'never']
                        },
                        community_involvement: {
                            type: 'string',
                            enum: ['daily', 'weekly', 'monthly', 'occasionally', 'never']
                        },
                        social_isolation_frequency: {
                            type: 'string',
                            enum: ['never', 'rarely', 'sometimes', 'often', 'always']
                        }
                    }
                }
            },
            validation_rules: this.getSDOHValidation(),
            examples: this.getSDOHExamples()
        };
    }

    // Get environmental context schema
    getEnvironmentalSchema() {
        return {
            component_name: 'Environmental Context Collection',
            component_version: '1.0.0',
            description: 'Comprehensive environmental factors assessment',
            data_structure: {
                weather_climate: {
                    type: 'object',
                    properties: {
                        temperature_celsius: {
                            type: 'number',
                            minimum: -50,
                            maximum: 60
                        },
                        weather_condition: {
                            type: 'string',
                            enum: ['clear', 'partly_cloudy', 'cloudy', 'light_rain', 'heavy_rain', 'snow', 'fog', 'storm', 'wind']
                        },
                        humidity_level: {
                            type: 'string',
                            enum: ['very_dry', 'dry', 'comfortable', 'humid', 'very_humid']
                        },
                        data_source: {
                            type: 'string',
                            enum: ['automatic', 'manual', 'api']
                        }
                    }
                },
                sound_environment: {
                    type: 'object',
                    properties: {
                        noise_level_db: {
                            type: 'number',
                            minimum: 0,
                            maximum: 140
                        },
                        perceived_noise_level: {
                            type: 'string',
                            enum: ['very_quiet', 'quiet', 'moderate', 'loud', 'very_loud']
                        },
                        noise_sources: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['traffic', 'construction', 'people_talking', 'music', 'nature', 'machinery', 'aircraft', 'other']
                            }
                        },
                        measurement_duration_ms: {
                            type: 'integer',
                            minimum: 0
                        }
                    }
                },
                social_environment: {
                    type: 'object',
                    properties: {
                        social_setting: {
                            type: 'string',
                            enum: ['alone', 'family', 'friends', 'coworkers', 'strangers', 'mixed_group', 'public_alone', 'public_social'],
                            required: true
                        },
                        crowd_density: {
                            type: 'string',
                            enum: ['empty', 'sparse', 'moderate', 'busy', 'crowded']
                        },
                        social_interaction_level: {
                            type: 'string',
                            enum: ['none', 'minimal', 'moderate', 'high', 'intense']
                        }
                    }
                },
                location_context: {
                    type: 'object',
                    properties: {
                        location_type: {
                            type: 'string',
                            enum: ['home_indoor', 'home_outdoor', 'workplace', 'school', 'healthcare', 'retail', 'restaurant', 'entertainment', 'transportation', 'park_nature', 'urban_outdoor', 'religious', 'community', 'other'],
                            required: true
                        },
                        indoor_outdoor: {
                            type: 'string',
                            enum: ['indoor', 'outdoor', 'semi_outdoor', 'transitioning']
                        },
                        location_familiarity: {
                            type: 'string',
                            enum: ['very_familiar', 'familiar', 'somewhat_familiar', 'unfamiliar', 'first_time']
                        }
                    }
                },
                lighting_visual: {
                    type: 'object',
                    properties: {
                        light_level_lux: {
                            type: 'number',
                            minimum: 0
                        },
                        lighting_type: {
                            type: 'string',
                            enum: ['natural_bright', 'natural_dim', 'artificial_bright', 'artificial_dim', 'mixed', 'low_light', 'dark']
                        },
                        visual_comfort: {
                            type: 'string',
                            enum: ['very_comfortable', 'comfortable', 'neutral', 'uncomfortable', 'very_uncomfortable']
                        }
                    }
                },
                additional_factors: {
                    type: 'object',
                    properties: {
                        air_quality_perceived: {
                            type: 'string',
                            enum: ['excellent', 'good', 'moderate', 'poor', 'very_poor']
                        },
                        overall_comfort: {
                            type: 'string',
                            enum: ['very_comfortable', 'comfortable', 'neutral', 'uncomfortable', 'very_uncomfortable']
                        },
                        environmental_distractions: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['noise', 'visual', 'crowding', 'temperature', 'smells', 'movement', 'technology', 'none']
                            }
                        }
                    }
                }
            },
            validation_rules: this.getEnvironmentalValidation(),
            examples: this.getEnvironmentalExamples()
        };
    }

    // Get longitudinal schema
    getLongitudinalSchema() {
        return {
            longitudinal_structure: {
                session_tracking: {
                    type: 'object',
                    properties: {
                        participant_id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Pseudonymized participant identifier'
                        },
                        session_id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Unique session identifier'
                        },
                        session_type: {
                            type: 'string',
                            enum: ['baseline', 'follow_up_1_week', 'follow_up_1_month', 'follow_up_3_month', 'follow_up_6_month', 'regular'],
                            description: 'Type of data collection session'
                        },
                        session_sequence: {
                            type: 'integer',
                            minimum: 1,
                            description: 'Sequential session number for participant'
                        },
                        days_since_baseline: {
                            type: 'integer',
                            minimum: 0,
                            description: 'Days elapsed since baseline assessment'
                        }
                    },
                    required: ['participant_id', 'session_id', 'session_type']
                },
                linkage_metadata: {
                    type: 'object',
                    properties: {
                        linked_sessions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    session_id: { type: 'string' },
                                    session_type: { type: 'string' },
                                    days_ago: { type: 'integer' },
                                    data_types_collected: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    }
                                }
                            }
                        },
                        baseline_reference: {
                            type: 'object',
                            properties: {
                                session_id: { type: 'string' },
                                completion_date: { type: 'string', format: 'iso8601' },
                                baseline_scores: {
                                    type: 'object',
                                    properties: {
                                        phq9_baseline: { type: 'integer' },
                                        gad7_baseline: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                },
                trend_analysis: {
                    type: 'object',
                    properties: {
                        mood_trends: {
                            type: 'object',
                            properties: {
                                phq9_trend: {
                                    type: 'object',
                                    properties: {
                                        direction: { type: 'string', enum: ['improving', 'stable', 'worsening'] },
                                        magnitude: { type: 'number' },
                                        confidence: { type: 'number', minimum: 0, maximum: 1 }
                                    }
                                },
                                gad7_trend: {
                                    type: 'object',
                                    properties: {
                                        direction: { type: 'string', enum: ['improving', 'stable', 'worsening'] },
                                        magnitude: { type: 'number' },
                                        confidence: { type: 'number', minimum: 0, maximum: 1 }
                                    }
                                }
                            }
                        },
                        environmental_patterns: {
                            type: 'object',
                            properties: {
                                location_consistency: { type: 'number', minimum: 0, maximum: 1 },
                                temporal_patterns: {
                                    type: 'object',
                                    properties: {
                                        preferred_times: {
                                            type: 'array',
                                            items: { type: 'string' }
                                        },
                                        weekday_patterns: {
                                            type: 'object'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    // Get validation schemas
    getValidationSchemas() {
        return {
            mood_tracking_validation: this.getMoodTrackingValidation(),
            geographic_validation: this.getGeographicValidation(),
            sdoh_validation: this.getSDOHValidation(),
            environmental_validation: this.getEnvironmentalValidation(),
            cross_component_validation: this.getCrossComponentValidation()
        };
    }

    // Get mood tracking validation rules
    getMoodTrackingValidation() {
        return {
            required_fields: ['session_id', 'timestamp', 'phq9_responses', 'gad7_responses'],
            response_validation: {
                phq9_responses: {
                    min_responses: 9,
                    max_responses: 9,
                    value_range: { min: 0, max: 3 },
                    critical_response_check: {
                        field: 'phq9_9',
                        trigger_values: [1, 2, 3],
                        action: 'flag_for_safety_protocol'
                    }
                },
                gad7_responses: {
                    min_responses: 7,
                    max_responses: 7,
                    value_range: { min: 0, max: 3 }
                }
            },
            data_quality_checks: {
                response_time_validation: {
                    min_time_per_question_ms: 1000,
                    max_time_per_assessment_ms: 1800000
                },
                pattern_detection: {
                    check_straight_lining: true,
                    max_consecutive_same_values: 5
                }
            }
        };
    }

    // Get geographic validation rules
    getGeographicValidation() {
        return {
            coordinate_validation: {
                latitude_range: { min: -90, max: 90 },
                longitude_range: { min: -180, max: 180 },
                accuracy_threshold_meters: 1000
            },
            privacy_validation: {
                required_privacy_level: true,
                anonymization_requirements: {
                    precise: { min_accuracy: 0 },
                    approximate: { min_accuracy: 100 },
                    area_only: { min_accuracy: 1000 },
                    none: { coordinates_allowed: false }
                }
            },
            data_source_validation: {
                allowed_sources: ['gps', 'manual', 'network'],
                manual_verification_required: true
            }
        };
    }

    // Get SDOH validation rules
    getSDOHValidation() {
        return {
            required_sections: ['demographics'],
            demographic_validation: {
                age_group: { required: true },
                gender_identity: { required: true },
                race_ethnicity: { 
                    required: true,
                    allow_multiple: true,
                    max_selections: 5
                }
            },
            conditional_validation: {
                healthcare_barriers: {
                    depends_on: 'healthcare_access_difficulty',
                    required_if_not: ['never']
                }
            },
            consistency_checks: {
                employment_income_consistency: {
                    check: 'employment_status vs household_income',
                    warn_if_inconsistent: true
                }
            }
        };
    }

    // Get environmental validation rules
    getEnvironmentalValidation() {
        return {
            required_fields: ['social_setting', 'location_type'],
            sensor_validation: {
                noise_level_db: {
                    min: 0,
                    max: 140,
                    measurement_duration_min_ms: 5000
                },
                light_level_lux: {
                    min: 0,
                    max: 100000
                }
            },
            consistency_validation: {
                indoor_outdoor_location_consistency: {
                    indoor_locations: ['home_indoor', 'workplace', 'retail', 'restaurant'],
                    outdoor_locations: ['home_outdoor', 'park_nature', 'urban_outdoor']
                }
            }
        };
    }

    // Get cross-component validation
    getCrossComponentValidation() {
        return {
            temporal_consistency: {
                timestamp_tolerance_ms: 300000, // 5 minutes
                require_all_timestamps_within_session: true
            },
            geographic_environmental_consistency: {
                location_type_coordinate_validation: true,
                weather_location_consistency_check: true
            },
            longitudinal_consistency: {
                participant_id_consistency: true,
                session_sequence_validation: true,
                baseline_completion_check: true
            }
        };
    }

    // Get UI schema
    getUISchema() {
        return {
            progressive_disclosure: {
                step_configuration: {
                    max_steps_before_break: 5,
                    estimated_time_per_step_ms: 60000,
                    adaptive_ordering_enabled: true
                },
                fatigue_detection: {
                    enabled: true,
                    response_time_threshold_ms: 500,
                    backward_navigation_threshold: 3
                }
            },
            validation_ui: {
                real_time_validation: true,
                error_display_strategy: 'inline_with_summary',
                warning_display_strategy: 'tooltip'
            },
            offline_ui: {
                offline_indicator: true,
                sync_status_display: true,
                pending_count_display: true
            }
        };
    }

    // Get research metadata
    getResearchMetadata() {
        return {
            ethical_compliance: {
                irb_approval_required: true,
                informed_consent_required: true,
                data_minimization_applied: true,
                pseudonymization_level: 'full'
            },
            data_retention: {
                retention_period_years: 7,
                deletion_policy: 'secure_deletion_after_retention',
                participant_withdrawal_support: true
            },
            research_quality: {
                data_quality_thresholds: {
                    completion_rate_minimum: 0.8,
                    response_consistency_minimum: 0.7,
                    temporal_consistency_tolerance_ms: 300000
                },
                bias_detection: {
                    pattern_response_detection: true,
                    rapid_response_detection: true,
                    demographic_bias_monitoring: true
                }
            },
            interoperability: {
                fhir_compatibility: 'partial',
                hl7_compliance: 'structured_data_only',
                export_formats: ['json', 'csv', 'fhir_bundle']
            }
        };
    }

    // Get offline schema
    getOfflineSchema() {
        return {
            offline_capabilities: {
                storage_mechanisms: ['indexeddb', 'localstorage_fallback'],
                sync_strategies: ['automatic', 'manual', 'periodic'],
                conflict_resolution: ['client_wins', 'server_wins', 'merge', 'manual']
            },
            sync_metadata: {
                sync_queue_structure: {
                    item_id: { type: 'string', required: true },
                    data_type: { type: 'string', required: true },
                    timestamp: { type: 'string', format: 'iso8601', required: true },
                    retry_count: { type: 'integer', minimum: 0 },
                    synced: { type: 'boolean', default: false }
                },
                conflict_resolution_metadata: {
                    conflict_detected_at: { type: 'string', format: 'iso8601' },
                    resolution_strategy: { type: 'string' },
                    resolved_at: { type: 'string', format: 'iso8601' },
                    user_intervention_required: { type: 'boolean' }
                }
            }
        };
    }

    // Get export metadata
    getExportMetadata() {
        return {
            export_info: {
                generated_at: new Date().toISOString(),
                generator_version: this.schemaVersion,
                export_format: this.exportFormat,
                compression: this.compressionLevel,
                includes_examples: this.includeExamples,
                includes_validation: this.includeValidationRules,
                includes_metadata: this.includeMetadata
            },
            usage_guidelines: {
                implementation_notes: [
                    'All timestamps should be in ISO 8601 format with timezone information',
                    'Participant IDs must be pseudonymized before storage',
                    'Critical responses (suicidal ideation) require immediate safety protocols',
                    'Geographic data should respect privacy settings at all times',
                    'Offline data must be encrypted at rest'
                ],
                compliance_requirements: [
                    'Implement proper consent management',
                    'Ensure data encryption in transit and at rest',
                    'Maintain audit logs for all data access',
                    'Provide participant data export capabilities',
                    'Support right-to-deletion requests'
                ]
            }
        };
    }

    // Get example data
    getMoodTrackingExamples() {
        if (!this.includeExamples) return {};
        
        return {
            example_complete_assessment: {
                session_id: "session_123e4567-e89b-12d3-a456-426614174000",
                timestamp: "2024-01-15T14:30:00.000Z",
                completion_time_ms: 480000,
                phq9_assessment: {
                    responses: [
                        {
                            question_id: "phq9_1",
                            value: 1,
                            domain: "anhedonia",
                            response_time_ms: 3500
                        },
                        {
                            question_id: "phq9_2",
                            value: 2,
                            domain: "depressed_mood",
                            response_time_ms: 4200
                        }
                    ],
                    total_score: 8,
                    severity_level: "mild",
                    critical_responses: []
                },
                gad7_assessment: {
                    responses: [
                        {
                            question_id: "gad7_1",
                            value: 1,
                            domain: "nervousness"
                        }
                    ],
                    total_score: 5,
                    severity_level: "mild"
                }
            }
        };
    }

    // Get geographic examples
    getGeographicExamples() {
        if (!this.includeExamples) return {};
        
        return {
            example_precise_location: {
                coordinates: {
                    latitude: 40.7128,
                    longitude: -74.0060,
                    accuracy: 5.0,
                    altitude: 10.0
                },
                privacy_settings: {
                    privacy_level: "precise",
                    geofencing_applied: false,
                    anonymization_radius: 0
                },
                collection_metadata: {
                    source: "gps",
                    timestamp: "2024-01-15T14:30:00.000Z",
                    manual_override: false
                },
                address_information: {
                    formatted_address: "New York, NY, USA",
                    components: {
                        city: "New York",
                        state: "NY",
                        country: "USA"
                    },
                    geocoding_source: "nominatim"
                }
            }
        };
    }

    // Get SDOH examples
    getSDOHExamples() {
        if (!this.includeExamples) return {};
        
        return {
            example_complete_sdoh: {
                demographics: {
                    age_group: "25-34",
                    gender_identity: "woman",
                    race_ethnicity: ["white", "hispanic_latino"],
                    sexual_orientation: "straight_heterosexual"
                },
                socioeconomic_factors: {
                    education_level: "bachelor_degree",
                    employment_status: "employed_full_time",
                    household_income: "50000_74999",
                    financial_strain: "sometimes"
                }
            }
        };
    }

    // Get environmental examples
    getEnvironmentalExamples() {
        if (!this.includeExamples) return {};
        
        return {
            example_environmental_context: {
                weather_climate: {
                    temperature_celsius: 22.5,
                    weather_condition: "partly_cloudy",
                    humidity_level: "comfortable",
                    data_source: "automatic"
                },
                sound_environment: {
                    noise_level_db: 45,
                    perceived_noise_level: "moderate",
                    noise_sources: ["traffic", "people_talking"],
                    measurement_duration_ms: 5000
                },
                social_environment: {
                    social_setting: "public_alone",
                    crowd_density: "moderate",
                    social_interaction_level: "minimal"
                }
            }
        };
    }

    // Format schema based on export format
    formatSchema(schema) {
        switch (this.exportFormat) {
            case 'json':
                return JSON.stringify(schema, null, 2);
            case 'yaml':
                return this.convertToYAML(schema);
            case 'xml':
                return this.convertToXML(schema);
            default:
                return JSON.stringify(schema, null, 2);
        }
    }

    // Convert to YAML (simplified implementation)
    convertToYAML(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        let yaml = '';
        
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                yaml += `${spaces}${key}:\n`;
                yaml += this.convertToYAML(value, indent + 1);
            } else if (Array.isArray(value)) {
                yaml += `${spaces}${key}:\n`;
                value.forEach(item => {
                    yaml += `${spaces}  - ${JSON.stringify(item)}\n`;
                });
            } else {
                yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`;
            }
        }
        
        return yaml;
    }

    // Convert to XML (simplified implementation)
    convertToXML(obj, rootName = 'schema') {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;
        xml += this.objectToXML(obj, 1);
        xml += `</${rootName}>`;
        return xml;
    }

    // Helper for XML conversion
    objectToXML(obj, indent) {
        const spaces = '  '.repeat(indent);
        let xml = '';
        
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                xml += `${spaces}<${key}>\n`;
                xml += this.objectToXML(value, indent + 1);
                xml += `${spaces}</${key}>\n`;
            } else if (Array.isArray(value)) {
                xml += `${spaces}<${key}>\n`;
                value.forEach(item => {
                    xml += `${spaces}  <item>${this.escapeXML(JSON.stringify(item))}</item>\n`;
                });
                xml += `${spaces}</${key}>\n`;
            } else {
                xml += `${spaces}<${key}>${this.escapeXML(String(value))}</${key}>\n`;
            }
        }
        
        return xml;
    }

    // Escape XML special characters
    escapeXML(str) {
        return str.replace(/[<>&'"]/g, (char) => {
            switch (char) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&apos;';
                case '"': return '&quot;';
                default: return char;
            }
        });
    }

    // Export schema to file
    exportToFile(filename = 'mindmap-data-collection-schema') {
        const schema = this.exportCompleteSchema();
        const blob = new Blob([schema], { 
            type: this.getContentType() 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${this.getFileExtension()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Get content type for export format
    getContentType() {
        switch (this.exportFormat) {
            case 'json': return 'application/json';
            case 'yaml': return 'text/yaml';
            case 'xml': return 'application/xml';
            default: return 'application/json';
        }
    }

    // Get file extension for export format
    getFileExtension() {
        switch (this.exportFormat) {
            case 'json': return 'json';
            case 'yaml': return 'yaml';
            case 'xml': return 'xml';
            default: return 'json';
        }
    }

    // Configure export options
    configure(options) {
        if (options.format) this.exportFormat = options.format;
        if (options.includeExamples !== undefined) this.includeExamples = options.includeExamples;
        if (options.includeValidationRules !== undefined) this.includeValidationRules = options.includeValidationRules;
        if (options.includeMetadata !== undefined) this.includeMetadata = options.includeMetadata;
        if (options.compressionLevel) this.compressionLevel = options.compressionLevel;
    }
}

// Export for use in other modules
window.DataCollectionSchemaExporter = DataCollectionSchemaExporter;