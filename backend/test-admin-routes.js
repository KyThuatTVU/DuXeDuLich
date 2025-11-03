// Test script for admin routes
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testRoutes() {
    console.log('🧪 Testing Admin Routes...\n');
    
    try {
        // Test dashboard stats
        console.log('1. Testing GET /api/admin/stats');
        const stats = await axios.get(`${API_BASE}/admin/stats`);
        console.log('✅ Stats:', stats.data);
        console.log('');
        
        // Test bookings
        console.log('2. Testing GET /api/admin/bookings');
        const bookings = await axios.get(`${API_BASE}/admin/bookings`);
        console.log('✅ Bookings count:', bookings.data.data.length);
        console.log('');
        
        // Test vehicles
        console.log('3. Testing GET /api/admin/vehicles');
        const vehicles = await axios.get(`${API_BASE}/admin/vehicles`);
        console.log('✅ Vehicles count:', vehicles.data.data.length);
        console.log('');
        
        // Test services
        console.log('4. Testing GET /api/admin/services');
        const services = await axios.get(`${API_BASE}/admin/services`);
        console.log('✅ Services count:', services.data.data.length);
        console.log('');
        
        // Test posts
        console.log('5. Testing GET /api/admin/posts');
        const posts = await axios.get(`${API_BASE}/admin/posts`);
        console.log('✅ Posts count:', posts.data.data.length);
        console.log('');
        
        // Test contacts
        console.log('6. Testing GET /api/admin/contacts');
        const contacts = await axios.get(`${API_BASE}/admin/contacts`);
        console.log('✅ Contacts count:', contacts.data.data.length);
        console.log('');
        
        // Test users
        console.log('7. Testing GET /api/admin/users');
        const users = await axios.get(`${API_BASE}/admin/users`);
        console.log('✅ Users count:', users.data.data.length);
        console.log('');
        
        console.log('✅ All admin routes are working!\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
}

testRoutes();
