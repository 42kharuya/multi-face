"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activityRepository } from "@/repositories/activity-repository";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import { subscriptionRepository } from "@/repositories/subscription-repository";
import { getFaceTitle, getFaceColor } from "@/lib/display";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { Face } from "@/types/face";
import FaceBadge from "./FaceBadge";
import FaceChip from "./FaceChip";
import RailCard from "./RailCard";
import SeedRow from "./SeedRow";

const REFERENCE_DATE = new Date("2026-04-01");

// ── WritingRail ────────────────────────────────────────────────
const WritingRail = () => {
  const user = userRepository.getCurrentUser();
  const allActivities = activityRepository.listByUserId(user.id);

  const thisMonth = REFERENCE_DATE.toISOString().slice(0, 7);
  const monthlyActs = allActivities.filter((a) => a.createdAt.startsWith(thisMonth));
  const monthlySeeds = monthlyActs.length;
  const monthlyFaces = new Set(monthlyActs.map((a) => a.faceId)).size;

  const dateSet = new Set(allActivities.map((a) => a.createdAt.slice(0, 10)));
  let streak = 0;
  const cur = new Date(REFERENCE_DATE);
  while (dateSet.has(cur.toISOString().slice(0, 10))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  // On This Day: 同じ月日の過去アクティビティ
  const mmdd = REFERENCE_DATE.toISOString().slice(5, 10);
  const onThisDay = allActivities.find((a) => {
    const d = a.createdAt.slice(0, 10);
    return d.slice(5) === mmdd && !d.startsWith("2026");
  });
  const onThisDayFace = onThisDay ? faceRepository.findById(onThisDay.faceId) : undefined;
  const yearsAgo = onThisDay
    ? REFERENCE_DATE.getFullYear() - parseInt(onThisDay.createdAt.slice(0, 4), 10)
    : 0;

  // 月間バーチャート（当月の日別シード数、31本）
  const daysInMonth = 31;
  const dailyCounts = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    const key = `${thisMonth}-${day}`;
    return monthlyActs.filter((a) => a.createdAt.startsWith(key)).length;
  });
  const maxCount = Math.max(...dailyCounts, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* On This Day */}
      {onThisDay && onThisDayFace && (
        <RailCard title="On This Day" action={`${yearsAgo}年前`}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <FaceChip faceId={onThisDayFace.id} title={getFaceTitle(onThisDayFace)} />
            <span style={{ fontSize: 10.5, color: "var(--mf-text-muted)" }}>
              {onThisDay.createdAt.slice(0, 10).replace(/-/g, ".")}
            </span>
          </div>
          <p
            style={{
              fontSize: 12.5,
              lineHeight: 1.65,
              color: "var(--mf-ink)",
              margin: 0,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {onThisDay.body}
          </p>
          <p style={{ marginTop: 6, fontSize: 11, color: "var(--mf-text-muted)", fontStyle: "italic", margin: "6px 0 0" }}>
            今のあなたは、何と返しますか
          </p>
        </RailCard>
      )}

      {/* 今月の記録 + バーチャート */}
      <RailCard title="今月の記録">
        <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
          {[
            { n: String(monthlySeeds), l: "シード" },
            { n: String(streak), l: "日連続" },
            { n: String(monthlyFaces), l: "フェイス" },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--mf-brand)", fontFamily: "var(--mf-font-serif-en)" }}>
                {s.n}
              </div>
              <div style={{ fontSize: 11, color: "var(--mf-text-muted)", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* バーチャート */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 40 }}>
          {dailyCounts.map((count, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: count === 0 ? 2 : `${Math.round((count / maxCount) * 100)}%`,
                background: count === 0 ? "var(--mf-line)" : "var(--mf-accent)",
                borderRadius: 2,
                opacity: count === 0 ? 0.3 : 0.7 + (count / maxCount) * 0.3,
                minHeight: count === 0 ? 2 : 4,
              }}
            />
          ))}
        </div>
      </RailCard>

    </div>
  );
};

