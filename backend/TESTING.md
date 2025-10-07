# FastAPI Backend Testing Guide

This guide covers comprehensive testing strategies for the MindMap Research API, including unit tests, integration tests, security tests, and research compliance validation.

## Testing Overview

### Test Categories

1. **Unit Tests**: Individual function and class testing
2. **Integration Tests**: API endpoint and database interaction testing  
3. **Security Tests**: Authentication, authorization, and vulnerability testing
4. **Research Compliance Tests**: Bias detection and HIPAA compliance validation
5. **Performance Tests**: Load testing and performance benchmarking
6. **End-to-End Tests**: Complete user workflow testing

## Quick Start

### Setup Test Environment

```bash
# Install test dependencies
pip install pytest pytest-cov pytest-asyncio httpx

# Create test database
createdb mindmap_test

# Set test environment
export ENVIRONMENT=testing
export DATABASE_URL=postgresql://postgres:password@localhost:5432/mindmap_test
export SECRET_KEY=test-secret-key-for-testing-only
```

### Run All Tests

```bash
# Run all tests with coverage
pytest --cov=src tests/ -v

# Run specific test categories
pytest tests/unit/ -v                    # Unit tests only
pytest tests/integration/ -v             # Integration tests only
pytest tests/security/ -v                # Security tests only
pytest tests/research/ -v                # Research compliance tests

# Run with detailed coverage report
pytest --cov=src --cov-report=html tests/
```

## Unit Tests

### Authentication Tests

```python
# tests/unit/test_auth.py
import pytest
from unittest.mock import Mock, patch
from core.auth import create_access_token, verify_jwt_token, get_current_user

class TestAuthentication:
    
    def test_create_access_token(self):
        """Test JWT token creation."""
        token_data = {"sub": "test_user", "email": "test@example.com"}
        token = create_access_token(token_data)
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    @pytest.mark.asyncio
    async def test_verify_valid_token(self):
        """Test valid token verification."""
        token_data = {"sub": "test_user", "email": "test@example.com"}
        token = create_access_token(token_data)
        
        verified_data = await verify_jwt_token(token)
        assert verified_data.user_id == "test_user"
        assert verified_data.email == "test@example.com"
    
    @pytest.mark.asyncio
    async def test_verify_invalid_token(self):
        """Test invalid token rejection."""
        with pytest.raises(HTTPException) as exc:
            await verify_jwt_token("invalid.jwt.token")
        
        assert exc.value.status_code == 401
```

### Data Model Tests

```python
# tests/unit/test_models.py
import pytest
from datetime import datetime, timezone
from database.models.user import User
from database.models.mood_entry import MoodEntry

class TestUserModel:
    
    def test_user_creation(self):
        """Test user model creation."""
        user = User(
            pseudonym_id="psn_test123",
            identifier_hash="hash123",
            is_active=True,
            engagement_score=0.5
        )
        
        assert user.pseudonym_id == "psn_test123"
        assert user.is_active is True
        assert user.engagement_score == 0.5

class TestMoodEntryModel:
    
    def test_mood_entry_validation(self):
        """Test mood entry validation."""
        mood_entry = MoodEntry(
            user_pseudonym_id="psn_test123",
            mood_score=7,
            entry_date=datetime.now().date(),
            recorded_at=datetime.now(timezone.utc)
        )
        
        assert mood_entry.mood_score == 7
        assert 1 <= mood_entry.mood_score <= 10
```

### Pseudonymization Tests

```python
# tests/unit/test_pseudonymization.py
import pytest
from database.utils.pseudonymization import pseudonymizer

class TestPseudonymization:
    
    def test_pseudonymize_user_id(self):
        """Test user ID pseudonymization."""
        user_id = "user@example.com"
        pseudonym = pseudonymizer.pseudonymize_user_id(user_id)
        
        assert pseudonym.startswith("psn_")
        assert len(pseudonym) == 36  # psn_ + 32 chars
        assert pseudonym != user_id
    
    def test_consistent_pseudonymization(self):
        """Test pseudonymization consistency."""
        user_id = "user@example.com"
        pseudonym1 = pseudonymizer.pseudonymize_user_id(user_id)
        pseudonym2 = pseudonymizer.pseudonymize_user_id(user_id)
        
        assert pseudonym1 == pseudonym2
    
    def test_different_inputs_different_outputs(self):
        """Test different inputs produce different pseudonyms."""
        pseudonym1 = pseudonymizer.pseudonymize_user_id("user1@example.com")
        pseudonym2 = pseudonymizer.pseudonymize_user_id("user2@example.com")
        
        assert pseudonym1 != pseudonym2
```

