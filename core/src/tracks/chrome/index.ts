import type { Lightrail, LightrailTrack } from "lightrail-sdk";

export default class Track implements LightrailTrack {
  lightrail: Lightrail;

  constructor(lightrail) {
    this.lightrail = lightrail;
  }

  async init() {
    const lightrail = this.lightrail;

    const handle = lightrail.registerToken({
      name: "chrome-current-page",
      description: "Google Chrome Current Page",
      args: [],
      color: "#f8bd13",
      async handler(args, prompt) {
        const TurndownService = require("turndown");
        const ArticleExtractor = require("@extractus/article-extractor");
        const turndownService = new TurndownService();

        const { url, content } = await lightrail.sendEvent(
          {
            name: "chrome:get-current-page",
            data: {},
          },
          "chrome-client"
        );

        const article = await ArticleExtractor.extractFromHtml(content);
        console.log(article);

        const markdown = turndownService.turndown(article.content);

        prompt.appendContextItem({
          type: "text",
          title: url,
          content: markdown,
        });

        prompt.appendText(url);

        return prompt;
      },
      renderer(_args) {
        return "chrome-current-page";
      },
    });

    if (lightrail.isRenderer) {
      lightrail.registerEventListener("chrome:new-page", async () => {
        handle?.prioritize();
      });

      lightrail.registerEventListener(
        "lightrail:client-disconnected",
        async ({ data }) => {
          if (data.name === "chrome-client") {
            handle?.disable();
          }
        }
      );
      lightrail.registerEventListener(
        "lightrail:client-connected",
        async ({ data }) => {
          if (data.name === "chrome-client") {
            handle?.enable();
          }
        }
      );
    }
  }
}