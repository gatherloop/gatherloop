import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://gatherloop.github.io",
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "id",
        locales: {
          id: "id",
          en: "en",
        },
      },
      serialize(item) {
        const idLink = item.links?.find((link) => link.lang === "id");
        if (!idLink) return item;
        return {
          ...item,
          links: [...item.links, { url: idLink.url, lang: "x-default" }],
        };
      },
    }),
  ],
  i18n: {
    defaultLocale: "id",
    locales: ["id", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
