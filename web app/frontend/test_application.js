/**
 * Test script for the HTML/JS Email Form System
 * This script tests all major functionality of the application
 */

// Create test directories if they don't exist
const fs = require('fs');
const path = require('path');

// Test directories
const testDir = path.join(__dirname, 'test');
const testFormsDir = path.join(testDir, 'forms');
const testDataDir = path.join(testDir, 'data');

// Create directories
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}
if (!fs.existsSync(testFormsDir)) {
  fs.mkdirSync(testFormsDir);
}
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir);
}

// Create a sample PDF form for testing
const { exec } = require('child_process');
const sampleFormPath = path.join(__dirname, '..', 'forms', 'sample_form.pdf');
const testFormPath = path.join(testFormsDir, 'test_form.pdf');

if (fs.existsSync(sampleFormPath)) {
  fs.copyFileSync(sampleFormPath, testFormPath);
  console.log('✅ Sample form copied for testing');
} else {
  console.log('❌ Sample form not found. Some tests may fail.');
}

// Test the backend API
console.log('\n🔍 Testing Backend API...');

// Function to test API endpoints
async function testApiEndpoint(endpoint, method = 'GET', data = null) {
  try {
    const url = `http://localhost:5000/api${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const result = isJson ? await response.json() : await response.text();
    
    if (response.ok) {
      console.log(`✅ ${method} ${endpoint} - Success`);
      return { success: true, data: result };
    } else {
      console.log(`❌ ${method} ${endpoint} - Failed: ${response.status} ${response.statusText}`);
      return { success: false, error: result };
    }
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Start the backend server for testing
let serverProcess;

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting backend server...');
    serverProcess = exec('cd ../backend && python3 app.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`Server error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Server stderr: ${stderr}`);
        return;
      }
      console.log(`Server stdout: ${stdout}`);
    });
    
    // Give the server some time to start
    setTimeout(() => {
      console.log('Backend server started');
      resolve();
    }, 3000);
  });
}

function stopServer() {
  if (serverProcess) {
    console.log('Stopping backend server...');
    serverProcess.kill();
    console.log('Backend server stopped');
  }
}

// Main test function
async function runTests() {
  try {
    // Start the server
    await startServer();
    
    // Test authentication endpoints
    console.log('\n🔑 Testing Authentication...');
    
    // Test login
    const loginResult = await testApiEndpoint('/auth/login', 'POST', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    let authToken = null;
    if (loginResult.success) {
      authToken = loginResult.data.access_token;
      console.log('✅ Login successful, received auth token');
    }
    
    // Test user info
    if (authToken) {
      const userResult = await testApiEndpoint('/auth/user', 'GET', null, authToken);
      if (userResult.success) {
        console.log(`✅ User info retrieved: ${userResult.data.name}`);
      }
    }
    
    // Test dashboard endpoints
    console.log('\n📊 Testing Dashboard...');
    const dashboardResult = await testApiEndpoint('/dashboard/summary', 'GET', null, authToken);
    if (dashboardResult.success) {
      console.log(`✅ Dashboard data retrieved: ${dashboardResult.data.formsCount} forms`);
    }
    
    // Test forms endpoints
    console.log('\n📄 Testing Forms...');
    const formsResult = await testApiEndpoint('/forms', 'GET', null, authToken);
    if (formsResult.success) {
      console.log(`✅ Forms list retrieved: ${formsResult.data.length} forms`);
    }
    
    // Test recipients endpoints
    console.log('\n👥 Testing Recipients...');
    const recipientsResult = await testApiEndpoint('/recipients', 'GET', null, authToken);
    if (recipientsResult.success) {
      console.log(`✅ Recipients list retrieved: ${recipientsResult.data.length} recipients`);
    }
    
    // Test tracking endpoints
    console.log('\n🔍 Testing Tracking...');
    const trackingResult = await testApiEndpoint('/tracking', 'GET', null, authToken);
    if (trackingResult.success) {
      console.log(`✅ Tracking data retrieved: ${trackingResult.data.length} records`);
    }
    
    // Test extraction endpoints
    console.log('\n📊 Testing Data Extraction...');
    const extractionResult = await testApiEndpoint('/extraction', 'GET', null, authToken);
    if (extractionResult.success) {
      console.log(`✅ Extraction data retrieved: ${extractionResult.data.length} records`);
    }
    
    // Test settings endpoints
    console.log('\n⚙️ Testing Settings...');
    const settingsResult = await testApiEndpoint('/settings', 'GET', null, authToken);
    if (settingsResult.success) {
      console.log('✅ Settings retrieved successfully');
    }
    
    // Test frontend functionality
    console.log('\n🖥️ Testing Frontend...');
    
    // Check if index.html exists
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.html exists');
    } else {
      console.log('❌ index.html not found');
    }
    
    // Check if CSS files exist
    const cssFiles = ['base.css', 'layout.css', 'components.css'];
    let cssSuccess = true;
    for (const file of cssFiles) {
      const cssPath = path.join(__dirname, 'css', file);
      if (fs.existsSync(cssPath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} not found`);
        cssSuccess = false;
      }
    }
    
    // Check if JS files exist
    const jsFiles = [
      'core/app.js', 
      'core/router.js', 
      'core/api.js', 
      'core/auth.js', 
      'core/store.js', 
      'core/ui.js', 
      'core/templates.js',
      'auth-implementation.js'
    ];
    let jsSuccess = true;
    for (const file of jsFiles) {
      const jsPath = path.join(__dirname, 'js', file);
      if (fs.existsSync(jsPath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} not found`);
        jsSuccess = false;
      }
    }
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`Authentication: ${loginResult.success ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Dashboard API: ${dashboardResult.success ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Forms API: ${formsResult.success ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Recipients API: ${recipientsResult.success ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Tracking API: ${trackingResult.success ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Extraction API: ${extractionResult.success ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Settings API: ${settingsResult.success ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Frontend HTML: ${fs.existsSync(indexPath) ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Frontend CSS: ${cssSuccess ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Frontend JS: ${jsSuccess ? '✅ Passed' : '❌ Failed'}`);
    
    const overallSuccess = 
      loginResult.success && 
      dashboardResult.success && 
      formsResult.success && 
      recipientsResult.success && 
      trackingResult.success && 
      extractionResult.success && 
      settingsResult.success && 
      fs.existsSync(indexPath) && 
      cssSuccess && 
      jsSuccess;
    
    console.log(`\nOverall Test Result: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (!overallSuccess) {
      console.log('\n⚠️ Some tests failed. Please check the logs above for details.');
    } else {
      console.log('\n🎉 All tests passed! The application is ready for deployment.');
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Stop the server
    stopServer();
  }
}

// Run the tests
runTests();
