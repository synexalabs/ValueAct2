/**
 * API utility helpers for server communication.
 * All paths are routed through the Next.js rewrite proxy → Express server.
 */
import axios from 'axios';

/** Fetch available mortality tables from the actuarial engine (via Express proxy). */
export async function getMortalityTables() {
  const response = await axios.get('/api/mortality-tables');
  return response.data;
}

/**
 * Create a Stripe Checkout session.
 * @param {'month'|'year'} interval - Billing interval
 * @param {string} token - JWT auth token
 */
export async function createCheckoutSession(interval = 'month', token) {
  const response = await axios.post(
    '/api/stripe/create-checkout-session',
    { interval },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data; // { url: string }
}

/** Fetch the current user's subscription status. */
export async function getSubscriptionStatus(token) {
  const response = await axios.get('/api/stripe/subscription-status', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data; // { plan: string, validUntil: string|null }
}
