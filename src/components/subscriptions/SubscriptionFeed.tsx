"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { activityRepository } from "@/repositories/activity-repository";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import { subscriptionRepository } from "@/repositories/subscription-repository";
import SeedRow from "@/components/ui/SeedRow";
import DateBar from "@/components/ui/DateBar";
import FaceBadge from "@/components/ui/FaceBadge";
import { useDetailPanel } from "@/lib/detail-panel-context";
import { createLookupMap, getFaceTitle } from "@/lib/display";

type Tab = "timeline" | "subscriptions";

const SubscriptionFeed = () => {
  const { openActivity } = useDetailPanel();
  const [activeTab, setActiveTab] = useState<Tab>("timeline");

  const subscribedFaceIds = subscriptionRepository.getSubscribedFaceIds();
  const subscribedActivities = activityRepository.listByFaceIds(subscribedFaceIds);

  const subscribedFaces = useMemo(
    () =>
      subscribedFaceIds.flatMap((faceId) => {
        const face = faceRepository.findById(faceId);
        return face ? [face] : [];
      }),
    [subscribedFaceIds]
  );

  const faceMap = createLookupMap(subscribedFaces, (face) => face.id);
  const userMap = createLookupMap(userRepository.listAll(), (user) => user.id);

  // タイムラインを日付でグループ化
  const grouped = useMemo(() => {
    const groups: { dateKey: string; activities: typeof subscribedActivities }[] = [];
    let lastKey = "";
    for (const act of subscribedActivities) {
      const dateKey = act.createdAt.slice(0, 10);
      if (dateKey !== lastKey) {
        groups.push({ dateKey, activities: [act] });
        lastKey = dateKey;
      } else {
        groups[groups.length - 1].activities.push(act);
      }
    }
    return groups;
  }, [subscribedActivities]);

  const TABS: { key: Tab; label: string }[] = [
    { key: "timeline", label: "タイムライン" },
    { key: "subscriptions", label: "サブスク一覧" },
  ];

  return (
    <div>
      {/* ページタイトル */}
      <div style={{ padding: "4px 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--mf-brand)",
              letterSpacing: -0.3,
              fontFamily: "var(--mf-font-sans)",
            }}
          >
            蒐集
          </div>
          {subscribedFaces.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--mf-text-sub)" }}>気になるフェイスを見つける</div>
          ) : (
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none" stroke="var(--mf-brand)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={8} cy={8} r={5.5} /><path d="M12.2 12.2L16 16" />
            </svg>
          )}
        </div>
      </div>

      {/* タブ */}
      <div
        style={{
          display: "flex",
          borderBottom: "0.5px solid var(--mf-line)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--mf-bg-light)",
        }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1,
              padding: "13px 0",
              fontSize: 13,
              fontWeight: activeTab === key ? 700 : 400,
              color: activeTab === key ? "var(--mf-brand)" : "var(--mf-text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderBottom: activeTab === key ? "2px solid var(--mf-accent)" : "2px solid transparent",
              marginBottom: -0.5,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "timeline" && (
        <>
          {/* サブスク中フェイスの横スクロール行 */}
          {subscribedFaces.length > 0 && (
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "0.5px solid var(--mf-line)",
                overflowX: "auto",
                display: "flex",
                gap: 12,
              }}
              className="mf-scroll"
            >
              {subscribedFaces.map((face) => {
                const hasUnread = subscribedActivities.some((a) => a.faceId === face.id);
                const owner = userMap.get(face.userId);
                return (
                  <div
                    key={face.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      flexShrink: 0,
                      width: 52,
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 12,
                        boxShadow: hasUnread
                          ? "0 0 0 2px var(--mf-bg-light), 0 0 0 3.5px var(--mf-accent)"
                          : "none",
                        flexShrink: 0,
                      }}
                    >
                      <FaceBadge face={face} size={46} radius={12} />
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--mf-text-sub)",
                        maxWidth: 52,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {owner?.handle ?? getFaceTitle(face)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* タイムライン */}
          {subscribedActivities.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ padding: "0 28px" }}>
              {grouped.map(({ dateKey, activities: acts }) => (
                <div key={dateKey}>
                  <DateBar
                    label={formatDateLabel(dateKey)}
                    date={dateKey.replace(/-/g, "/")}
                  />
                  {acts.map((activity, i) => {
                    const face = faceMap.get(activity.faceId);
                    if (!face) return null;
                    const owner = userMap.get(activity.userId);
                    return (
                      <SeedRow
                        key={activity.id}
                        activity={activity}
                        face={face}
                        handle={owner?.handle}
                        onClick={() => openActivity(activity.id)}
                        noBorder={i === acts.length - 1}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "subscriptions" && (
        <div>
          {subscribedFaces.length === 0 ? (
            <EmptyState />
          ) : (
            subscribedFaces.map((face, i) => {
              const owner = userMap.get(face.userId);
              const faceActivities = subscribedActivities.filter((a) => a.faceId === face.id);
              return (
                <div
                  key={face.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 18px",
                    borderBottom: i < subscribedFaces.length - 1 ? "0.5px solid var(--mf-line-soft)" : "none",
                  }}
                >
                  <Link href={`/faces/${face.id}`} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, textDecoration: "none" }}>
                    <FaceBadge face={face} size={42} radius={11} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--mf-brand)" }}>
                          {getFaceTitle(face)}
                        </span>
                        {owner?.handle && (
                          <span style={{ fontSize: 11.5, color: "var(--mf-text-muted)" }}>
                            @{owner.handle}
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: 2, fontSize: 11.5, color: "var(--mf-text-sub)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {face.description ?? ""} · {faceActivities.length} シード
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    style={{
                      padding: "7px 14px",
                      borderRadius: 999,
                      border: "1px solid var(--mf-brand)",
                      color: "var(--mf-brand)",
                      background: "transparent",
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    サブスク中
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const RECOMMENDED_FACES = [
  { color: "#5B8DB8", kanji: "読", name: "読書",    handle: "h_maru",     subs: 412, desc: "読みながら考えたこと" },
  { color: "#7B6B9E", kanji: "映", name: "映画断片", handle: "sayaka_t",   subs: 287, desc: "観終わってからしばらく" },
  { color: "#A89050", kanji: "珈", name: "朝の珈琲", handle: "kettle_co",  subs: 198, desc: "一杯目のメモ" },
  { color: "#B06B7A", kanji: "夜", name: "夜更けに", handle: "yorunoyoru", subs: 156, desc: "23時以降のひとりごと" },
];

const EmptyState = () => (
  <div>
    {/* Quiet Feed バナー */}
    <div
      style={{
        margin: "20px 18px 0",
        padding: "24px 22px",
        borderRadius: 16,
        background: "var(--mf-bg-dark)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, rgba(248,246,241,0.18) 0%, rgba(248,246,241,0.04) 60%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--mf-accent)" }} />
        <div style={{ fontSize: 10.5, color: "var(--mf-accent)", letterSpacing: 1, textTransform: "uppercase" as const, fontWeight: 700 }}>
          Quiet Feed
        </div>
      </div>
      <div style={{ fontSize: 17, lineHeight: 1.55, fontWeight: 700, color: "rgba(248,246,241,0.92)", letterSpacing: 0.2 }}>
        まだ、誰のフェイスも<br />サブスクライブしていない。
      </div>
      <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.7, color: "rgba(248,246,241,0.6)" }}>
        気になるフェイスを1つだけ、まず選んでみる。<br />
        通知の重みを大切にする設計です。
      </div>
    </div>

    {/* おすすめのフェイス */}
    <div style={{ marginTop: 20 }}>
      <div style={{ padding: "0 18px", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--mf-brand)", letterSpacing: 0.2 }}>おすすめのフェイス</div>
        <div style={{ fontSize: 11, color: "var(--mf-text-muted)" }}>· あなたに合いそうな</div>
      </div>

      {RECOMMENDED_FACES.map((r, i) => (
        <div
          key={r.handle}
          style={{
            padding: "12px 18px",
            borderBottom: i < RECOMMENDED_FACES.length - 1 ? `0.5px solid var(--mf-line-soft)` : "none",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              background: r.color,
              color: "#fff",
              fontFamily: "var(--mf-font-serif)",
              fontSize: 20,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {r.kanji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--mf-brand)" }}>{r.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--mf-text-muted)" }}>@{r.handle}</div>
            </div>
            <div style={{ marginTop: 2, fontSize: 11.5, color: "var(--mf-text-sub)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.desc} · {r.subs} サブスク
            </div>
          </div>
          <button
            type="button"
            style={{
              padding: "7px 14px",
              borderRadius: 999,
              background: i === 0 ? "var(--mf-brand)" : "transparent",
              border: i === 0 ? "none" : "1px solid var(--mf-brand)",
              color: i === 0 ? "#F8F6F1" : "var(--mf-brand)",
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            サブスク
          </button>
        </div>
      ))}

      <div style={{ padding: "14px 18px 0" }}>
        <div
          style={{
            padding: 11,
            border: "1px dashed var(--mf-line)",
            borderRadius: 10,
            textAlign: "center",
            fontSize: 12,
            color: "var(--mf-text-sub)",
            fontWeight: 600,
          }}
        >
          人気フェイスをもっと見る →
        </div>
      </div>
    </div>
  </div>
);

const formatDateLabel = (dateKey: string): string => {
  const [, m, d] = dateKey.split("-");
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
};

export default SubscriptionFeed;
