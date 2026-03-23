import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { passengerAPI, type Passenger } from '@/lib/api';

// Hook for fetching all passengers
export const usePassengers = () => {
  return useQuery({
    queryKey: ['passengers'],
    queryFn: () => passengerAPI.getAll(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for fetching a single passenger
export const usePassenger = (id: number) => {
  return useQuery({
    queryKey: ['passenger', id],
    queryFn: () => passengerAPI.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for creating a passenger
export const useCreatePassenger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: passengerAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      queryClient.setQueryData(['passenger', data.id], data);
      return data;
    },
    onError: (error) => {
      console.error('Failed to create passenger:', error);
      throw error;
    },
  });
};

// Hook for updating a passenger
export const useUpdatePassenger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof passengerAPI.update>[1] }) =>
      passengerAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      queryClient.setQueryData(['passenger', variables.id], data);
      return data;
    },
    onError: (error) => {
      console.error('Failed to update passenger:', error);
      throw error;
    },
  });
};

// Hook for deleting a passenger
export const useDeletePassenger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => passengerAPI.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      queryClient.removeQueries({ queryKey: ['passenger', id] });
    },
    onError: (error) => {
      console.error('Failed to delete passenger:', error);
      throw error;
    },
  });
};

// Hook for fetching passenger bookings
export const usePassengerBookings = (id: number) => {
  return useQuery({
    queryKey: ['passenger-bookings', id],
    queryFn: () => passengerAPI.getBookings(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
