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
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CreditCard, Building, Smartphone, Users, MapPin, Clock, Star, Filter, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useResidency } from '@/contexts/ResidencyContext';
import { getPriceByResidency, formatPrice } from '@/lib/pricing';
import { PaymentService } from '@/services/paymentService';
import { PAYMENT_CONFIG } from '@/lib/payment-config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/ui/loader';
import ResidencySelector from '@/components/ResidencySelector';

interface Destination {
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
}

interface BookingForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  participants: number;
  startDate: Date | undefined;
  specialRequests: string;
  paymentMethod: 'pesapal' | 'bank' | 'mpesa';
}

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedResidency, setSelectedResidency } = useResidency();

  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');

  const [form, setForm] = useState<BookingForm>({
    customerName: '',
    customerEmail: user?.email || '',
    customerPhone: '',
    participants: 1,
    startDate: undefined,
    specialRequests: '',
    paymentMethod: 'pesapal'
  });

  const destinationId = searchParams.get('destination');

  // Load destinations dynamically so booking page reflects admin updates
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const sb: any = supabase;
        const { data, error } = await sb
          .from('destinations')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: true });
        if (error) throw error;
        const mapped: Destination[] = (data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          highlights: d.highlights || [],
          image: d.image,
          pricing: {
            citizenPrice: d.citizen_price,
            residentPrice: d.resident_price,
            nonResidentPrice: d.non_resident_price,
          },
          category: d.category,
          duration: d.duration ?? undefined,
          maxParticipants: d.max_participants ?? undefined,
          difficulty: d.difficulty ?? undefined,
          rating: d.rating ?? undefined,
          location: d.location ?? undefined,
        }));
        setAllDestinations(mapped);
      } catch (e) {
        console.error('Failed to load destinations for booking:', e);
      }
    };
    load();
  }, []);

  const categories = [
    { id: 'all', name: 'All Experiences', icon: '🌟' },
    { id: 'Wildlife', name: 'Wildlife', icon: '🦁' },
    { id: 'Cultural', name: 'Cultural', icon: '🎭' },
    { id: 'Historical', name: 'Historical', icon: '🏛️' },
    { id: 'Adventure', name: 'Adventure', icon: '🏔️' }
  ];

  useEffect(() => {
    if (destinationId) {
      const destination = allDestinations.find(d => d.id === parseInt(destinationId));
      if (destination) {
        setSelectedDestination(destination);
      }
    }
  }, [destinationId]);

  useEffect(() => {
    if (user?.email) {
      setForm(prev => ({
        ...prev,
        customerEmail: user.email!,
        customerName: user.user_metadata?.full_name || ''
      }));
    }
  }, [user]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort destinations
  const filteredDestinationsBase = selectedCategory === 'all'
    ? allDestinations
    : allDestinations.filter(dest => dest.category === selectedCategory);

  const filteredDestinations = [...filteredDestinationsBase].sort((a, b) => {
    switch (sortBy) {
      case 'priceAsc':
        return a.pricing.citizenPrice - b.pricing.citizenPrice;
      case 'priceDesc':
        return b.pricing.citizenPrice - a.pricing.citizenPrice;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'duration':
        return (a.duration || 0) - (b.duration || 0);
      default:
        return 0;
    }
  });

  const calculateTotal = () => {
    if (!selectedDestination || !selectedResidency) return 0;
    const price = getPriceByResidency(selectedDestination.pricing, selectedResidency);
    return price * (Number(form.participants) || 0);
  };

  const handleInputChange = (field: keyof BookingForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination);
    setForm(prev => ({ ...prev, participants: 1 }));
  };

  const handlePesapalPayment = async () => {
    try {
      const paymentData = {
        destinationId: selectedDestination!.id,
        destinationTitle: selectedDestination!.name,
        participants: Number(form.participants) || 1,
        totalAmount: calculateTotal(),
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        startDate: form.startDate?.toISOString(),
        specialRequests: form.specialRequests,
        residency: selectedResidency,
      };

      const result = await PaymentService.processPesapalPayment(paymentData);

      if (result.success && result.url) {
        window.location.href = result.url; // Use href for direct redirect
        toast({
          title: 'Payment Session Created',
          description: 'Redirecting to PesaPal checkout...',
        });
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('PesaPal payment error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process PesaPal payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBankPayment = async () => {
    try {
      const bookingData = {
        tour_id: selectedDestination!.id.toString(),
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        customer_name: form.customerName,
        customer_email: form.customerEmail,
        customer_phone: form.customerPhone,
        participants: Number(form.participants) || 1,
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

      toast({
        title: 'Bank Transfer Details',
        description: `Account: 1234567890\nBank: KCB Bank\nAmount: KSh ${calculateTotal().toLocaleString()}\nReference: ${selectedDestination!.name}`,
      });

      navigate('/destinations');
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
          destinationId: selectedDestination!.id,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          participants: Number(form.participants) || 1,
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

    if (!selectedDestination) {
      toast({
        title: 'Destination Required',
        description: 'Please select a destination to book.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedResidency) {
      toast({
        title: 'Residency Required',
        description: 'Please select your residency status.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.startDate) {
      toast({
        title: 'Date Required',
        description: 'Please select a start date for your experience.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      switch (form.paymentMethod) {
        case 'pesapal':
          await handlePesapalPayment();
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

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader label="Loading destinations..." />
        </div>
      </div>
    );
  }

  // Show authentication required message if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card rounded-lg p-8 shadow-elegant">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-display font-bold text-primary mb-2">
                  Authentication Required
                </h1>
                <p className="text-muted-foreground">
                  Please sign in to access the booking page and reserve your African adventure.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => navigate('/auth', { state: { from: '/booking' } })}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all text-black font-medium"
                >
                  Sign In to Continue
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/destinations')}
                  className="w-full"
                >
                  Browse Destinations
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              Book Your African Adventure
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our curated collection of unforgettable experiences across Africa
            </p>
          </div>

          {/* Residency Selection */}
          <div className="mb-8">
            <ResidencySelector
              selectedResidency={selectedResidency}
              onResidencyChange={setSelectedResidency}
            />
          </div>

          {/* Category Filter and Sort */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">Filter by:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </Button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="recommended">Recommended</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="duration">Shortest First</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Destinations Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDestinations.map((destination) => (
                  <Card
                    key={destination.id}
                    className={cn(
                      "group hover:shadow-elegant transition-all duration-300 overflow-hidden cursor-pointer",
                      selectedDestination?.id === destination.id && "ring-2 ring-primary shadow-lg"
                    )}
                    onClick={() => handleDestinationSelect(destination)}
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {destination.rating && (
                        <div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-4 h-4 text-safari-gold fill-current" />
                          <span className="text-sm font-medium">{destination.rating}</span>
                        </div>
                      )}
                      {selectedDestination?.id === destination.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                            Selected
                          </div>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg font-display group-hover:text-primary transition-colors">
                          {destination.name}
                        </CardTitle>
                        {destination.difficulty && (
                          <Badge className={getDifficultyColor(destination.difficulty)}>
                            {destination.difficulty}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {destination.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {destination.location || destination.name}
                        </div>
                        {destination.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {destination.duration} {destination.duration < 1 ? 'hours' : destination.duration === 1 ? 'day' : 'days'}
                          </div>
                        )}
                        {destination.maxParticipants && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Max {destination.maxParticipants}
                          </div>
                        )}
                      </div>

                      {/* Highlights */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 text-sm">Highlights:</h4>
                        <div className="flex flex-wrap gap-1">
                          {destination.highlights.slice(0, 3).map((highlight, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                          {destination.highlights.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{destination.highlights.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Pricing Section */}
                      <div className="text-center w-full bg-slate-50 dark:bg-white text-black p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-300">
                        {selectedResidency ? (
                          <>
                            <div className="text-sm text-black dark:text-black font-medium">Starting from</div>
                            <div className="text-xl font-bold text-primary dark:text-black">
                              {formatPrice(getPriceByResidency(destination.pricing, selectedResidency))}
                              <span className="text-sm font-normal text-black dark:text-black ml-1">
                                per person
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-black dark:text-black font-medium">Starting from</div>
                            <div className="text-lg text-black dark:text-black italic">
                              per person
                            </div>
                            <Button
                              className="mt-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all text-sm text-white font-medium"
                              onClick={() => setSelectedResidency('citizen')}
                            >
                              Select Residency
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredDestinations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground">No destinations found for the selected category.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSelectedCategory('all')}
                  >
                    View All Destinations
                  </Button>
                </div>
              )}
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl font-display">Booking Details</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Signed in as {user?.email}</span>
                    </div>
                  </div>
                  <CardDescription>
                    {selectedDestination
                      ? `Book your ${selectedDestination.name} experience`
                      : 'Select a destination to start booking'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDestination ? (
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
                            max={selectedDestination.maxParticipants || 20}
                            value={form.participants}
                            onChange={(e) => handleInputChange('participants', e.target.value === '' ? '' as any : parseInt(e.target.value))}
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
                            <RadioGroupItem value="pesapal" id="pesapal" />
                            <Label htmlFor="pesapal" className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Credit/Debit Card & Mobile Money (PesaPal)
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
                            {selectedResidency ? `KSh ${calculateTotal().toLocaleString()}` : 'Select Residency'}
                          </span>
                        </div>
                        {selectedResidency && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {form.participants} participant{form.participants !== 1 ? 's' : ''} × {formatPrice(getPriceByResidency(selectedDestination.pricing, selectedResidency))}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all text-black font-medium"
                        disabled={submitting || !selectedResidency}
                      >
                        {submitting ? 'Processing...' : selectedResidency ? `Book Now - KSh ${calculateTotal().toLocaleString()}` : 'Select Residency to Book'}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground mb-4">
                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Select a destination to start your booking</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;