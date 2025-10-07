# MindMap Research API Backend

A FastAPI backend for mental health research with comprehensive bias detection and geographic analysis capabilities.

## Features

### Core Features
- **Firebase Authentication**: Seamless integration with Firebase Auth and JWT tokens
- **Bias Detection**: Advanced algorithmic fairness analysis and bias monitoring
- **Geographic Analysis**: PostGIS-powered location analysis with privacy protection
- **Real-time Mood Tracking**: Validated mood entry system with quality controls
- **A/B Testing Framework**: Built-in intervention tracking for research studies

### Technical Features
- **FastAPI Framework**: High-performance async API with automatic OpenAPI documentation
- **PostgreSQL + PostGIS**: Advanced database with geographic information system support
- **Connection Pooling**: Production-ready database connection management
- **Rate Limiting**: Redis-backed rate limiting with research compliance
- **Comprehensive Logging**: Audit trails and security monitoring
- **Error Handling**: Sanitized error responses with detailed internal logging

## 📋 Prerequisites

- Python 3.9+
- PostgreSQL 12+ with PostGIS extension
- Redis 6+ (optional, for rate limiting)
- Node.js 16+ (for development tools)

## 🛠 Installation

1. **Clone the repository**
   ```bash
   cd mindmap-app/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate  # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r ../requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python src/startup.py
   ```

6. **Run the application**
   ```bash
   cd src
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Application
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=your-super-secret-key-here
API_V1_STR=/api/v1

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/mindmap
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# Firebase Authentication
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40your-project.iam.gserviceaccount.com

# Security
ALLOWED_HOSTS=localhost,127.0.0.1,*.your-domain.com
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.com

# Research Compliance
PSEUDONYMIZATION_SALT=your-research-grade-salt-here
REQUIRE_CONSENT=true
MINIMUM_AGE=18
BIAS_DETECTION_ENABLED=true

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000
```

### Database Setup

1. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE mindmap;
   CREATE USER mindmap_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE mindmap TO mindmap_user;
   ```

2. **Enable PostGIS extension**
   ```sql
   \c mindmap
   CREATE EXTENSION postgis;
   CREATE EXTENSION "uuid-ossp";
   CREATE EXTENSION pgcrypto;
   ```

3. **Run migrations**
   ```bash
   cd src
   alembic upgrade head
   ```

4. **Generate seed data (optional)**
   ```bash
   python database/seeds/generate_seed_data.py
   ```

## Architecture

### Project Structure

```
backend/src/
├── main.py                 # FastAPI application entry point
├── startup.py             # Application initialization script
├── core/                  # Core application modules
│   ├── auth.py           # Authentication and authorization
│   ├── config.py         # Configuration management
│   ├── middleware.py     # Custom middleware components
│   └── exceptions.py     # Error handling and exceptions
├── api/                  # API endpoints
│   └── routers/          # API route handlers
│       ├── auth.py       # Authentication endpoints
│       ├── users.py      # User management
│       ├── mood.py       # Mood tracking
│       ├── recommendations.py # AI recommendations
│       ├── interventions.py   # Research interventions
│       └── research.py   # Research analytics
└── database/             # Database layer
    ├── models/           # SQLAlchemy models
    ├── queries/          # Complex query functions
    ├── migrations/       # Alembic database migrations
    ├── seeds/           # Seed data generators
    └── utils/           # Database utilities
