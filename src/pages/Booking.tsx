import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CreditCard, Building, Smartphone, Users, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/ui/loader';

interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_days: number;
  max_participants: number;
  location: string;
  image_url?: string;
}

interface BookingForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  participants: number;
  startDate: Date | undefined;
  specialRequests: string;
  paymentMethod: 'stripe' | 'bank' | 'mpesa';
}

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState<BookingForm>({
    customerName: '',
    customerEmail: user?.email || '',
    customerPhone: '',
    participants: 1,
    startDate: undefined,
    specialRequests: '',
    paymentMethod: 'stripe'
  });

  const tourId = searchParams.get('tour');

  useEffect(() => {
    if (!tourId) {
      navigate('/tours');
      return;
    }

    const fetchTour = async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', tourId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: 'Error',
          description: 'Tour not found or is no longer available.',
          variant: 'destructive',
        });
        navigate('/tours');
      } else {
        setTour(data);
      }
      setLoading(false);
    };

    fetchTour();
  }, [tourId, navigate, toast]);

  useEffect(() => {
    if (user?.email) {
      setForm(prev => ({ ...prev, customerEmail: user.email! }));
    }
  }, [user]);

  const calculateTotal = () => {
    return tour ? tour.price * form.participants : 0;
  };

  const handleInputChange = (field: keyof BookingForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStripePayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-booking-payment', {
        body: {
          tourId: tour!.id,
          tourTitle: tour!.title,
          participants: form.participants,
          totalAmount: calculateTotal(),
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          startDate: form.startDate?.toISOString(),
          specialRequests: form.specialRequests,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to process Stripe payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBankPayment = async () => {
    try {
      const bookingData = {
        tour_id: tour!.id,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        customer_name: form.customerName,
        customer_email: form.customerEmail,
        customer_phone: form.customerPhone,
        participants: form.participants,
        start_date: form.startDate?.toISOString().split('T')[0],
        total_amount: calculateTotal(),
        special_requests: form.specialRequests,
        payment_status: 'pending',
        status: 'pending',
      };

      const { error } = await supabase
        .from('bookings')
        .insert(bookingData);

      if (error) throw error;

      toast({
        title: 'Booking Created',
        description: 'Your booking has been created. Please complete the bank transfer and contact us with payment confirmation.',
      });

      // Show bank details
      toast({
        title: 'Bank Transfer Details',
        description: `Account: 1234567890\nBank: KCB Bank\nAmount: KSh ${calculateTotal().toLocaleString()}\nReference: ${tour!.title}`,
      });

      navigate('/tours');
    } catch (error) {
      console.error('Bank payment error:', error);
      toast({
        title: 'Booking Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMpesaPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-payment', {
        body: {
          phoneNumber: form.customerPhone,
          amount: calculateTotal(),
          tourId: tour!.id,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          participants: form.participants,
          startDate: form.startDate?.toISOString(),
          specialRequests: form.specialRequests,
        },
      });

      if (error) throw error;

      toast({
        title: 'M-Pesa Payment Initiated',
        description: 'Please check your phone for the M-Pesa payment prompt.',
      });
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to initiate M-Pesa payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to make a booking.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!form.startDate) {
      toast({
        title: 'Date Required',
        description: 'Please select a start date for your tour.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      switch (form.paymentMethod) {
        case 'stripe':
          await handleStripePayment();
          break;
        case 'bank':
          await handleBankPayment();
          break;
        case 'mpesa':
          await handleMpesaPayment();
          break;
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader label="Setting up your booking..." />
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-xl text-muted-foreground">Tour not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              Book Your Safari
            </h1>
            <p className="text-xl text-muted-foreground">
              Secure your spot on this incredible adventure
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tour Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-display">{tour.title}</CardTitle>
                <CardDescription>{tour.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                  {tour.image_url ? (
                    <img 
                      src={tour.image_url} 
                      alt={tour.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Image coming soon</p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {tour.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {tour.duration_days} days
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Max {tour.max_participants} people
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    KSh {tour.price.toLocaleString()}
                    <span className="text-sm font-normal text-black dark:text-black ml-1">
                      per person
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>Fill in your information to book this tour</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Full Name</Label>
                      <Input
                        id="customerName"
                        value={form.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={form.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerPhone">Phone Number</Label>
                      <Input
                        id="customerPhone"
                        value={form.customerPhone}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                        placeholder="+254 xxx xxx xxx"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="participants">Participants</Label>
                      <Input
                        id="participants"
                        type="number"
                        min="1"
                        max={tour.max_participants}
                        value={form.participants}
                        onChange={(e) => handleInputChange('participants', parseInt(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !form.startDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.startDate ? format(form.startDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.startDate}
                          onSelect={(date) => handleInputChange('startDate', date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      value={form.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      placeholder="Any special dietary requirements, accessibility needs, etc."
                    />
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <RadioGroup
                      value={form.paymentMethod}
                      onValueChange={(value) => handleInputChange('paymentMethod', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe" className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Credit/Debit Card (Stripe)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mpesa" id="mpesa" />
                        <Label htmlFor="mpesa" className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          M-Pesa
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Bank Transfer
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-primary">
                        KSh {calculateTotal().toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.participants} participant{form.participants !== 1 ? 's' : ''} × KSh {tour.price.toLocaleString()}
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all text-black font-medium"
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : `Book Now - KSh ${calculateTotal().toLocaleString()}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Booking;