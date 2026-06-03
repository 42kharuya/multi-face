"use client";

import { useState, useMemo } from "react";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { getFaceTitle } from "@/lib/display";
import FaceFilterBar from "./FaceFilterBar";
import ActivityFeed from "./ActivityFeed";
import FaceChip from "@/components/ui/FaceChip";

const REFERENCE_DATE = new Date("2026-04-01");

const HomeClient = () => {
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);

  const user = userRepository.getCurrentUser();
  const faces = faceRepository.listByUserId(user.id);

  const today = REFERENCE_DATE;

  const allActivities = activityRepository.listByUserId(user.id);
  const mmdd = REFERENCE_DATE.toISOString().slice(5, 10);
  const onThisDay = useMemo(
    () =>
      allActivities.find((a) => {
        const d = a.createdAt.slice(0, 10);
        return d.slice(5) === mmdd && !d.startsWith("2026");
      }),
    [allActivities, mmdd]
  );
  const onThisDayFace = onThisDay ? faceRepository.findById(onThisDay.faceId) : undefined;
  const yearsAgo = onThisDay
    ? REFERENCE_DATE.getFullYear() - parseInt(onThisDay.createdAt.slice(0, 4), 10)
    : 0;
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][today.getDay()];
  const dateLabel = `${today.getMonth() + 1}月${today.getDate()}日 (${weekday})`;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* モバイル専用タイトル (PC は TopBar が担当) */}
      <div
        className="md:hidden"
        style={{ padding: "4px 18px 14px" }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--mf-brand)", letterSpacing: -0.3 }}>
            書く
          </div>
          <div style={{ fontSize: 12, color: "var(--mf-text-sub)", fontWeight: 500 }}>
            {dateLabel}
          </div>
        </div>
      </div>

      {/* On This Day — PC は ContextRail が担当するため lg:hidden */}
      {onThisDay && onThisDayFace && (
        <div className="lg:hidden" style={{ padding: "14px 18px 0" }}>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: "var(--mf-surface)",
              border: "0.5px solid var(--mf-line)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--mf-text-muted)", letterSpacing: 0.6, textTransform: "uppercase" }}>
                On This Day
              </span>
              <span style={{ fontSize: 11, color: "var(--mf-text-muted)" }}>{yearsAgo}年前</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <FaceChip faceId={onThisDayFace.id} title={getFaceTitle(onThisDayFace)} />
              <span style={{ fontSize: 10.5, color: "var(--mf-text-muted)" }}>
                {onThisDay.createdAt.slice(0, 10).replace(/-/g, ".")}
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.65,
                color: "var(--mf-ink)",
                margin: 0,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {onThisDay.body}
            </p>
            <p style={{ marginTop: 8, fontSize: 11, color: "var(--mf-text-muted)", fontStyle: "italic", margin: "8px 0 0" }}>
              今のあなたは、何と返しますか
            </p>
          </div>
        </div>
      )}

      {/* 最近のシード セクションヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "20px 18px 4px",
        }}
      >
        <span
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            letterSpacing: 0.2,
            color: "var(--mf-brand)",
          }}
        >
          最近のシード
        </span>
        <span
          style={{
            fontSize: 11.5,
            color: "var(--mf-text-muted)",
          }}
        >
          すべて見る
        </span>
      </div>

      <FaceFilterBar
        faces={faces}
        selectedFaceId={selectedFaceId}
        onSelect={setSelectedFaceId}
      />
      <div style={{ padding: "0 28px" }}>
        <ActivityFeed selectedFaceId={selectedFaceId} />
      </div>

    </div>
  );
};

export default HomeClient;
