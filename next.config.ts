import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf.js v6 ships its web worker as an ESM module (`.mjs`). It is served
  // from `public/pdf.worker.min.mjs` so pdf.js can instantiate it in the
  // browser. Ensure the file is served with the correct JavaScript MIME
  // type so the worker scripts load successfully.
  async headers() {
    return [
      {
        source: "/pdf.worker.min.mjs",
        headers: [
          {
            key: "Content-Type",
            value: "text/javascript",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
