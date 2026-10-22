import { useState, useEffect, useRef, Suspense } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { timeAgo } from '../utils/format';
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  ShoppingBag,
  ClipboardList,
  Boxes,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Bell,
  LogOut,
  Menu,
  Check,
  X,
} from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';
import PageSkeleton from '../components/PageSkeleton';
import { preloadRoute } from '../utils/preload';

// Main application layout featuring a 236px dark ledger sidebar, top bar, and real-time notification popover
export default function AppLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { linesCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      // Quiet fail on background notification poll
    }
  };

  // Initial load and 60-second periodic poll
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close notification popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setNotifPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Unable to mark notifications as read');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        // Quiet fail
      }
    }
    setNotifPopoverOpen(false);

    if (notif.type === 'expiry') {
      const isExpired = notif.message?.toLowerCase().includes('expired');
      navigate(isExpired ? '/store/alerts?tab=expired' : '/store/alerts?tab=expiring');
    } else if (notif.type === 'lowstock') {
      navigate('/store/alerts?tab=lowstock');
    } else if (notif.type === 'order') {
      if (user?.role === 'supplier') {
        navigate('/supplier/orders');
      } else {
        navigate('/store/orders');
      }
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Signed out of MediLink');
    navigate('/login');
  };

  // Role-specific navigation links
  const getNavLinks = () => {
    switch (user?.role) {
      case 'store':
        return [
          { to: '/store', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/store/inventory', label: 'Inventory', icon: Package },
          { to: '/store/alerts', label: 'Expiry alerts', icon: AlertTriangle },
          { to: '/store/browse', label: 'Browse suppliers', icon: ShoppingBag },
          { to: '/store/orders', label: 'My orders', icon: ClipboardList },
        ];
      case 'supplier':
        return [
          { to: '/supplier', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/supplier/catalog', label: 'My catalog', icon: Boxes },
          { to: '/supplier/orders', label: 'Orders', icon: Receipt },
        ];
      case 'admin':
        return [
          { to: '/admin', label: 'Overview and approvals', icon: ShieldCheck, end: true },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const getInitials = (name) => {
    if (!name) return 'ML';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p === '/store') return 'Store / Dashboard';
    if (p === '/store/inventory') return 'Store / Inventory';
    if (p === '/store/alerts') return 'Store / Expiry alerts';
    if (p === '/store/browse') return 'Store / Browse suppliers';
    if (p === '/store/orders') return 'Store / My orders';
    if (p === '/store/cart') return 'Store / Order cart';
    if (p === '/supplier') return 'Supplier / Dashboard';
    if (p === '/supplier/catalog') return 'Supplier / My catalog';
    if (p === '/supplier/orders') return 'Supplier / Orders';
    if (p === '/admin') return 'Admin / Overview and approvals';
    return 'MediLink';
  };

  return (
    <div className="min-h-screen bg-paper flex">
      {/* SIDEBAR: Desktop 236px wide with #0B3327 background */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[236px] bg-[#0B3327] text-paper flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Logo & Role Badge */}
          <div className="p-5 border-b border-[#124536] flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-[5px] bg-accent relative flex items-center justify-center shrink-0">
                  <div className="absolute w-3 h-0.5 bg-surface rounded-[1px]" />
                  <div className="absolute w-0.5 h-3 bg-surface rounded-[1px]" />
                </div>
                <span className="font-display text-[22px] font-medium tracking-normal text-paper leading-none">
                  MediLink
                </span>
              </div>
              <span className="text-[11px] font-sans tracking-[0.08em] text-[#8DBAA8] mt-1.5 pl-8">
                {user?.role === 'store'
                  ? 'Store Portal'
                  : user?.role === 'supplier'
                    ? 'Supplier Portal'
                    : 'Admin Portal'}
              </span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-paper/70 hover:text-paper p-1 rounded"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="p-3">
            <div className="px-3 pt-2 pb-1.5 text-[11px] font-sans font-medium uppercase tracking-[0.08em] text-paper/50 select-none">
              Workspace
            </div>
            <nav className="space-y-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onMouseEnter={() => preloadRoute(item.to)}
                  onFocus={() => preloadRoute(item.to)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 h-10 rounded-[6px] text-[14px] font-sans font-medium transition-colors duration-150 relative select-none ${
                      isActive
                        ? 'bg-white/[0.12] text-paper relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-accent pl-[10px]'
                        : 'text-paper/75 hover:bg-white/[0.08] hover:text-paper'
                    }`
                  }
                >
                  <item.icon className="w-[18px] h-[18px] stroke-[1.5] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom User Block with 32px Avatar & Logout */}
        <div className="p-4 border-t border-[#124536] bg-[#08281E]">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-white/[0.14] text-paper font-sans text-xs font-medium flex items-center justify-center shrink-0 select-none">
                {getInitials(user?.businessName || user?.name)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[14px] font-sans font-medium text-paper truncate leading-tight">
                  {user?.businessName || user?.name}
                </p>
                <p className="text-[12px] font-sans text-paper/60 truncate mt-0.5">
                  {user?.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-paper/60 hover:text-paper hover:bg-white/[0.08] p-1.5 rounded-[4px] transition-colors shrink-0"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-30 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* RIGHT CONTENT WRAPPER */}
      <div className="flex-1 md:ml-[236px] flex flex-col min-w-0">
        {/* Top bar (64px high, paper background, 1px bottom border in line color) */}
        <header className="h-16 bg-paper border-b border-line px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-[6px] border border-line bg-surface text-ink hover:bg-paper transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-sans font-medium text-ink-soft hidden sm:inline select-none">
              {getBreadcrumb()}
            </span>
          </div>

          {/* Right Header Actions: Cart, Bell, User Avatar */}
          <div className="flex items-center gap-2.5">
            {/* Cart Button (for stores only): 40px square ghost button */}
            {user?.role === 'store' && (
              <Link
                to="/store/cart"
                onMouseEnter={() => preloadRoute('/store/cart')}
                onFocus={() => preloadRoute('/store/cart')}
                className="w-10 h-10 border border-line bg-surface hover:bg-paper/60 rounded-[6px] flex items-center justify-center relative text-ink transition-colors"
                title="View order cart"
                aria-label="View order cart"
              >
                <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                {linesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-surface text-[10px] font-sans font-medium flex items-center justify-center">
                    {linesCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell with Popover: 40px square ghost button */}
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => setNotifPopoverOpen((prev) => !prev)}
                className="w-10 h-10 border border-line bg-surface hover:bg-paper/60 rounded-[6px] flex items-center justify-center text-ink transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 stroke-[1.5]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-surface text-[10px] font-sans font-medium flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notifPopoverOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-line rounded-[10px] shadow-modal z-50 overflow-hidden animate-fade-in">
                  <div className="p-3.5 border-b border-line flex items-center justify-between bg-paper/50">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-sans font-medium text-ink">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-sans bg-accent text-surface font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-brand hover:underline font-medium flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-line">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-ink-soft italic">
                        You are all caught up.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleNotificationClick(notif)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleNotificationClick(notif);
                          }}
                          className={`p-3.5 text-xs transition-colors flex items-start gap-2.5 cursor-pointer hover:bg-paper select-none ${
                            notif.read ? 'bg-surface text-ink-soft' : 'bg-[#FAF7EE] text-ink font-medium'
                          }`}
                        >
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="leading-snug text-[13px]">{notif.message}</p>
                            <span className="text-[11px] font-sans text-ink-soft/70 mt-1 block">
                              {timeAgo(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar in Topbar */}
            <div
              className="w-8 h-8 rounded-full bg-paper border border-line text-ink font-sans text-xs font-medium flex items-center justify-center shrink-0 select-none ml-1 hidden sm:flex"
              title={user?.businessName || user?.name}
            >
              {getInitials(user?.businessName || user?.name)}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA: max 1240px, 32px padding, opacity-only fade-in */}
        <main className="p-6 sm:p-8 max-w-[1240px] w-full mx-auto flex-1 flex flex-col min-w-0">
          <div key={location.pathname} className="page-fade-in flex-1 flex flex-col min-w-0">
            <ErrorBoundary>
              <Suspense fallback={<PageSkeleton />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
