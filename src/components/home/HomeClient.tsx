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

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* インラインコンポーズ */}
      <div
        style={{
          padding: "12px 28px",
          borderBottom: "0.5px solid var(--mf-line)",
        }}
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
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px 6px",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            color: "var(--mf-text-muted)",
          }}
        >
          最近のシード
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
