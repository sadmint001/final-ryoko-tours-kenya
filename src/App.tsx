import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ResidencyProvider } from "./contexts/ResidencyContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Destinations from "./pages/Destinations";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogDetails from "./pages/BlogDetails"; // ← IMPORT PLURAL "BlogDetails"
import WhyUs from "./pages/WhyUs";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { I18nProvider } from "./contexts/I18nContext";

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
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/destinations" element={<Destinations />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/why-us" element={<WhyUs />} />
                  <Route path="/WhyUs" element={<Navigate to="/why-us" replace />} />
                  <Route path="/whyus" element={<Navigate to="/why-us" replace />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/booking" element={<Booking />} />
                  <Route path="/booking-success" element={<BookingSuccess />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetails />} /> {/* ← USE BlogDetails */}
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </I18nProvider>
          </TooltipProvider>
        </ResidencyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;