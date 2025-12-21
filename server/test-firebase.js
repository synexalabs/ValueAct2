require('dotenv').config();
const admin = require('firebase-admin');

console.log('=== Firebase Connection Test ===\n');

// Check environment variables
console.log('Checking environment variables...');
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error('✗ FIREBASE_PROJECT_ID is not set');
  process.exit(1);
}
if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error('✗ FIREBASE_PRIVATE_KEY is not set');
  process.exit(1);
}
if (!process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('✗ FIREBASE_CLIENT_EMAIL is not set');
  process.exit(1);
}

console.log('✓ All environment variables are set');
console.log(`  Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
console.log(`  Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);
console.log();

// Initialize Firebase
console.log('Initializing Firebase Admin SDK...');
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
  });
  console.log('✓ Firebase Admin initialized');
} catch (error) {
  console.error('✗ Firebase initialization failed:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function testFirebase() {
  try {
    console.log('\nTesting Firestore operations...');
    
    // Test Firestore write
    console.log('  Writing test document...');
    const testRef = await db.collection('_test').add({
      message: 'Firebase connection test',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      testId: Math.random().toString(36).substring(7)
    });
    console.log('  ✓ Successfully wrote to Firestore');
    console.log(`    Document ID: ${testRef.id}`);
    
    // Test Firestore read
    console.log('  Reading test document...');
    const doc = await testRef.get();
    const data = doc.data();
    console.log('  ✓ Successfully read from Firestore');
    console.log(`    Message: ${data.message}`);
    
    // Test Firestore update
    console.log('  Updating test document...');
    await testRef.update({
      updated: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('  ✓ Successfully updated document');
    
    // Clean up
    console.log('  Cleaning up test document...');
    await testRef.delete();
    console.log('  ✓ Successfully deleted test document');
    
    console.log('\n=== All tests passed! ===');
    console.log('Firebase is properly configured and working.');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Firebase test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testFirebase();
