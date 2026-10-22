import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageSkeleton from './components/PageSkeleton';
import { routeLoaders } from './utils/preload';

// Layouts
import AppLayout from './layouts/AppLayout';

// Lazy-loaded pages with chunk preloading capability
const Login = lazy(routeLoaders['/login']);
const Register = lazy(routeLoaders['/register']);

// Store Pages
const StoreDashboard = lazy(routeLoaders['/store']);
const StoreInventory = lazy(routeLoaders['/store/inventory']);
const StoreAlerts = lazy(routeLoaders['/store/alerts']);
const StoreBrowse = lazy(routeLoaders['/store/browse']);
const StoreOrders = lazy(routeLoaders['/store/orders']);
const StoreCart = lazy(routeLoaders['/store/cart']);

// Supplier Pages
const SupplierDashboard = lazy(routeLoaders['/supplier']);
const SupplierCatalog = lazy(routeLoaders['/supplier/catalog']);
const SupplierOrders = lazy(routeLoaders['/supplier/orders']);

// Admin Pages
const AdminApprovals = lazy(routeLoaders['/admin']);
const NotFound = lazy(() => import('./pages/NotFound'));

// Root redirect handler directing users based on their active role
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <div className="text-center font-sans text-[13px] text-ink-soft animate-pulse">
          Loading MediLink...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'store') return <Navigate to="/store" replace />;
  if (user.role === 'supplier') return <Navigate to="/supplier" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Store Portal Routes */}
                <Route
                  path="/store"
                  element={
                    <ProtectedRoute allowedRoles={['store']}>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StoreDashboard />} />
                  <Route path="inventory" element={<StoreInventory />} />
                  <Route path="alerts" element={<StoreAlerts />} />
                  <Route path="browse" element={<StoreBrowse />} />
                  <Route path="orders" element={<StoreOrders />} />
                  <Route path="cart" element={<StoreCart />} />
                </Route>

                {/* Supplier Portal Routes */}
                <Route
                  path="/supplier"
                  element={
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<SupplierDashboard />} />
                  <Route path="catalog" element={<SupplierCatalog />} />
                  <Route path="orders" element={<SupplierOrders />} />
                </Route>

                {/* Admin Portal Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminApprovals />} />
                </Route>

                {/* Root role dispatcher */}
                <Route path="/" element={<RootRedirect />} />

                {/* Catch-all fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