// ── ReflectionRail ─────────────────────────────────────────────
const ReflectionRail = () => {
  const user = userRepository.getCurrentUser();
  const faces = faceRepository.listByUserId(user.id);
  const allActivities = activityRepository.listByUserId(user.id);

  const thisMonth = REFERENCE_DATE.toISOString().slice(0, 7);

  // 今月の各フェイスのシード数
  const monthlyCountMap = new Map<string, number>();
  for (const act of allActivities) {
    if (act.createdAt.startsWith(thisMonth)) {
      monthlyCountMap.set(act.faceId, (monthlyCountMap.get(act.faceId) ?? 0) + 1);
    }
  }

  const facesWithCount = faces
    .map((f) => ({ face: f, count: monthlyCountMap.get(f.id) ?? 0 }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCount = Math.max(...facesWithCount.map(({ count }) => count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <RailCard title="フェイスについて">
        <p style={{ fontSize: 12.5, lineHeight: 1.75, color: "var(--mf-text-sub)", margin: 0 }}>
          フェイスは「あなたの多面性」のひとつ。
          投稿したい内容にあったフェイスで書き、後から自分のために振り返ることができます。
        </p>
      </RailCard>

      <RailCard title="アクティビティ" action="今月">
        {facesWithCount.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--mf-text-muted)", margin: 0 }}>
            今月はまだ記録がありません
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {facesWithCount.map(({ face, count }) => {
              const color = getFaceColor(face.id);
              const pct = (count / maxCount) * 100;
              return (
                <div key={face.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FaceBadge face={face} size={24} radius={6} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--mf-text)" }}>{getFaceTitle(face)}</span>
                      <span style={{ fontSize: 11, color: "var(--mf-text-muted)", fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--mf-surface-tint)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </RailCard>
    </div>
  );
};

// ── CollectionRail ─────────────────────────────────────────────
const RECOMMENDED_FACES_MOCK = [
  { name: "読書", handle: "h_maru", subs: 412, desc: "読みながら考えたこと" },
  { name: "映画断片", handle: "sayaka_t", subs: 287, desc: "観終わってからしばらく" },
  { name: "朝の珈琲", handle: "kettle_co", subs: 198, desc: "一杯目のメモ" },
];

const CollectionRail = () => {
  const subscribedFaceIds = subscriptionRepository.getSubscribedFaceIds();
  const subscribedFaces: Face[] = subscribedFaceIds.flatMap((id) => {
    const face = faceRepository.findById(id);
    return face ? [face] : [];
  });
  const userMap = new Map(userRepository.listAll().map((u) => [u.id, u]));

  const RECOMMENDED_COLORS = ["#5B8DB8", "#7B6B9E", "#A89050"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {subscribedFaces.length > 0 ? (
        <RailCard title="サブスク中">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {subscribedFaces.map((face) => {
              const lastAct = activityRepository.listByFaceId(face.id)[0];
              const owner = userMap.get(face.userId);
              const hasUnread = lastAct && lastAct.createdAt >= "2026-03-25";
              return (
                <Link
                  key={face.id}
                  href={`/faces/${face.id}`}
                  style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <FaceBadge face={face} size={32} radius={9} />
                    {hasUnread && (
                      <div style={{
                        position: "absolute", top: -2, right: -2,
                        width: 8, height: 8, borderRadius: "50%",
                        background: "var(--mf-accent)",
                        border: "1.5px solid var(--mf-surface)",
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--mf-brand)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {getFaceTitle(face)}
                    </div>
                    {owner && (
                      <div style={{ fontSize: 11, color: "var(--mf-text-muted)", marginTop: 1 }}>
                        {owner.handle ? `@${owner.handle}` : owner.name}
                      </div>
                    )}
                  </div>
                  {lastAct && (
                    <span style={{ fontSize: 10.5, color: "var(--mf-text-faint)", flexShrink: 0 }}>
                      {formatRelativeTime(lastAct.createdAt)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </RailCard>
      ) : (
        <RailCard title="サブスク中">
          <p style={{ fontSize: 12.5, color: "var(--mf-text-muted)", margin: 0, lineHeight: 1.7 }}>
            サブスクしているフェイスがありません。
            <br />
            <Link href="/search" style={{ color: "var(--mf-accent)", textDecoration: "none", fontWeight: 600 }}>
              フェイスを探す →
            </Link>
          </p>
        </RailCard>
      )}

      {/* おすすめフェイス */}
      <RailCard title="おすすめ">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {RECOMMENDED_FACES_MOCK.map((rec, i) => (
            <div key={rec.handle} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: RECOMMENDED_COLORS[i % RECOMMENDED_COLORS.length],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontFamily: "var(--mf-font-serif)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {rec.name.slice(0, 1)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--mf-brand)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {rec.name}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--mf-text-muted)", marginTop: 1 }}>
                  @{rec.handle} · {rec.subs} サブスク
                </div>
              </div>
              <button
                type="button"
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  background: "transparent",
                  border: "1px solid var(--mf-brand)",
                  color: "var(--mf-brand)",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                サブスク
              </button>
            </div>
          ))}
        </div>
      </RailCard>
    </div>
  );
};

// ── ContextRail（メイン） ───────────────────────────────────────
const ContextRail = () => {
  const pathname = usePathname();

  const renderContent = () => {
    if (pathname === "/faces" || pathname.startsWith("/faces/")) {
      return <ReflectionRail />;
    }
    if (pathname === "/subscriptions") {
      return <CollectionRail />;
    }
    return <WritingRail />;
  };

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 overflow-y-auto mf-scroll"
      style={{
        width: 340,
        padding: "24px 20px 24px 0",
      }}
    >
      <div key={`page-${pathname}`} style={{ flex: 1 }}>
        {renderContent()}
      </div>
    </aside>
  );
};

export default ContextRail;
