import Link from "next/link";
import { GAME04_LEGAL } from "./legalConfig";

export default function SupportContact() {
  return GAME04_LEGAL.supportEmail ? (
    <a href={`mailto:${GAME04_LEGAL.supportEmail}`}>{GAME04_LEGAL.supportEmail}</a>
  ) : (
    <Link href="/legal/contact">お問い合わせ窓口のご案内</Link>
  );
}
