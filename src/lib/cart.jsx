import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { PRODUCTS } from '../data/products'
import { readStorage, writeStorage, cleanField, LIMITS } from './security'

const CartCtx = createContext(null)
const KEY = 'calendria-bag-v1'

export const FREE_SHIPPING_AT = 1500
export const SHIPPING_FEE = 99
export const PROMOS = { CALENDRIA10: { pct: 10, label: '10% off your ritual' }, GLOW15: { pct: 15, label: '15% off — welcome gift' } }

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const found = state.find((i) => i.id === action.id)
      if (!known(action.id)) return state
      if (found) return state.map((i) => (i.id === action.id ? { ...i, qty: clampQty(i.qty + action.qty) } : i))
      return [...state, { id: action.id, qty: clampQty(action.qty) }]
    }
    case 'set':
      return state.map((i) => (i.id === action.id ? { ...i, qty: clampQty(action.qty) } : i))
    case 'remove':
      return state.filter((i) => i.id !== action.id)
    case 'clear':
      return []
    default:
      return state
  }
}

// Stored bag is user-editable, so rebuild it from scratch: known products only, whole quantities 1-9, no duplicates.
function load() {
  const parsed = readStorage(KEY, [])
  if (!Array.isArray(parsed)) return []
  const seen = new Set()
  const out = []
  for (const i of parsed.slice(0, PRODUCTS.length)) {
    if (!i || typeof i.id !== 'string' || seen.has(i.id) || !PRODUCTS.some((p) => p.id === i.id)) continue
    const qty = Math.trunc(Number(i.qty))
    if (!Number.isFinite(qty)) continue
    seen.add(i.id)
    out.push({ id: i.id, qty: Math.max(1, Math.min(9, qty)) })
  }
  return out
}

const clampQty = (q) => {
  const n = Math.trunc(Number(q))
  return Number.isFinite(n) ? Math.max(1, Math.min(9, n)) : 1
}
const known = (id) => PRODUCTS.some((p) => p.id === id)

/* ------------------------- full-page bag / checkout routing ------------------------- */
// #bag -> full bag, #checkout -> details + payment, #order -> confirmation
const PAGES = { '#bag': 'bag', '#checkout': 'checkout', '#order': 'done' }
const HASH = { bag: '#bag', checkout: '#checkout', done: '#order' }
const pageFromHash = () => (typeof window === 'undefined' ? null : PAGES[window.location.hash] ?? null)

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [panel, setPanel] = useState(null) // 'search' | 'account' | null
  const [page, setPageState] = useState(pageFromHash)
  const [promo, setPromo] = useState(null)
  const [order, setOrder] = useState(null)
  const [bump, setBump] = useState(0)
  const [toast, setToast] = useState(null)

  useEffect(() => writeStorage(KEY, items), [items])

  // browser back / forward moves between bag, checkout and the store
  useEffect(() => {
    const onPop = () => setPageState(pageFromHash())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const setPage = useCallback((next, { replace = false } = {}) => {
    setPageState(next)
    const url = next ? HASH[next] : window.location.pathname + window.location.search
    if (replace || !next) history.replaceState(null, '', url)
    else history.pushState(null, '', url)
  }, [])

  const value = useMemo(() => {
    const lines = items
      .map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.id) }))
      .filter((l) => l.product)
    const count = lines.reduce((s, l) => s + l.qty, 0)
    const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0)
    const discount = promo ? Math.round((subtotal * PROMOS[promo].pct) / 100) : 0
    const afterDiscount = subtotal - discount
    const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE
    const total = afterDiscount + shipping
    return {
      lines,
      count,
      subtotal,
      discount,
      shipping,
      total,
      promo,
      order,
      open,
      detail,
      panel,
      page,
      bump,
      toast,
      setOpen,
      setDetail,
      setPanel,
      setPage,
      setToast,
      applyPromo: (code) => {
        const c = String(code).trim().toUpperCase().slice(0, LIMITS.promo)
        if (!Object.hasOwn(PROMOS, c)) return false
        setPromo(c)
        return true
      },
      clearPromo: () => setPromo(null),
      add: (id, qty = 1) => {
        dispatch({ type: 'add', id, qty })
        setBump((b) => b + 1)
        const p = PRODUCTS.find((x) => x.id === id)
        setToast({ key: Date.now(), text: `${p?.name ?? 'Item'} added to your bag` })
      },
      setQty: (id, qty) => dispatch({ type: 'set', id, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
      /** Demo order: nothing is sent anywhere — the confirmation is built locally. */
      placeOrder: (raw) => {
        // only the expected fields, cleaned and capped, ever reach the order object
        const details = Object.fromEntries(Object.keys(LIMITS).filter((k) => k in raw).map((k) => [k, cleanField(raw[k], LIMITS[k])]))
        if (typeof raw.state === 'string') details.state = cleanField(raw.state, 60)
        const placed = new Date()
        const eta = (d) => new Date(placed.getTime() + d * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
        const o = {
          id: `CAL-${String(Math.floor(100000 + Math.random() * 900000))}`,
          lines,
          subtotal,
          discount,
          shipping,
          total,
          promo,
          details,
          payment: 'Cash on Delivery',
          eta: `${eta(4)} – ${eta(6)}`,
        }
        setOrder(o)
        dispatch({ type: 'clear' })
        setPromo(null)
        setPageState('done')
        history.replaceState(null, '', HASH.done)
        return o
      },
    }
  }, [items, open, detail, panel, page, promo, order, bump, toast, setPage])

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export const useCart = () => useContext(CartCtx)
