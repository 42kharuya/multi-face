"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Activity } from "@/types/activity";
import { type User } from "@/types/user";
import FaceChip from "./FaceChip";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { useDetailPanel } from "@/lib/detail-panel-context";

type ActivityCardProps = {
  activity: Activity;
  user: User;
  faceTitle: string;
  faceId: string;
  priority?: boolean;
  className?: string;
  onClick?: () => void;
};

const COLLAPSE_THRESHOLD = 200;

const ActivityCard = ({
  activity,
  user,
  faceTitle,
  faceId,
  priority = false,
  onClick,
}: ActivityCardProps) => {
  const { state } = useDetailPanel();
  const isSelected =
    state.type === "activity" && state.activityId === activity.id;

  const isLong = activity.body.length > COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(false);

  const displayBody =
    isLong && !expanded
      ? activity.body.slice(0, COLLAPSE_THRESHOLD) + "…"
      : activity.body;

  const handleCardClick = () => {
    if (onClick && typeof window !== "undefined" && window.innerWidth >= 768) {
      onClick();
    }
  };

  return (
    <article
      onClick={handleCardClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick();
              }
            }
          : undefined
      }
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        borderRadius: 14,
        padding: "14px 16px",
        background: isSelected ? "rgba(30,42,74,0.06)" : "var(--mf-surface-card)",
        border: `0.5px solid ${isSelected ? "var(--mf-brand)" : "var(--mf-line)"}`,
        transition: "background 0.15s, border 0.15s",
        cursor: onClick ? "pointer" : undefined,
      }}
    >
      {/* ヘッダー */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
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
            {user.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href={`/faces/${faceId}`}
              onClick={(e) => e.stopPropagation()}
              style={{ textDecoration: "none" }}
            >
              <FaceChip title={faceTitle} faceId={faceId} />
            </Link>
            <time
              dateTime={activity.createdAt}
              style={{ fontSize: 11.5, color: "var(--mf-text-muted)" }}
            >
              {formatRelativeTime(activity.createdAt)}
            </time>
          </div>
        </div>
      </div>

      {/* 本文 */}
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.65,
          color: "var(--mf-ink)",
          whiteSpace: "pre-wrap",
        }}
      >
        {displayBody}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          style={{
            alignSelf: "flex-start",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--mf-accent)",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          {expanded ? "折りたたむ" : "続きを読む"}
        </button>
      )}

      {/* 画像 */}
      {activity.imageUrls && activity.imageUrls.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(activity.imageUrls.length, 2)}, 1fr)`,
            gap: 3,
            borderRadius: 12,
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
                priority={priority && i === 0}
                loading={priority && i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

export default ActivityCard;
