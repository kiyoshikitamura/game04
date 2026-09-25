import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useGame } from "../context/GameContext";
import FullScreenPanel from "./ui/FullScreenPanel";
import SubTabNav from "./ui/SubTabNav";
import OutlawButton from "./ui/OutlawButton";
import CanonicalDialog from "./ui/CanonicalDialog";
import CanonicalItemIcon from "./ui/CanonicalItemIcon";
import { canonicalItemName } from "@/domain/gameplay/canonical/items";
import { battleDisplayText } from "@/domain/presentation/battleTerminology";
import "./InboxPanel.css";

// Existing community read recovery bound; never used for present mutations.
const NEWS_READ_TIMEOUT_MS = 12_000;

function PresentRewardIcon({ itemId }: { itemId: string }) {
  if (itemId === "PLAYER_XP") return <span className="inbox-present-reward-icon" aria-label="プレイヤー経験値">XP</span>;
  if (itemId === "CASH") return <img src="/ui/icon_cash.png" alt="" className="inbox-present-reward-icon" />;
  if (itemId === "DIA" || itemId === "DIAMOND") return <img src="/ui/icon_dia.png" alt="" className="inbox-present-reward-icon" />;
  return <CanonicalItemIcon itemId={itemId} alt="" className="inbox-present-reward-icon" />;
}

export default function InboxPanel() {
  const {
    showInboxPanel,
    setShowInboxPanel,
    inboxPanelTab,
    setInboxPanelTab,
    newsList,
    setNewsList,
    markNewsRead,
    presents,
    handleClaimPresent,
    handleClaimAllPresents,
    presentClaimLoading,
    playCyberSe
  } = useGame();

  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(false);
  const [newsRetry, setNewsRetry] = useState(0);

  // Refresh on opening so already logged-in players can read a new release.
  // Publication and time-window filtering are enforced by news RLS.
  useEffect(() => {
    if (!showInboxPanel || inboxPanelTab !== "news") return;
    let cancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      cancelled = true;
      controller.abort();
      setNewsError(true);
      setNewsLoading(false);
    }, NEWS_READ_TIMEOUT_MS);
    setNewsLoading(true);
    setNewsError(false);
    void (async () => {
      try {
        const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false }).abortSignal(controller.signal);
        if (cancelled) return;
        if (error || !data) throw error || new Error("News unavailable");
        setNewsList(data.map((news) => ({
          ...news,
          id: String(news.id),
          date: new Date(news.start_at).toLocaleDateString(),
        })));
      } catch {
        if (!cancelled) setNewsError(true);
      } finally {
        window.clearTimeout(timer);
        if (!cancelled) setNewsLoading(false);
      }
    })();
    return () => { cancelled = true; window.clearTimeout(timer); controller.abort(); };
  }, [showInboxPanel, inboxPanelTab, setNewsList, newsRetry]);

  if (!showInboxPanel) return null;

  const handleClose = () => {
    if (presentClaimLoading) return;
    setSelectedNews(null);
    setShowInboxPanel(false);
  };

  const unclaimedPresents = (presents || []).filter((p: any) => p.status === "UNCLAIMED");

  const renderNewsContent = () => (
    <div className="inbox-news-list" aria-busy={newsLoading}>
      {newsLoading && <p role="status">お知らせを更新中…</p>}
      {newsError && <div className="inbox-news-error" role="alert">
        <p>お知らせを取得できませんでした。</p>
        <OutlawButton variant="secondary" onClick={() => setNewsRetry((value) => value + 1)}>再試行</OutlawButton>
      </div>}
      {(newsList || []).length === 0 ? (
        !newsLoading && !newsError && <div className="inbox-empty">お知らせはありません</div>
      ) : (
        newsList.map((news: any) => (
          <button
            type="button"
            key={news.id}
            className="inbox-news-item active-scale-effect"
            onClick={() => { setSelectedNews(news); markNewsRead(news); playCyberSe("click"); }}
          >
            <div className="inbox-news-item-header">
              {news.category === "IMPORTANT" && <span className="news-badge important">重要</span>}
              {news.isNew && <span className="news-badge new">NEW</span>}
              <span className="news-date">{news.date || news.created_at}</span>
            </div>
            <div className="inbox-news-item-title">{news.title}</div>
          </button>
        ))
      )}
    </div>
  );

  const renderPresentsContent = () => (
    <div className="inbox-presents-area">
      <div className="inbox-presents-actions">
        <span className="inbox-presents-count">未受取: {unclaimedPresents.length}件</span>
        <OutlawButton
          variant="primary"
          disabled={unclaimedPresents.length === 0 || presentClaimLoading}
          isLoading={presentClaimLoading}
          loadingLabel="一括受取中…"
          onClick={handleClaimAllPresents}
        >
          一括受け取り
        </OutlawButton>
      </div>
      <div className="inbox-presents-list">
        {unclaimedPresents.length === 0 ? (
          <div className="inbox-empty">未受取のプレゼントはありません</div>
        ) : (
          unclaimedPresents.map((p: any) => (
            <div key={p.id} className="inbox-present-item">
              <div className="inbox-present-info">
                <div className="inbox-present-title">{battleDisplayText(p.title || p.message)}</div>
                <div className="inbox-present-reward">{(() => { const itemId = String(p.itemId || p.item_id || ""); const quantity = Number(p.qty ?? p.quantity ?? 0); return <><PresentRewardIcon itemId={itemId} /><span>{canonicalItemName(itemId)} <strong>× {quantity.toLocaleString()}</strong></span></>; })()}</div>
                <div className="inbox-present-expire">{p.expireText || "期限なし"}</div>
              </div>
              <OutlawButton
                variant="primary"
                disabled={presentClaimLoading}
                isLoading={Boolean(p.loading)}
                loadingLabel="受取中…"
                onClick={() => handleClaimPresent(p.id)}
              >
                受け取る
              </OutlawButton>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <FullScreenPanel
        title="受信箱"
        onClose={handleClose}
        closeDisabled={presentClaimLoading}
        className={presentClaimLoading ? "inbox-panel-pending" : ""}
      >
        <div className="inbox-panel-container-inner" aria-busy={presentClaimLoading}>
          <SubTabNav
            tabs={[
              { id: "news", label: "お知らせ" },
              { id: "presents", label: "プレゼント" }
            ]}
            activeTabId={inboxPanelTab}
            onSelect={(id) => { if (!presentClaimLoading) setInboxPanelTab(id as any); }}
            className="mb-3"
          />

          {inboxPanelTab === "news" ? renderNewsContent() : renderPresentsContent()}
        </div>
      </FullScreenPanel>

      {selectedNews && (
        <CanonicalDialog title={selectedNews.title} onClose={() => setSelectedNews(null)} actions={[{ label: "閉じる", semantic: "secondary", onClick: () => setSelectedNews(null) }]}>
          <p className="inbox-news-modal-text">{selectedNews.content || selectedNews.desc}</p>
        </CanonicalDialog>
      )}
    </>
  );
}
