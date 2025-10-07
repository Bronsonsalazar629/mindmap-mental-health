# MindMap Frontend - Research-Grade Data Collection System

## Overview

The MindMap frontend provides a comprehensive, research-grade data collection system for mental health research. Built with vanilla JavaScript for maximum compatibility, it includes validated assessment tools, privacy-controlled data collection, and offline capabilities.

## Features

### 🧠 **Mental Health Assessments**
- **PHQ-9 (Patient Health Questionnaire-9)**: Validated depression screening tool
- **GAD-7 (Generalized Anxiety Disorder-7)**: Standardized anxiety assessment
- Real-time scoring with clinical interpretation
- Critical response detection for safety protocols

### 🗺️ **Geographic Data Collection**
- GPS-based location capture with accuracy metrics
- Privacy controls (precise, approximate, area-only, none)
- Manual location override capability
- Reverse geocoding for address information
- HIPAA-compliant location anonymization

### 🏠 **Social Determinants of Health (SDOH)**
- Standardized demographic categories
- Socioeconomic factors assessment
- Housing and environmental factors
- Healthcare access evaluation
- Social support measurement

### 🌡️ **Environmental Context**
- Automatic weather data integration
- Real-time noise level monitoring
- Light sensor integration
- Social setting documentation
- Environmental distraction tracking

### 📈 **Longitudinal Tracking**
- Session linking across time
- Trend analysis and pattern detection
- Baseline and follow-up management
- Adherence scoring and reminders
- Research protocol compliance

### ✅ **Advanced Validation**
- Research-grade form validation
- Real-time error checking
- Data quality scoring
- Consistency verification
- Pattern response detection

### 📱 **Progressive Disclosure UI**
- Adaptive question ordering
- Fatigue detection and management
- Break suggestions and timing
- Completion incentives
- User engagement scoring

### 📶 **Offline Capabilities**
- Complete offline data collection
- IndexedDB storage with localStorage fallback
- Automatic sync when online
- Conflict resolution strategies
- Background synchronization

## Architecture

### Component Structure
```
frontend/src/components/data-collection/
├── DataCollectionSystem.js          # Main orchestrator
├── MoodTrackingComponents.js         # PHQ-9 & GAD-7 implementation
├── GeographicDataCollection.js       # Location services
├── SDOHQuestionnaire.js             # Social determinants assessment
├── EnvironmentalContextForms.js      # Environmental data collection
├── LongitudinalTrackingSystem.js     # Time-series tracking
├── FormValidationSystem.js          # Validation engine
├── ProgressiveDisclosureUI.js       # UI flow management
├── OfflineCapabilitySync.js         # Offline functionality
└── DataCollectionSchemaExporter.js  # Schema documentation
```

### Data Flow
```
User Input → Validation → Local Storage → Sync Queue → Backend API
     ↓              ↓            ↓           ↓           ↓
Components → Real-time → IndexedDB → Background → Research Database
           Feedback              Sync
```

## Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- IndexedDB and localStorage support
- Geolocation API (optional)
- MediaDevices API for environmental sensors (optional)

### Installation
1. Include the CSS file:
```html
<link rel="stylesheet" href="src/styles/data-collection.css">
```

2. Include the JavaScript components:
```html
<script src="src/components/data-collection/FormValidationSystem.js"></script>
<script src="src/components/data-collection/OfflineCapabilitySync.js"></script>
<script src="src/components/data-collection/MoodTrackingComponents.js"></script>
<script src="src/components/data-collection/GeographicDataCollection.js"></script>
<script src="src/components/data-collection/SDOHQuestionnaire.js"></script>
<script src="src/components/data-collection/EnvironmentalContextForms.js"></script>
<script src="src/components/data-collection/LongitudinalTrackingSystem.js"></script>
<script src="src/components/data-collection/ProgressiveDisclosureUI.js"></script>
<script src="src/components/data-collection/DataCollectionSchemaExporter.js"></script>
<script src="src/components/data-collection/DataCollectionSystem.js"></script>
```

### Basic Usage
```javascript
// Initialize the system
const participantId = 'participant_123';
const dataCollection = new DataCollectionSystem();

await dataCollection.initialize(participantId, {
    enabledComponents: ['all'],
    validationLevel: 'strict',
    offlineMode: true,
    longitudinalTracking: true
});

// The system will automatically create the UI and handle data collection
```

### Component-Specific Usage

#### Mood Tracking
```javascript
const moodTracker = new MoodTrackingSystem();
const phq9Questions = moodTracker.getPHQ9Questions();
const gad7Questions = moodTracker.getGAD7Questions();

// Create question UI
const questionElement = moodTracker.createQuestionComponent(
    phq9Questions[0], 0, phq9Questions.length
);
```

