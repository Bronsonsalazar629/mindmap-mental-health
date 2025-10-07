-- Migration: Add mental health facilities table with PostGIS spatial index
-- Date: 2024-12-04
-- Description: Creates mental_health_facilities table for SAMHSA facility data

-- Create mental_health_facilities table
CREATE TABLE IF NOT EXISTS mental_health_facilities (
    facility_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    website VARCHAR(500),
    location GEOGRAPHY(POINT, 4326),
    facility_type VARCHAR(50),
    services TEXT[],
    payment_types TEXT[],
    description TEXT,
    hours_of_operation JSONB,
    languages_spoken TEXT[],
    capacity INTEGER,
    email VARCHAR(255),
    fax VARCHAR(20),
    contact_person VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_verified TIMESTAMP WITH TIME ZONE,
    data_source VARCHAR(50) NOT NULL DEFAULT 'SAMHSA',
    source_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_facilities_name ON mental_health_facilities(name);
CREATE INDEX IF NOT EXISTS idx_facilities_city ON mental_health_facilities(city);
CREATE INDEX IF NOT EXISTS idx_facilities_state ON mental_health_facilities(state);
CREATE INDEX IF NOT EXISTS idx_facilities_zip_code ON mental_health_facilities(zip_code);
CREATE INDEX IF NOT EXISTS idx_facilities_facility_type ON mental_health_facilities(facility_type);
CREATE INDEX IF NOT EXISTS idx_facilities_is_active ON mental_health_facilities(is_active);

-- Create spatial index for location-based queries (PostGIS)
CREATE INDEX IF NOT EXISTS idx_facilities_location ON mental_health_facilities USING GIST(location);

-- Create GIN indexes for array fields
CREATE INDEX IF NOT EXISTS idx_facilities_services ON mental_health_facilities USING GIN(services);
CREATE INDEX IF NOT EXISTS idx_facilities_payment_types ON mental_health_facilities USING GIN(payment_types);
CREATE INDEX IF NOT EXISTS idx_facilities_languages ON mental_health_facilities USING GIN(languages_spoken);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_facilities_search ON mental_health_facilities USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_facilities_updated_at 
    BEFORE UPDATE ON mental_health_facilities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE mental_health_facilities IS 'SAMHSA mental health facilities with spatial search capabilities';
COMMENT ON COLUMN mental_health_facilities.location IS 'PostGIS geography point for spatial queries';
COMMENT ON COLUMN mental_health_facilities.services IS 'Array of services offered at facility';
COMMENT ON COLUMN mental_health_facilities.payment_types IS 'Array of payment methods accepted';