"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Face } from "@/types/face";
import FaceBadge from "@/components/ui/FaceBadge";
import { getFaceTitle } from "@/lib/display";
import CreateFaceModal from "./CreateFaceModal";

type Props = {
  initialFaces: Face[];
};

const FacesClient = ({ initialFaces }: Props) => {
  const [faces, setFaces] = useState<Face[]>(initialFaces);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (newFace: Face) => {
    setFaces((prev) => [newFace, ...prev]);
  };

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
          {faces.map((face) => (
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
                  transition: "box-shadow 0.15s",
                  cursor: "pointer",
                }}
              >
                {/* カバー画像 or FaceBadgeフォールバック */}
                {face.imageUrl ? (
                  <div style={{ position: "relative", aspectRatio: "16/10" }}>
                    <Image
                      src={face.imageUrl}
                      alt={face.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      aspectRatio: "16/10",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--mf-surface-tint)",
                    }}
                  >
                    <FaceBadge face={face} size={48} radius={13} />
                  </div>
                )}

                {/* カード本文 */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <FaceBadge face={face} size={20} radius={5} />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--mf-brand)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getFaceTitle(face)}
                    </span>
                  </div>
                  {face.description && (
                    <p
                      style={{
                        fontSize: 11.5,
                        lineHeight: 1.6,
                        color: "var(--mf-text-sub)",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        margin: 0,
                      }}
                    >
                      {face.description}
                    </p>
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
          ))}

          {/* 新規フェイス作成カード */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              height: 156,
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
