/** @type {import('next').NextConfig} */
const nextConfig = {
  // SkillPilot AI frontend is client-driven and can be deployed as a static
  // Next.js export on Cloudflare Pages. The Express API remains on Render.
  output: 'export',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
