import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Camera, Mountain, Leaf, ArrowRight, Award } from 'lucide-react';
import featuredBg from '@/assets/featured-bg.jpg';

interface Tour {
    key: string;
    title: string;
    icon: React.ReactNode;
    emoji: string;
    desc: string;
    tags: string[];
    gradient: string;
    hoverGradient: string;
    accentColor: string;
}

const tours: Tour[] = [
    {
        key: 'Historical',
        title: 'Historical, Cultural & Art',
        icon: <Compass className="w-6 h-6" />,
        emoji: '🏛️',
        desc: "Immerse yourself in Kenya's rich heritage and artistry through authentic local experiences",
        tags: ['Kazuri Beads', 'Maasai Market', 'Karen Blixen Museum'],
        gradient: 'from-amber-500 to-orange-600',
        hoverGradient: 'group-hover:from-amber-400 group-hover:to-orange-500',
        accentColor: 'amber'
    },
    {
        key: 'Wildlife',
        title: 'Wildlife Safari',
        icon: <Camera className="w-6 h-6" />,
        emoji: '🦁',
        desc: "Encounter Kenya's incredible wildlife up close in their natural habitat",
        tags: ['Nairobi NP', 'Giraffe Centre', 'Sheldrick Elephant'],
        gradient: 'from-emerald-500 to-teal-600',
        hoverGradient: 'group-hover:from-emerald-400 group-hover:to-teal-500',
        accentColor: 'emerald'
    },
    {
        key: 'Nature',
        title: 'Hiking, Picnic & Nature',
        icon: <Mountain className="w-6 h-6" />,
        emoji: '🥾',
        desc: "Explore Kenya's breathtaking natural landscapes and scenic trails",
        tags: ['Ngong Hills', 'Karura Forest', "Hell's Gate"],
        gradient: 'from-blue-500 to-indigo-600',
        hoverGradient: 'group-hover:from-blue-400 group-hover:to-indigo-500',
        accentColor: 'blue'
    },
    {
        key: 'Farming',
        title: 'Farming, Coffee & Tea',
        icon: <Leaf className="w-6 h-6" />,
        emoji: '🌿',
        desc: "Educational experiences in Kenya's world-famous agricultural heritage",
        tags: ['Fairview Coffee', 'Kiambethu Tea Farm'],
        gradient: 'from-lime-500 to-green-600',
        hoverGradient: 'group-hover:from-lime-400 group-hover:to-green-500',
        accentColor: 'lime'
    },
    {
        key: 'Signature',
        title: 'Signature Experience',
        icon: <Award className="w-6 h-6" />,
        emoji: '✨',
        desc: "Exclusively crafted journeys for the discerning traveler, featuring our most premium offerings",
        tags: ['Private Safari', 'Luxury Stay', 'Unique Moments'],
        gradient: 'from-indigo-600 to-purple-600',
        hoverGradient: 'group-hover:from-indigo-500 group-hover:to-purple-500',
        accentColor: 'purple'
    }
];

