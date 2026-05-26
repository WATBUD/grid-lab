import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QuantLab | ETH Fibonacci Martingale Terminal",
    short_name: "QuantLab",
    description: "ETH 5-Min K-Line Fibonacci Martingale Strategy Simulator with 10x Leverage",
    start_url: "/",
    display: "standalone",
    background_color: "#06080d",
    theme_color: "#06080d",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
