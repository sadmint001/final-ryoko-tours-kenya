import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { logPageView, getCookieConsent } from '@/lib/analytics';
import CookieConsent from './CookieConsent';

interface AnalyticsContextType {
    consentGiven: boolean;
    setConsent: (consent: boolean) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [consentGiven, setConsentGiven] = useState<boolean>(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = getCookieConsent();
        setConsentGiven(consent);

        // Show banner if no consent has been set yet
        if (localStorage.getItem('ryoko_cookie_consent_set') !== 'true') {
            setShowBanner(true);
        }
    }, []);

    useEffect(() => {
        // Always attempt to log page view; internal logic in logPageView
        // handles consent/anonymization for "fail-proof" tracking.
        logPageView(location.pathname);
    }, [location.pathname]);

    const handleSetConsent = (consent: boolean) => {
        setConsentGiven(consent);
        import('@/lib/analytics').then(m => m.setCookieConsent(consent));
        localStorage.setItem('ryoko_cookie_consent_set', 'true');
        setShowBanner(false);
    };

    return (
        <AnalyticsContext.Provider value={{ consentGiven, setConsent: handleSetConsent }}>
            {children}
            {showBanner && <CookieConsent onAccept={() => handleSetConsent(true)} onDecline={() => handleSetConsent(false)} />}
        </AnalyticsContext.Provider>
    );
};
