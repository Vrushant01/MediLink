import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'medilink_cart_items';

// Global state provider for B2B procurement cart with supplier grouping and localStorage sync
export function CartProvider({ children }) {
  const { user } = useAuth();

  // Load persisted cart lines from localStorage
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync state changes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // Quiet fail if quota exceeded
    }
  }, [items]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!user) {
      setItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [user]);

  // Add an item to the cart or update existing line quantity (clamped to MOQ and live stock)
  const addItem = (line) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.catalogId === line.catalogId);
      const minQty = line.minOrderQty || 1;
      const maxStock = line.stock || 9999;
      const requestedQty = line.quantity !== undefined ? line.quantity : minQty;
      const clampedQty = Math.max(minQty, Math.min(requestedQty, maxStock));

      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...line, quantity: clampedQty };
        return next;
      }
      return [...prev, { ...line, quantity: clampedQty }];
    });
  };

  // Update quantity for a specific line item, clamped between minOrderQty and available stock
  const updateQuantity = (catalogId, qty) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.catalogId !== catalogId) return i;
        const minQty = i.minOrderQty || 1;
        const maxStock = i.stock || 9999;
        const clamped = Math.max(minQty, Math.min(Number(qty) || minQty, maxStock));
        return { ...i, quantity: clamped };
      })
    );
  };

  // Remove a single item line from the cart
  const removeItem = (catalogId) => {
    setItems((prev) => prev.filter((i) => i.catalogId !== catalogId));
  };

  // Remove all items belonging to a specific supplier (used after supplier order success)
  const clearSupplier = (supplierId) => {
    setItems((prev) => prev.filter((i) => i.supplierId !== supplierId));
  };

  // Empty the entire cart
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  // Group cart lines by supplier with individual subtotals
  const groupedBySupplier = useMemo(() => {
    const groupsMap = new Map();

    items.forEach((item) => {
      const sId = item.supplierId;
      if (!groupsMap.has(sId)) {
        groupsMap.set(sId, {
          supplierId: sId,
          supplierName: item.supplierName || 'Wholesale Supplier',
          supplierCity: item.supplierCity || '',
          items: [],
          subtotal: 0,
        });
      }
      const group = groupsMap.get(sId);
      group.items.push(item);
      group.subtotal += (item.price || 0) * (item.quantity || 1);
    });

    return Array.from(groupsMap.values());
  }, [items]);

  // Total quantity of units in the cart
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + (i.quantity || 0), 0),
    [items]
  );

  // Grand total cost across all suppliers
  const grandTotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0),
    [items]
  );

  const value = {
    items,
    itemCount,
    linesCount: items.length,
    grandTotal,
    groupedBySupplier,
    addItem,
    updateQuantity,
    removeItem,
    clearSupplier,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook exposing cart state and dispatch actions
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default useCart;
