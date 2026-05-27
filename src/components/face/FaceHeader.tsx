"use client";

import Image from "next/image";
import { useState } from "react";
import { type Face } from "@/types/face";
import FaceBadge from "@/components/ui/FaceBadge";
import { getFaceTitle } from "@/lib/display";

type FaceHeaderProps = {
  face: Face;
  isOwner?: boolean;
};

const FaceHeader = ({ face, isOwner = false }: FaceHeaderProps) => {
  const [subscribed, setSubscribed] = useState(false);

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
            padding: "28px 24px",
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
    </div>
  );
};

export default FaceHeader;