## 🔗 Integration Tests

### API Endpoint Tests

```python
# tests/integration/test_auth_endpoints.py
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
class TestAuthEndpoints:
    
    async def test_health_check(self):
        """Test health check endpoint."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "mindmap-api"
    
    async def test_authentication_required(self):
        """Test authentication requirement."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/api/v1/users/profile")
        
        assert response.status_code == 401
    
    async def test_firebase_login(self):
        """Test Firebase authentication flow."""
        # Mock Firebase token verification
        with patch('core.auth.verify_firebase_token') as mock_verify:
            mock_verify.return_value = {
                "firebase_uid": "test_uid",
                "email": "test@example.com",
                "email_verified": True
            }
            
            async with AsyncClient(app=app, base_url="http://test") as ac:
                response = await ac.post("/api/v1/auth/firebase-login", 
                    json={"firebase_token": "mock_token"})
            
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert "refresh_token" in data
```

### Database Integration Tests

```python
# tests/integration/test_database.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.base import Base
from database.models.user import User

@pytest.fixture
def test_db():
    """Create test database session."""
    engine = create_engine("postgresql://postgres:password@localhost:5432/mindmap_test")
    Base.metadata.create_all(engine)
    
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(engine)

class TestDatabaseOperations:
    
    def test_user_creation_and_retrieval(self, test_db):
        """Test user CRUD operations."""
        user = User(
            pseudonym_id="psn_test123",
            identifier_hash="hash123",
            is_active=True
        )
        
        test_db.add(user)
        test_db.commit()
        
        retrieved_user = test_db.query(User).filter(
            User.pseudonym_id == "psn_test123"
        ).first()
        
        assert retrieved_user is not None
        assert retrieved_user.pseudonym_id == "psn_test123"
        assert retrieved_user.is_active is True
```

## Security Tests

### Authentication Security Tests

```python
# tests/security/test_auth_security.py
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
class TestAuthSecurity:
    
    async def test_jwt_token_expiration(self):
        """Test JWT token expiration handling."""
        expired_token = "expired.jwt.token"
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/api/v1/users/profile",
                headers={"Authorization": f"Bearer {expired_token}"})
        
        assert response.status_code == 401
    
    async def test_malformed_token_rejection(self):
        """Test malformed token rejection."""
        malformed_tokens = [
            "not.a.jwt",
            "Bearer malformed",
            "too_short",
            ""
        ]
        
        for token in malformed_tokens:
            async with AsyncClient(app=app, base_url="http://test") as ac:
                response = await ac.get("/api/v1/users/profile",
                    headers={"Authorization": f"Bearer {token}"})
            
            assert response.status_code == 401
    
    async def test_sql_injection_protection(self):
        """Test SQL injection protection."""
        malicious_inputs = [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "admin'; UPDATE users SET is_admin=true; --"
        ]
        
        for malicious_input in malicious_inputs:
            async with AsyncClient(app=app, base_url="http://test") as ac:
                response = await ac.post("/api/v1/mood/entries",
                    json={"mood_score": malicious_input},
                    headers={"Authorization": "Bearer valid_token"})
            
            # Should fail validation, not execute SQL
            assert response.status_code in [400, 422, 401]
```

### Rate Limiting Tests

```python
# tests/security/test_rate_limiting.py
import pytest
import asyncio
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
class TestRateLimiting:
    
    async def test_rate_limit_enforcement(self):
        """Test rate limiting is enforced."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # Make requests up to the limit
            responses = []
            for i in range(65):  # Exceed 60/minute limit
                response = await ac.get("/health")
                responses.append(response.status_code)
            
            # Check that rate limiting kicks in
            rate_limited_responses = [r for r in responses if r == 429]
            assert len(rate_limited_responses) > 0
```

## Research Compliance Tests

### Bias Detection Tests

