import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "pdfkit", "fontkit"],
  outputFileTracingIncludes: {
    "/**": ["./node_modules/pdfkit/js/**/*"],
  },
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;