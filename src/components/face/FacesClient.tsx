"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Face } from "@/types/face";
import { getFaceTitle, getFaceColor, getFaceKanji } from "@/lib/display";
import { activityRepository } from "@/repositories/activity-repository";
import CreateFaceModal from "./CreateFaceModal";

type Props = {
  initialFaces: Face[];
};

const REFERENCE_DATE = new Date("2026-04-01");

const FacesClient = ({ initialFaces }: Props) => {
  const [faces, setFaces] = useState<Face[]>(initialFaces);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (newFace: Face) => {
    setFaces((prev) => [newFace, ...prev]);
  };

  // フェイスごとの統計を事前計算
  const faceStats = useMemo(() => {
    const allActivities = activityRepository.listAll();
    const thisMonth = REFERENCE_DATE.toISOString().slice(0, 7); // "2026-04"
    const stats = new Map<string, { total: number; monthly: number; lastDate: string | null }>();
    for (const face of faces) {
      const faceActivities = allActivities.filter((a) => a.faceId === face.id);
      const monthly = faceActivities.filter((a) => a.createdAt.startsWith(thisMonth)).length;
      const sorted = [...faceActivities].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      stats.set(face.id, {
        total: faceActivities.length,
        monthly,
        lastDate: sorted[0]?.createdAt.slice(0, 10) ?? null,
      });
    }
    return stats;
  }, [faces]);

  return (
    <main style={{ display: "flex", flexDirection: "column", paddingBottom: 24 }}>
      {faces.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: "80px 0",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--mf-text-muted)" }}>
            フェイスがありません
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              background: "var(--mf-brand)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            最初のフェイスを作る
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: "20px 28px 32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          {faces.map((face) => {
            const color = getFaceColor(face.id);
            const kanji = getFaceKanji(getFaceTitle(face));
            const stats = faceStats.get(face.id);
            return (
              <Link
                key={face.id}
                href={`/faces/${face.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "var(--mf-surface)",
                    border: "0.5px solid var(--mf-line)",
                    cursor: "pointer",
                  }}
                >
                  {/* カラーバンド (56px) */}
                  <div
                    style={{
                      height: 56,
                      background: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.22)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--mf-font-serif)",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      {kanji}
                    </div>
                  </div>

                  {/* カード本文 */}
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--mf-brand)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: 8,
                      }}
                    >
                      {getFaceTitle(face)}
                    </div>

                    {/* 統計行 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 11, color: "var(--mf-text-sub)" }}>
                        <b style={{ color: "var(--mf-text)", fontWeight: 700, fontSize: 13 }}>
                          {stats?.total ?? 0}
                        </b>{" "}
                        シード
                      </span>
                      {stats && stats.monthly > 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--mf-accent)",
                            fontWeight: 600,
                            background: "rgba(212,146,42,0.1)",
                            padding: "2px 6px",
                            borderRadius: 999,
                          }}
                        >
                          +{stats.monthly}/月
                        </span>
                      )}
                    </div>

                    {/* 最終投稿日 */}
                    {stats?.lastDate && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--mf-text-faint)",
                        }}
                      >
                        最終: {stats.lastDate.replace(/-/g, "/")}
                      </div>
                    )}

                    {face.isPrivate && (
                      <span
                        style={{
                          marginTop: 6,
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "var(--mf-surface-tint)",
                          fontSize: 10,
                          color: "var(--mf-text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        非公開
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}

          {/* 新規フェイス作成カード */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              minHeight: 130,
              borderRadius: 14,
              border: "1.5px dashed var(--mf-line)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              color: "var(--mf-text-muted)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <svg width={24} height={24} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M10 4v12M4 10h12" />
            </svg>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>新しいフェイスを作る</div>
            <div style={{ fontSize: 10.5 }}>多面性を、もう一つ</div>
          </button>
        </div>
      )}

      <CreateFaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </main>
  );
};

export default FacesClient;
