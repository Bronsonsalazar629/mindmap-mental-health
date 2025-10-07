/**
 * Demo Data Generator for Algorithmic Fairness Research
 * 
 * This script generates realistic bias scenarios to demonstrate
 * the detection system's capabilities for academic presentations.
 */

class DemoDataGenerator {
    constructor(biasDetection) {
        this.biasDetection = biasDetection;
        this.demoScenarios = this.createDemoScenarios();
    }

    createDemoScenarios() {
        return [
            // Scenario 1: Insurance-based bias (most common in healthcare)
            {
                name: "Insurance Segregation",
                description: "Uninsured patients receive 40% lower quality resources",
                profiles: [
                    { age: 35, gender: 'female', insurance: 'insured', race: 'white', location: 'urban' },
                    { age: 32, gender: 'male', insurance: 'insured', race: 'black', location: 'urban' },
                    { age: 28, gender: 'female', insurance: 'uninsured', race: 'hispanic', location: 'urban' },
                    { age: 45, gender: 'male', insurance: 'uninsured', race: 'white', location: 'urban' },
                    { age: 38, gender: 'non-binary', insurance: 'medicaid', race: 'asian', location: 'urban' }
                ],
                biasFunction: (profile) => {
                    let results = [
                        { name: 'Premium Mental Health Center', rating: 4.8, isFallback: false },
                        { name: 'University Counseling Services', rating: 4.5, isFallback: false },
                        { name: 'Community Wellness Clinic', rating: 4.0, isFallback: false },
                        { name: 'Public Mental Health Center', rating: 3.5, isFallback: false },
                        { name: 'Crisis Support Line', rating: null, isFallback: true }
                    ];
                    
                    // Insurance bias: uninsured get lower quality options
                    if (profile.insurance === 'uninsured') {
                        results = results.filter(r => !r.rating || r.rating < 4.2);
                    }
                    
                    // Medicaid users get intermediate quality
                    if (profile.insurance === 'medicaid') {
                        results = results.filter(r => !r.rating || r.rating < 4.6);
                    }
                    
                    return results;
                }
            },
            
            // Scenario 2: Geographic bias (rural healthcare desert)
            {
                name: "Rural Healthcare Desert",
                description: "Rural users receive 60% fewer resources than urban users",
                profiles: [
                    { age: 42, gender: 'female', insurance: 'insured', race: 'white', location: 'urban' },
                    { age: 39, gender: 'male', insurance: 'insured', race: 'white', location: 'suburban' },
                    { age: 55, gender: 'female', insurance: 'medicare', race: 'white', location: 'rural' },
                    { age: 48, gender: 'male', insurance: 'insured', race: 'black', location: 'rural' },
                    { age: 33, gender: 'female', insurance: 'medicaid', race: 'hispanic', location: 'rural' }
                ],
                biasFunction: (profile) => {
                    let results = [
                        { name: 'Metropolitan Mental Health Hub', rating: 4.7, isFallback: false },
                        { name: 'Suburban Counseling Center', rating: 4.3, isFallback: false },
                        { name: 'Regional Medical Center', rating: 4.1, isFallback: false },
                        { name: 'Community Health Clinic', rating: 3.8, isFallback: false },
                        { name: 'Telehealth Services', rating: 3.9, isFallback: false }
                    ];
                    
                    // Geographic bias: rural areas have fewer options
                    if (profile.location === 'rural') {
                        results = results.slice(-2); // Only bottom 2 options
                        results.push({ name: 'Crisis Hotline', rating: null, isFallback: true });
                    }
                    
                    if (profile.location === 'suburban') {
                        results = results.slice(1); // Skip premium option
                    }
                    
                    return results;
                }
            },
            
            // Scenario 3: Age-based bias (ageism in mental healthcare)
            {
                name: "Age-based Resource Allocation",
                description: "Senior citizens receive different resource types than younger adults",
                profiles: [
                    { age: 22, gender: 'female', insurance: 'insured', race: 'white', location: 'urban' },
                    { age: 28, gender: 'male', insurance: 'insured', race: 'asian', location: 'urban' },
                    { age: 35, gender: 'non-binary', insurance: 'insured', race: 'black', location: 'urban' },
                    { age: 67, gender: 'female', insurance: 'medicare', race: 'white', location: 'urban' },
                    { age: 72, gender: 'male', insurance: 'medicare', race: 'hispanic', location: 'urban' }
                ],
                biasFunction: (profile) => {
                    let youngAdultResults = [
                        { name: 'Youth Mental Health Collective', rating: 4.6, isFallback: false },
                        { name: 'Progressive Therapy Center', rating: 4.4, isFallback: false },
                        { name: 'Digital Wellness Platform', rating: 4.2, isFallback: false },
                        { name: 'Campus Counseling', rating: 4.0, isFallback: false }
                    ];
                    
                    let seniorResults = [
                        { name: 'Senior Mental Health Services', rating: 3.8, isFallback: false },
                        { name: 'Geriatric Psychiatry Clinic', rating: 3.6, isFallback: false },
                        { name: 'Elder Care Support Group', rating: 3.4, isFallback: false }
                    ];
                    
                    // Age bias: different resources for different age groups
                    if (profile.age >= 65) {
                        return seniorResults;
                    } else if (profile.age < 30) {
                        return youngAdultResults;
                    } else {
                        // Middle-aged get mixed results
                        return [...youngAdultResults.slice(1, 3), ...seniorResults.slice(0, 1)];
                    }
                }
            },
            
            // Scenario 4: Intersectional bias (multiple factors)
            {
                name: "Intersectional Bias Pattern",
                description: "Black women in rural areas face compound disadvantages",
                profiles: [
                    { age: 28, gender: 'female', insurance: 'insured', race: 'white', location: 'urban' },
                    { age: 30, gender: 'male', insurance: 'insured', race: 'white', location: 'urban' },
                    { age: 29, gender: 'female', insurance: 'insured', race: 'black', location: 'urban' },
                    { age: 31, gender: 'female', insurance: 'medicaid', race: 'black', location: 'rural' },
                    { age: 33, gender: 'female', insurance: 'uninsured', race: 'black', location: 'rural' }
                ],
                biasFunction: (profile) => {
                    let baseResults = [
                        { name: 'Premium Wellness Center', rating: 4.8, isFallback: false },
                        { name: 'Integrated Health Services', rating: 4.5, isFallback: false },
                        { name: 'Community Mental Health', rating: 4.0, isFallback: false },
                        { name: 'Public Health Clinic', rating: 3.5, isFallback: false },
                        { name: 'Crisis Support', rating: null, isFallback: true }
                    ];
                    
                    let penaltyScore = 0;
                    
                    // Intersectional penalties
                    if (profile.race === 'black') penaltyScore += 1;
                    if (profile.gender === 'female') penaltyScore += 0.5;
                    if (profile.location === 'rural') penaltyScore += 1.5;
                    if (profile.insurance === 'uninsured') penaltyScore += 2;
                    if (profile.insurance === 'medicaid') penaltyScore += 1;
                    
                    // Apply penalties by removing high-quality options
                    const cutoffIndex = Math.min(Math.floor(penaltyScore), baseResults.length - 2);
                    return baseResults.slice(cutoffIndex);
                }
            }
        ];
    }

