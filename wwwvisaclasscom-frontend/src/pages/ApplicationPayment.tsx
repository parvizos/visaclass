import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Note: Install stripe with: npm install @stripe/stripe-js
// import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileText, 
  GraduationCap,
  DollarSign,
  Shield,
  Clock
} from 'lucide-react';

// Note: Uncomment and install @stripe/stripe-js to enable Stripe payments
// const stripePromise = loadStripe('pk_test_51234567890abcdef');

interface PaymentType {
  type: string;
  name: string;
  amount: number;
  description: string;
  required: boolean;
}

interface ApplicationPaymentData {
  application: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    target_program: string;
    target_university: string;
  };
  existing_payments: any[];
  available_payments: PaymentType[];
  total_paid: number;
  currency: string;
}

const ApplicationPayment = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  
  const [paymentData, setPaymentData] = useState<ApplicationPaymentData | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (applicationId) {
      fetchPaymentData();
    }
  }, [applicationId]);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/application-payments/payment-page/${applicationId}`);
      const result = await response.json();
      
      if (result.success) {
        setPaymentData(result.data);
        // Auto-select required payments
        const requiredPayments = result.data.available_payments
          .filter((payment: PaymentType) => payment.required)
          .map((payment: PaymentType) => payment.type);
        setSelectedPayments(requiredPayments);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentToggle = (paymentType: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments(prev => [...prev, paymentType]);
    } else {
      setSelectedPayments(prev => prev.filter(type => type !== paymentType));
    }
  };

  const calculateTotal = () => {
    if (!paymentData) return 0;
    return paymentData.available_payments
      .filter(payment => selectedPayments.includes(payment.type))
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const handlePayment = async () => {
    if (selectedPayments.length === 0) {
      setError('Please select at least one payment type');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Note: This is a mock payment for demo purposes
      // In production, uncomment and install @stripe/stripe-js to enable real Stripe payments
      
      /*
      // Create payment intent for each selected payment type
      for (const paymentType of selectedPayments) {
        const payment = paymentData!.available_payments.find(p => p.type === paymentType);
        
        const response = await fetch('http://localhost:5000/api/application-payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            application_id: parseInt(applicationId!),
            amount: payment!.amount,
            currency: paymentData!.currency,
            payment_type: paymentType,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          const stripe = await stripePromise;
          if (!stripe) throw new Error('Stripe failed to load');

          const { error } = await stripe.confirmPayment({
            clientSecret: result.data.client_secret,
            confirmParams: {
              return_url: `${window.location.origin}/application-payment/${applicationId}/success`,
              payment_method_data: {
                billing_details: {
                  email: paymentData!.application.email,
                  name: `${paymentData!.application.first_name} ${paymentData!.application.last_name}`,
                },
              },
            },
          });

          if (error) {
            throw new Error(error.message);
          }
        } else {
          throw new Error(result.message);
        }
      }
      */

      // Mock payment processing for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your application payment has been processed successfully. You will receive a confirmation email shortly.
              </p>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-500">
                  <strong>Application ID:</strong> #{applicationId}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Amount Paid:</strong> ${calculateTotal().toFixed(2)}
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/apply')}>
                  Back to Application
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Return to Homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error || 'Application not found'}</p>
              <Button onClick={() => navigate('/apply')}>
                Back to Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Application Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Application Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {paymentData.application.first_name} {paymentData.application.last_name}
                </h3>
                <p className="text-gray-600">{paymentData.application.email}</p>
                <p className="text-gray-600">
                  <strong>Program:</strong> {paymentData.application.target_program}
                </p>
                <p className="text-gray-600">
                  <strong>University:</strong> {paymentData.application.target_university || 'Not specified'}
                </p>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <Badge variant="outline" className="mb-2">
                    Application #{applicationId}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Already Paid: ${paymentData.total_paid.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Select Payment Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentData.available_payments.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All required payments have been completed for this application.
                </AlertDescription>
              </Alert>
            ) : (
              paymentData.available_payments.map((payment) => (
                <div key={payment.type} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        id={payment.type}
                        checked={selectedPayments.includes(payment.type)}
                        onCheckedChange={(checked) => handlePaymentToggle(payment.type, checked as boolean)}
                        disabled={payment.required}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Label htmlFor={payment.type} className="font-semibold">
                            {payment.name}
                          </Label>
                          {payment.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {payment.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        ${payment.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">USD</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedPayments.map((paymentType) => {
                const payment = paymentData.available_payments.find(p => p.type === paymentType);
                return (
                  <div key={paymentType} className="flex justify-between text-sm">
                    <span>{payment?.name}</span>
                    <span>${payment?.amount.toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Secure Payment</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Stripe Protected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/apply')}
            className="flex-1"
          >
            Back to Application
          </Button>
          <Button
            onClick={handlePayment}
            disabled={processing || selectedPayments.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ${calculateTotal().toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPayment;
