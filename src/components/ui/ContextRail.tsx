"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDetailPanel } from "@/lib/detail-panel-context";
import { activityRepository } from "@/repositories/activity-repository";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import { subscriptionRepository } from "@/repositories/subscription-repository";
import { getFaceTitle } from "@/lib/display";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { Face } from "@/types/face";
import ActivityDetail from "./ActivityDetail";
import FaceDetail from "./FaceDetail";
import FaceBadge from "./FaceBadge";
import RailCard from "./RailCard";
import SeedRow from "./SeedRow";

const REFERENCE_DATE = new Date("2026-04-01");

// ── WritingRail ────────────────────────────────────────────────
const WritingRail = () => {
  const user = userRepository.getCurrentUser();
  const allActivities = activityRepository.listByUserId(user.id);

  const thisMonth = REFERENCE_DATE.toISOString().slice(0, 7); // "2026-04"
  const monthlyActs = allActivities.filter((a) => a.createdAt.startsWith(thisMonth));
  const monthlySeeds = monthlyActs.length;
  const monthlyFaces = new Set(monthlyActs.map((a) => a.faceId)).size;

  // ストリーク: REFERENCE_DATE から過去に向かって連続投稿日数を数える
  const dateSet = new Set(allActivities.map((a) => a.createdAt.slice(0, 10)));
  let streak = 0;
  const cur = new Date(REFERENCE_DATE);
  while (dateSet.has(cur.toISOString().slice(0, 10))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <RailCard title="今月の記録">
        <div style={{ display: "flex", gap: 18 }}>
          {[
            { n: String(monthlySeeds), l: "シード" },
            { n: String(streak), l: "日連続" },
            { n: String(monthlyFaces), l: "フェイス" },
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
};

// ── ReflectionRail ─────────────────────────────────────────────
const ReflectionRail = () => {
  const user = userRepository.getCurrentUser();
  const faces = faceRepository.listByUserId(user.id);
  const allActivities = activityRepository.listByUserId(user.id);

  const refKey = REFERENCE_DATE.toISOString().slice(0, 10);
  const weekAgo = new Date(REFERENCE_DATE);
  weekAgo.setDate(REFERENCE_DATE.getDate() - 7);
  const weekKey = weekAgo.toISOString().slice(0, 10);

  const thisMonth = REFERENCE_DATE.toISOString().slice(0, 7);
  const lastMonthDate = new Date(REFERENCE_DATE);
  lastMonthDate.setMonth(REFERENCE_DATE.getMonth() - 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);

  const thirtyAgo = new Date(REFERENCE_DATE);
  thirtyAgo.setDate(REFERENCE_DATE.getDate() - 30);
  const thirtyKey = thirtyAgo.toISOString().slice(0, 10);

  // 今週のトップフェイス（直近7日）
  const weekActs = allActivities.filter((a) => {
    const d = a.createdAt.slice(0, 10);
    return d >= weekKey && d <= refKey;
  });
  const weekFaceCounts = new Map<string, number>();
  for (const act of weekActs) {
    weekFaceCounts.set(act.faceId, (weekFaceCounts.get(act.faceId) ?? 0) + 1);
  }
  const topFaces = [...weekFaceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .flatMap(([faceId, count]) => {
      const face = faces.find((f) => f.id === faceId);
      return face ? [{ face, count }] : [];
    });

  // 先月比で増加したフェイス
  const thisMonthCount = new Map<string, number>();
  const lastMonthCount = new Map<string, number>();
  for (const act of allActivities) {
    const m = act.createdAt.slice(0, 7);
    if (m === thisMonth) thisMonthCount.set(act.faceId, (thisMonthCount.get(act.faceId) ?? 0) + 1);
    if (m === lastMonth) lastMonthCount.set(act.faceId, (lastMonthCount.get(act.faceId) ?? 0) + 1);
  }
  const grownFaces = faces
    .map((f) => ({ face: f, diff: (thisMonthCount.get(f.id) ?? 0) - (lastMonthCount.get(f.id) ?? 0) }))
    .filter((x) => x.diff > 0)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 3);

  // 停滞中フェイス（直近30日間に0投稿）
  const stalledFaces = faces
    .filter((f) => !allActivities.some((a) => a.faceId === f.id && a.createdAt.slice(0, 10) >= thirtyKey))
    .slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <RailCard title="今週のフェイス">
        {topFaces.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--mf-text-muted)", margin: 0 }}>
            今週はまだ記録がありません
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topFaces.map(({ face, count }) => (
              <div key={face.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FaceBadge face={face} size={28} radius={8} />
                <span
                  style={{
                    flex: 1,
                    fontSize: 12.5,
                    color: "var(--mf-ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getFaceTitle(face)}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--mf-accent)",
                    background: "rgba(212,146,42,0.1)",
                    padding: "2px 7px",
                    borderRadius: 999,
                    flexShrink: 0,
                  }}
                >
                  {count}件
                </span>
              </div>
            ))}
          </div>
        )}
      </RailCard>

      {(grownFaces.length > 0 || stalledFaces.length > 0) && (
        <RailCard title="変化の可視化">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {grownFaces.map(({ face, diff }) => (
              <div key={`grown-${face.id}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaceBadge face={face} size={24} radius={7} />
                <span
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: "var(--mf-ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getFaceTitle(face)}
                </span>
                <span style={{ fontSize: 11, color: "var(--mf-accent)", fontWeight: 600, flexShrink: 0 }}>
                  ↑+{diff}
                </span>
              </div>
            ))}
            {stalledFaces.map((face) => (
              <div key={`stalled-${face.id}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaceBadge face={face} size={24} radius={7} />
                <span
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: "var(--mf-text-sub)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getFaceTitle(face)}
                </span>
                <span style={{ fontSize: 11, color: "var(--mf-text-muted)", fontWeight: 600, flexShrink: 0 }}>
                  停滞中
                </span>
              </div>
            ))}
          </div>
        </RailCard>
      )}
    </div>
  );
};

// ── CollectionRail ─────────────────────────────────────────────
const CollectionRail = () => {
  const subscribedFaceIds = subscriptionRepository.getSubscribedFaceIds();
  const subscribedFaces: Face[] = subscribedFaceIds.flatMap((id) => {
    const face = faceRepository.findById(id);
    return face ? [face] : [];
  });
  const recentActivities = activityRepository.listByFaceIds(subscribedFaceIds).slice(0, 3);
  const faceMap = new Map(subscribedFaces.map((f) => [f.id, f]));
  const userMap = new Map(userRepository.listAll().map((u) => [u.id, u]));

  if (subscribedFaces.length === 0) {
    return (
      <RailCard title="サブスク中">
        <p style={{ fontSize: 12.5, color: "var(--mf-text-muted)", margin: 0, lineHeight: 1.7 }}>
          サブスクしているフェイスがありません。
          <br />
          <Link href="/search" style={{ color: "var(--mf-accent)", textDecoration: "none", fontWeight: 600 }}>
            フェイスを探す →
          </Link>
        </p>
      </RailCard>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <RailCard title="サブスク中フェイス">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {subscribedFaces.map((face) => {
            const lastAct = activityRepository.listByFaceId(face.id)[0];
            const owner = userMap.get(face.userId);
            return (
              <Link
                key={face.id}
                href={`/faces/${face.id}`}
                style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
              >
                <FaceBadge face={face} size={32} radius={9} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "var(--mf-brand)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getFaceTitle(face)}
                  </div>
                  {owner && (
                    <div style={{ fontSize: 11, color: "var(--mf-text-muted)", marginTop: 1 }}>
                      {owner.name}
                    </div>
                  )}
                </div>
                {lastAct && (
                  <span style={{ fontSize: 10.5, color: "var(--mf-text-faint)", flexShrink: 0 }}>
                    {formatRelativeTime(lastAct.createdAt)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </RailCard>

      {recentActivities.length > 0 && (
        <RailCard title="最新シード">
          <div style={{ marginTop: -6 }}>
            {recentActivities.map((act) => {
              const face = faceMap.get(act.faceId);
              if (!face) return null;
              return (
                <SeedRow
                  key={act.id}
                  activity={act}
                  face={face}
                  noBorder
                />
              );
            })}
            <Link
              href="/subscriptions"
              style={{
                display: "block",
                textAlign: "center",
                fontSize: 12,
                color: "var(--mf-text-muted)",
                marginTop: 6,
                textDecoration: "none",
                padding: "6px 0",
              }}
            >
              もっと見る →
            </Link>
          </div>
        </RailCard>
      )}
    </div>
  );
};

// ── ContextRail（メイン） ───────────────────────────────────────
const ContextRail = () => {
  const pathname = usePathname();
  const { state } = useDetailPanel();

  const hasDetail = state.type === "activity" || state.type === "face";

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