    async generateFullDemoDataset() {
        console.log('🎭 Generating comprehensive demo dataset for research presentation...');
        
        let totalBiasEvents = 0;
        let scenarioResults = [];
        
        for (const scenario of this.demoScenarios) {
            console.log(`\n📊 Running scenario: ${scenario.name}`);
            console.log(`📝 ${scenario.description}`);
            
            let scenarioBiasCount = 0;
            
            // Run each profile through the scenario
            for (const profile of scenario.profiles) {
                const results = scenario.biasFunction(profile);
                
                // Simulate the bias detection
                const biasReport = this.biasDetection.checkForBias(
                    profile,
                    this.getLocationForProfile(profile),
                    results,
                    'mentalHealth'
                );
                
                if (biasReport && biasReport.overallBiasDetected) {
                    scenarioBiasCount++;
                    totalBiasEvents++;
                }
                
                // Small delay to simulate real usage
                await this.sleep(100);
            }
            
            scenarioResults.push({
                name: scenario.name,
                description: scenario.description,
                profilesTested: scenario.profiles.length,
                biasDetected: scenarioBiasCount,
                biasRate: `${((scenarioBiasCount / scenario.profiles.length) * 100).toFixed(1)}%`
            });
        }
        
        // Generate additional searches for geographic diversity
        await this.generateGeographicDiversity();
        
        console.log('\n🎯 Demo Dataset Generation Complete!');
        console.log('📈 Summary Statistics:');
        console.table(scenarioResults);
        console.log(`\n🚨 Total Bias Events: ${totalBiasEvents}`);
        console.log(`📊 Bias Detection Rate: ${((totalBiasEvents / (this.demoScenarios.reduce((sum, s) => sum + s.profiles.length, 0))) * 100).toFixed(1)}%`);
        
        return {
            scenarios: scenarioResults,
            totalBiasEvents,
            metricsGenerated: true
        };
    }

