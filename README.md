# MindMap: Mental Health Geography Platform

A research-grade mental health tracking and analysis platform combining geographic mapping, AI-powered analytics, and comprehensive data science capabilities for mental health research and intervention.

## 🎯 Research Objectives

### Primary Research Goals
- **Geographic Mental Health Patterns**: Analyze correlations between location, environmental factors, and mental health outcomes
- **Predictive Modeling**: Develop AI models to predict mental health episodes and recommend interventions
- **Population Health Insights**: Generate community-level mental health analytics for public health initiatives
- **Intervention Effectiveness**: Measure and optimize mental health intervention strategies using data-driven approaches

### Research Applications
- Clinical psychology research and treatment optimization
- Public health policy development and evaluation
- Environmental psychology and urban planning insights
- Personalized mental health intervention systems

## 🏗️ Architecture Overview

```
mindmap-app/
├── frontend/                 # Client-side application
│   ├── src/                 # Source code
│   └── Dockerfile           # Frontend containerization
├── backend/                 # API server and business logic
│   ├── src/                # Server source code
│   └── Dockerfile          # Backend containerization
├── data-science/           # Research and analytics
│   ├── notebooks/          # Jupyter notebooks for analysis
│   ├── scripts/           # Data processing scripts
│   ├── models/            # ML models and training
│   └── Dockerfile         # Data science environment
├── docs/                  # Documentation
│   ├── api/              # API documentation
│   ├── research/         # Research methodology and findings
│   └── deployment/       # Deployment guides
└── tests/                # Testing suites
```

## 🚀 Quick Setup

### Prerequisites
- Node.js >= 18.0.0
- Python >= 3.9
- Docker & Docker Compose
- Git

### 1. Clone and Initialize
```bash
git clone https://github.com/Bronsonsalazar629/mindmap-mental-health.git
cd mindmap-mental-health
npm install
pip install -r requirements.txt
```

### 2. Environment Configuration
```bash
# Copy configuration templates
cp backend/src/config/config.template.js backend/src/config/config.js
# Add your API keys and database credentials to .env
```

### 3. Database Setup
#### PostgreSQL (Primary Research Database)
```bash
docker-compose up postgres -d
npm run db:migrate
```

#### Firebase (Legacy Support)
- Configure Firebase credentials in your `.env` file

### 4. Development Environment
```bash
# Start all services with Docker
npm run docker:up

# Or run individually
npm run dev:frontend    # Frontend on :3000
npm run dev:backend     # Backend API on :5000
npm run jupyter        # Jupyter Lab on :8888
```

## 🔬 Data Science Environment

### Jupyter Lab Access
- URL: `http://localhost:8888`
- Pre-installed libraries: pandas, scikit-learn, tensorflow, matplotlib
- Notebooks organized by research domain

### Research Workflows
1. **Data Collection**: Automated data ingestion from app usage
2. **Preprocessing**: Data cleaning and feature engineering
3. **Analysis**: Statistical analysis and visualization
4. **Modeling**: Machine learning model development
5. **Validation**: Cross-validation and performance metrics

## 🛡️ Dual Backend Architecture

### PostgreSQL (Primary Research Database)
- **Use Case**: Research data storage, complex analytics
- **Features**: ACID compliance, complex queries, data integrity
- **Connection**: Configured via environment variables

### Firebase (Legacy Support)
- **Use Case**: Real-time features, mobile compatibility
- **Features**: Real-time sync, offline support, authentication
- **Migration Path**: Gradual transition to PostgreSQL

## 🌟 Key Features

### Core Platform
- 📍 **Geographic Mood Tracking**: Location-based mental health data collection
- 🤖 **AI-Powered Analytics**: Machine learning insights and predictions
- 📊 **Advanced Visualizations**: Interactive charts and geographic heatmaps
- 🔍 **AR Wellness Scanner**: Computer vision for wellness assessment
- 🎮 **Gamification**: Evidence-based engagement mechanisms

### Research Capabilities
- 📈 **Statistical Analysis**: Comprehensive statistical testing suites
- 🧠 **Machine Learning**: Predictive models for mental health outcomes
- 🗺️ **Geospatial Analysis**: Geographic information system integration
- 📋 **Clinical Assessments**: Standardized mental health measurement tools
- 🔬 **Longitudinal Studies**: Time-series analysis capabilities

## 🧪 Testing & Quality Assurance

### Testing Strategy
```bash
npm test                # Run all tests
npm run test:frontend   # Frontend unit tests
npm run test:backend    # Backend API tests
npm run test:integration # End-to-end tests
```

### Code Quality
```bash
npm run lint           # ESLint + TypeScript checks
npm run format         # Prettier formatting
npm run typecheck      # TypeScript validation
```

### Pre-commit Hooks
- Automated code formatting
- Linting and type checking
- Secret detection
- Test execution

## 📊 Research Ethics & Privacy

### Data Protection
- **HIPAA Compliance**: Healthcare data protection standards
- **GDPR Compliance**: European data protection regulations
- **Anonymization**: Personal identifiers removed from research datasets
- **Consent Management**: Granular consent tracking and management

### Research Ethics
- IRB approval processes integrated
- Participant consent workflows
- Data retention policies
- Research data sharing protocols

## 🚀 Deployment

### Development
```bash
docker-compose up
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment
- AWS/GCP/Azure compatible
- Kubernetes manifests included
- CI/CD pipeline configuration

## 📚 Documentation

- [API Reference](docs/api/README.md)
- [Research Methodology](docs/research/README.md)
- [Deployment Guide](docs/deployment/README.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🤝 Contributing

This project welcomes contributions from researchers, developers, and mental health professionals. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Research Collaboration
- Open to academic partnerships
- Data sharing agreements available
- Publication collaboration opportunities

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🔗 Related Resources

- [Mental Health Research Best Practices](https://example.com/research-guidelines)
- [Geographic Information Systems for Health](https://example.com/gis-health)
- [AI Ethics in Healthcare](https://example.com/ai-ethics)

## 📞 Contact

- **Research Inquiries**: research@mindmap-platform.org
- **Technical Support**: support@mindmap-platform.org
- **General**: info@mindmap-platform.org

---

*This platform is designed for research purposes and should not be used as a substitute for professional mental health care.*