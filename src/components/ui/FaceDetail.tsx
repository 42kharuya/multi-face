"use client";

import { faceRepository } from "@/repositories/face-repository";
import { activityRepository } from "@/repositories/activity-repository";
import { userRepository } from "@/repositories/user-repository";
import { useDetailPanel } from "@/lib/detail-panel-context";
import { createLookupMap, getFaceTitle } from "@/lib/display";
import FaceBadge from "./FaceBadge";
import SeedRow from "./SeedRow";

type FaceDetailProps = {
  faceId: string;
};

const FaceDetail = ({ faceId }: FaceDetailProps) => {
  const { close, openActivity } = useDetailPanel();

  const face = faceRepository.findById(faceId);
  const currentUser = userRepository.getCurrentUser();
  const userMap = createLookupMap(userRepository.listAll(), (user) => user.id);

  if (!face) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "0.5px solid var(--mf-line)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--mf-brand)" }}>
            フェイス詳細
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
          <p style={{ fontSize: 13, color: "var(--mf-text-muted)" }}>フェイスが見つかりませんでした</p>
        </div>
      </div>
    );
  }

  const activities = activityRepository.listByFaceId(faceId);
  const isOwner = face.userId === currentUser.id;
  const faceTitle = getFaceTitle(face) || face.name;
  void isOwner;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
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
          フェイス詳細
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

      {/* フェイスサマリー */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          borderBottom: "0.5px solid var(--mf-line)",
        }}
      >
        <FaceBadge face={face} size={48} radius={13} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--mf-brand)" }}>
            {faceTitle}
          </div>
          {face.description && (
            <p
              style={{
                fontSize: 12.5,
                lineHeight: 1.7,
                color: "var(--mf-text-sub)",
                margin: "4px 0 0",
              }}
            >
              {face.description}
            </p>
          )}
          <div
            style={{
              marginTop: 6,
              fontSize: 11,
              color: "var(--mf-text-muted)",
            }}
          >
            {activities.length} シード
          </div>
        </div>
      </div>

      {/* アクティビティ一覧 */}
      <div style={{ padding: "0 16px 16px" }}>
        <p
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            color: "var(--mf-text-muted)",
            padding: "12px 0 4px",
          }}
        >
          このフェイスのシード
        </p>
        {activities.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--mf-text-muted)" }}>
            まだシードがありません
          </p>
        ) : (
          activities.map((activity, i) => {
            const activityUser = userMap.get(activity.userId);
            if (!activityUser) return null;
            return (
              <SeedRow
                key={activity.id}
                activity={activity}
                face={face}
                onClick={() => openActivity(activity.id)}
                noBorder={i === activities.length - 1}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default FaceDetail;
