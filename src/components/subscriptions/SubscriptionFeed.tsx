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
                return (
                  <div
                    key={face.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        padding: 2,
                        borderRadius: 13,
                        background: hasUnread
                          ? "linear-gradient(135deg, var(--mf-accent), var(--mf-accent-soft))"
                          : "transparent",
                        border: hasUnread ? "none" : "1.5px solid var(--mf-line)",
                      }}
                    >
                      <FaceBadge face={face} size={44} radius={11} />
                    </div>
                    <span
                      style={{
                        fontSize: 9.5,
                        color: "var(--mf-text-sub)",
                        maxWidth: 50,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {getFaceTitle(face)}
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
                    return (
                      <SeedRow
                        key={activity.id}
                        activity={activity}
                        face={face}
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
        <div style={{ padding: "16px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
          {subscribedFaces.length === 0 ? (
            <EmptyState />
          ) : (
            subscribedFaces.map((face) => {
              const owner = userMap.get(face.userId);
              const faceActivities = subscribedActivities.filter((a) => a.faceId === face.id);
              return (
                <Link
                  key={face.id}
                  href={`/faces/${face.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "var(--mf-surface-card)",
                    border: "0.5px solid var(--mf-line)",
                    textDecoration: "none",
                  }}
                >
                  <FaceBadge face={face} size={40} radius={11} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
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
                      <div style={{ fontSize: 11.5, color: "var(--mf-text-muted)", marginTop: 2 }}>
                        {owner.name}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--mf-text-muted)",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {faceActivities.length} シード
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div
    style={{
      margin: "32px 28px",
      padding: "28px 20px",
      borderRadius: 16,
      background: "var(--mf-bg-dark)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "rgba(248,246,241,0.9)",
        letterSpacing: 0.3,
      }}
    >
      Quiet Feed
    </div>
    <p style={{ fontSize: 12, color: "rgba(248,246,241,0.5)", margin: 0, lineHeight: 1.7 }}>
      まだサブスクしているフェイスがありません。
      <br />
      気になるフェイスを見つけて、フィードを育てましょう。
    </p>
    <Link
      href="/search"
      style={{
        marginTop: 4,
        padding: "8px 20px",
        borderRadius: 999,
        background: "var(--mf-accent)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        textDecoration: "none",
      }}
    >
      フェイスを探す
    </Link>
  </div>
);

const formatDateLabel = (dateKey: string): string => {
  const [, m, d] = dateKey.split("-");
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
};

export default SubscriptionFeed;
