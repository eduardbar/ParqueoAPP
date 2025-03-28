import express from 'express';
import { PaymentService } from '../services/PaymentService';
import { authenticate } from '../middleware/auth';
import { Server } from 'socket.io';

export const createPaymentRoutes = (io: Server) => {
  const router = express.Router();
  const paymentService = new PaymentService(io);

  // Create payment intent
  router.post('/create-payment-intent', authenticate, async (req, res) => {
    try {
      const { bookingId } = req.body;
      const result = await paymentService.createPaymentIntent(bookingId);
      res.json(result);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // Confirm payment
  router.post('/confirm-payment', authenticate, async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      const booking = await paymentService.confirmPayment(paymentIntentId);
      res.json(booking);
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  });

  // Get payment history
  router.get('/history', authenticate, async (req, res) => {
    try {
      const userId = req.user?.id.toString() || '';
      const history = await paymentService.getPaymentHistory(userId);
      res.json(history);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ error: 'Failed to fetch payment history' });
    }
  });

  // Process refund (owner only)
  router.post('/refund', authenticate, async (req, res) => {
    try {
      const { bookingId, reason } = req.body;
      const refund = await paymentService.processRefund(bookingId, reason);
      res.json(refund);
    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({ error: 'Failed to process refund' });
    }
  });

  // Get earnings (owner only)
  router.get('/earnings', authenticate, async (req, res) => {
    try {
      const userId = req.user?.id.toString() || '';
      const { period } = req.query;
      const earnings = await paymentService.getEarnings(userId, period as 'week' | 'month' | 'year');
      res.json(earnings);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      res.status(500).json({ error: 'Failed to fetch earnings' });
    }
  });

  // Stripe webhook
  router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).send('Missing stripe signature or webhook secret');
    }

    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await paymentService.confirmPayment(paymentIntent.id);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook error: ${error}`);
    }
  });

  return router;
};
