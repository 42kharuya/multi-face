"use client";

import { useState } from "react";
import { notificationRepository } from "@/repositories/notification-repository";
import { userRepository } from "@/repositories/user-repository";
import { faceRepository } from "@/repositories/face-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { type Notification } from "@/types/notification";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { createLookupMap, getFaceTitle, getFaceColor } from "@/lib/display";
import { useDetailPanel } from "@/lib/detail-panel-context";
import FaceBadge from "@/components/ui/FaceBadge";
import DateBar from "@/components/ui/DateBar";

type FilterType = "all" | "sub" | "link";

const FILTER_LABELS: { key: FilterType; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "sub", label: "サブスク" },
  { key: "link", label: "リンク" },
];

// 参照日から7日以内の通知を未読とみなす
const UNREAD_CUTOFF = "2026-03-25";

type NotifItemProps = {
  notification: Notification;
  faceName?: string;
  faceId?: string;
  handle?: string;
  preview: string;
  activityId?: string;
};

const NotifItem = ({ notification, faceName, faceId, handle, preview, activityId }: NotifItemProps) => {
  const { openActivity, state } = useDetailPanel();
  const isUnread = notification.createdAt >= UNREAD_CUTOFF;
  const isLink = notification.type === "link";

  const isSelected =
    state.type === "activity" && activityId !== undefined && state.activityId === activityId;

  const typeMeta = isLink
    ? { label: "リンク", bg: "rgba(30,42,74,0.10)", color: "var(--mf-brand)" }
    : { label: "更新", bg: "rgba(212,146,42,0.10)", color: "var(--mf-accent)" };

  const mockFace = faceId
    ? { id: faceId, name: faceName ?? "", userId: "", isPrivate: false }
    : null;

  return (
    <div
      onClick={() => { if (activityId) openActivity(activityId); }}
      role={activityId ? "button" : undefined}
      tabIndex={activityId ? 0 : undefined}
      onKeyDown={activityId ? (e) => { if (e.key === "Enter") openActivity(activityId!); } : undefined}
      style={{
        padding: "12px 18px",
        background: isSelected
          ? "rgba(30,42,74,0.06)"
          : isUnread
          ? "rgba(212,146,42,0.05)"
          : "transparent",
        borderBottom: "0.5px solid var(--mf-line-soft)",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        position: "relative",
        cursor: activityId ? "pointer" : "default",
      }}
    >
      {/* 未読ドット */}
      {isUnread && (
        <div
          style={{
            position: "absolute",
            left: 6,
            top: "50%",
            transform: "translateY(-50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--mf-accent)",
          }}
        />
      )}

      {/* フェイスバッジ */}
      {mockFace ? (
        <div style={{ flexShrink: 0 }}>
          <FaceBadge face={mockFace} size={38} radius={11} />
        </div>
      ) : (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: "var(--mf-surface-tint)",
            border: "1px dashed var(--mf-line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 20 20" fill="none" stroke="var(--mf-text-muted)" strokeWidth={1.6} strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </div>
      )}

      {/* 本文 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {/* タイプバッジ */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 7px",
              borderRadius: 4,
              background: typeMeta.bg,
              color: typeMeta.color,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.4,
              flexShrink: 0,
            }}
          >
            {typeMeta.label}
          </div>
          {faceName && (
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--mf-brand)", overflow: "hidden", textOverflow: "ellipsis" }}>
              {faceName}
            </span>
          )}
          {handle && (
            <span style={{ fontSize: 11.5, color: "var(--mf-text-muted)", flexShrink: 0 }}>
              @{handle}
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--mf-text-muted)", flexShrink: 0 }}>
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <div
          style={{
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "var(--mf-ink)",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {preview}
        </div>
      </div>
    </div>
  );
};

const NotificationList = () => {
  const [filter, setFilter] = useState<FilterType>("all");

  const notifications = notificationRepository.listAll();
  const userMap = createLookupMap(userRepository.listAll(), (user) => user.id);
  const activityMap = createLookupMap(activityRepository.listAll(), (activity) => activity.id);

  const filtered = notifications.filter((n) => {
    if (filter === "sub") return n.type === "subscribe";
    if (filter === "link") return n.type === "link";
    return true;
  });

  // 日付でグループ化
  const grouped: { dateKey: string; items: typeof filtered }[] = [];
  let lastKey = "";
  for (const n of filtered) {
    const dateKey = n.createdAt.slice(0, 10);
    if (dateKey !== lastKey) {
      grouped.push({ dateKey, items: [n] });
      lastKey = dateKey;
    } else {
      grouped[grouped.length - 1].items.push(n);
    }
  }

  return (
    <div>
      {/* フィルターピル */}
      <div style={{ padding: "14px 18px 10px", display: "flex", gap: 6, borderBottom: "0.5px solid var(--mf-line-soft)" }}>
        {FILTER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            style={{
              padding: "5px 11px",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 600,
              background: filter === key ? "var(--mf-brand)" : "transparent",
              color: filter === key ? "#fff" : "var(--mf-text-sub)",
              border: filter === key ? "none" : "1px solid var(--mf-line)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "80px 0", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--mf-text-muted)" }}>通知はありません</p>
        </div>
      ) : (
        grouped.map(({ dateKey, items }) => (
          <div key={dateKey}>
            <DateBar
              label={dateKey >= "2026-03-30" ? "今日" : "以前"}
              date={dateKey.replace(/-/g, "/")}
            />
            {items.map((notification) => {
              const fromUser = userMap.get(notification.fromUserId);
              if (!fromUser) return null;

              if (notification.type === "link") {
                const activity = activityMap.get(notification.activityId);
                const linkedFace = activity ? faceRepository.findById(activity.faceId) : undefined;
                return (
                  <NotifItem
                    key={notification.id}
                    notification={notification}
                    faceName={linkedFace ? getFaceTitle(linkedFace) : undefined}
                    faceId={linkedFace?.id}
                    handle={fromUser.handle}
                    preview={activity?.body ?? "リンクされたシードです"}
                    activityId={notification.activityId}
                  />
                );
              }

              const face = faceRepository.findById(notification.faceId);
              return (
                <NotifItem
                  key={notification.id}
                  notification={notification}
                  faceName={face ? getFaceTitle(face) : undefined}
                  faceId={face?.id}
                  handle={fromUser.handle}
                  preview={face ? `${getFaceTitle(face)} に新しいシードが投稿されました` : "サブスク中のフェイスが更新されました"}
                />
              );
            })}
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList;
