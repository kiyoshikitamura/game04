/** GAME04の公開情報。未確定値はGAME03から推測で埋めない。 */
export const GAME04_LEGAL: {
  title: string;
  status: "draft" | "published";
  effectiveDate: string | null;
  operator: string | null;
  representative: string | null;
  address: string | null;
  phone: string | null;
  supportEmail: string | null;
  serviceUrl: string | null;
  rightsHolder: string | null;
} = {
  title: "戦国姫艶武",
  status: "draft",
  effectiveDate: null,
  operator: "戦国姫艶舞 運営事務局",
  representative: "請求があった場合、遅滞なく開示いたします。",
  address: "請求があった場合、遅滞なく開示いたします。",
  phone: "請求があった場合、遅滞なく開示いたします。",
  supportEmail: "original.title.support@gmail.com",
  serviceUrl: null,
  rightsHolder: "2026 戦国姫艶舞",
};

export const pendingLegalValue = (value: string | null) => value || "正式公開までに掲載します。";

