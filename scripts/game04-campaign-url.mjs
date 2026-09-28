import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const config = JSON.parse(await readFile(new URL("../config/game04-acquisition.json", import.meta.url), "utf8"));

export function buildGame04CampaignUrl({ source, campaign, creative, origin = config.previewOrigin }) {
  if (!config.sources.includes(source)) throw new Error("source must be x or meta.");
  if (!/^[a-z0-9][a-z0-9_-]{0,99}$/.test(campaign || "")) throw new Error("campaign must be a lowercase slug (1–100 characters).");
  if (!/^[a-z0-9][a-z0-9_-]{0,99}$/.test(creative || "")) throw new Error("creative must be a lowercase slug (1–100 characters).");
  const url = new URL(origin);
  const previewHost = /^game04(?:-[a-z0-9-]+)?\.vercel\.app$/.test(url.hostname);
  const approvedProduction = config.productionOrigin && url.origin === config.productionOrigin;
  if (url.protocol !== "https:" || (!previewHost && !approvedProduction) || url.username || url.password) {
    throw new Error("Use a GAME04 Preview origin. Production domain is not configured yet.");
  }
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", config.medium);
  url.searchParams.set("utm_campaign", campaign.startsWith(config.campaignPrefix) ? campaign : `${config.campaignPrefix}${campaign}`);
  url.searchParams.set("utm_content", creative);
  return url.href;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [source, campaign, creative, origin] = process.argv.slice(2);
  try { console.log(buildGame04CampaignUrl({ source, campaign, creative, origin })); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
