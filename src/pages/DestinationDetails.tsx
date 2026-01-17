import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  Loader2,
  Check,
  CalendarIcon,
  CreditCard,
  Building,
  Smartphone,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPriceByResidency } from '@/lib/pricing';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PaymentService } from '@/services/paymentService';
import { PAYMENT_CONFIG } from '@/lib/payment-config';
import { useResidencyPersistence } from '@/hooks/useResidencyPersistence';
import { getResidencyDisplay, getCurrency, formatPriceByResidency } from '@/lib/residencyUtils';

interface DestinationDetail {
  id: number;
  name: string;
  description: string;
  highlights: string[];
  image: string;
  pricing: {
    citizenPrice: number;
    residentPrice: number;
    nonResidentPrice: number;
  };
  category: string;
  duration?: number;
  maxParticipants?: number;
  difficulty?: string;
  rating?: number;
  location?: string;
  updatedAt?: string;
}

const DestinationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<DestinationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedResidency, setResidency } = useResidencyPersistence();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  interface BookingForm {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    participants: number;
    startDate: Date | undefined;
    specialRequests: string;
    paymentMethod: 'stripe' | 'bank' | 'mpesa';
  }

  const [form, setForm] = useState<BookingForm>({
    customerName: user?.user_metadata?.full_name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    participants: 1,
    startDate: undefined,
    specialRequests: '',
    paymentMethod: 'stripe'
  });

  // Get residency from URL if provided and sync with hook
  useEffect(() => {
    const urlResidency = searchParams.get('residency');
    if (urlResidency && urlResidency !== selectedResidency) {
      setResidency(urlResidency);
    }
  }, [searchParams, selectedResidency, setResidency]);

  useEffect(() => {
    if (user?.email) {
      setForm(prev => ({ 
        ...prev, 
        customerEmail: user.email!,
        customerName: user.user_metadata?.full_name || ''
      }));
    }
  }, [user]);

  // Redirect if no residency
  useEffect(() => {
    if (!selectedResidency) {
      toast({
        title: 'Residency Required',
        description: 'Please select your residency status first.',
        variant: 'destructive',
      });
      navigate('/destinations');
    }
  }, [selectedResidency, navigate, toast]);

  const calculateTotal = () => {
    if (!destination || !selectedResidency) return 0;
    const price = getPriceByResidency(destination.pricing, selectedResidency);
    return price * form.participants;
  };

  const handleInputChange = (field: keyof BookingForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStripePayment = async () => {
    try {
      if (!destination || !selectedResidency) {
        toast({
          title: 'Error',
          description: 'Destination or residency data is not available.',
          variant: 'destructive',
        });
        return;
      }
      
      // Create booking first to get booking ID
      const bookingData = {
        tour_id: destination.id.toString(),
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
        residency_type: selectedResidency,
        payment_method: 'stripe',
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Process Stripe payment with booking reference
      const paymentData = {
        destinationId: destination.id,
        destinationTitle: destination.name,
        bookingId: booking.id,
        participants: form.participants,
        totalAmount: calculateTotal(),
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        startDate: form.startDate?.toISOString(),
        specialRequests: form.specialRequests,
        residency: selectedResidency,
      };

      const result = await PaymentService.processStripePayment(paymentData);

      if (result.success && result.url) {
        // Update booking with Stripe session ID
        await supabase
          .from('bookings')
          .update({ 
            stripe_session_id: result.sessionId,
            payment_status: 'processing'
          })
          .eq('id', booking.id);

        window.open(result.url, '_blank');
        toast({
          title: 'Payment Session Created',
          description: 'Redirecting to Stripe checkout...',
        });
        navigate('/booking-success');
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBankPayment = async () => {
    try {
      if (!destination || !selectedResidency) {
        toast({
          title: 'Error',
          description: 'Destination or residency data is not available.',
          variant: 'destructive',
        });
        return;
      }
      
      const bookingData = {
        tour_id: destination.id.toString(),
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
        residency_type: selectedResidency,
        payment_method: 'bank_transfer',
      };

      const { error } = await supabase
        .from('bookings')
        .insert(bookingData);

      if (error) throw error;

      toast({
        title: 'Booking Created',
        description: 'Your booking has been created. Please complete the bank transfer.',
      });

      // Show bank details
      const currency = getCurrency(selectedResidency);
      const amount = calculateTotal().toLocaleString();
      
      toast({
        title: 'Bank Transfer Details',
        description: `Account: ${PAYMENT_CONFIG.BANK_ACCOUNT_NUMBER}\nBank: ${PAYMENT_CONFIG.BANK_NAME}\nAmount: ${currency} ${amount}\nReference: ${destination.name}`,
      });

      navigate('/booking-success');
    } catch (error) {
      console.error('Bank payment error:', error);
      toast({
        title: 'Booking Error',
        description: error instanceof Error ? error.message : 'Failed to create booking.',
        variant: 'destructive',
      });
    }
  };

  const handleMpesaPayment = async () => {
    try {
      if (!destination || !selectedResidency) {
        toast({
          title: 'Error',
          description: 'Destination or residency data is not available.',
          variant: 'destructive',
        });
        return;
      }
      
      // Create booking first
      const bookingData = {
        tour_id: destination.id.toString(),
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
        residency_type: selectedResidency,
        payment_method: 'mpesa',
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Initiate M-Pesa payment with booking reference
      const { data, error } = await supabase.functions.invoke('mpesa-payment', {
        body: {
          phoneNumber: form.customerPhone,
          amount: calculateTotal(),
          destinationId: destination.id,
          bookingId: booking.id,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          participants: form.participants,
          startDate: form.startDate?.toISOString(),
          specialRequests: form.specialRequests,
          residency: selectedResidency,
        },
      });

      if (error) throw error;

      // Update booking with M-Pesa reference
      await supabase
        .from('bookings')
        .update({ 
          mpesa_reference: data?.reference,
          payment_status: 'processing'
        })
        .eq('id', booking.id);

      toast({
        title: 'M-Pesa Payment Initiated',
        description: 'Please check your phone for the M-Pesa payment prompt.',
      });
      navigate('/booking-success');
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to initiate payment.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth', { state: { from: `/destinations/${id}?residency=${selectedResidency}` } });
      return;
    }

    if (!destination || !selectedResidency) {
      toast({
        title: 'Data Missing',
        description: 'Please ensure destination and residency are selected.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.startDate) {
      toast({
        title: 'Date Required',
        description: 'Please select a start date.',
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

  useEffect(() => {
    if (id) {
      fetchDestinationDetail();
    }
  }, [id]);

  const fetchDestinationDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('destinations')
        .select(`
          id,
          name,
          description,
          highlights,
          image,
          citizen_price,
          resident_price,
          non_resident_price,
          category,
          duration,
          max_participants,
          location,
          updated_at
        `)
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        throw new Error('Destination not found');
      }

      const mappedData: DestinationDetail = {
        id: data.id,
        name: data.name,
        description: data.description,
        highlights: data.highlights || [],
        image: data.image,
        pricing: {
          citizenPrice: data.citizen_price,
          residentPrice: data.resident_price,
          nonResidentPrice: data.non_resident_price,
        },
        category: data.category,
        duration: data.duration,
        maxParticipants: data.max_participants,
        location: data.location,
        updatedAt: data.updated_at,
      };

      setDestination(mappedData);
    } catch (error) {
      console.error('Error fetching destination:', error);
      setError('Failed to load destination details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
            <p className="text-muted-foreground">Loading destination...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Destination Not Found</h1>
          <p className="text-muted-foreground mb-8">
            {error || 'The destination you are looking for does not exist.'}
          </p>
          <Button asChild>
            <Link to="/destinations">Back to Destinations</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative h-[60vh] w-full overflow-hidden">
        <img
          src={destination.updatedAt ? `${destination.image}?v=${new Date(destination.updatedAt).getTime()}` : destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="container mx-auto px-4 pb-8 md:pb-12 text-white">
                        <Badge className="mb-3 md:mb-4 bg-white/20 text-white border border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors">
                          {destination.category}
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-md">{destination.name}</h1>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-lg items-center">
                          {destination.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-6 w-6 text-orange-400" />
                              <span className="font-medium">{destination.location}</span>
                            </div>
                          )}
                          {destination.duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-6 w-6 text-orange-400" />
                              <span className="font-medium">{destination.duration} Days</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        <Button
          variant="outline"
          className="mb-8 group transition-all duration-300 ease-in-out hover:bg-primary hover:text-primary-foreground border-primary/50 text-primary"
          asChild
        >
          <Link to="/destinations">
            <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Destinations
          </Link>
        </Button>

        {/* Residency Banner */}
        {selectedResidency && (
          <div className="mb-6 w-full">
            <div
              className="mx-auto w-full max-w-4xl rounded-2xl p-4 sm:p-6"
              style={{ background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)' }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-sm font-medium text-black">Residency:</div>
                  <div className="bg-white px-3 py-1 rounded-full font-medium text-black text-sm">
                    {getResidencyDisplay(selectedResidency)}
                  </div>
                  <div className="text-sm font-medium text-black">
                    Currency: {getCurrency(selectedResidency)}
                  </div>
                  <div className="text-sm font-medium text-black">
                    Pricing based on database rates
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">About this Destination</h2>
            <div className="prose prose-lg max-w-none mb-10 md:mb-16 text-muted-foreground whitespace-pre-line leading-relaxed">
              <p>{destination.description}</p>
            </div>

            {destination.highlights && destination.highlights.length > 0 && (
              <div className="mb-10 md:mb-16">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {destination.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg shadow-sm border border-border">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-xl shadow-lg border-none bg-card">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl font-display">Booking Details</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Signed in as {user?.email || 'Guest'}</span>
                  </div>
                </div>
                <CardDescription>
                  {destination
                    ? `Book your ${destination.name} experience`
                    : 'Destination details loading...'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                {destination ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Residency Info */}
                    {selectedResidency ? (
                      <div className="p-3 bg-slate-50 dark:bg-gray-800 rounded-lg mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Residency Status
                            </div>
                            <div className="text-lg font-bold text-orange-600">
                              {getResidencyDisplay(selectedResidency)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Price per person:
                            </div>
                            <div className="text-lg font-bold">
                              {formatPriceByResidency(getPriceByResidency(destination.pricing, selectedResidency), selectedResidency)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                        <div className="text-sm text-yellow-800">
                          Please select residency on the destinations page.
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Full Name</Label>
                        <Input
                          id="customerName"
                          value={form.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          required
                          disabled={!user}
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
                          disabled={!user}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          max={destination.maxParticipants || 20}
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
                          <ShadcnCalendar
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
                          {selectedResidency 
                            ? `${formatPriceByResidency(calculateTotal(), selectedResidency)}`
                            : 'Select Residency'
                          }
                        </span>
                      </div>
                      {selectedResidency && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {form.participants} participant{form.participants !== 1 ? 's' : ''} ×{' '}
                          {formatPriceByResidency(getPriceByResidency(destination.pricing, selectedResidency), selectedResidency)}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all text-black font-medium"
                      disabled={submitting || !selectedResidency}
                    >
                      {submitting ? 'Processing...' : selectedResidency ? `Book Now - ${formatPriceByResidency(calculateTotal(), selectedResidency)}` : 'Residency Required'}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground mb-4">
                      <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Loading destination details...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationDetails;