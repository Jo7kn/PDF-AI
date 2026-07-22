// components/social-links.tsx
//
// Inline SVGs instead of lucide-react: lucide has no Discord icon and dropped
// its Twitter/X icon years ago, so Github alone from lucide would be
// inconsistent style with hand-rolled X/Discord marks.

const SOCIAL_LINKS = [
  {
    href: 'https://x.com/jxhncoder',
    label: 'X',
    path: 'M18.9 2h3.3l-7.2 8.2L23.5 22h-6.6l-5.2-6.8L5.7 22H2.4l7.7-8.8L1.9 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20z',
  },
  {
    href: 'https://github.com/Jo7kn',
    label: 'GitHub',
    path: 'M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.21-3.37-1.21-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .28.18.61.69.5A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z',
  },
  {
    href: 'https://discord.gg/rBnKFypBWk',
    label: 'Discord',
    path: 'M20.3 5.4A19.7 19.7 0 0 0 15.4 4c-.23.4-.47.95-.65 1.38a18.3 18.3 0 0 0-5.5 0C9.02 4.95 8.77 4.4 8.54 4a19.6 19.6 0 0 0-4.9 1.4C1.1 9.1.4 12.7.7 16.25a19.8 19.8 0 0 0 5.7 2.75c.46-.62.87-1.28 1.22-1.97-.67-.24-1.31-.54-1.92-.9.16-.11.32-.23.47-.36 3.7 1.68 7.7 1.68 11.36 0 .16.13.31.25.47.36-.61.36-1.25.66-1.92.9.35.69.76 1.35 1.22 1.97a19.8 19.8 0 0 0 5.7-2.75c.36-4.1-.63-7.66-2.7-10.85ZM9.68 14.1c-.9 0-1.63-.82-1.63-1.83 0-1 .72-1.83 1.63-1.83.92 0 1.65.83 1.63 1.83 0 1.01-.72 1.83-1.63 1.83Zm5.35 0c-.9 0-1.63-.82-1.63-1.83 0-1 .72-1.83 1.63-1.83.92 0 1.65.83 1.63 1.83 0 1.01-.71 1.83-1.63 1.83Z',
  },
] as const

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="text-slate-400 transition-colors duration-150 ease-out hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d={s.path} />
          </svg>
        </a>
      ))}
    </div>
  )
}
