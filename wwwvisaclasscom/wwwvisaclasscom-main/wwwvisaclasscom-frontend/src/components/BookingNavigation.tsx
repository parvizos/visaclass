import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, CreditCard, BarChart3, Users, CheckCircle } from 'lucide-react';

const BookingNavigation = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">VISACLASS Booking System</h1>
        <p className="text-lg text-gray-600">Manage flights, passengers, and payments</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Plane className="h-12 w-12 mx-auto mb-2 text-blue-600" />
            <CardTitle>Book Flight</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Create a new flight booking with passenger details
            </p>
            <Link to="/booking">
              <Button className="w-full">
                New Booking
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 text-green-600" />
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              View and manage all flight bookings
            </p>
            <Link to="/bookings">
              <Button variant="outline" className="w-full">
                View Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-blue-600" />
            <CardTitle>Recent Booking</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              View your latest booking confirmation
            </p>
            <Link to="/booking-suggestions">
              <Button variant="outline" className="w-full">
                View Suggestions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto mb-2 text-purple-600" />
            <CardTitle>Passengers</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Manage passenger information and profiles
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-2 text-orange-600" />
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Process payments and manage transactions
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Backend API: Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Database: SQLite</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Payments: Test Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Email: Disabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingNavigation;
