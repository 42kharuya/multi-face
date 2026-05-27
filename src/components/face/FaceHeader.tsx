"use client";

import Image from "next/image";
import { useState } from "react";
import { type Face } from "@/types/face";
import FaceBadge from "@/components/ui/FaceBadge";
import { getFaceTitle } from "@/lib/display";
import { activityRepository } from "@/repositories/activity-repository";
import { subscriptionRepository } from "@/repositories/subscription-repository";

export type SortOrder = "newest" | "oldest" | "images";

type FaceHeaderProps = {
  face: Face;
  isOwner?: boolean;
  onSortChange?: (sort: SortOrder) => void;
};

const REFERENCE_DATE = "2026-04";

const FaceHeader = ({ face, isOwner = false, onSortChange }: FaceHeaderProps) => {
  const [subscribed, setSubscribed] = useState(() =>
    subscriptionRepository.getSubscribedFaceIds().includes(face.id)
  );
  const [sort, setSort] = useState<SortOrder>("newest");

  const faceActivities = activityRepository.listByFaceId(face.id);
  const totalSeeds = faceActivities.length;
  const monthlySeeds = faceActivities.filter((a) => a.createdAt.startsWith(REFERENCE_DATE)).length;
  const subscriberCount = 12; // モック値

  const handleSort = (s: SortOrder) => {
    setSort(s);
    onSortChange?.(s);
  };

  const SORT_LABELS: { key: SortOrder; label: string }[] = [
    { key: "newest", label: "新しい順" },
    { key: "oldest", label: "古い順" },
    { key: "images", label: "画像あり" },
  ];

  return (
    <div>
      {face.imageUrl ? (
        /* カバー画像あり */
        <div style={{ position: "relative", aspectRatio: "16/9", width: "100%" }}>
          <Image
            src={face.imageUrl}
            alt={face.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(20,24,36,0.80) 0%, rgba(20,24,36,0.35) 50%, transparent 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              textAlign: "center",
            }}
          >
            <FaceBadge face={face} size={56} radius={15} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>
                {getFaceTitle(face)}
              </h1>
              {face.isPrivate && (
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.4)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  非公開
                </span>
              )}
            </div>
            {face.description && (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", maxWidth: 320, margin: 0 }}>
                {face.description}
              </p>
            )}
            {!isOwner && (
              <button
                type="button"
                onClick={() => setSubscribed((prev) => !prev)}
                style={{
                  marginTop: 4,
                  padding: "8px 24px",
                  borderRadius: 999,
                  background: subscribed ? "rgba(255,255,255,0.15)" : "var(--mf-accent)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {subscribed ? "✓ サブスク中" : "サブスクする"}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* カバー画像なし */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "28px 24px 20px",
            textAlign: "center",
          }}
        >
          <FaceBadge face={face} size={56} radius={15} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--mf-brand)",
                margin: 0,
              }}
            >
              {getFaceTitle(face)}
            </h1>
            {face.isPrivate && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "var(--mf-surface-tint)",
                  fontSize: 11,
                  color: "var(--mf-text-muted)",
                }}
              >
                非公開
              </span>
            )}
          </div>
          {face.description && (
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: "var(--mf-text-sub)",
                maxWidth: 320,
                margin: 0,
              }}
            >
              {face.description}
            </p>
          )}
          {!isOwner && (
            <button
              type="button"
              onClick={() => setSubscribed((prev) => !prev)}
              style={{
                padding: "8px 24px",
                borderRadius: 999,
                background: subscribed ? "var(--mf-surface-tint)" : "var(--mf-accent)",
                color: subscribed ? "var(--mf-text-sub)" : "#fff",
                fontSize: 13,
                fontWeight: 700,
                border: subscribed ? "1px solid var(--mf-line)" : "none",
                cursor: "pointer",
              }}
            >
              {subscribed ? "✓ サブスク中" : "サブスクする"}
            </button>
          )}
        </div>
      )}

      {/* 統計行 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: "12px 24px",
          borderBottom: "0.5px solid var(--mf-line)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--mf-brand)" }}>
            {totalSeeds}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--mf-text-muted)", marginTop: 1 }}>シード</div>
        </div>
        <div style={{ width: 0.5, height: 28, background: "var(--mf-line)" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--mf-brand)" }}>
            {monthlySeeds}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--mf-text-muted)", marginTop: 1 }}>今月</div>
        </div>
        {!isOwner && (
          <>
            <div style={{ width: 0.5, height: 28, background: "var(--mf-line)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--mf-brand)" }}>
                {subscriberCount}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--mf-text-muted)", marginTop: 1 }}>サブスク</div>
            </div>
          </>
        )}
      </div>

      {/* ソートピル */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderBottom: "0.5px solid var(--mf-line)",
          overflowX: "auto",
        }}
        className="mf-scroll"
      >
        {SORT_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSort(key)}
            style={{
              padding: "5px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: sort === key ? 700 : 400,
              background: sort === key ? "var(--mf-brand)" : "var(--mf-surface-tint)",
              color: sort === key ? "#fff" : "var(--mf-text-sub)",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FaceHeader;
