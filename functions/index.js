const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

exports.moyasarWebhook = onRequest(
  { cors: true, invoker: 'public' },
  async (req, res) => {
  // Lazy initialization to prevent deployment timeouts
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const event = req.body;

    // Verify it's a valid Moyasar webhook
    if (!event || !event.type || !event.data || !event.data.id) {
      return res.status(400).send('Invalid payload');
    }

    const paymentId = event.data.id;
    const eventType = event.type; // 'payment_paid' or 'payment_failed'

    console.log(`Received webhook for payment ${paymentId}, type: ${eventType}`);

    const db = admin.firestore();
    const orderRef = db.collection('orders').doc(paymentId);

    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.warn(`Order with payment ID ${paymentId} not found in Firestore.`);
      // We can still return 200 so Moyasar doesn't keep retrying
      return res.status(200).send('Order not found, but webhook received.');
    }

    if (eventType === 'payment_paid') {
      await orderRef.update({
        paymentStatus: 'paid',
        status: 'placed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Order ${paymentId} marked as paid.`);
    } else if (eventType === 'payment_failed') {
      await orderRef.update({
        paymentStatus: 'failed',
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Order ${paymentId} marked as failed.`);
    }

    // Always return 200 OK to Moyasar
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send('Internal Server Error');
  }
});
