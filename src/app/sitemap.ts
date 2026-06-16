import type { MetadataRoute } from "next";

const BASE = "https://ahmedzaheer.dev"; // placeholder until the domain is live

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/player", "/stats", "/work", "/quest", "/campaign", "/contact"];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
