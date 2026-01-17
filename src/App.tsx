import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ResidencyProvider } from "./contexts/ResidencyContext";
import { I18nProvider } from "./contexts/I18nContext";
import { Suspense, lazy } from "react";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Destinations = lazy(() => import("./pages/Destinations"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const DestinationDetails = lazy(() => import("./pages/DestinationDetails"));
const WhyUs = lazy(() => import("./pages/WhyUs"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <ResidencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <I18nProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/destinations" element={<Destinations />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/why-us" element={<WhyUs />} />
                    <Route path="/WhyUs" element={<Navigate to="/why-us" replace />} />
                    <Route path="/whyus" element={<Navigate to="/why-us" replace />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/booking-success" element={<BookingSuccess />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogDetails />} />
                    <Route path="/destinations/:id" element={<DestinationDetails />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </I18nProvider>
          </TooltipProvider>
        </ResidencyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;