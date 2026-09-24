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
  operator: null,
  representative: null,
  address: null,
  phone: null,
  supportEmail: "original.title.support@gmail.com",
  serviceUrl: null,
  rightsHolder: null,
};

export const pendingLegalValue = (value: string | null) => value || "正式公開までに掲載します。";
