const https = require('https');
const fs = require('fs');

const API_KEY = 'AIzaSyDll2jvuvURfgbfs9JV4Iiuoh1IYBKsztU';
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

const testResults = {
    timestamp: new Date().toISOString(),
    tests: []
};

function makeRequest(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { timeout }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data, error: 'Invalid JSON' });
                }
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.on('error', reject);
    });
}

async function testTextSearch() {
    console.log('\nTesting Text Search API...');
    const query = 'mental health facilities near Seattle';
    const url = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
    
    try {
        const start = Date.now();
        const result = await makeRequest(url);
        const duration = Date.now() - start;
        
        const test = {
            name: 'Text Search',
            url: url.replace(API_KEY, 'API_KEY_HIDDEN'),
            duration,
            status: result.status,
            success: result.status === 200 && result.data.status === 'OK',
            resultCount: result.data.results ? result.data.results.length : 0,
            quota: result.data.status,
            error: result.data.error_message || result.error
        };
        
        testResults.tests.push(test);
        
        console.log(`Status: ${result.status}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Results: ${test.resultCount}`);
        console.log(`API Status: ${result.data.status}`);
        
        if (result.data.error_message) {
            console.log(`Error: ${result.data.error_message}`);
        }
        
    } catch (error) {
        const test = {
            name: 'Text Search',
            success: false,
            error: error.message
        };
        testResults.tests.push(test);
        console.log(`Error: ${error.message}`);
    }
}

async function testNearbySearch() {
    console.log('\nTesting Nearby Search API...');
    const location = '47.6062,-122.3321'; // Seattle
    const radius = 50000; // 50km
    const type = 'hospital';
    const url = `${BASE_URL}/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${API_KEY}`;
    
    try {
        const start = Date.now();
        const result = await makeRequest(url);
        const duration = Date.now() - start;
        
        const test = {
            name: 'Nearby Search',
            url: url.replace(API_KEY, 'API_KEY_HIDDEN'),
            duration,
            status: result.status,
            success: result.status === 200 && result.data.status === 'OK',
            resultCount: result.data.results ? result.data.results.length : 0,
            quota: result.data.status,
            error: result.data.error_message || result.error
        };
        
        testResults.tests.push(test);
        
        console.log(`Status: ${result.status}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Results: ${test.resultCount}`);
        console.log(`API Status: ${result.data.status}`);
        
        if (result.data.error_message) {
            console.log(`Error: ${result.data.error_message}`);
        }
        
    } catch (error) {
        const test = {
            name: 'Nearby Search',
            success: false,
            error: error.message
        };
        testResults.tests.push(test);
        console.log(`Error: ${error.message}`);
    }
}

async function testPlaceDetails() {
    console.log('\nTesting Place Details API...');
    // Use a known place_id for Seattle Children's Hospital
    const placeId = 'ChIJrw7QBKkVkFQRzU9nxb9GQ28';
    const url = `${BASE_URL}/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,place_id,types&key=${API_KEY}`;
    
    try {
        const start = Date.now();
        const result = await makeRequest(url);
        const duration = Date.now() - start;
        
        const test = {
            name: 'Place Details',
            url: url.replace(API_KEY, 'API_KEY_HIDDEN'),
            duration,
            status: result.status,
            success: result.status === 200 && result.data.status === 'OK',
            placeName: result.data.result ? result.data.result.name : 'N/A',
            quota: result.data.status,
            error: result.data.error_message || result.error
        };
        
        testResults.tests.push(test);
        
        console.log(`Status: ${result.status}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Place: ${test.placeName}`);
        console.log(`API Status: ${result.data.status}`);
        
        if (result.data.error_message) {
            console.log(`Error: ${result.data.error_message}`);
        }
        
    } catch (error) {
        const test = {
            name: 'Place Details',
            success: false,
            error: error.message
        };
        testResults.tests.push(test);
        console.log(`Error: ${error.message}`);
    }
}

async function testQuotaLimits() {
    console.log('\nTesting Quota Limits (5 rapid requests)...');
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
        const query = `mental health facility test ${i}`;
        const url = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
        promises.push(makeRequest(url, 5000));
    }
    
    try {
        const results = await Promise.allSettled(promises);
        let successful = 0;
        let quotaErrors = 0;
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                if (result.value.data.status === 'OK') {
                    successful++;
                } else if (result.value.data.status === 'OVER_QUERY_LIMIT') {
                    quotaErrors++;
                }
            }
        });
        
        const test = {
            name: 'Quota Test',
            successful,
            quotaErrors,
            totalRequests: 5,
            quotaHealthy: quotaErrors === 0
        };
        
        testResults.tests.push(test);
        
        console.log(`Successful: ${successful}/5`);
        console.log(`Quota errors: ${quotaErrors}/5`);
        console.log(`Quota health: ${test.quotaHealthy ? 'GOOD' : 'POOR'}`);
        
    } catch (error) {
        console.log(`Quota test failed: ${error.message}`);
    }
}

async function runDiagnostics() {
    console.log('Starting Google Places API Diagnostics\n');
    console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 10)}`);
    
    await testTextSearch();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
    
    await testNearbySearch();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
    
    await testPlaceDetails();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
    
    await testQuotaLimits();
    
    console.log('\nDIAGNOSTIC SUMMARY');
    console.log('='.repeat(50));
    
    const successful = testResults.tests.filter(t => t.success).length;
    const total = testResults.tests.filter(t => t.name !== 'Quota Test').length;
    
    console.log(`Successful tests: ${successful}/${total}`);
    console.log(`Average response time: ${Math.round(testResults.tests
        .filter(t => t.duration)
        .reduce((sum, t) => sum + t.duration, 0) / 
        testResults.tests.filter(t => t.duration).length)}ms`);
    
    const quotaTest = testResults.tests.find(t => t.name === 'Quota Test');
    if (quotaTest) {
        console.log(`Quota status: ${quotaTest.quotaHealthy ? 'HEALTHY' : 'LIMITED'}`);
    }
    
    console.log('\nRECOMMENDATIONS:');
    if (successful < total) {
        console.log('- Check API key permissions in Google Cloud Console');
        console.log('- Verify Places API is enabled');
        console.log('- Check billing account status');
    }
    if (quotaTest && !quotaTest.quotaHealthy) {
        console.log('- Implement request throttling (1 req/sec)');
        console.log('- Consider caching responses');
        console.log('- Monitor daily quota usage');
    }
    if (testResults.tests.some(t => t.duration > 5000)) {
        console.log('- Implement shorter timeouts for user experience');
        console.log('- Add retry logic with exponential backoff');
    }
    
    // Save detailed results
    fs.writeFileSync('places-api-diagnostic-results.json', JSON.stringify(testResults, null, 2));
    console.log('\nDetailed results saved to: places-api-diagnostic-results.json');
}

if (require.main === module) {
    runDiagnostics().catch(console.error);
}

module.exports = { runDiagnostics, testResults };