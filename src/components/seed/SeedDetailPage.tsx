"use client";

import Image from "next/image";
import Link from "next/link";
import type { Activity } from "@/types/activity";
import type { Face } from "@/types/face";
import { activityRepository } from "@/repositories/activity-repository";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import FaceBadge from "@/components/ui/FaceBadge";
import { getFaceTitle, getFaceColor } from "@/lib/display";
import { formatRelativeTime } from "@/lib/format-relative-time";

type LinkedSeedRowProps = {
  activity: Activity;
  incoming?: boolean;
};

const LinkedSeedRow = ({ activity, incoming = false }: LinkedSeedRowProps) => {
  const face = faceRepository.findById(activity.faceId);
  const user = userRepository.findById(activity.userId);
  if (!face) return null;

  const faceColor = getFaceColor(face.id);

  return (
    <Link
      href={`/seeds/${activity.id}`}
      style={{
        display: "flex",
        gap: 10,
        padding: "12px 12px",
        background: "var(--mf-surface)",
        borderRadius: 12,
        border: "0.5px solid var(--mf-line-soft)",
        borderLeft: `2.5px solid ${incoming ? "var(--mf-accent)" : faceColor}`,
        marginBottom: 8,
        textDecoration: "none",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <FaceBadge face={face} size={28} radius={7} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 5,
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--mf-brand)" }}>
            {getFaceTitle(face)}
          </span>
          {user?.handle && (
            <span style={{ fontSize: 11, color: "var(--mf-text-muted)" }}>@{user.handle}</span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--mf-text-muted)" }}>
            {formatRelativeTime(activity.createdAt)}
          </span>
        </div>
        <div
          style={{
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "var(--mf-ink)",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {activity.body}
        </div>
      </div>
    </Link>
  );
};

type Props = {
  activity: Activity;
  face: Face;
  isOwner: boolean;
};

const SeedDetailPage = ({ activity, face, isOwner }: Props) => {
  const user = userRepository.findById(activity.userId);
  const isPrivate = face.isPrivate;

  // 発信リンク（このシードが参照しているシード）
  const outgoingLinks = (activity.linkedActivityIds ?? []).flatMap((id) => {
    const act = activityRepository.findById(id);
    return act ? [act] : [];
  });

  // 被リンク（このシードを参照している他のシード）
  const allActivities = activityRepository.listAll();
  const incomingLinks = allActivities.filter(
    (a) => a.id !== activity.id && (a.linkedActivityIds ?? []).includes(activity.id)
  );

  return (
    <div style={{ padding: "14px 18px 80px" }}>
      {/* 著者行 */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
        <FaceBadge face={face} size={40} radius={11} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--mf-brand)" }}>
              {getFaceTitle(face)}
            </span>
            {user?.handle && (
              <span style={{ fontSize: 12, color: "var(--mf-text-muted)" }}>@{user.handle}</span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--mf-text-sub)", marginTop: 1, whiteSpace: "nowrap" }}>
            {activity.createdAt.slice(0, 10).replace(/-/g, ".")} · {activity.createdAt.slice(11, 16)}
          </div>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 9px",
            background: "var(--mf-surface-tint)",
            borderRadius: 999,
            fontSize: 11,
            color: "var(--mf-text-sub)",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <svg width={11} height={11} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
            {isPrivate ? (
              <>
                <rect x={4} y={7} width={8} height={7} rx={1.5} />
                <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
              </>
            ) : (
              <>
                <circle cx={8} cy={8} r={6} />
                <path d="M2.5 8c0-1 1-3 5.5-3s5.5 2 5.5 3-1 3-5.5 3S2.5 9 2.5 8z" />
                <circle cx={8} cy={8} r={2} fill="currentColor" />
              </>
            )}
          </svg>
          {isPrivate ? "非公開" : "公開"}
        </div>
      </div>

      {/* 本文 */}
      <div
        style={{
          fontFamily: "var(--mf-font-sans)",
          fontSize: 16,
          lineHeight: 1.85,
          color: "var(--mf-ink)",
          letterSpacing: 0.2,
          whiteSpace: "pre-wrap",
          marginBottom: 16,
        }}
      >
        {activity.body}
      </div>

      {/* 画像グリッド */}
      {activity.imageUrls && activity.imageUrls.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 3,
            borderRadius: 14,
            overflow: "hidden",
            height: 180,
            border: "0.5px solid var(--mf-line-soft)",
            marginBottom: 14,
          }}
        >
          {activity.imageUrls.slice(0, 3).map((url, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                gridRow: i === 0 ? "1 / 3" : undefined,
              }}
            >
              <Image src={url} alt={`画像 ${i + 1}`} fill className="object-cover" sizes="300px" />
            </div>
          ))}
        </div>
      )}

      {/* アクション行 */}
      <div
        style={{
          padding: "12px 0",
          borderTop: "0.5px solid var(--mf-line)",
          borderBottom: "0.5px solid var(--mf-line)",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--mf-brand)",
            fontSize: 13,
            fontWeight: 600,
            padding: "4px 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 9.5a3.54 3.54 0 005 0l2-2a3.54 3.54 0 00-5-5l-1 1" />
            <path d="M9.5 6.5a3.54 3.54 0 00-5 0l-2 2a3.54 3.54 0 005 5l1-1" />
          </svg>
          このシードにリンク
        </button>
        {isOwner && (
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--mf-text-sub)",
              fontSize: 13,
              fontWeight: 600,
              padding: "4px 12px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 2a1.414 1.414 0 012 2L5 12l-3 1 1-3L11 2z" />
            </svg>
            編集
          </button>
        )}
      </div>

      {/* 発信リンク */}
      {outgoingLinks.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="var(--mf-brand)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 9.5a3.54 3.54 0 005 0l2-2a3.54 3.54 0 00-5-5l-1 1" />
              <path d="M9.5 6.5a3.54 3.54 0 00-5 0l-2 2a3.54 3.54 0 005 5l1-1" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--mf-brand)" }}>このシードのリンク</span>
            <span style={{ fontSize: 11.5, color: "var(--mf-text-muted)" }}>{outgoingLinks.length} 件</span>
          </div>
          {outgoingLinks.map((act) => (
            <LinkedSeedRow key={act.id} activity={act} />
          ))}
        </div>
      )}

      {/* 被リンク */}
      {incomingLinks.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="var(--mf-accent)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 9.5a3.54 3.54 0 005 0l2-2a3.54 3.54 0 00-5-5l-1 1" />
              <path d="M9.5 6.5a3.54 3.54 0 00-5 0l-2 2a3.54 3.54 0 005 5l1-1" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--mf-accent)" }}>このシードへのリンク</span>
            <span style={{ fontSize: 11.5, color: "var(--mf-text-muted)" }}>{incomingLinks.length} 件</span>
          </div>
          {incomingLinks.slice(0, 4).map((act) => (
            <LinkedSeedRow key={act.id} activity={act} incoming />
          ))}
          {incomingLinks.length > 4 && (
            <div style={{ textAlign: "center", padding: "10px", fontSize: 12, color: "var(--mf-text-sub)", fontWeight: 600 }}>
              さらに {incomingLinks.length - 4} 件を見る →
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeedDetailPage;
