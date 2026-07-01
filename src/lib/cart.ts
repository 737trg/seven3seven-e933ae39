import { useSyncExternalStore } from 'react';

/**
 * Unified cart shared between product pages, /cart, and checkout.
 * Storage key MUST stay `s3s.cart.v1` — existing BTB+ and S.E.M. product
 * pages already read/write this key.
 */
export type CartItemSlug = 'basic-training-blueprint-plus' | 'sem-2026' | 'hybrid-race-plan';

export type CartState = {
  hasBtb?: boolean;
  hasSem?: boolean;
  hasHrp?: boolean;
};

const KEY = 's3s.cart.v1';
const EVT = 's3s-cart';

function read(): CartState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartState) : {};
  } catch {
    return {};
  }
}

function write(next: CartState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVT));
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  const handler = () => l();
  if (typeof window !== 'undefined') {
    window.addEventListener(EVT, handler);
    window.addEventListener('storage', handler);
  }
  return () => {
    listeners.delete(l);
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVT, handler);
      window.removeEventListener('storage', handler);
    }
  };
}

let snap: CartState = {};
let snapInit = false;
function getSnapshot(): CartState {
  if (!snapInit && typeof window !== 'undefined') {
    snap = read();
    snapInit = true;
    window.addEventListener(EVT, () => {
      snap = read();
      emit();
    });
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) {
        snap = read();
        emit();
      }
    });
  }
  return snap;
}
const empty: CartState = {};
function serverSnapshot(): CartState {
  return empty;
}

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}

export const cart = {
  read,
  add(slug: CartItemSlug) {
    const c = read();
    if (slug === 'basic-training-blueprint-plus') c.hasBtb = true;
    if (slug === 'sem-2026') c.hasSem = true;
    if (slug === 'hybrid-race-plan') c.hasHrp = true;
    write(c);
  },
  remove(slug: CartItemSlug) {
    const c = read();
    if (slug === 'basic-training-blueprint-plus') c.hasBtb = false;
    if (slug === 'sem-2026') c.hasSem = false;
    if (slug === 'hybrid-race-plan') c.hasHrp = false;
    write(c);
  },
  clear() {
    write({});
  },
  slugs(state: CartState = read()): CartItemSlug[] {
    const list: CartItemSlug[] = [];
    if (state.hasBtb) list.push('basic-training-blueprint-plus');
    if (state.hasSem) list.push('sem-2026');
    if (state.hasHrp) list.push('hybrid-race-plan');
    return list;
  },
  isEmpty(state: CartState = read()): boolean {
    return !state.hasBtb && !state.hasSem && !state.hasHrp;
  },
};

export const CART_CATALOG: Record<CartItemSlug, {
  slug: CartItemSlug;
  title: string;
  durationLabel: string;
  pricePence: number;
  stripePriceId: string;
}> = {
  'basic-training-blueprint-plus': {
    slug: 'basic-training-blueprint-plus',
    title: 'Basic Training Blueprint+',
    durationLabel: '12-week programme',
    pricePence: 1999,
    stripePriceId: 'basic_training_blueprint_plus_lifetime',
  },
  'sem-2026': {
    slug: 'sem-2026',
    title: 'S.E.M 2026',
    durationLabel: '8-week programme',
    pricePence: 1999,
    stripePriceId: 'sem_2026_lifetime',
  },
  'hybrid-race-plan': {
    slug: 'hybrid-race-plan',
    title: 'Hybrid Race Plan',
    durationLabel: '12-week programme',
    pricePence: 1999,
    stripePriceId: 'hybrid_race_plan_lifetime',
  },
};