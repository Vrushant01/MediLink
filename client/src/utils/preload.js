// Route loaders mapping for React.lazy code-splitting and sidebar prefetching
export const routeLoaders = {
  '/store': () => import('../pages/store/Dashboard'),
  '/store/inventory': () => import('../pages/store/Inventory'),
  '/store/alerts': () => import('../pages/store/Alerts'),
  '/store/browse': () => import('../pages/store/Browse'),
  '/store/orders': () => import('../pages/store/Orders'),
  '/store/cart': () => import('../pages/store/Cart'),
  '/supplier': () => import('../pages/SupplierDashboard'),
  '/supplier/catalog': () => import('../pages/SupplierCatalog'),
  '/supplier/orders': () => import('../pages/SupplierOrders'),
  '/admin': () => import('../pages/AdminApprovals'),
  '/login': () => import('../pages/Login'),
  '/register': () => import('../pages/Register'),
};

// Preloads a route chunk on hover or focus to ensure zero latency on click
export const preloadRoute = (path) => {
  if (routeLoaders[path]) {
    routeLoaders[path]();
  }
};