#### Geographic Data
```javascript
const geoCollector = new GeographicDataCollection();
const geoUI = geoCollector.createGeographicUI();

// Set privacy level
geoCollector.privacyLevel = 'approximate'; // precise, approximate, area_only, none
```

#### SDOH Questionnaire
```javascript
const sdohQuest = new SDOHQuestionnaire();
const demographicsSection = sdohQuest.createSectionUI(0); // Demographics section
```

## Configuration

### Validation Configuration
```javascript
const validator = new FormValidationSystem();

// Register field validation
validator.registerValidation('email', [
    { type: 'required' },
    { type: 'email' }
]);

// Register cross-field validation
validator.registerCrossFieldValidator({
    id: 'consistency_check',
    fields: ['field1', 'field2'],
    validator: (data) => ({ isValid: data.field1 === data.field2 })
});
```

### Offline Configuration
```javascript
const offlineSync = new OfflineCapabilitySync();
offlineSync.conflictResolutionStrategy = 'client_wins'; // server_wins, merge, manual
offlineSync.maxRetryAttempts = 5;
```

### Progressive Disclosure Configuration
```javascript
const progressive = new ProgressiveDisclosureUI();
progressive.adaptiveSettings = {
    enableAdaptiveOrdering: true,
    enableSmartSkipping: true,
    enableFatigueDetection: true,
    maxStepsBeforeBreak: 5
};
```

## Data Export

### Schema Export
```javascript
const exporter = new DataCollectionSchemaExporter();

// Configure export options
exporter.configure({
    format: 'json', // json, yaml, xml
    includeExamples: true,
    includeValidationRules: true,
    includeMetadata: true
});

// Export to file
exporter.exportToFile('research-schema');
```

### Data Export
```javascript
// Export all collected data
const sessionData = dataCollection.collectFinalSessionData();

// Export longitudinal trends
const trends = longitudinalTracker.getAllTrends();
```

## Privacy & Security

### Data Protection
- All participant IDs are pseudonymized
- Geographic data respects privacy level settings
- Sensitive responses (e.g., suicidal ideation) trigger safety protocols
- Data encrypted in transit and at rest

### HIPAA Compliance
- Automatic pseudonymization of identifiers
- Comprehensive audit logging
- Consent management integration
- Data minimization principles applied

### Research Ethics
- IRB-compliant data collection procedures
- Informed consent integration
- Right to withdraw and delete data
- Transparency in data usage

## Browser Compatibility

### Minimum Requirements
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Progressive Enhancement
- Core functionality works without modern APIs
- Enhanced features available with:
  - Geolocation API
  - MediaDevices API
  - IndexedDB
  - Service Workers

## Performance

### Optimization Features
- Lazy loading of components
- Efficient data structures
- Minimal DOM manipulation
- Background synchronization
- Memory management

### Storage Management
- Automatic cleanup of synced data
- Compression for large datasets
- Fallback storage strategies
- Storage quota monitoring

## Development

### Code Organization
- Modular component architecture
- Clear separation of concerns
- Consistent naming conventions
- Comprehensive error handling

### Testing
```bash
# Run frontend tests
npm run test:frontend

# Run component-specific tests
npm run test:components
```

### Building
```bash
# Development build
npm run build:frontend

# Production build with minification
npm run build:frontend:prod
```

## API Integration

The frontend integrates with the FastAPI backend through RESTful endpoints:

- `POST /api/v1/mood/entry` - Submit mood tracking data
- `POST /api/v1/geographic/entry` - Submit location data
- `POST /api/v1/sdoh/entry` - Submit SDOH responses
- `POST /api/v1/environmental/entry` - Submit environmental context
- `POST /api/v1/sessions/entry` - Submit session data

## Troubleshooting

### Common Issues

**Offline Sync Issues**
- Check network connectivity
- Verify IndexedDB availability
- Clear browser cache if needed
- Check storage quotas

**Validation Errors**
- Review field requirements
- Check data format specifications
- Verify cross-field dependencies
- Enable debug mode for details

**Component Integration**
- Ensure proper script loading order
- Check browser console for errors
- Verify component initialization
- Review configuration settings

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'mindmap:*');

// Component-specific debugging
const dataCollection = new DataCollectionSystem();
dataCollection.debugMode = true;
```

## Contributing

1. Follow the existing code style
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure HIPAA compliance for any data handling
5. Test offline functionality thoroughly

## License

MIT License - See LICENSE file for details.

## Support

For technical support or research collaboration inquiries:
- Email: support@mindmap-platform.org
- Documentation: [Research Documentation](../docs/)
- Issues: GitHub Issues page