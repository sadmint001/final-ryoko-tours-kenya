import Cookies from 'js-cookie';

const VISITOR_ID_KEY = 'site_visitor_id';
const SESSION_ID_KEY = 'site_session_id';

/**
 * Robust Visitor Identification Utility
 * Handles persistent cookies with sessionStorage fallback for privacy/block compliance.
 */
export const visitorTracking = {
    /**
     * Generates a unique UUID v4
     */
    generateUUID(): string {
        return (crypto && 'randomUUID' in crypto)
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
    },

    /**
     * Gets or creates a persistent visitor ID (365 days)
     */
    getVisitorId(): { id: string, isNew: boolean, isPersistent: boolean } {
        let id = Cookies.get(VISITOR_ID_KEY);
        let isNew = false;
        let isPersistent = true;

        if (!id) {
            // Check fallback
            id = window.sessionStorage.getItem(VISITOR_ID_KEY) || undefined;

            if (!id) {
                id = this.generateUUID();
                isNew = true;

                // Try to set cookie
                try {
                    Cookies.set(VISITOR_ID_KEY, id, {
                        expires: 365,
                        sameSite: 'strict',
                        secure: window.location.protocol === 'https:'
                    });

                    // Verify if cookie was actually set
                    if (!Cookies.get(VISITOR_ID_KEY)) throw new Error('Cookies blocked');
                } catch (e) {
                    // Fallback to sessionStorage
                    window.sessionStorage.setItem(VISITOR_ID_KEY, id);
                    isPersistent = false;
                }
            } else {
                isPersistent = false;
            }
        }

        return { id, isNew, isPersistent };
    },

    /**
     * Gets or creates a session-based ID
     */
    getSessionId(): { id: string, isNewSession: boolean } {
        let id = Cookies.get(SESSION_ID_KEY);
        let isNewSession = false;

        if (!id) {
            id = window.sessionStorage.getItem(SESSION_ID_KEY) || undefined;

            if (!id) {
                id = this.generateUUID();
                isNewSession = true;

                try {
                    Cookies.set(SESSION_ID_KEY, id, {
                        sameSite: 'strict',
                        secure: window.location.protocol === 'https:'
                    });
                    if (!Cookies.get(SESSION_ID_KEY)) throw new Error('Cookies blocked');
                } catch (e) {
                    window.sessionStorage.setItem(SESSION_ID_KEY, id);
                }
            }
        }

        return { id, isNewSession };
    }
};
