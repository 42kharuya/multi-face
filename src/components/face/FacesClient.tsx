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

type SortType = "lastAt" | "total" | "name";
type ViewType = "grid" | "list";

const REFERENCE_DATE = new Date("2026-04-01");

const FacesClient = ({ initialFaces }: Props) => {
  const [faces, setFaces] = useState<Face[]>(initialFaces);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("lastAt");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleCreate = (newFace: Face) => {
    setFaces((prev) => [newFace, ...prev]);
  };

  const faceStats = useMemo(() => {
    const allActivities = activityRepository.listAll();
    const thisMonth = REFERENCE_DATE.toISOString().slice(0, 7);
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

  const filteredFaces = useMemo(() => {
    let result = [...faces];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) =>
        getFaceTitle(f).toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const sa = faceStats.get(a.id);
      const sb = faceStats.get(b.id);
      if (sortType === "lastAt") {
        const da = sa?.lastDate ?? "";
        const db = sb?.lastDate ?? "";
        return db.localeCompare(da);
      }
      if (sortType === "total") {
        return (sb?.total ?? 0) - (sa?.total ?? 0);
      }
      return getFaceTitle(a).localeCompare(getFaceTitle(b), "ja");
    });
    return result;
  }, [faces, faceStats, searchQuery, sortType]);

  const SORT_LABELS: Record<SortType, string> = {
    lastAt: "最終投稿日順",
    total: "シード数順",
    name: "名前順",
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", paddingBottom: 24 }}>
      {/* 検索バー */}
      <div style={{ padding: "12px 20px 8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: "var(--mf-surface)",
            borderRadius: 12,
            border: "0.5px solid var(--mf-line)",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="var(--mf-text-muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={6.5} cy={6.5} r={4.5} />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="自分のシードを全文検索"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: 13.5,
              color: "var(--mf-text)",
              outline: "none",
              fontFamily: "var(--mf-font-sans)",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mf-text-muted)", padding: 0 }}
            >
              <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ソートコントロール */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 20px 12px",
        }}
      >
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowSortMenu((p) => !p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12.5,
              color: "var(--mf-text-sub)",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            {SORT_LABELS[sortType]}
            <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>
          {showSortMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                zIndex: 20,
                background: "var(--mf-surface)",
                borderRadius: 10,
                border: "0.5px solid var(--mf-line)",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(30,42,74,0.12)",
                minWidth: 140,
              }}
            >
              {(Object.entries(SORT_LABELS) as [SortType, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSortType(key);
                    setShowSortMenu(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: sortType === key ? 700 : 400,
                    color: sortType === key ? "var(--mf-brand)" : "var(--mf-text)",
                    background: sortType === key ? "var(--mf-hover)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* グリッド/リスト切替 */}
        <div style={{ display: "flex", gap: 2 }}>
          <button
            type="button"
            onClick={() => setViewType("grid")}
            aria-label="グリッド表示"
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 7,
              background: viewType === "grid" ? "var(--mf-brand)" : "transparent",
              border: "none",
              cursor: "pointer",
              color: viewType === "grid" ? "#fff" : "var(--mf-text-muted)",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 14 14" fill="currentColor">
              <rect x={0} y={0} width={6} height={6} rx={1} />
              <rect x={8} y={0} width={6} height={6} rx={1} />
              <rect x={0} y={8} width={6} height={6} rx={1} />
              <rect x={8} y={8} width={6} height={6} rx={1} />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewType("list")}
            aria-label="リスト表示"
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 7,
              background: viewType === "list" ? "var(--mf-brand)" : "transparent",
              border: "none",
              cursor: "pointer",
              color: viewType === "list" ? "#fff" : "var(--mf-text-muted)",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              <path d="M2 3h10M2 7h10M2 11h10" />
            </svg>
          </button>
        </div>
      </div>

      {filteredFaces.length === 0 && faces.length === 0 ? (
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
      ) : filteredFaces.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--mf-text-muted)" }}>
            「{searchQuery}」に一致するフェイスが見つかりません
          </p>
        </div>
      ) : viewType === "grid" ? (
        <div
          style={{
            padding: "0 20px 32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          {filteredFaces.map((face) => {
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
                    height: 156,
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "var(--mf-surface)",
                    border: "0.5px solid var(--mf-line)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
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
                      flexShrink: 0,
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
                  <div style={{ padding: "10px 12px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        fontSize: 14.5,
                        fontWeight: 700,
                        color: "var(--mf-brand)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: 6,
                      }}
                    >
                      {getFaceTitle(face)}
                    </div>

                    {/* 統計行 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 11, color: "var(--mf-text-sub)" }}>
                        <b style={{ color: "var(--mf-text)", fontWeight: 700, fontSize: 17 }}>
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
                          }}
                        >
                          +{stats.monthly}/月
                        </span>
                      )}
                    </div>

                    {/* 最終投稿日 */}
                    {stats?.lastDate && (
                      <div style={{ fontSize: 10.5, color: "var(--mf-text-faint)", marginTop: "auto" }}>
                        {stats.lastDate.replace(/-/g, "/")}
                      </div>
                    )}

                    {face.isPrivate && (
                      <span
                        style={{
                          marginTop: 4,
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "var(--mf-surface-tint)",
                          fontSize: 10,
                          color: "var(--mf-text-muted)",
                          fontWeight: 600,
                          alignSelf: "flex-start",
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
          </button>
        </div>
      ) : (
        /* リストビュー */
        <div style={{ padding: "0 0 32px" }}>
          {filteredFaces.map((face, i) => {
            const color = getFaceColor(face.id);
            const kanji = getFaceKanji(getFaceTitle(face));
            const stats = faceStats.get(face.id);
            return (
              <Link key={face.id} href={`/faces/${face.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 20px",
                    borderBottom: i < filteredFaces.length - 1 ? "0.5px solid var(--mf-line-soft)" : "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontFamily: "var(--mf-font-serif)", fontSize: 18, fontWeight: 600, color: "#fff" }}>
                      {kanji}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--mf-brand)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {getFaceTitle(face)}
                    </div>
                    {face.description && (
                      <div style={{ fontSize: 11.5, color: "var(--mf-text-sub)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {face.description}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--mf-brand)" }}>{stats?.total ?? 0}</div>
                    <div style={{ fontSize: 10.5, color: "var(--mf-text-muted)" }}>シード</div>
                  </div>
                </div>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--mf-text-muted)",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, border: "1.5px dashed var(--mf-line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={18} height={18} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>新しいフェイスを作る</span>
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
