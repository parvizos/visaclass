import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingAPI, type Booking } from '@/lib/api';

// Hook for fetching all bookings
export const useBookings = (params?: {
  status?: string;
  payment_status?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingAPI.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for fetching a single booking
export const useBooking = (id: number) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingAPI.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for creating a booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bookingAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.setQueryData(['booking', data.id], data);
      return data;
    },
    onError: (error) => {
      console.error('Failed to create booking:', error);
      throw error;
    },
  });
};

// Hook for updating a booking
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof bookingAPI.update>[1] }) =>
      bookingAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.setQueryData(['booking', variables.id], data);
      return data;
    },
    onError: (error) => {
      console.error('Failed to update booking:', error);
      throw error;
    },
  });
};

// Hook for cancelling a booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      bookingAPI.cancel(id, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      return data;
    },
    onError: (error) => {
      console.error('Failed to cancel booking:', error);
      throw error;
    },
  });
};

// Hook for searching bookings
export const useSearchBookings = (query: string, limit?: number) => {
  return useQuery({
    queryKey: ['search-bookings', query, limit],
    queryFn: () => bookingAPI.search(query, limit),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
