import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Users, MapPin, CreditCard, Printer, ArrowLeft, Home, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/ui/loader';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  tour_id: string;
  customer_name: string;
  participants: number;
  start_date: string;
  total_amount: number;
  payment_status: string;
  status: string;
  tours: {
    title: string;
    location: string;
    duration_days: number;
  };
}

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const bookingIdParam = searchParams.get('bookingId') || searchParams.get('id');
  const trackingIdParam = searchParams.get('trackingId') || searchParams.get('OrderTrackingId');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingIdParam && !trackingIdParam) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching booking with:', { bookingId: bookingIdParam, trackingId: trackingIdParam });

        let data: Booking | null = null;

        // 1. Try fetching from pesapal_transactions first
        if (trackingIdParam) {
          console.log('Attempting to fetch via tracking ID...');
          const { data: txData, error: txError } = await supabase
            .from('pesapal_transactions')
            .select('*, booking:bookings(*)')
            .eq('order_tracking_id', trackingIdParam)
            .maybeSingle();

          if (txError) {
            console.error('Transaction fetch error details:', txError);
          }

          if (txData && txData.booking) {
            console.log('Found booking via transaction data');
            const b = txData.booking as Booking;
            data = {
              ...b,
              total_amount: txData.amount || b.total_amount,
              payment_status: txData.status?.toLowerCase() === 'completed' ? 'paid' : b.payment_status
            };
          }
        }

        // 2. Fallback to direct bookings query
        if (!data && bookingIdParam) {
          console.log('Falling back to direct booking lookup...');
          const { data: bData, error: bError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingIdParam)
            .single();

          if (bError) {
            console.error('Booking fallback fetch error details:', bError);
          } else {
            data = bData;
          }
        }

        // 3. Fetch Destination Details separately (since FK is missing)
        if (data && data.tour_id) {
          console.log('Fetching destination details for tour_id:', data.tour_id);
          const { data: tourData, error: tourError } = await supabase
            .from('destinations')
            .select('*')
            .eq('id', parseInt(data.tour_id))
            .maybeSingle();

          if (tourError) {
            console.error('Destination fetch error:', tourError);
          } else if (tourData) {
            data.tours = {
              title: tourData.name,
              location: tourData.location,
              duration_days: tourData.duration
            };
          }
        }

        if (data) {
          setBooking(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingIdParam, trackingIdParam]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader label="Finalizing your booking..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-xl text-muted-foreground">
              Thank you for choosing our safari adventures
            </p>
          </div>

          {booking ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="border-2 border-primary/20 shadow-luxury overflow-hidden bg-white dark:bg-slate-900 print:shadow-none print:border-slate-200">
                {/* Receipt Header (Visible only when printing or as style) */}
                <div className="bg-primary/5 p-8 border-b border-primary/10 flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-primary mb-1">BOOKING RECEIPT</h2>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest">Ryoko Tours Africa</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">Reference</p>
                    <p className="text-xl font-mono text-foreground">#{booking.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <CardContent className="p-8 space-y-8">
                  {/* Status Banner */}
                  <div className={cn(
                    "rounded-xl p-4 border flex items-center justify-between",
                    booking.payment_status === 'paid'
                      ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        booking.payment_status === 'paid' ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                      )}>
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-tight">
                          {booking.payment_status === 'paid' ? 'Payment Confirmed' : 'Payment Processing'}
                        </p>
                        <p className="text-xs opacity-80">
                          {new Date().toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs uppercase tracking-tighter opacity-70 font-semibold text-foreground">Status</p>
                      <p className="font-bold uppercase tracking-widest leading-none mt-1">{booking.status}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> Adventure Details
                        </h4>
                        <p className="text-xl font-serif font-bold text-foreground">{booking.tours.title}</p>
                        <p className="text-muted-foreground">{booking.tours.location}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> Scheduled For
                        </h4>
                        <p className="font-bold text-lg text-foreground">
                          {new Date(booking.start_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground italic">Duration: {booking.tours.duration_days} Days</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Users className="w-3 h-3" /> Guest Information
                        </h4>
                        <p className="font-bold text-lg text-foreground">{booking.customer_name}</p>
                        <p className="text-muted-foreground">
                          {booking.participants} Traveler{booking.participants !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="bg-accent/5 p-4 rounded-xl border border-accent/10">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                          <CreditCard className="w-3 h-3" /> Payment Summary
                        </h4>
                        <div className="flex justify-between items-end">
                          <span className="text-sm text-muted-foreground">Total Paid (KSh)</span>
                          <span className="text-3xl font-display font-bold text-primary">
                            {booking.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Footer */}
                  <div className="border-t-2 border-dashed pt-8 space-y-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-foreground">Important Information</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Please present this receipt (digital or printed) upon arrival</li>
                        <li>• A confirmation email has been sent to your registered address</li>
                        <li>• Cancellations must be made at least 72 hours in advance</li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-4 print:hidden">
                      <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="gap-2 border-primary/20 hover:bg-primary/5"
                      >
                        <Printer className="w-4 h-4" />
                        Print Receipt
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2 border-primary/20 hover:bg-primary/5"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = '#';
                          link.download = `Ryoko-Booking-${booking.id.slice(0, 8)}.txt`;
                          // In a real app, this might be a generated PDF
                          alert("PDF processing would happen here. For now, please use the Print function.");
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Save as PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
                <Link to="/destinations">
                  <Button variant="outline" className="w-full h-14 text-lg border-primary/20 hover:bg-primary/5 transition-all duration-300">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Book Another Tour
                  </Button>
                </Link>
                <Link to="/">
                  <Button className="w-full h-14 text-lg bg-gradient-primary hover:opacity-90 shadow-lg transition-all duration-300">
                    <Home className="w-5 h-5 mr-2" />
                    Return to Homepage
                  </Button>
                </Link>
              </div>

              <p className="text-center text-sm text-muted-foreground italic px-4">
                Need help? <Link to="/contact" className="text-primary hover:underline font-bold">Contact our safari experts</Link> available 24/7.
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">Booking Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn't find your booking details. This might be due to a technical issue.
                </p>
                <div className="space-y-3">
                  <Link to="/contact">
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </Link>
                  <Link to="/destinations">
                    <Button className="w-full bg-gradient-primary hover:opacity-90">
                      Browse Destinations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingSuccess;