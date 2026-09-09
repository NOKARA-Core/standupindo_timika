/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mock-storage.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    // Build CSP directives
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: Next.js hydration, Turbopack, inline scripts and eval for dev mode
      isDev
        ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: Google Fonts stylesheets and inline CSS
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts: Google Fonts static files and local fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Images: Self, blob, data URIs, and authorized CDNs/storage
      "img-src 'self' data: blob: https://res.cloudinary.com https://mock-storage.supabase.co https://*.supabase.co https://images.unsplash.com https://*.google.com https://maps.google.com https://*.gstatic.com",
      // Media (audio/video)
      "media-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co",
      // Connect: Self, Supabase APIs, local/remote backend APIs, and Google font preconnect
      isDev
        ? "connect-src 'self' https://*.supabase.co https://res.cloudinary.com https://fonts.googleapis.com https://fonts.gstatic.com http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*"
        : "connect-src 'self' https://*.supabase.co https://res.cloudinary.com https://fonts.googleapis.com https://fonts.gstatic.com",
      // Frame src: Google Maps embed iframe
      "frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com",
      // Prevent embedding this site inside untrusted iframes
      "frame-ancestors 'self'",
      // Object & base restrictions
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    const cspHeaderValue = cspDirectives.join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeaderValue,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
