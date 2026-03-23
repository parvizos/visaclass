import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Plane, 
  Calendar, 
  Users, 
  CreditCard, 
  Mail,
  Phone,
  User,
  ArrowLeft,
  Download,
  Share
} from 'lucide-react';

interface BookingData {
  passenger: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    nationality?: string;
  };
  booking: {
    booking_reference: string;
    trip_type: string;
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string;
    passengers_count: number;
    total_amount: number;
    currency: string;
    status: string;
  };
  payment: {
    status: string;
    amount: number;
    currency: string;
  };
}

const BookingSuggestions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get booking data from URL params or localStorage
    const bookingId = searchParams.get('bookingId');
    const storedData = localStorage.getItem('lastBookingData');

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setBookingData(parsed);
        setLoading(false);
      } catch (error) {
        console.error('Failed to parse booking data:', error);
        setLoading(false);
      }
    } else if (bookingId) {
      // In a real app, fetch from backend using bookingId
      fetchBookingDetails(bookingId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBookingData(data);
      }
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = () => {
    if (!bookingData) return;
    
    // Create ticket content
    const ticketContent = `
BOOKING CONFIRMATION
==================

Passenger: ${bookingData.passenger.first_name} ${bookingData.passenger.last_name}
Email: ${bookingData.passenger.email}
Phone: ${bookingData.passenger.phone || 'N/A'}

Booking Reference: ${bookingData.booking.booking_reference}
Route: ${bookingData.booking.origin} → ${bookingData.booking.destination}
Trip Type: ${bookingData.booking.trip_type.replace('_', ' ').toUpperCase()}
Departure: ${new Date(bookingData.booking.departure_date).toLocaleDateString()}
${bookingData.booking.return_date ? `Return: ${new Date(bookingData.booking.return_date).toLocaleDateString()}` : ''}
Passengers: ${bookingData.booking.passengers_count}
Total Amount: $${bookingData.booking.total_amount.toFixed(2)} ${bookingData.booking.currency}

Status: ${bookingData.booking.status.toUpperCase()}
Payment: ${bookingData.payment.status.toUpperCase()}

Thank you for choosing VISACLASS!
    `;

    // Download as text file
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${bookingData.booking.booking_reference}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Booking ticket downloaded!');
  };

  const handleShareBooking = () => {
    if (!bookingData) return;
    
    const shareText = `🛫 VISACLASS Booking Confirmed!\n` +
      `Reference: ${bookingData.booking.booking_reference}\n` +
      `Route: ${bookingData.booking.origin} → ${bookingData.booking.destination}\n` +
      `Date: ${new Date(bookingData.booking.departure_date).toLocaleDateString()}\n` +
      `Passenger: ${bookingData.passenger.first_name} ${bookingData.passenger.last_name}`;

    if (navigator.share) {
      navigator.share({
        title: 'VISACLASS Booking Confirmation',
        text: shareText,
      });
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success('Booking details copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Booking Data Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find your booking information.</p>
            <Button onClick={() => navigate('/booking')}>
              Create New Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/booking')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Booking Confirmation</h1>
            <p className="text-gray-600">Your booking has been successfully processed</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShareBooking}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownloadTicket}>
            <Download className="h-4 w-4 mr-2" />
            Download Ticket
          </Button>
        </div>
      </div>

      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-green-800">Booking Confirmed!</h2>
              <p className="text-green-700">
                Your booking reference is <strong>{bookingData.booking.booking_reference}</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Passenger Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Passenger Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">
                {bookingData.passenger.first_name} {bookingData.passenger.last_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{bookingData.passenger.email}</span>
            </div>
            {bookingData.passenger.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{bookingData.passenger.phone}</span>
              </div>
            )}
            {bookingData.passenger.nationality && (
              <div>
                <p className="text-sm text-gray-600">Nationality</p>
                <p className="font-medium">{bookingData.passenger.nationality}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flight Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Flight Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Route</p>
              <p className="font-medium">
                {bookingData.booking.origin} → {bookingData.booking.destination}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trip Type</p>
              <Badge variant="outline">
                {bookingData.booking.trip_type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Departure</p>
                <p className="font-medium">
                  {new Date(bookingData.booking.departure_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            {bookingData.booking.return_date && (
              <div>
                <p className="text-sm text-gray-600">Return</p>
                <p className="font-medium">
                  {new Date(bookingData.booking.return_date).toLocaleDateString()}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{bookingData.booking.passengers_count} Passenger(s)</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                ${bookingData.booking.total_amount.toFixed(2)} {bookingData.booking.currency}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <Badge className={bookingData.payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {bookingData.payment.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Booking Status</p>
              <Badge className={bookingData.booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                {bookingData.booking.status.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions and Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">Check Your Email</h3>
              <p className="text-sm text-gray-600">
                We've sent a confirmation to {bookingData.passenger.email}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold mb-1">Prepare for Travel</h3>
              <p className="text-sm text-gray-600">
                Arrive at the airport 2 hours before departure
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Plane className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">Manage Booking</h3>
              <p className="text-sm text-gray-600">
                View or modify your booking anytime
              </p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/bookings')}>
              View All Bookings
            </Button>
            <Button onClick={() => navigate('/booking')}>
              Book Another Flight
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSuggestions;
