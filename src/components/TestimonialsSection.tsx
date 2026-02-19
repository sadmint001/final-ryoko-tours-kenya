import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Google logo SVG component
const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// TripAdvisor logo SVG component
const TripAdvisorLogo = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#34E0A1" />
        <circle cx="8" cy="12" r="3" fill="white" />
        <circle cx="16" cy="12" r="3" fill="white" />
        <circle cx="8" cy="12" r="1.5" fill="#1A1A1A" />
        <circle cx="16" cy="12" r="1.5" fill="#1A1A1A" />
        <path d="M12 8 L14 6 L10 6 Z" fill="#FF5722" />
        <ellipse cx="12" cy="16" rx="3" ry="1.5" fill="white" />
    </svg>
);

interface Review {
    id: number;
    name: string;
    // avatar?: string; // Not using images for now
    content: string; // Mapped from DB content
    rating: number;
    location: string;
    source: 'google' | 'tripadvisor';
    date: string; // Derived from created_at
    initials: string; // Derived
    avatarBg: string; // Derived
}

const TestimonialsSection = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [expandedReview, setExpandedReview] = useState<number | null>(null);
    const [autoplay, setAutoplay] = useState(true);

    const gradients = [
        'bg-gradient-to-br from-amber-500 to-orange-600',
        'bg-gradient-to-br from-emerald-500 to-teal-600',
        'bg-gradient-to-br from-blue-500 to-indigo-600',
        'bg-gradient-to-br from-purple-500 to-pink-600',
        'bg-gradient-to-br from-rose-500 to-red-600',
        'bg-gradient-to-br from-cyan-500 to-blue-600',
    ];

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data, error } = await supabase
                    .from('testimonials')
                    .select('*')
                    .eq('visible', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    const formatted: Review[] = data.map((item: any, index: number) => ({
                        id: item.id,
                        name: item.name,
                        content: item.content,
                        rating: item.rating,
                        location: item.location,
                        source: item.source || 'google', // Default to google if missing
                        date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
                        initials: item.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
                        avatarBg: gradients[index % gradients.length]
                    }));
                    setReviews(formatted);
                } else {
                    // Fallback if no data (to keep the UI looking good initially)
                    // You can remove this else block if you want it empty
                }
            } catch (err) {
                console.error('Error loading testimonials:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const visibleCount = 4;
    const maxIndex = Math.max(0, reviews.length - visibleCount);

    useEffect(() => {
        if (!autoplay || reviews.length <= visibleCount) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [currentIndex, autoplay, reviews.length]);

    const nextSlide = () => {
        if (isAnimating || reviews.length <= visibleCount) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        setTimeout(() => setIsAnimating(false), 500);
    };

    const prevSlide = () => {
        if (isAnimating || reviews.length <= visibleCount) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
        setTimeout(() => setIsAnimating(false), 500);
    };

    const googleReviews = reviews.filter(r => r.source === 'google');
    const tripAdvisorReviews = reviews.filter(r => r.source === 'tripadvisor');
    const googleAvgRating = googleReviews.length ? (googleReviews.reduce((sum, r) => sum + r.rating, 0) / googleReviews.length).toFixed(1) : '5.0';
    const tripAdvisorAvgRating = tripAdvisorReviews.length ? (tripAdvisorReviews.reduce((sum, r) => sum + r.rating, 0) / tripAdvisorReviews.length).toFixed(1) : '5.0';

    const toggleExpand = (id: number) => {
        setExpandedReview(expandedReview === id ? null : id);
    };

    if (loading) return null; // Or a loader skeletons

    if (reviews.length === 0) return null; // Don't show section if no reviews

    return (
        <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
            {/* Decorative Elements - Light Mode */}
            <div className="absolute inset-0 overflow-hidden dark:hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/40 to-orange-300/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/30 to-teal-300/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-100/30 to-transparent rounded-full"></div>
            </div>

            {/* Decorative Elements - Dark Mode */}
            <div className="absolute inset-0 overflow-hidden hidden dark:block">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-500/15 to-teal-600/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-500/5 to-transparent rounded-full"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-8 h-px bg-amber-500"></div>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">Trusted by 1,000+ Travelers</span>
                        <div className="w-8 h-px bg-amber-500"></div>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-4 font-serif">
                        Real Stories,
                        <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent"> Real Adventures</span>
                    </h2>

                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Don't just take our word for it — hear from travelers who experienced the magic of Kenya with us
                    </p>

                    {/* Rating Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                        <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/10 rounded-2xl shadow-lg dark:shadow-none border border-slate-200 dark:border-white/10 hover:shadow-xl dark:hover:bg-white/15 transition-all duration-300">
                            <GoogleLogo />
                            <div className="text-left">
                                <div className="flex items-center gap-1">
                                    <span className="text-lg font-bold text-slate-800 dark:text-white">{googleAvgRating}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{googleReviews.length ? googleReviews.length * 52 : 120} reviews</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/10 rounded-2xl shadow-lg dark:shadow-none border border-slate-200 dark:border-white/10 hover:shadow-xl dark:hover:bg-white/15 transition-all duration-300">
                            <TripAdvisorLogo />
                            <div className="text-left">
                                <div className="flex items-center gap-1">
                                    <span className="text-lg font-bold text-slate-800 dark:text-white">{tripAdvisorAvgRating}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{tripAdvisorReviews.length ? tripAdvisorReviews.length * 34 : 85} reviews</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Carousel */}
                <div
                    className="relative"
                    onMouseEnter={() => setAutoplay(false)}
                    onMouseLeave={() => setAutoplay(true)}
                >
                    {/* Navigation Arrows */}
                    {reviews.length > visibleCount && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-lg dark:shadow-none border border-slate-200 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
                                aria-label="Previous reviews"
                            >
                                <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" />
                            </button>

                            <button
                                onClick={nextSlide}
                                className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-lg dark:shadow-none border border-slate-200 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
                                aria-label="Next reviews"
                            >
                                <ChevronRight className="w-6 h-6 text-slate-600 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" />
                            </button>
                        </>
                    )}

                    {/* Reviews Grid */}
                    <div className="overflow-hidden px-2">
                        <div
                            className="flex gap-5 transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
                        >
                            {reviews.map((review) => (
                                <article
                                    key={review.id}
                                    className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 min-w-0"
                                >
                                    <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden group border border-slate-100 dark:border-slate-700">
                                        {/* Card Header */}
                                        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar */}
                                                    <div className={`w-11 h-11 rounded-full ${review.avatarBg} flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-700`}>
                                                        <span className="text-sm font-bold text-white">{review.initials}</span>
                                                    </div>

                                                    <div>
                                                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{review.name}</h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{review.date}</p>
                                                    </div>
                                                </div>

                                                {/* Source Logo */}
                                                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {review.source === 'google' ? <GoogleLogo /> : <TripAdvisorLogo />}
                                                </div>
                                            </div>

                                            {/* Star Rating */}
                                            <div className="flex items-center gap-1 mt-3">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${review.source === 'google'
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'fill-emerald-500 text-emerald-500'
                                                            }`}
                                                    />
                                                ))}
                                                {[...Array(5 - review.rating)].map((_, i) => (
                                                    <Star key={`empty-${i}`} className="w-4 h-4 text-slate-200 dark:text-slate-600" />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Review Content */}
                                        <div className="p-5">
                                            <p className={`text-slate-700 dark:text-slate-300 text-sm leading-relaxed ${expandedReview === review.id ? '' : 'line-clamp-4'
                                                }`}>
                                                {review.content}
                                            </p>

                                            {review.content.length > 150 && (
                                                <button
                                                    onClick={() => toggleExpand(review.id)}
                                                    className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center gap-1 group"
                                                >
                                                    {expandedReview === review.id ? 'Show less' : 'Read more'}
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Location Badge */}
                                        <div className="px-5 pb-5">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-full text-xs text-slate-600 dark:text-slate-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                {review.location}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* Progress Dots */}
                    {reviews.length > visibleCount && (
                        <div className="flex justify-center gap-2 mt-8">
                            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex
                                        ? 'w-8 bg-gradient-to-r from-amber-400 to-orange-500'
                                        : 'w-2 bg-slate-300 dark:bg-white/30 hover:bg-slate-400 dark:hover:bg-white/50'
                                        }`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Rating Summary */}
                <div className="mt-16 text-center">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 px-8 py-6 bg-gradient-to-r from-slate-50 to-amber-50/50 dark:from-white/5 dark:to-white/10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-none">
                        <div className="flex items-center gap-2">
                            <GoogleLogo />
                            <span className="text-slate-600 dark:text-slate-300 text-sm">
                                <span className="text-amber-600 dark:text-amber-400 font-bold">Google</span> rating: {googleAvgRating} of 5
                            </span>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-white/20"></div>
                        <div className="flex items-center gap-2">
                            <TripAdvisorLogo />
                            <span className="text-slate-600 dark:text-slate-300 text-sm">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tripadvisor</span> rating: {tripAdvisorAvgRating} of 5
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
