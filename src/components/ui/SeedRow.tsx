"use client";

import { useState } from "react";
import Image from "next/image";
import type { Activity } from "@/types/activity";
import type { Face } from "@/types/face";
import FaceBadge from "./FaceBadge";
import { getFaceTitle } from "@/lib/display";
import { formatRelativeTime } from "@/lib/format-relative-time";

type SeedRowProps = {
  activity: Activity;
  face: Face;
  onClick?: () => void;
  replyChain?: boolean;
  showActions?: boolean;
  noBorder?: boolean;
};

const COLLAPSE_THRESHOLD = 200;

const SeedRow = ({
  activity,
  face,
  onClick,
  replyChain = false,
  showActions = false,
  noBorder = false,
}: SeedRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = activity.body.length > COLLAPSE_THRESHOLD;
  const displayBody =
    isLong && !expanded
      ? activity.body.slice(0, COLLAPSE_THRESHOLD) + "…"
      : activity.body;

  const linkedCount = activity.linkedActivityIds?.length ?? 0;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        padding: "14px 0",
        borderBottom: noBorder
          ? "none"
          : "0.5px solid var(--mf-line-soft)",
        display: "flex",
        gap: 12,
        cursor: onClick ? "pointer" : undefined,
      }}
    >
      {/* 左: FaceBadge + リプライチェーン線 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <FaceBadge face={face} size={36} radius={10} />
        {replyChain && (
          <div
            style={{
              width: 2,
              flex: 1,
              background: "var(--mf-line-soft)",
              marginTop: 6,
            }}
          />
        )}
      </div>

      {/* 右: メタ情報 + 本文 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* ヘッダー行 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mf-font-sans)",
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--mf-brand)",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {getFaceTitle(face)}
          </span>
          <span style={{ fontSize: 12.5, color: "var(--mf-text-muted)" }}>
            ·
          </span>
          <span style={{ fontSize: 12.5, color: "var(--mf-text-muted)" }}>
            {formatRelativeTime(activity.createdAt)}
          </span>
        </div>

        {/* 本文 */}
        <div
          style={{
            fontFamily: "var(--mf-font-sans)",
            fontSize: 14,
            lineHeight: 1.65,
            color: "var(--mf-ink)",
            whiteSpace: "pre-wrap",
          }}
        >
          {displayBody}
        </div>

        {/* もっと見る */}
        {isLong && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            style={{
              marginTop: 4,
              fontSize: 12.5,
              color: "var(--mf-accent)",
              fontFamily: "var(--mf-font-sans)",
              fontWeight: 600,
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
              marginTop: 10,
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(activity.imageUrls.length, 2)}, 1fr)`,
              gap: 3,
              borderRadius: 14,
              overflow: "hidden",
              border: "0.5px solid var(--mf-line-soft)",
            }}
          >
            {activity.imageUrls.slice(0, 4).map((url, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  aspectRatio:
                    activity.imageUrls!.length === 1 ? "16/10" : "1/1",
                }}
              >
                <Image
                  src={url}
                  alt={`画像 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 384px) 100vw, 192px"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        )}

        {/* アクション行 or リンク数表示 */}
        {showActions ? (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {linkedCount > 0 && (
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: "var(--mf-text-muted)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "var(--mf-font-sans)",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.5 9.5a3.54 3.54 0 005 0l2-2a3.54 3.54 0 00-5-5l-1 1" />
                  <path d="M9.5 6.5a3.54 3.54 0 00-5 0l-2 2a3.54 3.54 0 005 5l1-1" />
                </svg>
                <span>{linkedCount}</span>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "var(--mf-text-muted)",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontFamily: "var(--mf-font-sans)",
              }}
            >
              <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 2a1.414 1.414 0 012 2L5 12l-3 1 1-3L11 2z" />
              </svg>
              <span>編集</span>
            </button>
          </div>
        ) : linkedCount > 0 ? (
          <div
            style={{
              marginTop: 10,
              padding: "8px 10px",
              background: "var(--mf-surface-card)",
              border: "1px solid var(--mf-line-soft)",
              borderRadius: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--mf-text-sub)",
              fontFamily: "var(--mf-font-sans)",
              whiteSpace: "nowrap",
            }}
          >
            <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M6.5 9.5a3.54 3.54 0 005 0l2-2a3.54 3.54 0 00-5-5l-1 1" />
              <path d="M9.5 6.5a3.54 3.54 0 00-5 0l-2 2a3.54 3.54 0 005 5l1-1" />
            </svg>
            <span>
              <b style={{ color: "var(--mf-text)", fontWeight: 600 }}>{linkedCount}</b>{" "}
              件のリンク
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SeedRow;
