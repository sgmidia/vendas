import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import EditNotifications from './pages/EditNotifications';
import WebhookConfig from './pages/WebhookConfig';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/history', label: 'Histórico', icon: 'notifications' },
  { to: '/settings', label: 'Config', icon: 'settings' },
];

export default function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-dvh bg-surface">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface safe-top">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">sensors</span>
            <span className="font-headline font-bold text-on-surface tracking-tight text-base">Command Center</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="relative w-2 h-2">
              <div className="w-2 h-2 rounded-full bg-tertiary relative pulse-dot"></div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Live</span>
          </div>
        </div>
        <div className="h-px bg-surface-container-low" />
      </header>

      {/* Page content */}
      <main className="flex-1 pt-14 pb-20 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/edit-notifications" element={<EditNotifications />} />
          <Route path="/settings" element={<WebhookConfig />} />
        </Routes>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface safe-bottom border-t-0">
        <div className="h-px bg-surface-container" />
        <div className="flex items-center justify-around px-4 h-16">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-primary'
                    : 'text-on-surface-variant'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${isActive ? 'bg-primary-container/30' : ''}`}>
                    <span className={`material-symbols-outlined text-xl transition-all duration-200`}
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
