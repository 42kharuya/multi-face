"use client";

import { notificationRepository } from "@/repositories/notification-repository";
import { userRepository } from "@/repositories/user-repository";
import { faceRepository } from "@/repositories/face-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { type Notification } from "@/types/notification";
import { type User } from "@/types/user";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { createLookupMap, getFaceTitle } from "@/lib/display";
import { useDetailPanel } from "@/lib/detail-panel-context";

type NotificationItemProps = {
  notification: Notification;
  fromUser: User;
  detail: string;
  activitySnippet?: string;
  activityId?: string;
};

const NotificationItem = ({
  notification,
  fromUser,
  detail,
  activitySnippet,
  activityId,
}: NotificationItemProps) => {
  const { openActivity, state } = useDetailPanel();
  const isLink = notification.type === "link";

  const isSelected =
    state.type === "activity" &&
    activityId !== undefined &&
    state.activityId === activityId;

  return (
    <li
      onClick={() => {
        if (activityId) openActivity(activityId);
      }}
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 14,
        background: isSelected
          ? "rgba(30,42,74,0.06)"
          : "var(--mf-surface-card)",
        border: `0.5px solid ${isSelected ? "var(--mf-brand)" : "var(--mf-line)"}`,
        cursor: activityId ? "pointer" : "default",
        transition: "background 0.15s, border 0.15s",
      }}
    >
      {/* ユーザー頭文字アバター */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--mf-brand)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {fromUser.name.slice(0, 1)}
      </div>

      {/* 本文 */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <p style={{ fontSize: 13, color: "var(--mf-text)", lineHeight: 1.5, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>{fromUser.name}</span>
            {" さんが "}
            <span style={{ color: "var(--mf-accent)", fontWeight: 600 }}>{detail}</span>
          </p>
          <span style={{ flexShrink: 0, fontSize: 11.5, color: "var(--mf-text-muted)" }}>
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        {isLink && activitySnippet && (
          <blockquote
            style={{
              borderLeft: "2px solid var(--mf-accent)",
              paddingLeft: 10,
              margin: 0,
              fontSize: 12,
              color: "var(--mf-text-sub)",
              lineHeight: 1.6,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {activitySnippet}
          </blockquote>
        )}

        <span
          style={{
            alignSelf: "flex-start",
            padding: "2px 8px",
            borderRadius: 999,
            background: "var(--mf-surface-tint)",
            fontSize: 11,
            color: "var(--mf-text-muted)",
            fontWeight: 600,
          }}
        >
          {isLink ? "🔗 リンク" : "📥 サブスク"}
        </span>
      </div>
    </li>
  );
};

const NotificationList = () => {
  const notifications = notificationRepository.listAll();
  const userMap = createLookupMap(userRepository.listAll(), (user) => user.id);
  const activityMap = createLookupMap(activityRepository.listAll(), (activity) => activity.id);

  if (notifications.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "80px 0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 36 }}>🔔</p>
        <p style={{ fontSize: 13, color: "var(--mf-text-muted)" }}>
          まだ通知はありません
        </p>
      </div>
    );
  }

  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
      {notifications.map((notification) => {
        const fromUser = userMap.get(notification.fromUserId);
        if (!fromUser) return null;

        if (notification.type === "link") {
          const activity = activityMap.get(notification.activityId);
          return (
            <NotificationItem
              key={notification.id}
              notification={notification}
              fromUser={fromUser}
              detail="あなたの投稿をリンクしました"
              activitySnippet={activity?.body}
              activityId={notification.activityId}
            />
          );
        }

        const face = faceRepository.findById(notification.faceId);
        const faceName = face ? getFaceTitle(face) : notification.faceId;
        return (
          <NotificationItem
            key={notification.id}
            notification={notification}
            fromUser={fromUser}
            detail={`${faceName} をサブスクライブしました`}
          />
        );
      })}
    </ul>
  );
};

export default NotificationList;
