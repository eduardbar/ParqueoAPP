import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import NotificationService from './notificationService';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

export class PaymentService {
  private stripe: Stripe;
  private notificationService: NotificationService;

  constructor(io: Server) {
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key';
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-06-30.basil',
    });
    this.notificationService = new NotificationService(io);
  }

  async createPaymentIntent(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: {
          user: true,
          parkingLot: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status === 'PAID') {
        throw new Error('Booking already paid');
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(booking.totalPrice * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          bookingId: booking.id.toString(),
          userId: booking.userId.toString(),
          parkingLotId: booking.parkingLotId.toString(),
        },
      });

      // Update booking with payment intent ID
      await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: { paymentIntentId: paymentIntent.id },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        const bookingId = paymentIntent.metadata.bookingId;
        
        // Update booking status
        const booking = await prisma.booking.update({
          where: { id: parseInt(bookingId) },
          data: { 
            status: 'PAID',
            paymentCompletedAt: new Date(),
          },
          include: {
            user: true,
            parkingLot: {
              include: {
                owner: true,
              },
            },
          },
        });

        // Send notifications
        await this.notificationService.sendToUser(booking.userId, {
          id: `payment-${booking.id}`,
          type: 'PAYMENT_PROCESSED',
          title: 'Payment Processed',
          message: `Your payment for ${booking.parkingLot.name} has been processed successfully`,
        });

        return booking;
      }

      throw new Error('Payment not completed');
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  async getPaymentHistory(userId: string) {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          userId: parseInt(userId),
          status: 'PAID',
        },
        include: {
          parkingLot: true,
        },
        orderBy: {
          paymentCompletedAt: 'desc',
        },
      });

      return bookings;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  async processRefund(bookingId: number, reason: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          parkingLot: {
            include: {
              owner: true,
            },
          },
        },
      });

      if (!booking || !booking.paymentIntentId) {
        throw new Error('Booking or payment intent not found');
      }

      const refund = await this.stripe.refunds.create({
        payment_intent: booking.paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          bookingId: booking.id,
          reason,
        },
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: 'REFUNDED',
          refundedAt: new Date(),
        },
      });

      // Send refund notification
      await this.notificationService.sendToUser(booking.userId, {
        id: `refund-${booking.id}`,
        type: 'PAYMENT_PROCESSED',
        title: 'Refund Processed',
        message: `Your refund of $${booking.totalPrice} has been processed`,
        data: {
          bookingId: booking.id,
          refundAmount: booking.totalPrice,
          refundId: refund.id,
        },
      });

      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  async getEarnings(ownerId: string, period: 'week' | 'month' | 'year' = 'month') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const earnings = await prisma.booking.groupBy({
        by: ['parkingLotId'],
        where: {
          parkingLot: {
            ownerId: parseInt(ownerId),
          },
          status: 'PAID',
          paymentCompletedAt: {
            gte: startDate,
          },
        },
        _sum: {
          totalPrice: true,
        },
        _count: {
          id: true,
        },
      });

      const parkingLots = await prisma.parkingLot.findMany({
        where: {
          ownerId: parseInt(ownerId),
          id: {
            in: earnings.map((e: any) => e.parkingLotId),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      return earnings.map((earning: any) => ({
        parkingLot: parkingLots.find(pl => pl.id === earning.parkingLotId),
        totalEarnings: earning._sum.totalPrice || 0,
        totalBookings: earning._count.id,
      }));
    } catch (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }
  }
}
