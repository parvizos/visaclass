import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentAPI, type Payment } from '@/lib/api';

// Hook for creating a payment intent
export const useCreatePaymentIntent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: paymentAPI.createIntent,
    onSuccess: (data, variables) => {
      // Invalidate related booking queries
      queryClient.invalidateQueries({ queryKey: ['booking', variables.booking_id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return data;
    },
    onError: (error) => {
      console.error('Failed to create payment intent:', error);
      throw error;
    },
  });
};

// Hook for confirming payment
export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: paymentAPI.confirm,
    onSuccess: (data, variables) => {
      // Invalidate related booking queries
      queryClient.invalidateQueries({ queryKey: ['booking', variables.booking_id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['payments', variables.booking_id] });
      return data;
    },
    onError: (error) => {
      console.error('Failed to confirm payment:', error);
      throw error;
    },
  });
};

// Hook for fetching a single payment
export const usePayment = (id: number) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentAPI.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for fetching payments by booking
export const useBookingPayments = (bookingId: number) => {
  return useQuery({
    queryKey: ['payments', bookingId],
    queryFn: () => paymentAPI.getByBooking(bookingId),
    enabled: !!bookingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for handling Stripe payment
export const useStripePayment = () => {
  const { mutateAsync: createIntent } = useCreatePaymentIntent();
  const { mutateAsync: confirmPayment } = useConfirmPayment();
  
  const processPayment = async (bookingId: number, amount: number, currency = 'USD') => {
    try {
      // Create payment intent
      const paymentIntent = await createIntent({
        booking_id: bookingId,
        amount,
        currency,
      });
      
      // In a real app, you would use Stripe Elements here to collect payment
      // For now, we'll simulate successful payment
      const { client_secret, payment_intent_id } = paymentIntent.data;
      
      // Simulate payment confirmation (in real app, this would be after Stripe confirms)
      const confirmedPayment = await confirmPayment({
        payment_intent_id,
        booking_id: bookingId,
      });
      
      return confirmedPayment;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  };
  
  return { processPayment };
};
