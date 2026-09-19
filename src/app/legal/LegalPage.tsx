"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LEGAL_SETTINGS_RETURN_QUERY, LEGAL_SETTINGS_RETURN_VALUE } from "@/utils/legalSettingsReturn";
import "./legal.css";
import { GAME04_LEGAL } from "./legalConfig";

type LegalPageProps = {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
  returnToGame?: boolean;
};

export default function LegalPage({ title, updatedAt, children, returnToGame = false }: LegalPageProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState({ top: 0, height: 100 });

  const updateScrollProgress = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
    const height = Math.max(12, Math.min(100, (element.clientHeight / element.scrollHeight) * 100));
    const top = maxScroll === 0 ? 0 : (element.scrollTop / maxScroll) * (100 - height);
    setScrollProgress({ top, height });
  }, []);

  useEffect(() => {
    updateScrollProgress();
    const element = scrollRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateScrollProgress);
    observer.observe(element);
    const card = element.querySelector(".legal-page-card");
    if (card) observer.observe(card);
    return () => observer.disconnect();
  }, [updateScrollProgress]);

  const legalHref = (path: string) => returnToGame ? `${path}?from=settings` : path;
  const closeToGame = () => {
    window.location.replace(`/?${LEGAL_SETTINGS_RETURN_QUERY}=${LEGAL_SETTINGS_RETURN_VALUE}`);
  };

  return (
    <main
      ref={scrollRef}
      className={`legal-page${returnToGame ? " legal-page--from-game" : ""}`}
      onScroll={updateScrollProgress}
    >
      <section className="legal-page-card" aria-labelledby="legal-page-title">
        {!returnToGame && <Link href="/" className="legal-page-back">← タイトルへ戻る</Link>}
        <p className="legal-page-brand">{GAME04_LEGAL.title}</p>
        <h1 id="legal-page-title">{title}</h1>
        <p className="legal-page-updated">{GAME04_LEGAL.status === "draft" ? "草案更新日" : "施行日"}：{GAME04_LEGAL.status === "draft" ? updatedAt : GAME04_LEGAL.effectiveDate}</p>
        {GAME04_LEGAL.status === "draft" && <p className="legal-page-notice">正式公開前の草案です。運営者情報・問い合わせ窓口・施行日は、正式公開までに掲載します。</p>}
        <div className="legal-page-content">{children}</div>
        <nav className="legal-page-nav" aria-label="法的情報">
          <Link href={legalHref("/legal/terms")} replace={returnToGame}>利用規約</Link>
          <Link href={legalHref("/legal/privacy")} replace={returnToGame}>プライバシーポリシー</Link>
          <Link href={legalHref("/legal/tokusho")} replace={returnToGame}>特定商取引法に基づく表記</Link>
          <Link href={legalHref("/legal/payments")} replace={returnToGame}>有償通貨・購入品について</Link>
          <Link href={legalHref("/legal/cookies")} replace={returnToGame}>Cookie・アクセス解析</Link>
          <Link href={legalHref("/legal/age-rating")} replace={returnToGame}>年齢・課金について</Link>
          <Link href={legalHref("/legal/rights")} replace={returnToGame}>権利表記・運営者情報</Link>
          <Link href={legalHref("/legal/contact")} replace={returnToGame}>お問い合わせ</Link>
        </nav>
        <p className="legal-page-copyright">{GAME04_LEGAL.rightsHolder ? `© ${GAME04_LEGAL.rightsHolder}` : GAME04_LEGAL.title}</p>
      </section>
      <div className="legal-page-scroll-track" aria-hidden="true">
        <span
          className="legal-page-scroll-thumb"
          style={{ top: `${scrollProgress.top}%`, height: `${scrollProgress.height}%` }}
        />
      </div>
      {returnToGame && (
        <div className="legal-page-close-bar">
          <button type="button" className="legal-page-close active-scale-effect" onClick={closeToGame}>
            閉じる
          </button>
        </div>
      )}
    </main>
  );
}