```python
# tests/research/test_bias_detection.py
import pytest
from database.queries.bias_detection import BiasDetectionAnalyzer
from database.models.user import User, RaceEthnicity
from database.models.resource_recommendation import ResourceRecommendation

class TestBiasDetection:
    
    def test_demographic_parity_calculation(self, test_db):
        """Test demographic parity bias detection."""
        # Create test users with different demographics
        users = [
            User(pseudonym_id=f"psn_user{i}", race_ethnicity=RaceEthnicity.white)
            for i in range(10)
        ] + [
            User(pseudonym_id=f"psn_user{i+10}", race_ethnicity=RaceEthnicity.black_african_american)
            for i in range(10)
        ]
        
        for user in users:
            test_db.add(user)
        test_db.commit()
        
        # Create biased recommendations (more therapy for white users)
        recommendations = []
        for i, user in enumerate(users[:5]):  # First 5 white users get therapy
            rec = ResourceRecommendation(
                user_pseudonym_id=user.pseudonym_id,
                resource_type="therapy",
                confidence_score=0.8
            )
            recommendations.append(rec)
        
        for rec in recommendations:
            test_db.add(rec)
        test_db.commit()
        
        # Run bias detection
        analyzer = BiasDetectionAnalyzer(test_db)
        results = analyzer.analyze_recommendation_bias(days_back=30)
        
        # Check that bias is detected
        assert "bias_tests" in results
        therapy_bias = results["bias_tests"].get("therapy", {})
        race_parity = therapy_bias.get("demographic_parity", {}).get("race_ethnicity", {})
        assert race_parity.get("biased", False) is True
    
    def test_geographic_bias_detection(self, test_db):
        """Test geographic bias detection."""
        # Create users in different geographic areas
        # Test implementation would create mock geographic data
        # and verify bias detection across regions
        pass
```

### HIPAA Compliance Tests

```python
# tests/research/test_hipaa_compliance.py
import pytest
from database.models.audit_log import AuditLog
from database.utils.pseudonymization import validate_pseudonym_format

class TestHIPAACompliance:
    
    def test_pseudonym_format_validation(self):
        """Test pseudonym format compliance."""
        valid_pseudonyms = [
            "psn_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
            "rid_a1b2c3d4e5f6g7h8",
            "sess_a1b2c3d4e5f6g7h8"
        ]
        
        invalid_pseudonyms = [
            "user@example.com",  # Real email
            "john_doe",          # Real name
            "123456789",         # Numeric ID
            "psn_short"          # Too short
        ]
        
        for pseudonym in valid_pseudonyms:
            assert validate_pseudonym_format(pseudonym) is True
        
        for pseudonym in invalid_pseudonyms:
            assert validate_pseudonym_format(pseudonym) is False
    
    def test_audit_log_creation(self, test_db):
        """Test audit logging for compliance."""
        audit_log = AuditLog(
            user_pseudonym_id="psn_test123",
            event_type="data_access",
            event_category="privacy",
            event_description="User data accessed",
            ip_address="192.168.1.1",
            user_agent="test-agent"
        )
        
        test_db.add(audit_log)
        test_db.commit()
        
        retrieved_log = test_db.query(AuditLog).first()
        assert retrieved_log is not None
        assert retrieved_log.event_type == "data_access"
        assert retrieved_log.user_pseudonym_id == "psn_test123"
```

## Performance Tests

### Load Testing

```python
# tests/performance/test_load.py
import pytest
import asyncio
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
class TestPerformance:
    
    async def test_concurrent_requests(self):
        """Test API performance under load."""
        async def make_request():
            async with AsyncClient(app=app, base_url="http://test") as ac:
                response = await ac.get("/health")
                return response.status_code
        
        # Create 100 concurrent requests
        tasks = [make_request() for _ in range(100)]
        results = await asyncio.gather(*tasks)
        
        # Check that all requests succeeded
        success_count = sum(1 for status in results if status == 200)
        assert success_count >= 95  # At least 95% success rate
    
    async def test_database_connection_pool(self):
        """Test database connection pool performance."""
        from database.base import db_manager
        
        # Check pool status
        pool_status = db_manager.get_pool_status()
        assert pool_status["pool_size"] > 0
        assert pool_status["overflow"] >= 0
        
        # Test concurrent database operations
        async def db_operation():
            return db_manager.health_check()
        
        tasks = [db_operation() for _ in range(50)]
        results = await asyncio.gather(*tasks)
        
        # All operations should succeed
        assert all(results)
```

### Memory and Resource Tests

