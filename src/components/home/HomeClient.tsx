"use client";

import { useState } from "react";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import FaceFilterBar from "./FaceFilterBar";
import ActivityFeed from "./ActivityFeed";
import PostModal from "@/components/ui/PostModal";
import FaceBadge from "@/components/ui/FaceBadge";

const REFERENCE_DATE = new Date("2026-04-01");

const HomeClient = () => {
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = userRepository.getCurrentUser();
  const faces = faceRepository.listByUserId(user.id);
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
      <div style={{ padding: "0 18px" }}>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 16,
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
