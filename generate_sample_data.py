"""
Sample Data Generator for Quick Testing
Generates a small sample of mental health research entries for testing purposes

This script generates sample CSV data without affecting the existing database seed system.
Use this for quick testing, demos, or data analysis prototypes.

Usage: python generate_sample_data.py [number_of_entries]
Default: 100 entries
"""

import csv
import random
import math
import sys
from datetime import datetime, timedelta

def generate_sample_data(num_entries=100):
    """Generate sample mental health data around Bradenton, FL"""
    
    print(f"🔬 Generating {num_entries} sample mental health entries...")
    
    # Bradenton, FL coordinates
    center_lat, center_lon = 27.4989, -82.5748
    
    entries = []
    for i in range(1, num_entries + 1):
        # Random coordinates within ~10 mile radius
        angle = random.uniform(0, 2 * math.pi)
        distance = random.uniform(0, 0.15)  # ~10 miles in degrees
        
        lat = center_lat + (distance * math.cos(angle))
        lon = center_lon + (distance * math.sin(angle))
        
        # Base mood with geographic bias (south areas slightly lower)
        base_mood = random.uniform(4, 8)
        if lat < 27.45:
            base_mood -= 0.8
        mood_score = max(1, min(10, base_mood))
        
        # Generate correlated metrics
        anxiety = max(1, min(7, 8 - mood_score + random.uniform(-1, 1)))
        stress = max(1, min(10, 9 - mood_score + random.uniform(-1, 1)))
        
        # Random timestamp within last 30 days
        days_ago = random.randint(0, 30)
        timestamp = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
        
        entry = {
            'id': f'SAMPLE_{i:03d}',
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'latitude': round(lat, 6),
            'longitude': round(lon, 6),
            'mood_score': round(mood_score, 1),
            'anxiety_level': round(anxiety, 1),
            'stress_level': round(stress, 1),
            'age_group': random.choice(['18-24', '25-34', '35-44', '45-54', '55+']),
            'location_type': random.choice(['Home', 'Work', 'Public', 'Healthcare']),
            'weather': random.choice(['Sunny', 'Cloudy', 'Rainy', 'Stormy'])
        }
        entries.append(entry)
    
    # Write to CSV
    filename = f'sample_data_{num_entries}_entries.csv'
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'timestamp', 'latitude', 'longitude', 'mood_score', 
                     'anxiety_level', 'stress_level', 'age_group', 'location_type', 'weather']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(entries)
    
    # Show statistics
    south_entries = [e for e in entries if e['latitude'] < 27.45]
    north_entries = [e for e in entries if e['latitude'] >= 27.45]
    
    if south_entries and north_entries:
        south_avg = sum(e['mood_score'] for e in south_entries) / len(south_entries)
        north_avg = sum(e['mood_score'] for e in north_entries) / len(north_entries)
        
        print(f"✅ Generated {filename}")
        print(f"📊 South area avg mood: {south_avg:.2f} ({len(south_entries)} entries)")
        print(f"📊 North area avg mood: {north_avg:.2f} ({len(north_entries)} entries)")
        print(f"📊 Geographic bias: {north_avg - south_avg:.2f} point difference")
    else:
        print(f"✅ Generated {filename} with {num_entries} entries")

if __name__ == "__main__":
    # Get number of entries from command line or use default
    num_entries = 100
    if len(sys.argv) > 1:
        try:
            num_entries = int(sys.argv[1])
            num_entries = max(10, min(1000, num_entries))  # Limit between 10-1000
        except ValueError:
            print("Invalid number, using default of 100 entries")
    
    generate_sample_data(num_entries)