const FeaturedToursSection = () => {
    const navigate = useNavigate();
    const [hoveredTour, setHoveredTour] = useState<string | null>(null);

    const handleTourClick = (key: string) => {
        navigate(`/destinations?category=${encodeURIComponent(key)}`);
    };

    return (
        <section id="featured-tours" className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
            {/* Decorative Background Elements - Light Mode */}
            <div className="absolute inset-0 overflow-hidden dark:hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-100/50 to-orange-100/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-emerald-100/40 to-teal-100/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-indigo-100/30 rounded-full blur-3xl"></div>
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            </div>

            {/* Background Image - 75% Opacity */}
            <div className="absolute inset-0 z-0">
                <img
                    src={featuredBg}
                    alt="Section Background"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
                {/* Overlay for better readability */}
                <div className="absolute inset-0 bg-slate-50/20 dark:bg-slate-900/40 backdrop-blur-[1px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
                        <div className="w-8 h-px bg-amber-500"></div>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">Curated Experiences</span>
                        <div className="w-8 h-px bg-amber-500"></div>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-4 font-serif">
                        Featured
                        <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent"> Tours</span>
                    </h2>

                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Discover Kenya through our carefully curated experiences that go beyond traditional tourism
                    </p>
                </div>

                {/* Tours Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {tours.map((tour, index) => (
                        <article
                            key={tour.key}
                            role="button"
                            tabIndex={0}
                            aria-label={`View ${tour.title} tours`}
                            onClick={() => handleTourClick(tour.key)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleTourClick(tour.key);
                                }
                            }}
                            onMouseEnter={() => setHoveredTour(tour.key)}
                            onMouseLeave={() => setHoveredTour(null)}
                            className={`
                group relative overflow-hidden rounded-3xl cursor-pointer
                bg-white dark:bg-slate-800/80
                border border-slate-200 dark:border-slate-700
                shadow-lg hover:shadow-2xl
                transform transition-all duration-500
                hover:-translate-y-2 hover:scale-[1.02]
                ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}
              `}
                        >
                            {/* Animated gradient background on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${tour.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>

                            {/* Card inner content */}
                            <div className="relative m-[2px] rounded-[22px] bg-white dark:bg-slate-800 p-8 h-full transition-colors duration-500 group-hover:bg-transparent">
                                {/* Top Row: Icon + Title + Arrow */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        {/* Animated Icon Container */}
                                        <div className={`
                      relative w-16 h-16 rounded-2xl
                      bg-gradient-to-br ${tour.gradient}
                      flex items-center justify-center
                      shadow-lg
                      transform transition-all duration-500
                      group-hover:scale-110 group-hover:rotate-3
                      group-hover:shadow-xl
                      group-hover:from-white group-hover:to-white
                    `}>
                                            <span className="text-3xl animate-bounce-subtle">{tour.emoji}</span>
                                            {/* Glow effect */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${tour.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white font-serif transition-colors duration-300 group-hover:text-white">
                                                {tour.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300 group-hover:text-white/80">Explore experiences →</p>
                                        </div>
                                    </div>

                                    {/* Arrow Button */}
                                    <div className={`
                    w-12 h-12 rounded-full
                    bg-slate-100 dark:bg-slate-700
                    flex items-center justify-center
                    transform transition-all duration-500
                    group-hover:bg-white
                    group-hover:scale-110
                    group-hover:shadow-lg
                  `}>
                                        <ArrowRight className={`
                      w-5 h-5 text-slate-400 dark:text-slate-500
                      transform transition-all duration-500
                      group-hover:text-amber-600
                      group-hover:translate-x-1
                    `} />
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed transition-colors duration-300 group-hover:text-white/90">
                                    {tour.desc}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {tour.tags.map((tag, tagIndex) => (
                                        <span
                                            key={tag}
                                            className={`
                        inline-flex items-center gap-1.5 px-4 py-2
                        rounded-full text-sm font-medium
                        bg-slate-100 dark:bg-slate-700/50
                        text-slate-700 dark:text-slate-300
                        border border-slate-200 dark:border-slate-600
                        transform transition-all duration-300
                        group-hover:bg-white/20
                        group-hover:text-white group-hover:border-white/30
                        group-hover:shadow-md
                        backdrop-blur-sm
                      `}
                                            style={{
                                                transitionDelay: `${tagIndex * 50}ms`
                                            }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                            {tag}
                                        </span>
                                    ))}
                                </div>


                            </div>
                        </article>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <button
                        onClick={() => navigate('/destinations')}
                        className="
              inline-flex items-center gap-3 px-8 py-4
              bg-gradient-to-r from-amber-500 to-orange-600
              hover:from-amber-400 hover:to-orange-500
              text-white font-semibold text-lg
              rounded-full shadow-lg hover:shadow-xl
              transform transition-all duration-300
              hover:scale-105 hover:-translate-y-1
              group
            "
                    >
                        <span>Explore All Destinations</span>
                        <ArrowRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
        </section>
    );
};

export default FeaturedToursSection;
