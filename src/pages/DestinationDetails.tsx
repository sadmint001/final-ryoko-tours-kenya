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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Globe,
  Compass,
  Sun,
  Mountain,
  Camera,
  TreePine,
  ShieldCheck,
  Info
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
  const [pesapalUrl, setPesapalUrl] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
    paymentMethod: 'pesapal' | 'bank' | 'mpesa';
  }

  const [form, setForm] = useState<BookingForm>({
    customerName: user?.user_metadata?.full_name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    participants: 1,
    startDate: undefined,
    specialRequests: '',
    paymentMethod: 'pesapal'
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

  const handlePesapalPayment = async () => {
    try {
      if (!destination || !selectedResidency) {
        toast({
          title: 'Error',
          description: 'Destination or residency data is not available.',
          variant: 'destructive',
        });
        return;
      }

      const paymentData: PaymentRequest = {
        destinationId: destination.id.toString(),
        destinationTitle: destination.name,
        participants: form.participants,
        totalAmount: calculateTotal(),
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        startDate: form.startDate?.toISOString(),
        specialRequests: form.specialRequests,
        residency_type: selectedResidency,
      };

      const result = await PaymentService.processPesapalPayment(paymentData);

      if (result.success && result.url) {
        setPesapalUrl(result.url);
        setIsPaymentModalOpen(true);
        toast({
          title: 'Payment Session Created',
          description: 'Please complete payment in the secure window.',
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
      if (!destination || !selectedResidency) {
        toast({
          title: 'Error',
          description: 'Destination or residency data is not available.',
          variant: 'destructive',
        });
        return;
      }

      const paymentData: PaymentRequest = {
        destinationId: destination.id.toString(),
        destinationTitle: destination.name,
        participants: form.participants,
        totalAmount: calculateTotal(),
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        startDate: form.startDate?.toISOString(),
        specialRequests: form.specialRequests,
        residency_type: selectedResidency,
      };

      const result = await PaymentService.processBankTransfer(paymentData);

      if (result.success) {
        toast({
          title: 'Booking Created',
          description: 'Your booking has been created. Please complete the bank transfer.',
        });

        const bankDetails = PaymentService.getBankTransferDetails(paymentData.totalAmount, destination.name);

        toast({
          title: 'Bank Transfer Details',
          description: `Account: ${bankDetails.accountNumber}\nBank: ${bankDetails.bankName}\nAmount: ${PaymentService.formatCurrency(bankDetails.amount, selectedResidency)}\nReference: ${bankDetails.reference}`,
        });

        navigate('/booking-success');
      } else {
        throw new Error(result.error);
      }
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

      const paymentData: PaymentRequest = {
        destinationId: destination.id.toString(),
        destinationTitle: destination.name,
        participants: form.participants,
        totalAmount: calculateTotal(),
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        startDate: form.startDate?.toISOString(),
        specialRequests: form.specialRequests,
        residency_type: selectedResidency,
      };

      const result = await PaymentService.processMpesaPayment(paymentData);

      if (result.success) {
        toast({
          title: 'Payment Initiated',
          description: 'Please check your phone for the STK push notification.',
        });
        navigate('/booking-success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process M-Pesa payment.',
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin h-12 w-12 text-amber-500 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Loading destination details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-slate-500" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-800 dark:text-white mb-4">Destination Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            {error || 'The destination you are looking for does not exist or has been removed.'}
          </p>
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
            <Link to="/destinations">Back to Destinations</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      <Navbar />

      {/* Parallax Hero Section */}
      <div className="relative h-[70vh] lg:h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={destination.updatedAt ? `${destination.image}?v=${new Date(destination.updatedAt).getTime()}` : destination.image}
            alt={destination.name}
            className="w-full h-full object-cover animate-ken-burns"
          />
        </div>

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 to-transparent"></div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-16 md:pb-24 pt-32 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
          <div className="container mx-auto px-4">
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-amber-500/90 hover:bg-amber-600 text-white border-none shadow-lg px-4 py-1.5 text-sm font-medium backdrop-blur-md">
                <Compass className="w-3.5 h-3.5 mr-1.5" />
                {destination.category}
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif text-white mb-6 leading-tight drop-shadow-2xl !text-white">
                {destination.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base font-medium !text-white/90">
                {destination.location && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <MapPin className="h-4 w-4 text-amber-400" />
                    <span>{destination.location}</span>
                  </div>
                )}
                {destination.duration && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span>{destination.duration} Days</span>
                  </div>
                )}
                {destination.maxParticipants && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <Users className="h-4 w-4 text-amber-400" />
                    <span>Max {destination.maxParticipants} guests</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-20 -mt-10">
        <Button
          variant="outline"
          className="mb-8 border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:text-white border-0 absolute -top-10 left-4 hidden md:inline-flex"
          asChild
        >
          <Link to="/destinations">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Destinations
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Residency & Currency Indicator */}
            {selectedResidency && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-1 shadow-lg">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Residency</div>
                      <div className="font-bold text-slate-800 dark:text-white">{getResidencyDisplay(selectedResidency)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Currency</div>
                      <div className="font-bold text-slate-800 dark:text-white">{getCurrency(selectedResidency)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8 overflow-x-auto">
                {['overview', 'highlights', 'activities'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="flex-1 min-w-[100px] rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md font-medium capitalize"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-2xl font-bold font-serif text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-amber-500" />
                    About the Destination
                  </h3>
                  <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    {destination.description.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-2xl font-bold font-serif text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                    <Sun className="w-6 h-6 text-amber-500" />
                    Best Time to Visit
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-lg shadow-emerald-500/50"></div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">Green Season</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Lush landscapes, baby animals, excellent bird watching, and fewer crowds.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mt-2 shrink-0 shadow-lg shadow-amber-500/50"></div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">Dry Season</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Prime wildlife viewing as animals congregate around water sources.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Highlights Tab */}
              <TabsContent value="highlights" className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destination.highlights?.map((highlight, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium pt-1">{highlight}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: "Game Drives", icon: ShieldCheck, desc: "Classic safari experience in 4x4 land cruisers." },
                    { title: "Photography", icon: Camera, desc: "Capture wildlife and stunning landscapes." },
                    { title: "Nature Walks", icon: TreePine, desc: "Guided walking safaris with expert rangers." },
                    { title: "Sundowners", icon: Sun, desc: "Enjoy drinks while watching the sunset over the savannah." },
                  ].map((activity, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                        <activity.icon className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{activity.title}</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">{activity.desc}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden rounded-3xl">
                {/* Decorative Header */}
                <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600 w-full"></div>

                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold font-serif text-slate-800 dark:text-white">Book Your Trip</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Reserve your spot for this unforgettable experience
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price Display */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wide font-semibold block mb-1">
                      Price Per Person
                    </span>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                      {selectedResidency
                        ? formatPriceByResidency(getPriceByResidency(destination.pricing, selectedResidency), selectedResidency)
                        : '-'}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Travel Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal h-12 rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-900",
                              !form.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.startDate ? format(form.startDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <ShadcnCalendar
                            mode="single"
                            selected={form.startDate}
                            onSelect={(date) => setForm(prev => ({ ...prev, startDate: date }))}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="participants">Travelers</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          min="1"
                          max={destination.maxParticipants || 20}
                          value={form.participants}
                          onChange={(e) => setForm(prev => ({ ...prev, participants: parseInt(e.target.value) || 1 }))}
                          className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Customer Details</Label>
                      <div className="space-y-2">
                        <Input
                          placeholder="Full Name"
                          value={form.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          className="h-12 rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-900"
                        />
                        <Input
                          placeholder="Email Address"
                          type="email"
                          value={form.customerEmail}
                          onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                          className="h-12 rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-900"
                        />
                        <Input
                          placeholder="Phone Number"
                          type="tel"
                          value={form.customerPhone}
                          onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                          className="h-12 rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="mb-2 block">Payment Method</Label>
                      <RadioGroup
                        value={form.paymentMethod}
                        onValueChange={(val: any) => setForm(prev => ({ ...prev, paymentMethod: val }))}
                        className="grid grid-cols-3 gap-2"
                      >
                        <div>
                          <RadioGroupItem value="pesapal" id="pesapal" className="peer sr-only" />
                          <Label
                            htmlFor="pesapal"
                            className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50 dark:peer-data-[state=checked]:bg-amber-900/20 cursor-pointer h-20 text-xs text-center gap-2 transition-all"
                          >
                            <CreditCard className="mb-1 h-5 w-5" />
                            Online Card/Mobile
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="bank" id="bank" className="peer sr-only" />
                          <Label
                            htmlFor="bank"
                            className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50 dark:peer-data-[state=checked]:bg-amber-900/20 cursor-pointer h-20 text-xs text-center gap-2 transition-all"
                          >
                            <Building className="mb-1 h-5 w-5" />
                            Bank xfer
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="mpesa" id="mpesa" className="peer sr-only" />
                          <Label
                            htmlFor="mpesa"
                            className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50 dark:peer-data-[state=checked]:bg-amber-900/20 cursor-pointer h-20 text-xs text-center gap-2 transition-all"
                          >
                            <Smartphone className="mb-1 h-5 w-5" />
                            M-Pesa
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 mt-4">
                      <div className="flex justify-between items-center text-sm mb-4">
                        <span className="text-slate-500">Total Amount</span>
                        <span className="text-xl font-bold text-slate-800 dark:text-white">
                          {selectedResidency && calculateTotal() > 0
                            ? formatPriceByResidency(calculateTotal(), selectedResidency)
                            : '-'}
                        </span>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold h-14 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
                        disabled={submitting || !selectedResidency}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Info Card */}
              <Card className="border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl">
                <CardContent className="p-6">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Why Book With Us?
                  </h4>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Secure payment processing</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Local expert support 24/7</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Verified destination partners</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* PesaPal Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-semibold text-slate-800 dark:text-gray-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Secure Payment
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full bg-slate-50 dark:bg-slate-950">
            {pesapalUrl && (
              <iframe
                src={pesapalUrl}
                className="w-full h-full border-0"
                title="PesaPal Payment"
                allow="payment"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DestinationDetails;