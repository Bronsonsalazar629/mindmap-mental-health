const { Client } = require('pg');

const connectionConfig = {
    host: 'localhost',
    port: 5432,
    database: 'mindmap',
    user: 'postgres',
    password: 'password',
    connectTimeoutMillis: 5000,
    statement_timeout: 10000,
    query_timeout: 10000,
};

async function testConnection() {
    console.log('Testing PostgreSQL Connection...');
    console.log(`Host: ${connectionConfig.host}:${connectionConfig.port}`);
    console.log(`Database: ${connectionConfig.database}`);
    console.log(`User: ${connectionConfig.user}\n`);

    const client = new Client(connectionConfig);

    try {
        console.log('Attempting to connect...');
        await client.connect();
        console.log('Connection successful!\n');

        // Test basic query
        console.log('Testing basic query...');
        const result = await client.query('SELECT version()');
        console.log('PostgreSQL Version:', result.rows[0].version);

        // Test database exists
        console.log('\nTesting database access...');
        const dbResult = await client.query('SELECT current_database()');
        console.log('Connected to database:', dbResult.rows[0].current_database);

        // Test PostGIS extension (if available)
        console.log('\nTesting PostGIS extension...');
        try {
            const postgisResult = await client.query('SELECT PostGIS_Version()');
            console.log('PostGIS Version:', postgisResult.rows[0].postgis_version);
        } catch (error) {
            console.log('PostGIS not available:', error.message);
        }

        // Test schema creation capability
        console.log('\nTesting schema operations...');
        try {
            await client.query('CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, test_time TIMESTAMP DEFAULT NOW())');
            await client.query('INSERT INTO connection_test DEFAULT VALUES');
            const testResult = await client.query('SELECT COUNT(*) as count FROM connection_test');
            console.log('Test table operations successful. Record count:', testResult.rows[0].count);
            
            // Clean up
            await client.query('DROP TABLE IF EXISTS connection_test');
            console.log('Test table cleaned up');
        } catch (error) {
            console.log('Schema operation failed:', error.message);
        }

        // Test connection pool behavior
        console.log('\nTesting multiple queries...');
        const queries = [
            'SELECT 1 as test1',
            'SELECT 2 as test2', 
            'SELECT 3 as test3'
        ];

        const startTime = Date.now();
        const results = await Promise.all(queries.map(q => client.query(q)));
        const duration = Date.now() - startTime;
        
        console.log('Multiple queries completed in', duration, 'ms');
        console.log('Results:', results.map(r => r.rows[0]));

    } catch (error) {
        console.error('Connection test failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\nTroubleshooting:');
            console.log('- Make sure PostgreSQL is running');
            console.log('- Check if Docker containers are up: docker ps');
            console.log('- Start containers: docker-compose up -d postgres');
        } else if (error.code === 'ENOTFOUND') {
            console.log('\nTroubleshooting:');
            console.log('- Check hostname/IP address');
            console.log('- Verify network connectivity');
        } else if (error.code === '28P01') {
            console.log('\nTroubleshooting:');
            console.log('- Check username and password');
            console.log('- Verify user permissions');
        } else if (error.code === '3D000') {
            console.log('\nTroubleshooting:');
            console.log('- Database does not exist');
            console.log('- Check database name in connection config');
        }
        
        process.exit(1);
    } finally {
        await client.end();
        console.log('\nConnection closed');
    }
}

async function testConnectionString() {
    console.log('\nTesting with connection string format...');
    const connectionString = `postgresql://${connectionConfig.user}:${connectionConfig.password}@${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`;
    
    const client = new Client({
        connectionString,
        connectTimeoutMillis: 5000
    });

    try {
        await client.connect();
        const result = await client.query('SELECT current_timestamp');
        console.log('Connection string test successful');
        console.log('Current timestamp:', result.rows[0].current_timestamp);
    } catch (error) {
        console.error('Connection string test failed:', error.message);
    } finally {
        await client.end();
    }
}

if (require.main === module) {
    testConnection()
        .then(() => testConnectionString())
        .then(() => {
            console.log('\nAll tests completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { testConnection, connectionConfig };