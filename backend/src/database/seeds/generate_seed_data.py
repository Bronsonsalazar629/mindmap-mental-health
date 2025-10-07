"""
Comprehensive seed data generator for mental health research platform.
Generates realistic demo data with geographic disparities and bias patterns 
for research and bias detection algorithm testing.

IMPORTANT: This generates synthetic data for research and testing purposes only.
Contains realistic patterns but does not represent real individuals.
"""

import os
import sys
import random
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Tuple
import json
import pandas as pd
import zipfile

# Add database module to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base import SessionLocal
from models import *
from utils.pseudonymization import pseudonymizer, generate_demo_user_id

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set random seed for reproducible results
random.seed(42)

class SeedDataGenerator:
    """Generate realistic seed data with geographic disparities for bias detection research."""
    
    def __init__(self):
        self.db = SessionLocal()
        
        # Geographic regions with different socioeconomic profiles
        self.regions = {
            'affluent_urban': {
                'center': (37.7749, -122.4194),  # San Francisco
                'radius': 0.1,
                'demographics': {
                    'income_levels': ['higher_income', 'moderate_income'],
                    'education_levels': ['bachelor_degree', 'graduate_degree', 'some_college'],
                    'insurance_rates': {'private_insurance': 0.8, 'medicaid': 0.1, 'no_insurance': 0.05},
                    'housing_stability': ['owned_home', 'rented_home'],
                    'mental_health_access': 0.9  # 90% have access
                }
            },
            'middle_class_suburban': {
                'center': (39.7391, -104.9847),  # Denver
                'radius': 0.2,
                'demographics': {
                    'income_levels': ['moderate_income', 'higher_income', 'low_income'],
                    'education_levels': ['high_school_diploma', 'some_college', 'bachelor_degree'],
                    'insurance_rates': {'private_insurance': 0.7, 'medicaid': 0.2, 'no_insurance': 0.1},
                    'housing_stability': ['owned_home', 'rented_home'],
                    'mental_health_access': 0.7
                }
            },
            'rural_underserved': {
                'center': (32.3617, -86.2792),  # Rural Alabama
                'radius': 0.5,
                'demographics': {
                    'income_levels': ['low_income', 'below_poverty', 'moderate_income'],
                    'education_levels': ['high_school_diploma', 'less_than_high_school', 'some_college'],
                    'insurance_rates': {'medicaid': 0.4, 'no_insurance': 0.3, 'private_insurance': 0.25},
                    'housing_stability': ['owned_home', 'living_with_family', 'rented_home'],
                    'mental_health_access': 0.3
                }
            },
            'urban_underserved': {
                'center': (39.9526, -75.1652),  # Philadelphia (underserved areas)
                'radius': 0.15,
                'demographics': {
                    'income_levels': ['below_poverty', 'low_income', 'moderate_income'],
                    'education_levels': ['high_school_diploma', 'less_than_high_school', 'some_college'],
                    'insurance_rates': {'medicaid': 0.5, 'no_insurance': 0.25, 'private_insurance': 0.2},
                    'housing_stability': ['rented_home', 'living_with_family', 'transitional_housing'],
                    'mental_health_access': 0.4
                }
            }
        }
        
        # Bias patterns in the data (reflecting real-world disparities)
        self.bias_patterns = {
            'therapy_recommendation_bias': {
                'baseline_rate': 0.4,
                'race_multipliers': {
                    'white': 1.2,
                    'asian': 1.1,
                    'black_african_american': 0.7,
                    'hispanic_latino': 0.75,
                    'american_indian_alaska_native': 0.6
                },
                'income_multipliers': {
                    'higher_income': 1.5,
                    'moderate_income': 1.0,
                    'low_income': 0.8,
                    'below_poverty': 0.6
                }
            },
            'mood_reporting_patterns': {
                'cultural_factors': {
                    'asian': {'mood_underreporting': 0.8},  # Cultural stigma effect
                    'hispanic_latino': {'mood_underreporting': 0.9},
                    'black_african_american': {'mood_underreporting': 0.9},
                    'white': {'mood_underreporting': 1.0}
                }
            }
        }
    
    def generate_location_in_region(self, region_name: str) -> Tuple[float, float]:
        """Generate a random location within a specified region."""
        region = self.regions[region_name]
        center_lat, center_lon = region['center']
        radius = region['radius']
        
        # Generate random point within circular region
        angle = random.uniform(0, 2 * 3.14159)
        distance = random.uniform(0, radius)
        
        lat = center_lat + (distance * 0.0144927536) * random.uniform(0.8, 1.2)  # ~1 degree = 111km
        lon = center_lon + (distance * 0.0181818182) * random.uniform(0.8, 1.2)
        
        return lat, lon
    
    def generate_user_demographics(self, region_name: str) -> Dict:
        """Generate user demographics based on regional patterns."""
        region = self.regions[region_name]
        demographics = region['demographics']
        
        # Age distribution (slightly skewed toward younger users for mental health apps)
        age_weights = [0.25, 0.3, 0.25, 0.15, 0.05, 0.02]  # 18-24, 25-34, 35-44, 45-54, 55-64, 65+
        age_groups = list(DemographicCategory)
        age_group = random.choices(age_groups, weights=age_weights)[0]
        
        # Gender identity distribution
        gender_weights = [0.45, 0.45, 0.05, 0.03, 0.02]  # male, female, non_binary, self_describe, prefer_not_to_say
        gender_identities = list(GenderIdentity)
        gender_identity = random.choices(gender_identities, weights=gender_weights)[0]
        
        # Race/ethnicity based on US demographics with regional variation
        base_race_weights = {
            'white': 0.6,
            'hispanic_latino': 0.18,
            'black_african_american': 0.13,
            'asian': 0.06,
            'american_indian_alaska_native': 0.02,
            'multiracial': 0.01
        }
        
        # Adjust for regional patterns
        if 'urban' in region_name:
            base_race_weights['hispanic_latino'] *= 1.3
            base_race_weights['black_african_american'] *= 1.2
            base_race_weights['asian'] *= 1.4
            base_race_weights['white'] *= 0.8
        elif 'rural' in region_name:
            base_race_weights['white'] *= 1.2
            base_race_weights['american_indian_alaska_native'] *= 2.0
            base_race_weights['hispanic_latino'] *= 0.7
        
        # Normalize weights
        total_weight = sum(base_race_weights.values())
        race_weights = [base_race_weights[race.value] / total_weight for race in RaceEthnicity if race.value in base_race_weights]
        races = [race for race in RaceEthnicity if race.value in base_race_weights]
        race_ethnicity = random.choices(races, weights=race_weights)[0]
        
        return {
            'age_group': age_group,
            'gender_identity': gender_identity,
            'race_ethnicity': race_ethnicity,
            'region': region_name
        }
    
    def generate_social_determinants(self, region_name: str, demographics: Dict) -> Dict:
        """Generate social determinants of health data based on demographics and region."""
        region = self.regions[region_name]
        demo_data = region['demographics']
        
        # Income level influenced by region and demographics
        income_levels = demo_data['income_levels']
        income_weights = [1.0] * len(income_levels)
        
        # Adjust for demographic disparities (reflecting real-world patterns)
        if demographics['race_ethnicity'].value in ['black_african_american', 'hispanic_latino', 'american_indian_alaska_native']:
            # Shift toward lower income (reflecting systemic inequalities)
            if 'below_poverty' in income_levels:
                income_weights[income_levels.index('below_poverty')] *= 1.5
            if 'low_income' in income_levels:
                income_weights[income_levels.index('low_income')] *= 1.3
        
        income_level = random.choices(income_levels, weights=income_weights)[0]
        
        # Education level
        education_levels = demo_data['education_levels']
        education_level = random.choice(education_levels)
        
        # Employment status based on income and education
        employment_weights = {
            'employed_full_time': 0.6,
            'employed_part_time': 0.15,
            'unemployed_seeking': 0.1,
            'student': 0.08,
            'unemployed_not_seeking': 0.05,
            'disabled': 0.02
        }
        
        if income_level in ['below_poverty', 'low_income']:
            employment_weights['unemployed_seeking'] *= 2
            employment_weights['employed_part_time'] *= 1.5
            employment_weights['employed_full_time'] *= 0.7
        
        employment_status = random.choices(
            list(employment_weights.keys()),
            weights=list(employment_weights.values())
        )[0]
        
        # Insurance status
        insurance_rates = demo_data['insurance_rates']
        insurance_statuses = list(insurance_rates.keys())
        insurance_weights = list(insurance_rates.values())
        insurance_status = random.choices(insurance_statuses, weights=insurance_weights)[0]
        
        # Housing status
        housing_options = demo_data['housing_stability']
        housing_status = random.choice(housing_options)
        
        # Mental health access
        has_mental_health_provider = random.random() < demo_data['mental_health_access']
        
        # Social support (varies by demographics)
        base_social_support = random.randint(2, 5)  # 1-5 scale
        
        # Discrimination experiences (higher for marginalized groups)
        discrimination_probability = {
            'white': 0.1,
            'asian': 0.25,
            'black_african_american': 0.45,
            'hispanic_latino': 0.4,
            'american_indian_alaska_native': 0.5,
            'multiracial': 0.3
        }
        
        experiences_discrimination = random.random() < discrimination_probability.get(
            demographics['race_ethnicity'].value, 0.2
        )
        
        return {
            'income_level': income_level,
            'education_level': education_level,
            'employment_status': employment_status,
            'insurance_status': insurance_status,
            'housing_status': housing_status,
            'has_mental_health_provider': has_mental_health_provider,
            'social_support_level': base_social_support,
            'experiences_discrimination': experiences_discrimination,
            'financial_stress_level': random.randint(2, 5) if income_level in ['below_poverty', 'low_income'] else random.randint(1, 3),
            'neighborhood_safety_rating': random.randint(2, 5) if 'underserved' in region_name else random.randint(3, 5)
        }
    
    def generate_users(self, count: int = 1000) -> List[User]:
        """Generate realistic user data with geographic and demographic diversity."""
        users = []
        
        # Distribution across regions (reflecting app usage patterns)
        region_distribution = {
            'affluent_urban': 0.25,
            'middle_class_suburban': 0.35,
            'rural_underserved': 0.2,
            'urban_underserved': 0.2
        }
        
        for i in range(count):
            # Select region
            region = random.choices(
                list(region_distribution.keys()),
                weights=list(region_distribution.values())
            )[0]
            
            # Generate location
            lat, lon = self.generate_location_in_region(region)
            
            # Generate demographics
            demographics = self.generate_user_demographics(region)
            
            # Generate social determinants
            sdoh = self.generate_social_determinants(region, demographics)
            
            # Create user
            user_id = generate_demo_user_id()
            
            # Create pseudonymized identifier
            original_email = f"user_{i}@example.com"
            pseudonym_id = pseudonymizer.pseudonymize_user_id(original_email)
            identifier_hash = pseudonymizer.hash_sensitive_data(original_email)
            
            # Create user object
            user = User(
                pseudonym_id=pseudonym_id,
                identifier_hash=identifier_hash,
                age_group=demographics['age_group'],
                gender_identity=demographics['gender_identity'],
                race_ethnicity=demographics['race_ethnicity'],
                location_point=f'POINT({lon} {lat})',
                zip_code_prefix=f"{random.randint(100, 999)}",  # Anonymized zip prefix
                is_active=random.choice([True, True, True, False]),  # 75% active
                engagement_score=random.uniform(0.1, 1.0),
                data_sharing_consent=random.choice([True, False]),
                research_participation_consent=random.choice([True, True, False]),  # 67% consent
                is_consented=True,
                consent_version_id='v1.0.0',
                preferred_language='en',
                timezone='America/New_York'  # Simplified for demo
            )
            
            # Create social determinants record
            sdoh_record = SocialDeterminants(
                user_pseudonym_id=pseudonym_id,
                **sdoh,
                data_collection_date=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
            )
            
            users.append((user, sdoh_record))
            
            if (i + 1) % 100 == 0:
                logger.info(f"Generated {i + 1} users...")
        
        return users
    
    def generate_mood_entries(self, users: List[Tuple[User, SocialDeterminants]], entries_per_user: int = 20) -> List[MoodEntry]:
        """Generate mood entries with realistic patterns and bias indicators."""
        mood_entries = []
        
        for user, sdoh in users:
            # Number of entries varies by engagement and demographics
            base_entries = entries_per_user
            
            # Adjust for engagement level
            num_entries = int(base_entries * user.engagement_score * random.uniform(0.5, 1.5))
            num_entries = max(1, min(50, num_entries))  # Between 1-50 entries
            
            # Generate entries over the past 3 months
            start_date = datetime.now(timezone.utc) - timedelta(days=90)
            
            # Base mood influenced by social determinants
            base_mood = self.calculate_base_mood(user, sdoh)
            
            for i in range(num_entries):
                # Entry date
                entry_date = start_date + timedelta(days=random.uniform(0, 90))
                
                # Mood score with some variation
                mood_variation = random.normalvariate(0, 1.5)  # Normal distribution
                mood_score = max(1, min(10, base_mood + mood_variation))
                
                # Apply cultural underreporting bias
                cultural_factor = self.bias_patterns['mood_reporting_patterns']['cultural_factors'].get(
                    user.race_ethnicity.value, {}
                ).get('mood_underreporting', 1.0)
                
                if cultural_factor < 1.0 and random.random() < (1 - cultural_factor):
                    mood_score = max(1, mood_score - random.uniform(1, 2))  # Underreport mood
                
                # Generate additional metrics
                anxiety_level = self.generate_correlated_metric(mood_score, inverse=True, scale=4)
                stress_level = self.generate_correlated_metric(mood_score, inverse=True, scale=5)
                energy_level = self.generate_correlated_metric(mood_score, inverse=False, scale=5)
                sleep_quality = self.generate_correlated_metric(mood_score, inverse=False, scale=5)
                
                # Location (sometimes different from home)
                if random.random() < 0.8:  # 80% at home location
                    # Get user's home coordinates
                    home_coords = user.location_point
                    # Small variation around home
                    lat_offset = random.normalvariate(0, 0.01)
                    lon_offset = random.normalvariate(0, 0.01)
                    # This is simplified - in practice would parse the POINT
                    location_point = f'POINT({-122.4194 + lon_offset} {37.7749 + lat_offset})'
                else:
                    # Random location (work, social, etc.)
                    lat = random.uniform(25, 49)  # US latitude range
                    lon = random.uniform(-125, -66)  # US longitude range
                    location_point = f'POINT({lon} {lat})'
                
                # Entry method and quality
                entry_methods = ['manual', 'prompted', 'automated']
                entry_method = random.choices(entry_methods, weights=[0.6, 0.3, 0.1])[0]
                
                data_quality = 'high' if entry_method == 'manual' else random.choice(['high', 'medium'])
                
                mood_entry = MoodEntry(
                    user_pseudonym_id=user.pseudonym_id,
                    recorded_at=entry_date + timedelta(minutes=random.randint(-30, 30)),
                    entry_date=entry_date,
                    mood_score=int(mood_score),
                    mood_scale='1-10',
                    anxiety_level=anxiety_level,
                    stress_level=stress_level,
                    energy_level=energy_level,
                    sleep_quality=sleep_quality,
                    location_point=location_point,
                    location_accuracy=random.uniform(5, 100),  # GPS accuracy in meters
                    location_method=random.choice(['gps', 'network', 'manual']),
                    entry_method=entry_method,
                    data_quality=data_quality,
                    is_research_eligible=user.research_participation_consent,
                    data_sharing_allowed=user.data_sharing_consent,
                    demographic_context={
                        'age_group': user.age_group.value,
                        'gender_identity': user.gender_identity.value,
                        'race_ethnicity': user.race_ethnicity.value
                    }
                )
                
                mood_entries.append(mood_entry)
        
        logger.info(f"Generated {len(mood_entries)} mood entries")
        return mood_entries
    
    def calculate_base_mood(self, user: User, sdoh: SocialDeterminants) -> float:
        """Calculate base mood level based on social determinants and demographics."""
        base_mood = 6.0  # Neutral starting point
        
        # Income impact
        income_adjustments = {
            'below_poverty': -1.5,
            'low_income': -1.0,
            'moderate_income': 0.0,
            'higher_income': 0.5
        }
        base_mood += income_adjustments.get(sdoh.income_level, 0)
        
        # Employment impact
        employment_adjustments = {
            'unemployed_seeking': -1.2,
            'unemployed_not_seeking': -0.8,
            'employed_part_time': -0.3,
            'employed_full_time': 0.2,
            'retired': 0.1
        }
        base_mood += employment_adjustments.get(sdoh.employment_status, 0)
        
        # Housing stability
        if sdoh.housing_status in ['homeless', 'transitional_housing']:
            base_mood -= 1.5
        elif sdoh.housing_status == 'owned_home':
            base_mood += 0.3
        
        # Mental health access
        if sdoh.has_mental_health_provider:
            base_mood += 0.5
        
        # Social support
        if sdoh.social_support_level:
            base_mood += (sdoh.social_support_level - 3) * 0.3  # Centered around 3
        
        # Discrimination impact
        if sdoh.experiences_discrimination:
            base_mood -= 0.8
        
        # Financial stress
        if sdoh.financial_stress_level:
            base_mood -= (sdoh.financial_stress_level - 2) * 0.2
        
        return max(1.0, min(10.0, base_mood))
    
    def generate_correlated_metric(self, mood_score: float, inverse: bool = False, scale: int = 5) -> int:
        """Generate a metric that correlates with mood score."""
        if inverse:
            # Higher mood = lower anxiety/stress
            base_value = scale - (mood_score - 1) * (scale - 1) / 9
        else:
            # Higher mood = higher energy/sleep quality
            base_value = 1 + (mood_score - 1) * (scale - 1) / 9
        
        # Add some noise
        variation = random.normalvariate(0, 0.5)
        final_value = base_value + variation
        
        return max(1, min(scale, int(round(final_value))))
    
    def generate_biased_recommendations(self, users: List[Tuple[User, SocialDeterminants]]) -> List[ResourceRecommendation]:
        """Generate resource recommendations with realistic bias patterns."""
        recommendations = []
        
        for user, sdoh in users:
            if not user.is_active:
                continue
            
            # Number of recommendations varies by engagement and demographics
            num_recs = random.poisson(3)  # Average 3 recommendations per user
            
            for _ in range(num_recs):
                # Resource type selection with bias
                resource_types = ['therapy', 'medication', 'support_group', 'self_care', 'educational']
                
                # Apply therapy recommendation bias
                therapy_bias = self.bias_patterns['therapy_recommendation_bias']
                
                if 'therapy' in resource_types:
                    therapy_prob = therapy_bias['baseline_rate']
                    
                    # Apply race multiplier
                    race_mult = therapy_bias['race_multipliers'].get(user.race_ethnicity.value, 1.0)
                    therapy_prob *= race_mult
                    
                    # Apply income multiplier
                    income_mult = therapy_bias['income_multipliers'].get(sdoh.income_level, 1.0)
                    therapy_prob *= income_mult
                    
                    # Recommend therapy based on biased probability
                    if random.random() < therapy_prob:
                        resource_type = 'therapy'
                    else:
                        resource_type = random.choice(['support_group', 'self_care', 'educational'])
                else:
                    resource_type = random.choice(resource_types)
                
                # Generate recommendation details
                resource_titles = {
                    'therapy': ['Cognitive Behavioral Therapy', 'Individual Counseling', 'Online Therapy Session'],
                    'support_group': ['Peer Support Group', 'Mental Health Support Circle', 'Community Wellness Group'],
                    'self_care': ['Mindfulness Exercise', 'Breathing Technique', 'Self-Care Routine'],
                    'educational': ['Mental Health Education', 'Coping Strategies Guide', 'Wellness Resources']
                }
                
                resource_title = random.choice(resource_titles.get(resource_type, ['Mental Health Resource']))
                
                # Algorithm details
                algorithm_types = ['rule_based', 'machine_learning', 'collaborative_filtering']
                algorithm_type = random.choice(algorithm_types)
                
                confidence_score = random.uniform(0.3, 0.95)
                
                # Engagement varies by demographics and resource type
                base_engagement = 0.4
                if resource_type == 'therapy' and sdoh.has_mental_health_provider:
                    base_engagement += 0.3
                if sdoh.income_level in ['higher_income', 'moderate_income']:
                    base_engagement += 0.2
                
                engagement_score = min(1.0, base_engagement + random.uniform(-0.2, 0.2))
                
                # Status based on engagement
                statuses = ['delivered', 'viewed', 'clicked', 'engaged', 'completed', 'dismissed']
                status_weights = [0.1, 0.2, 0.25, 0.2, 0.15, 0.1]  # Higher engagement = better outcomes
                
                if engagement_score > 0.7:
                    status_weights = [0.05, 0.1, 0.15, 0.3, 0.3, 0.1]  # More completion
                elif engagement_score < 0.3:
                    status_weights = [0.2, 0.3, 0.2, 0.1, 0.05, 0.15]  # More dismissal
                
                status = random.choices(statuses, weights=status_weights)[0]
                
                # Detect bias indicators
                bias_indicators = {}
                if resource_type == 'therapy':
                    expected_rate = therapy_bias['baseline_rate']
                    actual_assignment = 1.0  # This user got therapy recommendation
                    
                    race_expected = expected_rate * therapy_bias['race_multipliers'].get(user.race_ethnicity.value, 1.0)
                    if abs(actual_assignment - race_expected) > 0.3:
                        bias_indicators['demographic_disparity'] = {
                            'severity': abs(actual_assignment - race_expected),
                            'type': 'therapy_assignment_bias',
                            'demographic': user.race_ethnicity.value
                        }
                
                recommendation = ResourceRecommendation(
                    user_pseudonym_id=user.pseudonym_id,
                    resource_type=resource_type,
                    resource_title=resource_title,
                    resource_description=f"Personalized {resource_type} recommendation based on your recent mood patterns",
                    algorithm_type=algorithm_type,
                    algorithm_version='v2.1.0',
                    confidence_score=confidence_score,
                    status=status,
                    engagement_score=engagement_score,
                    user_demographic_context={
                        'age_group': user.age_group.value,
                        'gender_identity': user.gender_identity.value,
                        'race_ethnicity': user.race_ethnicity.value,
                        'income_level': sdoh.income_level
                    },
                    bias_indicators=bias_indicators if bias_indicators else None,
                    recommended_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 60))
                )
                
                recommendations.append(recommendation)
        
        logger.info(f"Generated {len(recommendations)} resource recommendations")
        return recommendations
    
    def save_to_database(self, users, mood_entries, recommendations):
        """Save all generated data to the database."""
        try:
            logger.info("Saving users and social determinants...")
            for user, sdoh in users:
                self.db.add(user)
                self.db.add(sdoh)
            self.db.commit()
            
            logger.info("Saving mood entries...")
            for entry in mood_entries:
                self.db.add(entry)
            self.db.commit()
            
            logger.info("Saving resource recommendations...")
            for rec in recommendations:
                self.db.add(rec)
            self.db.commit()
            
            logger.info("✅ All seed data saved successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error saving seed data: {e}")
            self.db.rollback()
            raise
    
    def generate_all_seed_data(self, num_users: int = 1000):
        """Generate complete seed dataset."""
        logger.info(f"Starting seed data generation for {num_users} users...")
        
        # Generate users with social determinants
        users = self.generate_users(num_users)
        
        # Generate mood entries
        mood_entries = self.generate_mood_entries(users)
        
        # Generate biased recommendations
        recommendations = self.generate_biased_recommendations(users)
        
        # Save to database
        self.save_to_database(users, mood_entries, recommendations)
        
        # Generate summary statistics
        self.generate_summary_report(users, mood_entries, recommendations)
    
    def generate_summary_report(self, users, mood_entries, recommendations):
        """Generate summary report of generated data."""
        logger.info("\n" + "="*50)
        logger.info("SEED DATA GENERATION SUMMARY")
        logger.info("="*50)
        
        logger.info(f"Users generated: {len(users)}")
        logger.info(f"Mood entries generated: {len(mood_entries)}")
        logger.info(f"Recommendations generated: {len(recommendations)}")
        
        # Demographic distribution
        race_counts = {}
        income_counts = {}
        region_counts = {}
        
        for user, sdoh in users:
            race_counts[user.race_ethnicity.value] = race_counts.get(user.race_ethnicity.value, 0) + 1
            income_counts[sdoh.income_level] = income_counts.get(sdoh.income_level, 0) + 1
        
        logger.info("\nDemographic Distribution:")
        for race, count in race_counts.items():
            logger.info(f"  {race}: {count} ({count/len(users)*100:.1f}%)")
        
        logger.info("\nIncome Distribution:")
        for income, count in income_counts.items():
            logger.info(f"  {income}: {count} ({count/len(users)*100:.1f}%)")
        
        # Bias indicators
        therapy_recs = [r for r in recommendations if r.resource_type == 'therapy']
        biased_recs = [r for r in recommendations if r.bias_indicators]
        
        logger.info(f"\nBias Detection Summary:")
        logger.info(f"  Therapy recommendations: {len(therapy_recs)}")
        logger.info(f"  Recommendations with bias indicators: {len(biased_recs)}")
        
        logger.info("\n" + "="*50)


    def import_csv_dataset(self, csv_path: str) -> pd.DataFrame:
        """Import and process the N-SUMHSS CSV dataset."""
        logger.info(f"Importing CSV dataset from {csv_path}")
        
        try:
            # Read the CSV file
            df = pd.read_csv(csv_path)
            logger.info(f"Successfully loaded CSV with shape: {df.shape}")
            
            # Display basic info about the dataset
            logger.info(f"Columns: {len(df.columns)}")
            logger.info(f"Records: {len(df)}")
            
            return df
            
        except Exception as e:
            logger.error(f"Failed to import CSV: {e}")
            raise
    
    def extract_zip_dataset(self, zip_path: str, extract_to: str) -> str:
        """Extract the zipped CSV dataset."""
        logger.info(f"Extracting dataset from {zip_path}")
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
            
            # Find the CSV file in extracted directory
            for file in os.listdir(extract_to):
                if file.endswith('.csv'):
                    csv_path = os.path.join(extract_to, file)
                    logger.info(f"Found CSV file: {csv_path}")
                    return csv_path
            
            raise FileNotFoundError("No CSV file found in extracted archive")
            
        except Exception as e:
            logger.error(f"Failed to extract dataset: {e}")
            raise


def main():
    """Main function to generate seed data."""
    generator = SeedDataGenerator()
    
    try:
        # Option 1: Generate synthetic data
        generator.generate_all_seed_data(num_users=1000)
        
        # Option 2: Import real CSV dataset
        # zip_path = "../data/N-SUMHSS-2023-DS0001-bndl-data-csv_v1.zip"
        # extract_to = "../data/extracted"
        # csv_path = generator.extract_zip_dataset(zip_path, extract_to)
        # df = generator.import_csv_dataset(csv_path)
        # logger.info(f"Dataset loaded with {len(df)} records")
        
    except Exception as e:
        logger.error(f"Seed data generation failed: {e}")
        raise
    finally:
        generator.db.close()


if __name__ == "__main__":
    main()