const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

// Create Stripe checkout session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Stripe ist nicht konfiguriert.' });
    }

    const { interval = 'month' } = req.body;
    const priceId = interval === 'year'
      ? process.env.STRIPE_PRICE_ID_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY;

    if (!priceId) {
      return res.status(400).json({ error: 'Ungültiger Abrechnungszeitraum.' });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/preise`,
      metadata: { userId: req.user.id },
      locale: 'de',
      tax_id_collection: { enabled: true },
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Checkout konnte nicht erstellt werden.' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook-Signatur ungültig.' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId) {
          const admin = require('firebase-admin');
          await admin.firestore().collection('users').doc(userId).update({
            plan: 'pro',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            updatedAt: new Date().toISOString(),
          });
          logger.info(`User ${userId} upgraded to pro`);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const snapshot = await admin.firestore().collection('users')
          .where('stripeSubscriptionId', '==', subscription.id).limit(1).get();
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({ plan: 'free', updatedAt: new Date().toISOString() });
        }
        break;
      }
    }
    res.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook handler error:', error);
    res.status(500).json({ error: 'Webhook-Verarbeitung fehlgeschlagen.' });
  }
});

// Get subscription status
router.get('/subscription-status', authMiddleware, async (req, res) => {
  try {
    const admin = require('firebase-admin');
    const doc = await admin.firestore().collection('users').doc(req.user.id).get();
    const data = doc.data() || {};
    res.json({
      plan: data.plan || 'free',
      validUntil: data.subscriptionEndDate || null,
    });
  } catch (error) {
    logger.error('Subscription status error:', error);
    res.status(500).json({ error: 'Status konnte nicht abgerufen werden.' });
  }
});

module.exports = router;
