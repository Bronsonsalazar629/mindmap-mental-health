# FACTS Algorithm Implementation in MindMap Platform

## What is FACTS?

FACTS (Fair Adaptive Causal Tree Search) is a state-of-the-art algorithm designed to identify and mitigate algorithmic bias in machine learning systems, particularly in healthcare and mental health applications.

## How FACTS Works in the MindMap Analytics

### 1. Causal Graph Construction
The platform implements FACTS through a causal directed acyclic graph (DAG) that models relationships between:

- **Treatment Assignment**: Mental health recommendation (therapy/medication/intervention)
- **Protected Attributes**: Race, ethnicity, gender, age group
- **Confounders**: Socioeconomic status, insurance coverage, geographic location
- **Mediators**: Access to healthcare, stigma factors
- **Outcomes**: Mental health improvement, engagement rates

### 2. Real-time Bias Detection

**Geographic Disparity Calculation:**
```javascript
// Simplified version of FACTS geographic bias detection
function calculateGeographicBias(recommendations, locations) {
    const southRecommendations = recommendations.filter(r => r.latitude < 27.45);
    const northRecommendations = recommendations.filter(r => r.latitude >= 27.45);
    
    const southRate = southRecommendations.length / southLocations.length;
    const northRate = northRecommendations.length / northLocations.length;
    
    return Math.abs(southRate - northRate); // Geographic disparity metric
}
```

**Demographic Parity Calculation:**
```javascript
// FACTS demographic fairness assessment
function calculateDemographicParity(recommendations) {
    const rateByRace = {};
    ['White', 'Black', 'Hispanic', 'Asian', 'Other'].forEach(race => {
        const total = users.filter(u => u.race === race).length;
        const recommended = recommendations.filter(r => r.user.race === race).length;
        rateByRace[race] = recommended / total;
    });
    
    const rates = Object.values(rateByRace);
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    
    return minRate / maxRate; // Demographic parity score (1.0 = perfect parity)
}
```

### 3. Causal Pathway Analysis

The FACTS algorithm in the dashboard shows:

1. **Root Node (Treatment Assignment)**: The algorithmic decision being made
2. **Confounder Node (Race/Ethnicity)**: Protected attribute that shouldn't influence decisions
3. **Mediator Node (Geographic Location)**: Environmental factor that may legitimately influence outcomes
4. **Outcome Node (Mental Health)**: The desired result we're optimizing for

### 4. Bias Mitigation Strategies

When FACTS detects bias above threshold (>0.4 for geographic, <0.8 for demographic):

**Intervention 1: Constraint Optimization**
- Adjust recommendation weights to achieve demographic parity
- Apply fairness constraints to the ML model

**Intervention 2: Causal Debiasing**
- Remove spurious correlations between protected attributes and outcomes
- Preserve legitimate causal pathways (e.g., geographic access to services)

**Intervention 3: Counterfactual Fairness**
- Generate counterfactual predictions: "What would the recommendation be if this person had a different race/location?"
- Ensure decisions remain consistent across counterfactuals

### 5. Implementation in Analytics Dashboard

The bias detection dashboard provides real-time monitoring of:

- **Recommendation Rates by Demographics**: Visual representation of potential bias
- **Geographic Heat Map**: Spatial analysis of bias patterns
- **Severity Indicators**: Real-time bias metrics with actionable thresholds
- **Causal Diagram**: Visual representation of the FACTS causal model

### 6. Research Applications

The FACTS implementation enables:

1. **Prospective Bias Monitoring**: Detect bias as it emerges in real-time
2. **Causal Inference**: Understand why bias occurs, not just that it exists
3. **Targeted Interventions**: Apply specific fixes to identified causal pathways
4. **Fairness Validation**: Verify that interventions actually reduce bias

### 7. Technical Integration Points

**Data Pipeline Integration:**
- Real-time data ingestion from user interactions
- Continuous bias metric calculation
- Automated alerts for bias threshold violations

**ML Model Integration:**
- Bias-aware model training with fairness constraints
- Real-time model adjustment based on FACTS recommendations
- A/B testing framework for bias mitigation strategies

**Clinical Integration:**
- Provider dashboard showing bias alerts
- Decision support tools with fairness explanations
- Audit trails for regulatory compliance

## Conclusion

The FACTS algorithm implementation in MindMap provides a comprehensive framework for detecting, understanding, and mitigating algorithmic bias in mental health recommendations. The real-time dashboard makes these complex fairness concepts accessible to researchers, clinicians, and policymakers.