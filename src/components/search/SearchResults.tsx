"use client";

import { type Activity } from "@/types/activity";
import { type User } from "@/types/user";
import { type Face } from "@/types/face";
import SeedRow from "@/components/ui/SeedRow";
import FaceBadge from "@/components/ui/FaceBadge";
import { getFaceTitle } from "@/lib/display";
import { useDetailPanel } from "@/lib/detail-panel-context";

export type SearchActivityResultItem = {
  activity: Activity;
  user: User;
  face: Face;
};

type SearchResultsProps = {
  query: string;
  activityResults: SearchActivityResultItem[];
  faceResults: Face[];
  subscribedFaceIds: string[];
};

const SearchResults = ({
  query,
  activityResults,
  faceResults,
  subscribedFaceIds,
}: SearchResultsProps) => {
  const { state, openActivity, openFace } = useDetailPanel();

  if (!query) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "80px 0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 32 }}>🔍</p>
        <p style={{ fontSize: 13, color: "var(--mf-text-muted)" }}>
          キーワードを入力して検索してください
        </p>
        <p style={{ fontSize: 11.5, color: "var(--mf-text-faint)" }}>
          フェイス名・シード本文をスコープに応じて絞り込みます
        </p>
      </div>
    );
  }

  const totalCount = faceResults.length + activityResults.length;

  if (totalCount === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "80px 0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 32 }}>😶</p>
        <p style={{ fontSize: 13, color: "var(--mf-text-muted)" }}>
          「{query}」に一致する結果が見つかりませんでした
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* フェイス検索結果 */}
      {faceResults.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: "var(--mf-text-muted)",
              marginBottom: 8,
            }}
          >
            フェイス
            <span style={{ marginLeft: 6, color: "var(--mf-accent)", fontWeight: 700 }}>
              {faceResults.length}
            </span>
          </h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none", padding: 0, margin: 0 }}>
            {faceResults.map((face) => {
              const isSubscribed = subscribedFaceIds.includes(face.id);
              const isSelected = state.type === "face" && state.faceId === face.id;
              return (
                <li
                  key={face.id}
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth >= 768) {
                      openFace(face.id);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: isSelected
                      ? "rgba(30,42,74,0.06)"
                      : "var(--mf-surface-card)",
                    border: `0.5px solid ${isSelected ? "var(--mf-brand)" : "var(--mf-line)"}`,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <FaceBadge face={face} size={36} radius={10} />
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--mf-brand)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          margin: 0,
                        }}
                      >
                        {getFaceTitle(face)}
                      </p>
                      {face.description && (
                        <p
                          style={{
                            fontSize: 11.5,
                            color: "var(--mf-text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            margin: "2px 0 0",
                          }}
                        >
                          {face.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    style={{
                      flexShrink: 0,
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: isSubscribed ? "1px solid var(--mf-brand)" : "none",
                      background: isSubscribed ? "transparent" : "var(--mf-accent)",
                      color: isSubscribed ? "var(--mf-brand)" : "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "not-allowed",
                    }}
                    disabled
                    aria-label={
                      isSubscribed
                        ? `${face.name}のサブスクを解除`
                        : `${face.name}をサブスクする`
                    }
                  >
                    {isSubscribed ? "サブスク中" : "サブスクする"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* シード検索結果 */}
      {activityResults.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: "var(--mf-text-muted)",
              marginBottom: 8,
            }}
          >
            シード
            <span style={{ marginLeft: 6, color: "var(--mf-accent)", fontWeight: 700 }}>
              {activityResults.length}
            </span>
          </h2>
          <div>
            {activityResults.map(({ activity, face }, i) => (
              <SeedRow
                key={activity.id}
                activity={activity}
                face={face}
                onClick={() => openActivity(activity.id)}
                noBorder={i === activityResults.length - 1}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchResults;
