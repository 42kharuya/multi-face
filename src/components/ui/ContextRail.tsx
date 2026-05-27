"use client";

import { usePathname } from "next/navigation";
import { useDetailPanel } from "@/lib/detail-panel-context";
import ActivityDetail from "./ActivityDetail";
import FaceDetail from "./FaceDetail";
import RailCard from "./RailCard";

const WritingRail = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <RailCard title="On This Day">
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: "var(--mf-ink)",
          margin: 0,
        }}
      >
        過去のシードは、今のあなたに何を語りかけますか。
      </p>
    </RailCard>
    <RailCard title="今月の記録">
      <div style={{ display: "flex", gap: 18 }}>
        {[
          { n: "—", l: "シード" },
          { n: "—", l: "日連続" },
          { n: "—", l: "フェイス" },
        ].map((s) => (
          <div key={s.l} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--mf-brand)",
                fontFamily: "var(--mf-font-serif-en)",
              }}
            >
              {s.n}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--mf-text-muted)",
                marginTop: 2,
              }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </RailCard>
    <RailCard pad="14px">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--mf-text-muted)",
          fontSize: 13,
        }}
      >
        <svg width={18} height={18} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <circle cx={8} cy={8} r={5.5} />
          <path d="M12.2 12.2L16 16" />
        </svg>
        すべてを検索
        <div
          style={{
            marginLeft: "auto",
            fontSize: 10.5,
            padding: "2px 6px",
            background: "var(--mf-surface-tint)",
            borderRadius: 4,
            color: "var(--mf-text-sub)",
            fontWeight: 700,
          }}
        >
          ⌘K
        </div>
      </div>
    </RailCard>
  </div>
);

const ReflectionRail = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <RailCard title="フェイスについて">
      <p
        style={{
          fontSize: 12.5,
          lineHeight: 1.75,
          color: "var(--mf-text-sub)",
          margin: 0,
        }}
      >
        フェイスは「あなたの多面性」のひとつ。投稿したい内容にあったフェイスで書き、後から自分のために振り返ることができます。
      </p>
    </RailCard>
  </div>
);

const CollectionRail = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <RailCard title="サブスク中">
      <p
        style={{
          fontSize: 12.5,
          lineHeight: 1.75,
          color: "var(--mf-text-sub)",
          margin: 0,
        }}
      >
        サブスクライブしているフェイスの新着シードがここに表示されます。
      </p>
    </RailCard>
  </div>
);

const ContextRail = () => {
  const pathname = usePathname();
  const { state } = useDetailPanel();

  const hasDetail =
    state.type === "activity" || state.type === "face";

  const contentKey = hasDetail
    ? state.type === "activity"
      ? `activity-${state.activityId}`
      : `face-${state.faceId}`
    : `page-${pathname}`;

  const renderContent = () => {
    if (state.type === "activity") {
      return <ActivityDetail activityId={state.activityId} />;
    }
    if (state.type === "face") {
      return <FaceDetail faceId={state.faceId} />;
    }

    if (pathname === "/faces" || pathname.startsWith("/faces/")) {
      return <ReflectionRail />;
    }
    if (pathname === "/subscriptions") {
      return <CollectionRail />;
    }
    return <WritingRail />;
  };

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 overflow-y-auto mf-scroll"
      style={{
        width: 340,
        padding: hasDetail ? 0 : "24px 20px 24px 0",
      }}
    >
      <div key={contentKey} style={{ flex: 1 }}>
        {renderContent()}
      </div>
    </aside>
  );
};

export default ContextRail;
