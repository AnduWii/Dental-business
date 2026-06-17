/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Twilio's node SDK is server-only; keep it out of the client bundle.
  serverExternalPackages: ["twilio"],
};

export default nextConfig;