    async generateGeographicDiversity() {
        const locations = [
            { name: 'Urban NYC', coords: { lat: 40.7128, lng: -74.0060 }, type: 'urban' },
            { name: 'Rural Montana', coords: { lat: 47.0527, lng: -109.6333 }, type: 'rural' },
            { name: 'Suburban Atlanta', coords: { lat: 33.7490, lng: -84.3880 }, type: 'suburban' },
            { name: 'Rural Mississippi', coords: { lat: 32.3547, lng: -89.3985 }, type: 'rural' },
            { name: 'Urban San Francisco', coords: { lat: 37.7749, lng: -122.4194 }, type: 'urban' }
        ];
        
        for (const location of locations) {
            const profile = {
                age: 25 + Math.floor(Math.random() * 40),
                gender: ['female', 'male', 'non-binary'][Math.floor(Math.random() * 3)],
                insurance: ['insured', 'uninsured', 'medicaid', 'medicare'][Math.floor(Math.random() * 4)],
                race: ['white', 'black', 'hispanic', 'asian', 'other'][Math.floor(Math.random() * 5)],
                location: location.type
            };
            
            let results = [
                { name: `${location.name} Mental Health Center`, rating: 4.0 + Math.random(), isFallback: false },
                { name: `${location.name} Counseling Services`, rating: 3.5 + Math.random(), isFallback: false }
            ];
            
            // Rural bias: fewer, lower quality results
            if (location.type === 'rural') {
                results = results.filter(r => r.rating < 4.2);
                if (Math.random() < 0.3) {
                    results.push({ name: 'Crisis Hotline', rating: null, isFallback: true });
                }
            }
            
            this.biasDetection.checkForBias(profile, location.coords, results, 'mentalHealth');
            await this.sleep(50);
        }
    }

    getLocationForProfile(profile) {
        const locations = {
            urban: { lat: 40.7128, lng: -74.0060 },
            suburban: { lat: 33.7490, lng: -84.3880 },
            rural: { lat: 47.0527, lng: -109.6333 }
        };
        return locations[profile.location] || locations.urban;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate real-time demo for live presentation
    async generateLiveDemoScenario() {
        console.log('🎬 Starting live demo scenario...');
        
        // Scenario: Show insurance bias in real-time
        const profiles = [
            { age: 35, gender: 'female', insurance: 'insured', race: 'white', location: 'urban', name: 'Sarah (Insured)' },
            { age: 33, gender: 'female', insurance: 'uninsured', race: 'black', location: 'urban', name: 'Maria (Uninsured)' }
        ];
        
        for (const profile of profiles) {
            console.log(`\n👤 Testing profile: ${profile.name}`);
            
            let results;
            if (profile.insurance === 'insured') {
                results = [
                    { name: 'Premium Mental Health Center', rating: 4.8, isFallback: false },
                    { name: 'Private Practice Therapy', rating: 4.6, isFallback: false },
                    { name: 'Wellness Institute', rating: 4.4, isFallback: false },
                    { name: 'Community Clinic', rating: 4.0, isFallback: false }
                ];
            } else {
                results = [
                    { name: 'Public Mental Health Center', rating: 3.2, isFallback: false },
                    { name: 'Community Support Group', rating: 3.0, isFallback: false },
                    { name: 'Crisis Hotline', rating: null, isFallback: true }
                ];
            }
            
            const biasReport = this.biasDetection.checkForBias(
                profile,
                { lat: 40.7128, lng: -74.0060 },
                results,
                'mentalHealth'
            );
            
            console.log(`📊 Results for ${profile.name}:`, results.length, 'resources');
            console.log(`⚖️ Bias detected:`, biasReport?.overallBiasDetected || false);
            
            await this.sleep(2000); // 2 second delay for demo effect
        }
        
        console.log('\n🎯 Live demo complete! Check analytics panel for bias detection results.');
    }
}

// Make available globally for demo
if (typeof window !== 'undefined') {
    window.DemoDataGenerator = DemoDataGenerator;
}