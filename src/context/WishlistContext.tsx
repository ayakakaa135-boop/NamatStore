import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface WishlistContext {
  items: string[];
  count: number;
  toggle: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

const WishlistCtx = createContext<WishlistContext | null>(null);

const STORAGE_KEY = 'namat_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggle = (id: string) => {
    setItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isWishlisted = (id: string) => items.includes(id);

  return (
    <WishlistCtx.Provider value={{ items, count: items.length, toggle, isWishlisted }}>
      {children}
    </WishlistCtx.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistCtx);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
}
