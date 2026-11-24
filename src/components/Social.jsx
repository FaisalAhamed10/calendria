const paths = {
  Instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" />
    </>
  ),
  Pinterest: (
    <>
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11.2 8.2c2.9-.6 4.9 1 4.6 3.4-.3 2.3-1.9 3.6-3.6 3.2-.9-.2-1.3-.9-1.3-.9l-1.3 5.3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.4 13.4c-.9-2.2.2-4.6 1.8-5.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  Facebook: (
    <path d="M13.6 21v-7.6h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H8v3h2.6V21" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  ),
}

export const SOCIALS = [
  { name: 'Instagram', href: 'https://www.instagram.com/' },
  { name: 'Pinterest', href: 'https://www.pinterest.com/' },
  { name: 'Facebook', href: 'https://www.facebook.com/' },
]

export function SocialIcon({ name, size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

export default function SocialLinks({ className = '', itemClass = '' }) {
  return (
    <ul className={`flex gap-3 ${className}`}>
      {SOCIALS.map((s) => (
        <li key={s.name}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`CALENDRIA on ${s.name}`}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 hover:-translate-y-0.5 ${itemClass}`}
          >
            <SocialIcon name={s.name} />
          </a>
        </li>
      ))}
    </ul>
  )
}
