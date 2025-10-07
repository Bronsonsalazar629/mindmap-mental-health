# SAMHSA Mental Health Facilities Integration Guide

## Overview

This guide documents the complete integration of SAMHSA mental health facility data into the MindMap platform. The integration provides location-based facility search with PostGIS spatial queries, map visualization, and comprehensive facility information.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│                 │    │                 │    │                 │
│ - FacilitiesAPI │◄──►│ FastAPI Routes  │◄──►│ PostgreSQL +    │
│ - Map Markers   │    │ - /nearby       │    │ PostGIS         │
│ - Info Windows  │    │ - /search       │    │                 │
└─────────────────┘    │ - /by-state     │    └─────────────────┘
                       └─────────────────┘
                               │
                       ┌─────────────────┐
                       │  Data Import    │
                       │                 │
                       │ SAMHSA CSV →    │
                       │ PostgreSQL      │
                       └─────────────────┘
```

## Database Schema

### Mental Health Facilities Table

```sql
CREATE TABLE mental_health_facilities (
    facility_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    website VARCHAR(500),
    location GEOGRAPHY(POINT, 4326),  -- PostGIS spatial column
    facility_type VARCHAR(50),
    services TEXT[],                  -- Array of services
    payment_types TEXT[],             -- Array of payment methods
    description TEXT,
    hours_of_operation JSONB,
    languages_spoken TEXT[],
    capacity INTEGER,
    email VARCHAR(255),
    contact_person VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    data_source VARCHAR(50) DEFAULT 'SAMHSA',
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Spatial index for location-based queries
CREATE INDEX idx_facilities_location ON mental_health_facilities USING GIST(location);
```

## API Endpoints

### 1. Nearby Facilities Search
**Endpoint:** `GET /api/facilities/nearby`

**Parameters:**
- `latitude` (required): Search center latitude
- `longitude` (required): Search center longitude  
- `radius` (optional, default: 10): Search radius in miles
- `facility_type` (optional): Filter by facility type
- `services` (optional): Comma-separated services filter
- `limit` (optional, default: 50): Maximum results

**Example:**
```bash
GET /api/facilities/nearby?latitude=37.7749&longitude=-122.4194&radius=5&limit=20
```

**Response:**
```json
{
  "facilities": [
    {
      "facility_id": "CA12345",
      "name": "Community Mental Health Center",
      "full_address": "123 Main St, San Francisco, CA 94102",
      "phone": "(415) 555-0123",
      "facility_type": "outpatient",
      "services": ["Mental Health Services", "Crisis Support"],
      "coordinates": [37.7749, -122.4194],
      "distance_miles": 0.8,
      "is_verified": true
    }
  ],
  "total_count": 1,
  "search_center": {"latitude": 37.7749, "longitude": -122.4194},
  "search_radius_miles": 5
}
```

### 2. Text-Based Facility Search
**Endpoint:** `GET /api/facilities/search`

**Parameters:**
- `q` (required): Search query
- `state` (optional): State filter
- `city` (optional): City filter
- `facility_type` (optional): Facility type filter

**Example:**
```bash
GET /api/facilities/search?q=mental+health+crisis&state=CA&limit=10
```

### 3. Facility Details
**Endpoint:** `GET /api/facilities/{facility_id}`

**Example:**
```bash
GET /api/facilities/CA12345
```

## Frontend Integration

### 1. Facilities API Service

```javascript
// Initialize the service
const facilitiesAPI = new FacilitiesAPI('/api/facilities');

// Search nearby facilities
const nearbyFacilities = await facilitiesAPI.getNearbyFacilities(
    37.7749, -122.4194, 
    { radius: 10, verifiedOnly: true }
);

// Text search
const searchResults = await facilitiesAPI.searchFacilities(
    'mental health', 
    { state: 'CA', limit: 20 }
);
```

### 2. Map Integration

```javascript
// Initialize map markers
const facilityMapMarkers = new FacilityMapMarkers(map, facilitiesAPI);
window.facilityMapMarkers = facilityMapMarkers;

// Show nearby facilities on map
await facilityMapMarkers.showNearbyFacilities(lat, lng, radius);

// Add facility markers
facilityMapMarkers.addFacilityMarkers(facilities);
```

### 3. Custom Marker Icons

```javascript
const facilityIcons = {
    hospital: { fillColor: '#dc2626', scale: 8 },      // Red circles
    outpatient: { fillColor: '#2563eb', scale: 8 },    // Blue circles  
    crisis_center: { fillColor: '#ea580c', scale: 10 }, // Orange circles
    community_center: { fillColor: '#16a34a', scale: 8 }, // Green circles
    residential: { fillColor: '#7c3aed', scale: 8 }    // Purple circles
};
```

## Data Import Process

### 1. Running the Import Script

```bash
# Install dependencies
pip install asyncpg pandas numpy

# Import SAMHSA data
python scripts/import_samhsa_data.py \
    --csv-path data-science/data/extracted/NSUMHSS_2023_PUF_CSV.csv \
    --database-url postgresql://user:pass@localhost:5432/mindmap \
    --batch-size 100

# Dry run to validate data
python scripts/import_samhsa_data.py \
    --csv-path data.csv \
    --dry-run
```

### 2. Import Features

- **Async Processing**: Uses asyncpg for high-performance database operations
- **Batch Processing**: Processes records in configurable batches
- **Data Validation**: Cleans and validates facility data
- **Duplicate Detection**: Prevents duplicate facility records
- **Progress Logging**: Real-time import progress and statistics  
- **Error Handling**: Comprehensive error logging and recovery

### 3. Import Statistics

```json
{
  "total_records": 29113,
  "processed": 29113,
  "successful": 28956,
  "failed": 157,
  "duplicates": 45,
  "success_rate": "99.5%",
  "duration_seconds": 245.2,
  "records_per_second": 118.7
}
```

## Database Performance

### Spatial Queries
- **PostGIS ST_DWithin**: Efficient radius-based searches
- **Spatial Index**: GIST index on location column
- **Query Performance**: <50ms for typical nearby searches

### Full-Text Search  
- **PostgreSQL tsvector**: Full-text search on names and descriptions
- **GIN Index**: Optimized text search performance
- **Search Ranking**: Results ranked by relevance

## Integration Testing

### 1. Database Migration

```sql
-- Run the migration
\i backend/src/database/migrations/versions/001_add_mental_health_facilities.sql
```

### 2. API Testing

```bash
# Health check
curl http://localhost:8000/api/facilities/health/status

# Nearby search
curl "http://localhost:8000/api/facilities/nearby?latitude=37.7749&longitude=-122.4194&radius=10"

# Text search  
curl "http://localhost:8000/api/facilities/search?q=mental+health&limit=5"
```

### 3. Frontend Testing

```html
<!-- Include required scripts -->
<script src="src/services/facilitiesAPI.js"></script>
<script src="src/components/FacilityMapMarkers.js"></script>

<script>
// Test facility search
facilitiesAPI.getNearbyFacilities(37.7749, -122.4194, {radius: 5})
    .then(response => console.log('Found facilities:', response.facilities.length));

// Test map integration
const markers = new FacilityMapMarkers(map, facilitiesAPI);
markers.showNearbyFacilities(37.7749, -122.4194, 10);
</script>
```

## Security Considerations

### 1. Authentication
- All API endpoints require valid authentication tokens
- Rate limiting applied to prevent abuse (60 requests/minute for search)

### 2. Data Privacy
- No PII stored in facility records
- Location data anonymized to facility-level precision
- Audit logging for facility access

### 3. Input Validation
- SQL injection protection via parameterized queries
- Input sanitization on all API parameters
- Comprehensive error handling

## Maintenance

### 1. Data Updates
- SAMHSA data should be updated annually
- Re-run import script with new data
- Verify facilities after major updates

### 2. Performance Monitoring
- Monitor spatial query performance
- Track API response times
- Review import success rates

### 3. Cache Management
- Frontend API responses cached for 5 minutes
- Clear cache after data updates
- Monitor cache hit rates

## Troubleshooting

### Common Issues

1. **PostGIS Not Installed**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Import Permission Errors**
   ```bash
   # Check database permissions
   GRANT ALL PRIVILEGES ON mental_health_facilities TO username;
   ```

3. **Missing Coordinates**
   - Many facilities may not have coordinates
   - Consider integrating geocoding service
   - Use address-based search as fallback

4. **Slow Spatial Queries**
   ```sql
   -- Verify spatial index exists
   SELECT * FROM pg_indexes WHERE tablename = 'mental_health_facilities';
   
   -- Rebuild if necessary
   REINDEX INDEX idx_facilities_location;
   ```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live facility updates
2. **Advanced Filtering**: More granular service and payment type filters
3. **Reviews & Ratings**: User feedback system for facilities
4. **Accessibility Info**: ADA compliance and accessibility details
5. **Multi-language**: Support for facilities serving non-English speakers

