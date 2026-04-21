import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  name_en?: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
}

interface CartItemIdentity {
  id: string;
  size?: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: CartItemIdentity }
  | { type: 'UPDATE_QTY'; payload: CartItemIdentity & { quantity: number } }
  | { type: 'CLEAR' };

const isSameCartItem = (item: CartItem, target: CartItemIdentity) =>
  item.id === target.id && item.size === target.size;

const reducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find((i) => isSameCartItem(i, action.payload));
      if (exists) {
        return {
          items: state.items.map((i) =>
            isSameCartItem(i, action.payload)
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => !isSameCartItem(i, action.payload)) };
    case 'UPDATE_QTY':
      return {
        items: state.items.map((i) =>
          isSameCartItem(i, action.payload) ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
};

interface CartContext {
  items: CartItem[];
  cart: CartItem[];
  count: number;
  total: number;
  getCartTotal: () => number;
  addItem: (item: CartItem) => void;
  removeItem: (item: CartItemIdentity) => void;
  updateQuantity: (item: CartItemIdentity, quantity: number) => void;
  clearCart: () => void;
}

const CartCtx = createContext<CartContext | null>(null);

const STORAGE_KEY = 'namat_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] }, () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { items: [] };
    } catch {
      return { items: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const count = state.items.reduce((acc, i) => acc + i.quantity, 0);
  const total = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartCtx.Provider value={{
      items: state.items,
      cart: state.items,
      count,
      total,
      getCartTotal: () => total,
      addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
      removeItem: (item) => dispatch({ type: 'REMOVE_ITEM', payload: item }),
      updateQuantity: (item, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { ...item, quantity } }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
