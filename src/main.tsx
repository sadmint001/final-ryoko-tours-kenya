import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import { logPageView } from '@/lib/analytics'

// Log first view
// try { logPageView(location.pathname); } catch {}

// Log on SPA navigations
const origPush = history.pushState;
history.pushState = function (...args) {
  const ret = origPush.apply(this, args as any);
  // try { logPageView(location.pathname); } catch {}
  return ret;
} as any;

window.addEventListener('popstate', () => {
  // try { logPageView(location.pathname); } catch {}
});

createRoot(document.getElementById("root")!).render(<App />);

