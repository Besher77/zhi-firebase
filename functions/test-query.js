const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function test() {
  try {
    const snapshot = await db.collection('orders')
      .where('userId', '==', 'test-user')
      .orderBy('createdAt', 'desc')
      .get();
    console.log('Query successful');
  } catch (e) {
    console.error('Query failed:', e.message);
  }
}
test();
