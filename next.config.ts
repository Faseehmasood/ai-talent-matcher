import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist"],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/hr/login",
        destination: "/hr-login",
      },
      {
        source: "/employers/login",
        destination: "/hr-login",
      },
      {
        source: "/candidate/login",
        destination: "/login",
      },
    ]
  },
}

export default nextConfig
