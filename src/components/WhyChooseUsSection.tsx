import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Heart, ShieldCheck, Users, CheckCircle, ArrowRight } from 'lucide-react';

interface Feature {
    key: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    stats: string;
    highlights: string[];
}

const features: Feature[] = [
    {
        key: 'exceptional-service',
        title: 'Exceptional Service',
        description: 'Professional, warm, responsive service that exceeds expectations at every touchpoint.',
        icon: <Award className="w-7 h-7" />,
        gradient: 'from-amber-500 to-orange-600',
        stats: '98%',
        highlights: ['24/7 Support', 'Personalized Care', 'Quick Response']
    },
    {
        key: 'unforgettable-experiences',
        title: 'Unforgettable Experiences',
        description: 'Deep cultural immersion and authentic connections that create lasting memories.',
        icon: <Heart className="w-7 h-7" />,
        gradient: 'from-rose-500 to-pink-600',
        stats: '1000+',
        highlights: ['Cultural Tours', 'Local Guides', 'Unique Activities']
    },
    {
        key: 'safety-first',
        title: 'Safety First',
        description: 'Secure booking, trusted guides, and comprehensive safety measures for peace of mind.',
        icon: <ShieldCheck className="w-7 h-7" />,
        gradient: 'from-emerald-500 to-teal-600',
        stats: '100%',
        highlights: ['Licensed Guides', 'Insured Tours', 'Safe Vehicles']
    },
    {
        key: 'stories-worth-telling',
        title: 'Stories Worth Telling',
        description: 'Not just trips, but meaningful connections and experiences that transform perspectives.',
        icon: <Users className="w-7 h-7" />,
        gradient: 'from-blue-500 to-indigo-600',
        stats: '50+',
        highlights: ['Group Tours', 'Private Safaris', 'Family Adventures']
    }
];

const WhyChooseUsSection = () => {
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState<string | null>(null);

    const handleFeatureClick = (key: string) => {
        navigate(`/WhyUs#${key}`);
    };

    return (
        <section className="relative py-24 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-amber-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
            {/* Decorative Background - Light Mode */}
            <div className="absolute inset-0 overflow-hidden dark:hidden">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-100/40 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-100/30 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
            </div>

            {/* Decorative Background - Dark Mode */}
            <div className="absolute inset-0 overflow-hidden hidden dark:block">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-8 h-px bg-amber-500"></div>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">Why Trust Us</span>
                        <div className="w-8 h-px bg-amber-500"></div>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-4 font-serif">
                        Why Choose
                        <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent"> Us?</span>
                    </h2>

                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        We don't just plan trips — we curate moments that leave a mark
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <article
                            key={feature.key}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleFeatureClick(feature.key)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick(feature.key)}
                            onMouseEnter={() => setActiveFeature(feature.key)}
                            onMouseLeave={() => setActiveFeature(null)}
                            className={`
                group relative cursor-pointer
                rounded-3xl overflow-hidden
                bg-white dark:bg-slate-800/80
                border border-slate-200 dark:border-slate-700
                shadow-lg hover:shadow-2xl
                transform transition-all duration-500
                hover:-translate-y-3 hover:scale-[1.02]
              `}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Gradient overlay on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>

                            {/* Content Container */}
                            <div className="relative p-6 h-full flex flex-col">
                                {/* Stats Badge */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold">
                                        {feature.stats}
                                        <span className="text-white/70">+</span>
                                    </span>
                                </div>

                                {/* Icon */}
                                <div className={`
                  w-16 h-16 rounded-2xl
                  bg-gradient-to-br ${feature.gradient}
                  flex items-center justify-center
                  text-white
                  shadow-lg
                  mb-5
                  transform transition-all duration-500
                  group-hover:scale-110 group-hover:rotate-6
                  group-hover:shadow-xl
                `}>
                                    {feature.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-white mb-3 transition-colors duration-300 font-serif">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-slate-600 dark:text-slate-300 group-hover:text-white/90 mb-5 transition-colors duration-300 text-sm leading-relaxed flex-grow">
                                    {feature.description}
                                </p>

                                {/* Highlights */}
                                <div className="space-y-2 mb-5">
                                    {feature.highlights.map((highlight, i) => (
                                        <div
                                            key={highlight}
                                            className="flex items-center gap-2 transform transition-all duration-300"
                                            style={{ transitionDelay: `${i * 50}ms` }}
                                        >
                                            <CheckCircle className="w-4 h-4 text-emerald-500 group-hover:text-white/90 transition-colors flex-shrink-0" />
                                            <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80 transition-colors">
                                                {highlight}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Learn More Link */}
                                <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors">
                                    <span>Learn more</span>
                                    <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>

                            {/* Animated corner decoration */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/5 to-white/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-700"></div>
                        </article>
                    ))}
                </div>


            </div>
        </section>
    );
};

export default WhyChooseUsSection;
