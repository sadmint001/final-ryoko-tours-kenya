import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setCookieConsent } from '@/lib/analytics';

interface CookieConsentProps {
    onAccept: () => void;
    onDecline: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
    const handleAccept = () => {
        setCookieConsent(true);
        onAccept();
    };

    const handleDecline = () => {
        setCookieConsent(false);
        onDecline();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100]"
            >
                <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-3xl p-6 md:p-8 overflow-hidden relative group">
                    {/* Decorative element */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Cookie className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Cookie Preferences</h3>
                                <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest">
                                    <ShieldCheck className="w-3 h-3" />
                                    GDPR Compliant
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                            We use cookies to enhance your experience, analyze site traffic, and assist in our marketing efforts. By clicking "Accept All", you consent to our use of cookies.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                onClick={handleDecline}
                                className="rounded-2xl border-slate-200 dark:border-white/10 h-12 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Essential Only
                            </Button>
                            <Button
                                onClick={handleAccept}
                                className="rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 h-12 shadow-xl hover:shadow-2xl transition-all"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Accept All
                            </Button>
                        </div>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-4">
                            Read our <a href="/privacy-policy" className="underline hover:text-amber-500 transition-colors">Privacy Policy</a> to learn more.
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CookieConsent;