```python
# tests/performance/test_resources.py
import pytest
import psutil
import os
from main import app

class TestResourceUsage:
    
    def test_memory_usage(self):
        """Test memory usage within acceptable limits."""
        process = psutil.Process(os.getpid())
        memory_info = process.memory_info()
        
        # Memory usage should be reasonable (less than 500MB for API)
        memory_mb = memory_info.rss / 1024 / 1024
        assert memory_mb < 500, f"Memory usage too high: {memory_mb:.2f}MB"
    
    def test_response_time(self):
        """Test API response times."""
        import time
        from httpx import Client
        
        with Client(app=app, base_url="http://test") as client:
            start_time = time.time()
            response = client.get("/health")
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # milliseconds
            assert response_time < 100, f"Response time too slow: {response_time:.2f}ms"
```

## End-to-End Tests

### User Journey Tests

```python
# tests/e2e/test_user_journey.py
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
class TestUserJourney:
    
    async def test_complete_user_registration_flow(self):
        """Test complete user registration and data entry flow."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # 1. User registers with Firebase token
            with patch('core.auth.verify_firebase_token') as mock_verify:
                mock_verify.return_value = {
                    "firebase_uid": "test_uid",
                    "email": "test@example.com",
                    "email_verified": True
                }
                
                auth_response = await ac.post("/api/v1/auth/firebase-login",
                    json={"firebase_token": "mock_token"})
                
                assert auth_response.status_code == 200
                auth_data = auth_response.json()
                access_token = auth_data["access_token"]
            
            # 2. User updates their profile
            headers = {"Authorization": f"Bearer {access_token}"}
            profile_response = await ac.put("/api/v1/users/profile",
                json={
                    "age_group": "25-34",
                    "preferred_language": "en"
                },
                headers=headers)
            
            assert profile_response.status_code == 200
            
            # 3. User provides consent
            consent_response = await ac.post("/api/v1/auth/consent",
                json={
                    "research_participation_consent": True,
                    "data_sharing_consent": True,
                    "consent_version_id": "v1.0.0"
                },
                headers=headers)
            
            assert consent_response.status_code == 200
            
            # 4. User creates mood entries
            mood_response = await ac.post("/api/v1/mood/entries",
                json={
                    "mood_score": 7,
                    "anxiety_level": 2,
                    "notes": "Feeling good today"
                },
                headers=headers)
            
            assert mood_response.status_code == 200
            
            # 5. User views their data
            entries_response = await ac.get("/api/v1/mood/entries",
                headers=headers)
            
            assert entries_response.status_code == 200
            entries_data = entries_response.json()
            assert len(entries_data) == 1
            assert entries_data[0]["mood_score"] == 7
```

## Test Coverage and Reporting

### Coverage Configuration

```bash
# .coveragerc
[run]
source = src
omit = 
    */tests/*
    */venv/*
    */migrations/*
    */alembic/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:

[html]
directory = htmlcov
```

### Running Coverage Analysis

```bash
# Generate coverage report
pytest --cov=src --cov-report=html --cov-report=term-missing tests/

# View detailed coverage
open htmlcov/index.html

# Coverage thresholds (add to pytest.ini)
# [tool:pytest]
# addopts = --cov=src --cov-fail-under=80
```

## Continuous Testing

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgis/postgis:15-3.3-alpine
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: mindmap_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v3
      with:
        python-version: 3.11
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov pytest-asyncio
    
    - name: Run tests
      run: |
        pytest --cov=src --cov-report=xml tests/
      env:
        DATABASE_URL: postgresql://postgres:password@localhost:5432/mindmap_test
        REDIS_URL: redis://localhost:6379/0
        SECRET_KEY: test-secret-key
        ENVIRONMENT: testing
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
```

##Test Documentation

### Writing Good Tests

1. **Test Names**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests clearly with setup, execution, and verification
3. **Mock External Services**: Don't rely on external services in tests
4. **Test Data**: Use factories or fixtures for consistent test data
5. **Edge Cases**: Test boundary conditions and error scenarios

### Test Maintenance

1. **Regular Updates**: Keep tests updated with code changes
2. **Performance**: Ensure tests run quickly (< 5 minutes total)
3. **Reliability**: Tests should be deterministic and not flaky
4. **Documentation**: Document complex test scenarios and mock setups
