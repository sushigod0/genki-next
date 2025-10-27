// test-cloudinary.js
// Run this script to test your Cloudinary connection
// Usage: node test-cloudinary.js

const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryConnection() {
  console.log('🧪 Testing Cloudinary connection...');
  console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set ✅' : 'Missing ❌');
  console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set ✅' : 'Missing ❌');
  console.log('');

  try {
    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const pingResult = await cloudinary.api.ping();
    console.log('Ping result:', pingResult);
    console.log('');

    // Test 2: List ALL resources to see what's available
    console.log('📁 Fetching ALL resources to analyze structure...');
    const allResources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 30,
      resource_type: 'image'
    });
    
    console.log(`Found ${allResources.resources.length} total resources`);
    console.log('');
    
    // Analyze folder structure
    const folderAnalysis = {};
    allResources.resources.forEach((resource) => {
      const publicId = resource.public_id;
      const folder = resource.folder || 'root';
      
      if (!folderAnalysis[folder]) {
        folderAnalysis[folder] = [];
      }
      folderAnalysis[folder].push({
        public_id: publicId,
        format: resource.format,
        size: `${resource.width}x${resource.height}`
      });
    });
    
    console.log('📊 Folder Analysis:');
    Object.keys(folderAnalysis).forEach(folder => {
      console.log(`\n📁 Folder: "${folder}" (${folderAnalysis[folder].length} images)`);
      folderAnalysis[folder].slice(0, 5).forEach((img, index) => {
        console.log(`   ${index + 1}. ${img.public_id} (${img.format}, ${img.size})`);
      });
      if (folderAnalysis[folder].length > 5) {
        console.log(`   ... and ${folderAnalysis[folder].length - 5} more`);
      }
    });

    // Test 3: Specifically test genki folder access
    console.log('\n🎯 Testing genki folder access methods...');
    
    const testMethods = [
      { prefix: 'genki', name: 'prefix: genki' },
      { prefix: 'genki/', name: 'prefix: genki/' },
      { expression: 'folder:genki', name: 'search folder:genki' },
      { expression: 'folder:genki/*', name: 'search folder:genki/*' }
    ];

    for (const method of testMethods) {
      try {
        console.log(`\n🔍 Testing: ${method.name}`);
        
        let result;
        if (method.prefix) {
          result = await cloudinary.api.resources({
            type: 'upload',
            prefix: method.prefix,
            max_results: 10,
            resource_type: 'image'
          });
        } else {
          result = await cloudinary.search
            .expression(method.expression)
            .max_results(10)
            .execute();
        }
        
        console.log(`   ✅ Found ${result.resources?.length || 0} images`);
        if (result.resources && result.resources.length > 0) {
          result.resources.slice(0, 3).forEach((img, index) => {
            console.log(`      ${index + 1}. ${img.public_id}`);
          });
        }
      } catch (methodError) {
        console.log(`   ❌ Failed: ${methodError.message}`);
      }
    }

    console.log('\n✅ Cloudinary connection test completed!');
    
    // Generate URLs for testing
    if (folderAnalysis.genki && folderAnalysis.genki.length > 0) {
      console.log('\n🌐 Sample optimized URLs:');
      const sampleImage = folderAnalysis.genki[0];
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      console.log(`Original: https://res.cloudinary.com/${cloudName}/image/upload/${sampleImage.public_id}.${sampleImage.format}`);
      console.log(`Optimized: https://res.cloudinary.com/${cloudName}/image/upload/w_800,h_600,c_fill,q_auto,f_auto/${sampleImage.public_id}`);
    }
    
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:');
    console.error(error);
    
    if (error.message?.includes('Invalid API key or secret')) {
      console.log('');
      console.log('💡 Fix: Check your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local');
    }
    
    if (error.message?.includes('Invalid cloud name')) {
      console.log('');
      console.log('💡 Fix: Check your NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local');
    }
  }
}

testCloudinaryConnection();