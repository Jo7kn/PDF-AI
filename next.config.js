/** @type {import('next').NextConfig} */
const nextConfig = {
  // Toglie "X-Powered-By: Next.js" dalle risposte — nessun beneficio nel
  // dichiararlo, solo informazione gratis per chi fa fingerprinting.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