```

### Key Components

#### Authentication System
- **Firebase Integration**: Seamless user authentication with Firebase
- **JWT Tokens**: Secure API access with refresh token support
- **Role-Based Access**: User, researcher, and admin role management
- **Consent Management**: Research participation and data sharing consent

#### Data Models
- **User**: Pseudonymized user profiles with demographic data
- **MoodEntry**: Mood tracking with location and quality validation
- **ResourceRecommendation**: AI-powered personalized recommendations
- **SocialDeterminants**: Social determinants of health (SDOH) data
- **InterventionLog**: A/B testing and intervention tracking
- **AuditLog**: Comprehensive audit trail for compliance

#### Middleware Stack
- **Security Headers**: OWASP-compliant security headers
- **CORS**: Cross-origin request handling
- **Rate Limiting**: Redis-backed request throttling
- **Request Logging**: Comprehensive request/response logging
- **Pseudonymization**: Automatic user ID pseudonymization
- **Error Handling**: Sanitized error responses with audit logging

##  Security Features

### Data Protection
- **Pseudonymization**: SHA-256 HMAC-based user ID pseudonymization
- **Geographic Privacy**: Location data anonymization with configurable precision
- **Data Minimization**: Collection of only necessary data for research
- **Retention Policies**: Configurable data retention and deletion

### Authentication & Authorization
- **Multi-factor Authentication**: Firebase-based MFA support
- **JWT Security**: Secure token handling with configurable expiration
- **Role-based Access Control**: Granular permission system
- **Session Management**: Secure session handling with logout capabilities

- **IRB Support**: Institutional Review Board compliance features
- **Audit Logging**: Comprehensive audit trail for all operations
- **Consent Management**: Granular consent tracking and validation

## Research Features

### Bias Detection
- **Algorithmic Fairness**: Statistical tests for bias detection
- **Demographic Parity**: Equal treatment across demographic groups
- **Geographic Analysis**: Spatial bias detection and analysis
- **Real-time Monitoring**: Continuous bias monitoring with alerts

### Analytics & Insights
- **Mood Trend Analysis**: Temporal mood pattern analysis
- **Geographic Patterns**: Spatial analysis of mental health outcomes
- **Intervention Effectiveness**: A/B testing result analysis
- **Population Health**: Aggregate health outcome analysis

### Research Tools
- **Data Export**: HIPAA-compliant data export for analysis
- **Statistical Analysis**: Built-in statistical analysis functions
- **Cohort Management**: Research participant grouping and tracking
- **Study Management**: Multi-study support with participant isolation

## API Documentation

### Interactive Documentation
- **Swagger UI**: Available at `http://localhost:8000/docs`
- **ReDoc**: Available at `http://localhost:8000/redoc`
- **OpenAPI Spec**: Available at `http://localhost:8000/openapi.json`

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/firebase-login` - Firebase authentication
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Current user information
- `POST /api/v1/auth/logout` - User logout

#### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/preferences` - Get user preferences
- `PUT /api/v1/users/social-determinants` - Update SDOH data

#### Mood Tracking
- `POST /api/v1/mood/entries` - Create mood entry
- `GET /api/v1/mood/entries` - Get mood entries
- `GET /api/v1/mood/trends` - Get mood analysis

#### Research & Analytics
- `GET /api/v1/research/bias-analysis` - Bias detection analysis
- `GET /api/v1/research/geographic-analysis` - Geographic analysis
- `POST /api/v1/research/bias-report` - Generate bias report

### Rate Limits
- Authentication endpoints: 10 requests/minute
- User data endpoints: 30 requests/minute  
- Research endpoints: 5 requests/minute (researcher role required)
- General API: 60 requests/minute

## Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   export ENVIRONMENT=production
   export DEBUG=false
   # Set all production environment variables
   ```

2. **Database Migration**
   ```bash
   alembic upgrade head
   ```

3. **Application Server**
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Health Monitoring

- **Health Check**: `GET /health`
- **Detailed Health**: `GET /health/detailed`
- **Metrics**: `GET /metrics`

## Testing

### Running Tests
```bash
# Unit tests
pytest tests/unit/

# Integration tests  
pytest tests/integration/

# Coverage report
pytest --cov=src tests/
```

### Test Data
```bash
# Generate test data
python src/database/seeds/generate_seed_data.py

# Run bias analysis on test data
python src/database/queries/bias_detection.py
```

## Contributing

1. **Code Standards**
   - Follow PEP 8 style guidelines
   - Use type hints for all functions
   - Add docstrings for public methods
   - Include unit tests for new features

2. **Security Requirements**
   - No hardcoded secrets or credentials
   - Validate all user inputs
   - Follow OWASP security guidelines
   - Add audit logging for sensitive operations

3. **Research Compliance**
   - Maintain HIPAA compliance standards
   - Document bias detection methods
   - Follow IRB approval processes
   - Ensure data minimization principles

## Support

- **Documentation**: [API Documentation](http://localhost:8000/docs)
- **Issues**: GitHub Issues
- **Security**: Report security issues privately

## License

MIT License - See LICENSE file for details.

## Research Citation

If you use this platform for research, please cite:
```
MindMap Research Platform. (2025). FastAPI Backend for Mental Health Research 
with Bias Detection. Version 2.0.0.
```