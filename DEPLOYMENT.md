# MindMap Research Platform - Deployment Guide

This guide covers deployment of the complete MindMap Research Platform with FastAPI backend, React frontend, PostgreSQL database, and Redis caching.

## 🚀 Quick Start

### Development Environment

1. **Prerequisites**
   ```bash
   # Install Docker and Docker Compose
   # Windows: Download Docker Desktop
   # macOS: Download Docker Desktop  
   # Linux: Install docker and docker-compose packages
   ```

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd mindmap-app
   ```

3. **Configure Environment**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   
   # Edit backend/.env with your configuration
   # At minimum, update:
   # - SECRET_KEY (generate a secure 32+ character key)
   # - PSEUDONYMIZATION_SALT (generate a secure salt)
   # - Firebase configuration if using Firebase Auth
   ```

4. **Start Development Environment**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f backend
   
   # Access services:
   # - API Documentation: http://localhost:8000/docs
   # - Frontend: http://localhost:3000
   # - Database Admin: http://localhost:5050 (with --profile tools)
   ```

5. **Initialize Database**
   ```bash
   # Run database migrations and seed data
   docker-compose exec backend python src/startup.py
   
   # Or run individually:
   docker-compose exec backend python src/database/init_db.py
   docker-compose exec backend python src/database/seeds/generate_seed_data.py
   ```

## 🏗 Production Deployment

### Environment Setup

1. **Server Requirements**
   - 4+ CPU cores
   - 8+ GB RAM
   - 100+ GB SSD storage
   - Ubuntu 20.04+ or similar Linux distribution

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone Repository**
   ```bash
   git clone <repository-url> /opt/mindmap
   cd /opt/mindmap
   ```

### Production Configuration

1. **Environment Variables**
   ```bash
   # Create production environment file
   cp backend/.env.example backend/.env.production
   
   # Configure production settings:
   # - ENVIRONMENT=production
   # - DEBUG=false
   # - Strong SECRET_KEY and PSEUDONYMIZATION_SALT
   # - Production database URL
   # - Firebase production configuration
   # - Allowed hosts and origins
   ```

2. **SSL Certificates**
   ```bash
   # Create SSL directory
   mkdir -p nginx/ssl
   
   # Option 1: Let's Encrypt (recommended)
   sudo apt install certbot
   sudo certbot certonly --standalone -d api.yourdomain.com -d app.yourdomain.com
   
   # Copy certificates
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
   
   # Option 2: Self-signed (development only)
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/ssl/privkey.pem -out nginx/ssl/fullchain.pem
   ```

3. **Nginx Configuration**
   ```bash
   # Create nginx configuration
   mkdir -p nginx
   cat > nginx/nginx.conf << 'EOF'
   events {
       worker_connections 1024;
   }
   
   http {
       upstream backend {
           server backend:8000;
       }
       
       upstream frontend {
           server frontend:3000;
       }
       
       server {
           listen 80;
           server_name yourdomain.com;
           return 301 https://$server_name$request_uri;
       }
       
       server {
           listen 443 ssl http2;
           server_name yourdomain.com;
           
           ssl_certificate /etc/nginx/ssl/fullchain.pem;
           ssl_certificate_key /etc/nginx/ssl/privkey.pem;
           
           location /api/ {
               proxy_pass http://backend;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }
           
           location /docs {
               proxy_pass http://backend;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
           }
           
           location / {
               proxy_pass http://frontend;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           }
       }
   }
   EOF
   ```

### Production Deployment

1. **Deploy Services**
   ```bash
   # Build and start production services
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   
   # Initialize database
   docker-compose exec backend python src/startup.py
   
   # Check service health
   docker-compose ps
   curl -f https://yourdomain.com/api/v1/health
   ```

2. **Setup Monitoring**
   ```bash
   # View logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   
   # Monitor resources
   docker stats
   
   # Setup log rotation
   sudo nano /etc/logrotate.d/docker
   ```

3. **Backup Strategy**
   ```bash
   # Database backup script
   cat > backup-db.sh << 'EOF'
   #!/bin/bash
   BACKUP_DIR="/opt/mindmap/backups"
   mkdir -p $BACKUP_DIR
   
   # Create database backup
   docker-compose exec -T postgres pg_dump -U postgres mindmap > \
     $BACKUP_DIR/mindmap-$(date +%Y%m%d-%H%M%S).sql
   
   # Keep only last 30 days
   find $BACKUP_DIR -name "mindmap-*.sql" -mtime +30 -delete
   EOF
   
   chmod +x backup-db.sh
   
   # Add to crontab
   (crontab -l 2>/dev/null; echo "0 2 * * * /opt/mindmap/backup-db.sh") | crontab -
   ```

## 🔒 Security Hardening

### Application Security

1. **Environment Variables**
   ```bash
   # Generate secure secrets
   python -c "import secrets; print(secrets.token_urlsafe(32))"  # SECRET_KEY
   python -c "import secrets; print(secrets.token_urlsafe(64))"  # PSEUDONYMIZATION_SALT
   ```

2. **Database Security**
   ```bash
   # Create dedicated database user
   docker-compose exec postgres psql -U postgres -c "
   CREATE USER mindmap_app WITH PASSWORD 'secure_random_password';
   GRANT CONNECT ON DATABASE mindmap TO mindmap_app;
   GRANT USAGE ON SCHEMA public TO mindmap_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mindmap_app;
   GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO mindmap_app;
   "
   
   # Update DATABASE_URL with new user
   ```

3. **Network Security**
   ```bash
   # Configure firewall
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw --force enable
   
   # Close database ports (remove from docker-compose.yml)
   # Remove: "5432:5432" and "6379:6379" port mappings
   ```

### HIPAA Compliance

1. **Audit Logging**
   ```bash
   # Ensure audit logs are enabled
   # Check backend/.env:
   # AUDIT_LOG_RETENTION_DAYS=3650
   # LOG_LEVEL=INFO
   
   # Monitor audit logs
   docker-compose exec backend tail -f /var/log/mindmap-audit.log
   ```

2. **Data Encryption**
   ```bash
   # Enable disk encryption (production)
   sudo cryptsetup luksFormat /dev/sdb
   sudo cryptsetup luksOpen /dev/sdb mindmap-data
   sudo mkfs.ext4 /dev/mapper/mindmap-data
   sudo mount /dev/mapper/mindmap-data /var/lib/docker
   ```

3. **Access Controls**
   ```bash
   # Regular user permission audit
   docker-compose exec postgres psql -U postgres -c "
   SELECT usename, usesuper, usecreatedb FROM pg_user;
   "
   ```

## 📊 Monitoring & Maintenance

### Health Monitoring

1. **Service Health Checks**
   ```bash
   # Check all services
   docker-compose ps
   
   # Check API health
   curl -f http://localhost:8000/health/detailed
   
   # Check database connections
   docker-compose exec backend python -c "
   from database.base import db_manager
   print('DB Health:', db_manager.health_check())
   print('Pool Status:', db_manager.get_pool_status())
   "
   ```

2. **Performance Monitoring**
   ```bash
   # Monitor resource usage
   docker stats --no-stream
   
   # Monitor API performance
   docker-compose exec backend python -c "
   import requests, time
   start = time.time()
   response = requests.get('http://localhost:8000/api/v1/health')
   print(f'API Response Time: {(time.time() - start)*1000:.2f}ms')
   "
   ```

### Maintenance Tasks

1. **Database Maintenance**
   ```bash
   # Run VACUUM and ANALYZE
   docker-compose exec postgres psql -U postgres -d mindmap -c "VACUUM ANALYZE;"
   
   # Check database size
   docker-compose exec postgres psql -U postgres -d mindmap -c "
   SELECT pg_size_pretty(pg_database_size('mindmap'));
   "
   ```

2. **Log Management**
   ```bash
   # Archive old logs
   docker-compose exec backend find /var/log -name "*.log" -mtime +30 -exec gzip {} \;
   
   # Clean up Docker logs
   docker system prune -f
   ```

3. **Security Updates**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Update Docker images
   docker-compose pull
   docker-compose up -d --build
   
   # Update dependencies
   pip list --outdated
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   docker-compose exec postgres pg_isready -U postgres
   
   # View PostgreSQL logs
   docker-compose logs postgres
   
   # Reset database connection
   docker-compose restart postgres backend
   ```

2. **Authentication Issues**
   ```bash
   # Check Firebase configuration
   docker-compose exec backend python -c "
   from core.auth import init_firebase
   app = init_firebase()
   print('Firebase initialized:', app is not None)
   "
   
   # Verify JWT tokens
   curl -H 'Authorization: Bearer <token>' http://localhost:8000/api/v1/auth/verify
   ```

3. **Performance Issues**
   ```bash
   # Check database performance
   docker-compose exec postgres psql -U postgres -d mindmap -c "
   SELECT query, calls, total_time, mean_time 
   FROM pg_stat_statements 
   ORDER BY total_time DESC LIMIT 10;
   "
   
   # Check connection pools
   docker-compose exec backend python -c "
   from database.base import db_manager
   print(db_manager.get_pool_status())
   "
   ```

### Recovery Procedures

1. **Database Recovery**
   ```bash
   # Restore from backup
   docker-compose exec -T postgres psql -U postgres -d mindmap < backup.sql
   
   # Reset to clean state
   docker-compose down -v
   docker-compose up -d
   docker-compose exec backend python src/startup.py
   ```

2. **Service Recovery**
   ```bash
   # Restart specific service
   docker-compose restart backend
   
   # Full system restart
   docker-compose down
   docker-compose up -d
   
   # Check service logs
   docker-compose logs -f --tail=100 backend
   ```

## 📞 Support

- **Documentation**: Check `/docs` directory for detailed API documentation
- **Logs**: All application logs are available via `docker-compose logs`
- **Health Checks**: Use `/health` and `/health/detailed` endpoints
- **Database**: Access via PgAdmin at `http://localhost:5050` (development)
- **Monitoring**: Use `/metrics` endpoint for Prometheus integration

## 🔄 Updates & Upgrades

1. **Application Updates**
   ```bash
   git pull origin main
   docker-compose build
   docker-compose up -d
   ```

2. **Database Migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

3. **Dependency Updates**
   ```bash
   pip list --outdated > updates.txt
   # Review and update requirements.txt
   docker-compose build --no-cache backend
   ```