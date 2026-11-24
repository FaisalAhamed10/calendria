# CALENDRIA — botanical skincare (demo storefront)

React + Vite + Tailwind + GSAP/ScrollTrigger + Lenis + React Three Fiber.

```
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

- All 3D (calendula bloom, serum/cream/cleanser/oil bottles) is procedural in `src/three/` — no model files to load. Product photography in `public/images/` was cropped from the supplied campaign grid.
- Every 3D canvas pauses when off-screen and falls back to photography if WebGL is unavailable.
- `prefers-reduced-motion` disables smooth scroll, pinning and the preloader.
- Checkout, account and contact form are front-end demos: nothing is sent or charged.

## Security

- **Headers:** `security-headers.js` is the single source. `npm run build` writes `dist/_headers` (Netlify / Cloudflare Pages) with CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy and COOP/CORP, and adds the CSP as a `<meta>` tag for hosts that ignore `_headers`. `npm run preview` serves the build with the same headers.
- **Inputs:** `src/lib/security.js` strips control / bidi-override characters, caps every field length, and tightens email checks. Contact and checkout forms have a hidden honeypot field and a re-submit guard.
- **Storage:** the saved bag is rebuilt on load (known products only, quantities 1–9, no duplicates), so a tampered `localStorage` value can't break the page.
- **Still demo-only:** nothing is sent to a server. Once real orders or messages are wired up, validate and rate-limit again on the server; client checks are only a first line.
- `npm audit`: one remaining dev-server-only esbuild advisory (affects `npm run dev`, not the built site); clearing it needs a Vite major upgrade.
