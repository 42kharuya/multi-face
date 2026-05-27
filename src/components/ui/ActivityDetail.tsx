"use client";

import Image from "next/image";
import Link from "next/link";
import { activityRepository } from "@/repositories/activity-repository";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import { useDetailPanel } from "@/lib/detail-panel-context";
import { getFaceTitle } from "@/lib/display";
import FaceBadge from "./FaceBadge";
import FaceChip from "./FaceChip";
import { formatRelativeTime } from "@/lib/format-relative-time";

type ActivityDetailProps = {
  activityId: string;
};

const ActivityDetail = ({ activityId }: ActivityDetailProps) => {
  const { close } = useDetailPanel();

  const activity = activityRepository.findById(activityId);
  const face = activity ? faceRepository.findById(activity.faceId) : undefined;
  const user = activity ? userRepository.findById(activity.userId) : undefined;

  if (!activity || !user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "0.5px solid var(--mf-line)",
            background: "rgba(248,246,241,0.85)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--mf-brand)" }}>
            シード詳細
          </span>
          <button
            type="button"
            aria-label="閉じる"
            onClick={close}
            style={{
              width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", border: "none", background: "transparent",
              color: "var(--mf-text-muted)", cursor: "pointer",
            }}
          >
            <svg width={16} height={16} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: "32px 16px" }}>
          <p style={{ fontSize: 13, color: "var(--mf-text-muted)" }}>シードが見つかりませんでした</p>
        </div>
      </div>
    );
  }

  const faceTitle = face ? getFaceTitle(face) : activity.faceId || "不明なフェイス";
  const relativeTime = formatRelativeTime(activity.createdAt);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "0.5px solid var(--mf-line)",
          background: "rgba(248,246,241,0.85)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--mf-brand)" }}>
          シード詳細
        </span>
        <button
          type="button"
          aria-label="閉じる"
          onClick={close}
          style={{
            width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%", border: "none", background: "transparent",
            color: "var(--mf-text-muted)", cursor: "pointer",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>

      {/* コンテンツ */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
        {/* ユーザー・フェイス行 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {face ? (
            <FaceBadge face={face} size={40} radius={11} />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: "var(--mf-surface-tint)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>?</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--mf-brand)" }}>
              {user.name}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaceChip title={faceTitle} faceId={activity.faceId} />
              <time
                dateTime={activity.createdAt}
                style={{ fontSize: 11.5, color: "var(--mf-text-muted)" }}
              >
                {relativeTime}
              </time>
            </div>
          </div>
        </div>

        {/* 本文 */}
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.75,
            color: "var(--mf-ink)",
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {activity.body}
        </p>

        {/* 画像グリッド */}
        {activity.imageUrls && activity.imageUrls.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(activity.imageUrls.length, 2)}, 1fr)`,
              gap: 3,
              borderRadius: 14,
              overflow: "hidden",
              border: "0.5px solid var(--mf-line-soft)",
            }}
          >
            {activity.imageUrls.map((url, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  aspectRatio: activity.imageUrls!.length === 1 ? "16/10" : "1/1",
                }}
              >
                <Image
                  src={url}
                  alt={`画像 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 384px) 100vw, 192px"
                />
              </div>
            ))}
          </div>
        )}

        {/* フェイスへのリンク */}
        <Link
          href={`/faces/${activity.faceId}`}
          style={{
            fontSize: 12,
            color: "var(--mf-accent)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          → このフェイスを見る
        </Link>
      </div>
    </div>
  );
};

export default ActivityDetail;
