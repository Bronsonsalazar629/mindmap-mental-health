"""
Bias detection query functions for mental health research platform.
Implements statistical tests and fairness metrics to detect algorithmic bias
across demographic groups and geographic regions.
"""

import os
import sys
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import func, and_, or_, case, text
from sqlalchemy.orm import Session
import numpy as np
from scipy import stats
import pandas as pd

# Add database module to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base import SessionLocal
from models import *

logger = logging.getLogger(__name__)


class BiasDetectionAnalyzer:
    """
    Comprehensive bias detection and fairness analysis for mental health algorithms.
    
    Implements multiple bias detection methods:
    - Demographic Parity
    - Equalized Odds
    - Calibration
    - Individual Fairness
    - Geographic Bias Detection
    """
    
    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session or SessionLocal()
        
        # Significance thresholds
        self.significance_level = 0.05
        self.effect_size_threshold = 0.2  # Cohen's d
        self.fairness_threshold = 0.1  # 10% difference threshold
        
    def analyze_recommendation_bias(self, days_back: int = 90) -> Dict:
        """
        Analyze bias in resource recommendations across demographic groups.
        
        Args:
            days_back: Number of days to look back for analysis
            
        Returns:
            Dictionary containing bias analysis results
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_back)
        
        # Query recommendations with user demographics
        query = self.db.query(
            ResourceRecommendation.resource_type,
            User.age_group,
            User.gender_identity,
            User.race_ethnicity,
            ResourceRecommendation.confidence_score,
            ResourceRecommendation.engagement_score,
            ResourceRecommendation.status,
            SocialDeterminants.income_level
        ).join(
            User, ResourceRecommendation.user_pseudonym_id == User.pseudonym_id
        ).join(
            SocialDeterminants, User.pseudonym_id == SocialDeterminants.user_pseudonym_id
        ).filter(
            ResourceRecommendation.recommended_at >= cutoff_date
        )
        
        df = pd.read_sql(query.statement, self.db.bind)
        
        if df.empty:
            return {'error': 'No recommendations found in the specified time period'}
        
        results = {
            'analysis_period_days': days_back,
            'total_recommendations': len(df),
            'bias_tests': {},
            'fairness_metrics': {},
            'demographic_patterns': {},
            'recommendations': []
        }
        
        # Analyze each resource type
        for resource_type in df['resource_type'].unique():
            type_df = df[df['resource_type'] == resource_type]
            results['bias_tests'][resource_type] = self._analyze_resource_type_bias(type_df, resource_type)
        
        # Overall fairness metrics
        results['fairness_metrics'] = self._calculate_fairness_metrics(df)
        
        # Demographic patterns
        results['demographic_patterns'] = self._analyze_demographic_patterns(df)
        
        # Generate recommendations
        results['recommendations'] = self._generate_bias_recommendations(results)
        
        return results
    
    def _analyze_resource_type_bias(self, df: pd.DataFrame, resource_type: str) -> Dict:
        """Analyze bias for a specific resource type."""
        bias_results = {
            'resource_type': resource_type,
            'total_count': len(df),
            'demographic_parity': {},
            'equalized_odds': {},
            'calibration': {},
            'statistical_tests': {}
        }
        
        # Demographic Parity Analysis
        # Test if recommendation rates are equal across demographic groups
        
        # By Race/Ethnicity
        race_counts = df['race_ethnicity'].value_counts()
        race_rates = df.groupby('race_ethnicity').size() / len(df)
        
        # Chi-square test for independence
        if len(race_counts) > 1:
            chi2, p_value = stats.chi2_contingency(race_counts.values.reshape(1, -1))[0:2]
            bias_results['statistical_tests']['race_chi2'] = {
                'statistic': float(chi2),
                'p_value': float(p_value),
                'significant': p_value < self.significance_level
            }
        
        bias_results['demographic_parity']['race_ethnicity'] = {
            'rates': race_rates.to_dict(),
            'max_difference': float(race_rates.max() - race_rates.min()),
            'biased': (race_rates.max() - race_rates.min()) > self.fairness_threshold
        }
        
        # By Income Level
        income_counts = df['income_level'].value_counts()
        income_rates = df.groupby('income_level').size() / len(df)
        
        bias_results['demographic_parity']['income_level'] = {
            'rates': income_rates.to_dict(),
            'max_difference': float(income_rates.max() - income_rates.min()),
            'biased': (income_rates.max() - income_rates.min()) > self.fairness_threshold
        }
        
        # By Gender
        gender_counts = df['gender_identity'].value_counts()
        gender_rates = df.groupby('gender_identity').size() / len(df)
        
        bias_results['demographic_parity']['gender_identity'] = {
            'rates': gender_rates.to_dict(),
            'max_difference': float(gender_rates.max() - gender_rates.min()),
            'biased': (gender_rates.max() - gender_rates.min()) > self.fairness_threshold
        }
        
        # Equalized Odds Analysis
        # Test if true positive rates are equal across groups
        successful_outcomes = df[df['status'].isin(['engaged', 'completed'])]
        
        if len(successful_outcomes) > 0:
            success_by_race = successful_outcomes.groupby('race_ethnicity').size() / df.groupby('race_ethnicity').size()
            bias_results['equalized_odds']['race_ethnicity'] = {
                'success_rates': success_by_race.fillna(0).to_dict(),
                'max_difference': float(success_by_race.max() - success_by_race.min()) if len(success_by_race) > 1 else 0,
                'biased': len(success_by_race) > 1 and (success_by_race.max() - success_by_race.min()) > self.fairness_threshold
            }
        
        # Calibration Analysis
        # Test if confidence scores match actual outcomes
        if 'confidence_score' in df.columns and len(df) > 20:
            # Bin confidence scores and calculate actual success rates
            df['confidence_bin'] = pd.cut(df['confidence_score'], bins=5, labels=['very_low', 'low', 'medium', 'high', 'very_high'])
            calibration_data = df.groupby('confidence_bin').agg({
                'engagement_score': 'mean',
                'confidence_score': 'mean'
            }).dropna()
            
            if len(calibration_data) > 2:
                # Correlation between confidence and actual engagement
                correlation, p_val = stats.pearsonr(calibration_data['confidence_score'], calibration_data['engagement_score'])
                bias_results['calibration'] = {
                    'correlation': float(correlation),
                    'p_value': float(p_val),
                    'well_calibrated': correlation > 0.5 and p_val < 0.05
                }
        
        return bias_results
    
    def _calculate_fairness_metrics(self, df: pd.DataFrame) -> Dict:
        """Calculate comprehensive fairness metrics."""
        metrics = {}
        
        # Overall demographic representation
        total_users = self.db.query(User).count()
        
        # Population vs. recommendation demographics
        pop_race_dist = self.db.query(
            User.race_ethnicity,
            func.count().label('count')
        ).group_by(User.race_ethnicity).all()
        
        pop_race_dict = {str(race): count for race, count in pop_race_dist}
        rec_race_dist = df['race_ethnicity'].value_counts().to_dict()
        
        # Calculate representation parity
        representation_parity = {}
        for race in pop_race_dict:
            pop_rate = pop_race_dict[race] / sum(pop_race_dict.values())
            rec_rate = rec_race_dist.get(race, 0) / len(df)
            representation_parity[race] = {
                'population_rate': pop_rate,
                'recommendation_rate': rec_rate,
                'parity_ratio': rec_rate / pop_rate if pop_rate > 0 else 0,
                'underrepresented': (rec_rate / pop_rate) < 0.8 if pop_rate > 0 else False
            }
        
        metrics['representation_parity'] = representation_parity
        
        # Disparate Impact Ratio (80% rule)
        therapy_recs = df[df['resource_type'] == 'therapy']
        if len(therapy_recs) > 0:
            white_therapy_rate = len(therapy_recs[therapy_recs['race_ethnicity'] == 'white']) / len(df[df['race_ethnicity'] == 'white']) if len(df[df['race_ethnicity'] == 'white']) > 0 else 0
            
            disparate_impact = {}
            for race in df['race_ethnicity'].unique():
                if race != 'white':
                    race_therapy_rate = len(therapy_recs[therapy_recs['race_ethnicity'] == race]) / len(df[df['race_ethnicity'] == race]) if len(df[df['race_ethnicity'] == race]) > 0 else 0
                    ratio = race_therapy_rate / white_therapy_rate if white_therapy_rate > 0 else 0
                    disparate_impact[race] = {
                        'therapy_rate': race_therapy_rate,
                        'white_therapy_rate': white_therapy_rate,
                        'ratio': ratio,
                        'passes_80_percent_rule': ratio >= 0.8
                    }
            
            metrics['disparate_impact'] = disparate_impact
        
        return metrics
    
    def _analyze_demographic_patterns(self, df: pd.DataFrame) -> Dict:
        """Analyze patterns across demographic groups."""
        patterns = {}
        
        # Engagement by demographics
        engagement_by_race = df.groupby('race_ethnicity')['engagement_score'].agg(['mean', 'std', 'count'])
        patterns['engagement_by_race'] = engagement_by_race.to_dict('index')
        
        engagement_by_income = df.groupby('income_level')['engagement_score'].agg(['mean', 'std', 'count'])
        patterns['engagement_by_income'] = engagement_by_income.to_dict('index')
        
        # Resource type preferences by demographics
        resource_preferences = df.groupby(['race_ethnicity', 'resource_type']).size().unstack(fill_value=0)
        resource_percentages = resource_preferences.div(resource_preferences.sum(axis=1), axis=0)
        patterns['resource_preferences_by_race'] = resource_percentages.to_dict('index')
        
        return patterns
    
    def _generate_bias_recommendations(self, analysis_results: Dict) -> List[Dict]:
        """Generate recommendations based on bias analysis."""
        recommendations = []
        
        # Check for demographic parity violations
        for resource_type, bias_data in analysis_results['bias_tests'].items():
            for demo_attr, parity_data in bias_data['demographic_parity'].items():
                if parity_data['biased']:
                    recommendations.append({
                        'type': 'demographic_parity_violation',
                        'severity': 'high' if parity_data['max_difference'] > 0.3 else 'medium',
                        'resource_type': resource_type,
                        'demographic_attribute': demo_attr,
                        'max_difference': parity_data['max_difference'],
                        'description': f"Significant disparity in {resource_type} recommendations across {demo_attr} groups",
                        'recommended_action': f"Review {resource_type} recommendation algorithm for {demo_attr} bias"
                    })
        
        # Check for representation issues
        if 'representation_parity' in analysis_results['fairness_metrics']:
            for race, parity_data in analysis_results['fairness_metrics']['representation_parity'].items():
                if parity_data['underrepresented']:
                    recommendations.append({
                        'type': 'underrepresentation',
                        'severity': 'medium',
                        'demographic_group': race,
                        'parity_ratio': parity_data['parity_ratio'],
                        'description': f"{race} group is underrepresented in recommendations",
                        'recommended_action': f"Increase outreach and algorithm tuning for {race} demographic"
                    })
        
        # Check disparate impact
        if 'disparate_impact' in analysis_results['fairness_metrics']:
            for race, impact_data in analysis_results['fairness_metrics']['disparate_impact'].items():
                if not impact_data['passes_80_percent_rule']:
                    recommendations.append({
                        'type': 'disparate_impact',
                        'severity': 'high',
                        'demographic_group': race,
                        'ratio': impact_data['ratio'],
                        'description': f"Therapy recommendations for {race} fail the 80% rule",
                        'recommended_action': f"Immediate algorithm audit required for therapy recommendations to {race} demographic"
                    })
        
        return recommendations
    
    def analyze_geographic_bias(self, days_back: int = 90) -> Dict:
        """
        Analyze geographic bias in mental health outcomes and recommendations.
        
        Args:
            days_back: Number of days to look back
            
        Returns:
            Geographic bias analysis results
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_back)
        
        # Query with geographic data
        query = self.db.query(
            User.pseudonym_id,
            User.zip_code_prefix,
            User.race_ethnicity,
            func.ST_Y(User.location_point).label('latitude'),
            func.ST_X(User.location_point).label('longitude'),
            SocialDeterminants.income_level,
            SocialDeterminants.has_mental_health_provider,
            func.avg(MoodEntry.mood_score).label('avg_mood'),
            func.count(MoodEntry.entry_id).label('mood_entry_count')
        ).join(
            SocialDeterminants, User.pseudonym_id == SocialDeterminants.user_pseudonym_id
        ).join(
            MoodEntry, User.pseudonym_id == MoodEntry.user_pseudonym_id
        ).filter(
            MoodEntry.recorded_at >= cutoff_date
        ).group_by(
            User.pseudonym_id,
            User.zip_code_prefix,
            User.race_ethnicity,
            User.location_point,
            SocialDeterminants.income_level,
            SocialDeterminants.has_mental_health_provider
        )
        
        df = pd.read_sql(query.statement, self.db.bind)
        
        if df.empty:
            return {'error': 'No geographic data found'}
        
        results = {
            'analysis_period_days': days_back,
            'total_locations': len(df),
            'geographic_patterns': {},
            'spatial_clustering': {},
            'access_disparities': {},
            'recommendations': []
        }
        
        # Analyze mood patterns by geographic area
        zip_mood_analysis = df.groupby('zip_code_prefix').agg({
            'avg_mood': 'mean',
            'mood_entry_count': 'sum',
            'has_mental_health_provider': 'mean'
        })
        
        # Identify areas with concerning patterns
        low_mood_areas = zip_mood_analysis[zip_mood_analysis['avg_mood'] < 5.0]  # Below neutral
        low_access_areas = zip_mood_analysis[zip_mood_analysis['has_mental_health_provider'] < 0.5]  # <50% access
        
        results['geographic_patterns'] = {
            'low_mood_areas': len(low_mood_areas),
            'low_access_areas': len(low_access_areas),
            'mood_range': {
                'min': float(df['avg_mood'].min()),
                'max': float(df['avg_mood'].max()),
                'std': float(df['avg_mood'].std())
            }
        }
        
        # Analyze access disparities by race and location
        access_by_race_location = df.groupby(['race_ethnicity', 'zip_code_prefix']).agg({
            'has_mental_health_provider': 'mean',
            'avg_mood': 'mean'
        })
        
        results['access_disparities'] = self._analyze_access_disparities(access_by_race_location)
        
        return results
    
    def _analyze_access_disparities(self, access_df: pd.DataFrame) -> Dict:
        """Analyze mental health access disparities."""
        disparities = {}
        
        # Overall access rates by race
        access_by_race = access_df.groupby('race_ethnicity')['has_mental_health_provider'].mean()
        
        disparities['access_rates_by_race'] = access_by_race.to_dict()
        
        # Identify significant disparities
        max_access = access_by_race.max()
        min_access = access_by_race.min()
        
        disparities['access_gap'] = {
            'max_rate': float(max_access),
            'min_rate': float(min_access),
            'gap': float(max_access - min_access),
            'significant_disparity': (max_access - min_access) > 0.2  # 20% threshold
        }
        
        return disparities
    
    def detect_algorithmic_bias_realtime(self, user_id: str, recommendation_data: Dict) -> Dict:
        """
        Real-time bias detection for individual recommendations.
        
        Args:
            user_id: User pseudonym ID
            recommendation_data: Recommendation details
            
        Returns:
            Bias detection results
        """
        # Get user demographics
        user_data = self.db.query(User, SocialDeterminants).join(
            SocialDeterminants, User.pseudonym_id == SocialDeterminants.user_pseudonym_id
        ).filter(User.pseudonym_id == user_id).first()
        
        if not user_data:
            return {'error': 'User not found'}
        
        user, sdoh = user_data
        
        bias_indicators = {}
        
        # Check for therapy recommendation bias
        if recommendation_data.get('resource_type') == 'therapy':
            # Get historical therapy recommendation rates for this demographic
            similar_users = self.db.query(ResourceRecommendation).join(
                User, ResourceRecommendation.user_pseudonym_id == User.pseudonym_id
            ).join(
                SocialDeterminants, User.pseudonym_id == SocialDeterminants.user_pseudonym_id
            ).filter(
                User.race_ethnicity == user.race_ethnicity,
                SocialDeterminants.income_level == sdoh.income_level,
                ResourceRecommendation.resource_type == 'therapy'
            ).count()
            
            total_similar = self.db.query(User).join(
                SocialDeterminants, User.pseudonym_id == SocialDeterminants.user_pseudonym_id
            ).filter(
                User.race_ethnicity == user.race_ethnicity,
                SocialDeterminants.income_level == sdoh.income_level
            ).count()
            
            if total_similar > 0:
                demographic_therapy_rate = similar_users / total_similar
                
                # Compare to overall therapy rate
                overall_therapy_rate = self.db.query(ResourceRecommendation).filter(
                    ResourceRecommendation.resource_type == 'therapy'
                ).count() / self.db.query(ResourceRecommendation).count()
                
                rate_ratio = demographic_therapy_rate / overall_therapy_rate if overall_therapy_rate > 0 else 0
                
                if rate_ratio < 0.8:  # 80% rule
                    bias_indicators['therapy_underrepresentation'] = {
                        'severity': 1.0 - rate_ratio,
                        'demographic_rate': demographic_therapy_rate,
                        'overall_rate': overall_therapy_rate,
                        'description': f"Therapy recommendations underrepresented for {user.race_ethnicity.value} with {sdoh.income_level} income"
                    }
        
        # Check confidence score calibration
        confidence = recommendation_data.get('confidence_score', 0)
        if confidence > 0:
            # Get historical success rates for similar confidence scores
            similar_confidence_recs = self.db.query(ResourceRecommendation).filter(
                ResourceRecommendation.confidence_score.between(confidence - 0.1, confidence + 0.1),
                ResourceRecommendation.status.in_(['engaged', 'completed'])
            ).count()
            
            total_similar_confidence = self.db.query(ResourceRecommendation).filter(
                ResourceRecommendation.confidence_score.between(confidence - 0.1, confidence + 0.1)
            ).count()
            
            if total_similar_confidence > 10:  # Minimum sample size
                actual_success_rate = similar_confidence_recs / total_similar_confidence
                calibration_error = abs(confidence - actual_success_rate)
                
                if calibration_error > 0.2:  # 20% calibration error threshold
                    bias_indicators['poor_calibration'] = {
                        'severity': calibration_error,
                        'predicted_success': confidence,
                        'actual_success': actual_success_rate,
                        'description': 'Recommendation confidence score poorly calibrated'
                    }
        
        return {
            'user_demographics': {
                'race_ethnicity': user.race_ethnicity.value,
                'age_group': user.age_group.value,
                'income_level': sdoh.income_level
            },
            'bias_indicators': bias_indicators,
            'bias_detected': len(bias_indicators) > 0,
            'max_severity': max([ind['severity'] for ind in bias_indicators.values()]) if bias_indicators else 0
        }
    
    def generate_bias_report(self, output_path: str = None) -> Dict:
        """
        Generate comprehensive bias detection report.
        
        Args:
            output_path: Optional path to save report
            
        Returns:
            Complete bias analysis report
        """
        logger.info("Generating comprehensive bias detection report...")
        
        report = {
            'generated_at': datetime.now(timezone.utc).isoformat(),
            'analysis_summary': {},
            'recommendation_bias': {},
            'geographic_bias': {},
            'overall_assessment': {},
            'action_items': []
        }
        
        # Analyze recommendation bias
        report['recommendation_bias'] = self.analyze_recommendation_bias()
        
        # Analyze geographic bias
        report['geographic_bias'] = self.analyze_geographic_bias()
        
        # Overall assessment
        total_bias_issues = 0
        high_severity_issues = 0
        
        if 'recommendations' in report['recommendation_bias']:
            for rec in report['recommendation_bias']['recommendations']:
                total_bias_issues += 1
                if rec.get('severity') == 'high':
                    high_severity_issues += 1
        
        report['overall_assessment'] = {
            'total_bias_issues': total_bias_issues,
            'high_severity_issues': high_severity_issues,
            'bias_risk_level': 'high' if high_severity_issues > 0 else ('medium' if total_bias_issues > 2 else 'low'),
            'requires_immediate_action': high_severity_issues > 0
        }
        
        # Generate action items
        if high_severity_issues > 0:
            report['action_items'].append({
                'priority': 'immediate',
                'action': 'Audit and fix high-severity algorithmic bias issues',
                'description': 'Critical bias issues detected that require immediate algorithm review'
            })
        
        if total_bias_issues > 0:
            report['action_items'].append({
                'priority': 'medium',
                'action': 'Implement bias monitoring dashboard',
                'description': 'Set up continuous monitoring for bias detection metrics'
            })
        
        report['action_items'].append({
            'priority': 'ongoing',
            'action': 'Regular bias audits',
            'description': 'Schedule monthly bias detection analyses'
        })
        
        # Save report if path provided
        if output_path:
            import json
            with open(output_path, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            logger.info(f"Bias report saved to {output_path}")
        
        logger.info("Bias detection report generated successfully")
        return report
    
    def __del__(self):
        """Clean up database session."""
        if hasattr(self, 'db'):
            self.db.close()


# Convenience functions
def run_bias_analysis(days_back: int = 90) -> Dict:
    """Run complete bias analysis."""
    analyzer = BiasDetectionAnalyzer()
    try:
        return analyzer.generate_bias_report()
    finally:
        analyzer.db.close()


def detect_realtime_bias(user_id: str, recommendation_data: Dict) -> Dict:
    """Detect bias for a single recommendation."""
    analyzer = BiasDetectionAnalyzer()
    try:
        return analyzer.detect_algorithmic_bias_realtime(user_id, recommendation_data)
    finally:
        analyzer.db.close()


if __name__ == "__main__":
    # Run bias analysis
    results = run_bias_analysis()
    print("Bias Analysis Results:")
    print(f"Total bias issues: {results['overall_assessment']['total_bias_issues']}")
    print(f"Risk level: {results['overall_assessment']['bias_risk_level']}")
    
    for action in results['action_items']:
        print(f"Action ({action['priority']}): {action['action']}")