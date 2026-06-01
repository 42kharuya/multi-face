"use client";

import { useState, useMemo } from "react";
import { faceRepository } from "@/repositories/face-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { userRepository } from "@/repositories/user-repository";
import FaceFilterBar from "./FaceFilterBar";
import ActivityFeed from "./ActivityFeed";
import PostModal from "@/components/ui/PostModal";
import FaceBadge from "@/components/ui/FaceBadge";
import FaceChip from "@/components/ui/FaceChip";
import { getFaceTitle } from "@/lib/display";

const REFERENCE_DATE = new Date("2026-04-01");

const HomeClient = () => {
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = userRepository.getCurrentUser();
  const faces = faceRepository.listByUserId(user.id);

  // On This Day: 同じ月日の過去のアクティビティを取得
  const onThisDayActivities = useMemo(() => {
    const mmdd = REFERENCE_DATE.toISOString().slice(5, 10); // "04-01"
    const allUserActivities = activityRepository.listByUserId(user.id);
    return allUserActivities
      .filter((a) => {
        const actDate = a.createdAt.slice(0, 10);
        return actDate.slice(5) === mmdd && !actDate.startsWith("2026");
      })
      .slice(0, 1);
  }, [user.id]);

  const defaultFace = faces[0] ?? null;

  const today = REFERENCE_DATE;
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

      {/* インラインコンポーズ */}
      <div
        style={{
          padding: "12px 18px 12px",
          borderBottom: "0.5px solid var(--mf-line)",
        }}
        className="md:px-[28px]"
      >
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 14,
            background: "var(--mf-surface)",
            border: "0.5px solid var(--mf-line)",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {defaultFace && (
            <FaceBadge face={defaultFace} size={32} radius={9} />
          )}
          <span
            style={{
              flex: 1,
              fontSize: 14,
              color: "var(--mf-text-faint)",
              fontFamily: "var(--mf-font-sans)",
            }}
          >
            今、何を書く？
          </span>
          <span
            style={{
              padding: "5px 14px",
              borderRadius: 999,
              background: "var(--mf-accent)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            投稿
          </span>
        </button>
      </div>

      {/* On This Day */}
      {onThisDayActivities.length > 0 && (() => {
        const act = onThisDayActivities[0];
        const face = faceRepository.findById(act.faceId);
        const year = parseInt(act.createdAt.slice(0, 4), 10);
        const yearsAgo = REFERENCE_DATE.getFullYear() - year;
        const mmdd = act.createdAt.slice(5, 10).replace("-", "/");
        return (
          <div style={{ padding: "22px 28px 6px" }}>
            {/* ヘッダー: アクセントライン + ON THIS DAY + N年前の今日 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ width: 14, height: 1, background: "var(--mf-accent)", flexShrink: 0 }} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--mf-accent)",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                On This Day
              </span>
              <span style={{ fontSize: 11.5, color: "var(--mf-text-muted)" }}>
                · {yearsAgo}年前の今日
              </span>
            </div>
            {/* カード */}
            <div
              style={{
                background: "var(--mf-surface-card)",
                borderRadius: 16,
                padding: "14px 16px",
                border: "0.5px solid var(--mf-line-soft)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {face && <FaceChip faceId={face.id} title={getFaceTitle(face)} />}
                <span style={{ fontSize: 11, color: "var(--mf-text-muted)" }}>
                  {act.createdAt.slice(0, 4)}.{mmdd}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  color: "var(--mf-ink)",
                  margin: 0,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {act.body}
              </p>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: "var(--mf-text-muted)",
                  fontStyle: "italic",
                  margin: "8px 0 0",
                }}
              >
                今のあなたは、何と返しますか
              </p>
            </div>
          </div>
        );
      })()}

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

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default HomeClient;
