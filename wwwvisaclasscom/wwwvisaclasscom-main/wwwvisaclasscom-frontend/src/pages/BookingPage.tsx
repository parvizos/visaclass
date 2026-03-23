import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePassenger } from '@/hooks/usePassengerAPI';
import { useCreateBooking } from '@/hooks/useBookingAPI';
import { useStripePayment } from '@/hooks/usePaymentAPI';
import { toast } from 'sonner';
import { Loader2, Plane, CreditCard } from 'lucide-react';

const BookingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'passenger' | 'booking' | 'payment'>('passenger');
  const [passengerData, setPassengerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    nationality: '',
  });
  const [bookingData, setBookingData] = useState({
    trip_type: 'one_way' as const,
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    passengers_count: 1,
    total_amount: 0,
  });

  const createPassenger = useCreatePassenger();
  const createBooking = useCreateBooking();
  const { processPayment } = useStripePayment();

  const handlePassengerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const passenger = await createPassenger.mutateAsync(passengerData);
      toast.success('Passenger created successfully!');
      setStep('booking');
    } catch (error) {
      toast.error('Failed to create passenger. Please try again.');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate price (simple calculation for demo)
    const basePrice = 500; // Base price in USD
    const totalPrice = bookingData.trip_type === 'round_trip' 
      ? basePrice * 2 * bookingData.passengers_count 
      : basePrice * bookingData.passengers_count;
    
    setBookingData(prev => ({ ...prev, total_amount: totalPrice }));
    setStep('payment');
  };

  const handlePayment = async () => {
    try {
      // First create the passenger
      const passenger = await createPassenger.mutateAsync(passengerData);
      
      // Then create the booking
      const booking = await createBooking.mutateAsync({
        ...bookingData,
        passenger_id: passenger.data.id,
        total_amount: bookingData.total_amount,
      });
      
      // Process payment
      const payment = await processPayment(booking.data.id, booking.data.total_amount);
      
      // Save booking data to localStorage for suggestions page
      const bookingDataForSuggestions = {
        passenger: passengerData,
        booking: {
          ...booking.data,
          status: 'confirmed',
        },
        payment: {
          status: 'succeeded',
          amount: booking.data.total_amount,
          currency: booking.data.currency,
        },
      };
      
      localStorage.setItem('lastBookingData', JSON.stringify(bookingDataForSuggestions));
      
      toast.success('Booking completed successfully!');
      navigate('/booking-suggestions');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }
  };

  const renderPassengerForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Passenger Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePassengerSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={passengerData.first_name}
                onChange={(e) => setPassengerData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={passengerData.last_name}
                onChange={(e) => setPassengerData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={passengerData.email}
              onChange={(e) => setPassengerData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={passengerData.phone}
              onChange={(e) => setPassengerData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={passengerData.date_of_birth}
                onChange={(e) => setPassengerData(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={passengerData.nationality}
                onChange={(e) => setPassengerData(prev => ({ ...prev, nationality: e.target.value }))}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={createPassenger.isPending}>
            {createPassenger.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue to Booking Details
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderBookingForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Booking Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div>
            <Label htmlFor="trip_type">Trip Type</Label>
            <Select
              value={bookingData.trip_type}
              onValueChange={(value: 'one_way' | 'round_trip' | 'multi_city') => 
                setBookingData(prev => ({ ...prev, trip_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_way">One Way</SelectItem>
                <SelectItem value="round_trip">Round Trip</SelectItem>
                <SelectItem value="multi_city">Multi City</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                value={bookingData.origin}
                onChange={(e) => setBookingData(prev => ({ ...prev, origin: e.target.value }))}
                placeholder="New York"
                required
              />
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={bookingData.destination}
                onChange={(e) => setBookingData(prev => ({ ...prev, destination: e.target.value }))}
                placeholder="London"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departure_date">Departure Date</Label>
              <Input
                id="departure_date"
                type="date"
                value={bookingData.departure_date}
                onChange={(e) => setBookingData(prev => ({ ...prev, departure_date: e.target.value }))}
                required
              />
            </div>
            {bookingData.trip_type === 'round_trip' && (
              <div>
                <Label htmlFor="return_date">Return Date</Label>
                <Input
                  id="return_date"
                  type="date"
                  value={bookingData.return_date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, return_date: e.target.value }))}
                  min={bookingData.departure_date}
                />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="passengers_count">Number of Passengers</Label>
            <Input
              id="passengers_count"
              type="number"
              min="1"
              max="10"
              value={bookingData.passengers_count}
              onChange={(e) => setBookingData(prev => ({ ...prev, passengers_count: parseInt(e.target.value) }))}
              required
            />
          </div>
          
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setStep('passenger')}>
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue to Payment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderPayment = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Booking Summary</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Route:</strong> {bookingData.origin} → {bookingData.destination}</p>
            <p><strong>Trip Type:</strong> {bookingData.trip_type.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Departure:</strong> {new Date(bookingData.departure_date).toLocaleDateString()}</p>
            {bookingData.return_date && (
              <p><strong>Return:</strong> {new Date(bookingData.return_date).toLocaleDateString()}</p>
            )}
            <p><strong>Passengers:</strong> {bookingData.passengers_count}</p>
            <p><strong>Total Amount:</strong> ${bookingData.total_amount.toFixed(2)} USD</p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            This is a demo payment. In production, you would be redirected to Stripe's secure payment form.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => setStep('booking')}>
            Back
          </Button>
          <Button 
            className="flex-1" 
            onClick={handlePayment}
            disabled={createPassenger.isPending || createBooking.isPending}
          >
            {(createPassenger.isPending || createBooking.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Complete Booking & Pay ${bookingData.total_amount.toFixed(2)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Book Your Flight</h1>
        <div className="flex justify-center items-center gap-2 text-sm text-gray-600">
          <div className={`flex items-center gap-1 ${step === 'passenger' ? 'text-blue-600' : ''}`}>
            <div className={`w-6 h-6 rounded-full border-2 ${step === 'passenger' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`} />
            Passenger
          </div>
          <span>→</span>
          <div className={`flex items-center gap-1 ${step === 'booking' ? 'text-blue-600' : ''}`}>
            <div className={`w-6 h-6 rounded-full border-2 ${step === 'booking' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`} />
            Booking
          </div>
          <span>→</span>
          <div className={`flex items-center gap-1 ${step === 'payment' ? 'text-blue-600' : ''}`}>
            <div className={`w-6 h-6 rounded-full border-2 ${step === 'payment' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`} />
            Payment
          </div>
        </div>
      </div>

      {step === 'passenger' && renderPassengerForm()}
      {step === 'booking' && renderBookingForm()}
      {step === 'payment' && renderPayment()}
    </div>
  );
};

export default BookingPage;
