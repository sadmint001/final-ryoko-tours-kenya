import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Users, MapPin, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/ui/loader';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
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

  const bookingIdParam = searchParams.get('bookingId');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingIdParam) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            tours (
              title,
              location,
              duration_days
            )
          `)
          .eq('id', bookingIdParam)
          .single();

        if (error) {
          console.error('Error fetching booking:', error);
        } else {
          setBooking(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingIdParam]);

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
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-display text-center">
                  Your Safari Adventure
                </CardTitle>
                <CardDescription className="text-center">
                  Booking Reference: {booking.id.slice(0, 8).toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">{booking.tours.title}</p>
                        <p className="text-sm text-muted-foreground">{booking.tours.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Start Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.start_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Participants</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.participants} participant{booking.participants !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Total Amount</p>
                        <p className="text-sm text-muted-foreground">
                          KSh {booking.total_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className={cn(
                    "rounded-lg p-4 border",
                    booking.payment_status === 'paid'
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className={cn(
                        "w-5 h-5",
                        booking.payment_status === 'paid' ? "text-green-600" : "text-amber-600"
                      )} />
                      <span className={cn(
                        "font-semibold",
                        booking.payment_status === 'paid' ? "text-green-800" : "text-amber-800"
                      )}>
                        {booking.payment_status === 'paid' ? 'Payment Confirmed' : 'Payment Processing'}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm",
                      booking.payment_status === 'paid' ? "text-green-700" : "text-amber-700"
                    )}>
                      {booking.payment_status === 'paid'
                        ? 'Your payment has been processed successfully. You will receive a confirmation email shortly.'
                        : 'Your payment is being verified by PesaPal. This page will update automatically once confirmed.'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• You'll receive a detailed itinerary via email within 24 hours</li>
                    <li>• Our team will contact you 48 hours before departure</li>
                    <li>• Pack according to the packing list we'll provide</li>
                    <li>• Prepare for an unforgettable adventure!</li>
                  </ul>
                </div>

                <div className="border-t pt-6 space-y-3">
                  <Link to="/destinations">
                    <Button variant="outline" className="w-full">
                      Book Another Experience
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button className="w-full bg-gradient-primary hover:opacity-90">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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