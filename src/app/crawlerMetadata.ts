export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SITE_TITLE = "戦国姫艶武｜dev";
export const SITE_DESCRIPTION =
  "ブラウザRPG『戦国姫艶武』の開発環境。";
export const SOCIAL_IMAGE_PATH = "/ogp-image.png";

export function isVercelProduction(): boolean {
  return false; // GAME04 devは検索対象にしない
}
