"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Wordmark from "@/components/ui/Wordmark";
import FaceBadge from "@/components/ui/FaceBadge";
import FaceNavItem from "@/components/ui/FaceNavItem";
import AccountMenu from "@/components/ui/AccountMenu";
import CreateFaceModal from "@/components/face/CreateFaceModal";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import { notificationRepository } from "@/repositories/notification-repository";
import { subscriptionRepository } from "@/repositories/subscription-repository";
import { useDetailPanel } from "@/lib/detail-panel-context";
import type { Face } from "@/types/face";

type NavItem = {
  href: string;
  label: string;
  jp: string;
  icon: (active: boolean) => React.ReactNode;
  count?: number;
};

const UNREAD_CUTOFF = "2026-03-25";

const PencilIcon = ({ active }: { active: boolean }) => (
  <svg width={22} height={22} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    {active ? (
      <path d="M3 17l1-3.5L13 4.5l3.5 3.5L7.5 17H3z" fill="currentColor" />
    ) : (
      <>
        <path d="M3 17l1-3.5L13 4.5l3.5 3.5L7.5 17H3z" />
        <path d="M12 5.5l3.5 3.5" />
      </>
    )}
  </svg>
);

const LayersIcon = ({ active }: { active: boolean }) => (
  <svg width={22} height={22} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 3L3 7l8 4 8-4-8-4z" fill={active ? "currentColor" : "none"} />
    <path d="M3 11l8 4 8-4" opacity={active ? 0.6 : 1} />
    {!active && <path d="M3 15l8 4 8-4" />}
  </svg>
);

const CompassIcon = ({ active }: { active: boolean }) => (
  <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
    <circle cx={11} cy={11} r={8} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.18 : 0} stroke="currentColor" strokeWidth={1.6} />
    <path d="M14.5 7.5L12.5 12.5 7.5 14.5 9.5 9.5z" fill="currentColor" />
  </svg>
);

const BellIcon = ({ active }: { active: boolean }) => (
  <svg width={22} height={22} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 14.5h11l-1.3-1.7c-.5-.7-.8-1.5-.8-2.3V7.8a3.4 3.4 0 00-6.8 0v2.7c0 .8-.3 1.6-.8 2.3l-1.3 1.7z" />
    <path d="M8.5 16.5a1.5 1.5 0 003 0" />
  </svg>
);

const SideNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentUser = userRepository.getCurrentUser();
  const faces = faceRepository.listByUserId(currentUser.id);
  const { openFace } = useDetailPanel();

  const unreadNotifCount = notificationRepository.listAll().filter(
    (n) => n.createdAt >= UNREAD_CUTOFF
  ).length;
  const subscribedCount = subscriptionRepository.getSubscribedFaceIds().length;

  const NAV_ITEMS: NavItem[] = [
    { href: "/",             label: "Writing",      jp: "書く",    icon: (a) => <PencilIcon active={a} /> },
    { href: "/faces",        label: "Reflection",   jp: "振り返り", icon: (a) => <LayersIcon active={a} /> },
    { href: "/subscriptions",label: "Collection",   jp: "蒐集",    icon: (a) => <CompassIcon active={a} />, count: subscribedCount > 0 ? 3 : undefined },
    { href: "/notifications",label: "Notifications",jp: "通知",    icon: (a) => <BellIcon active={a} />, count: unreadNotifCount > 0 ? unreadNotifCount : undefined },
  ];

  const activeFaceId = pathname.startsWith("/faces/")
    ? pathname.split("/")[2]
    : undefined;

  const handleFaceNavItemClick = (face: Face) => {
    router.push(`/faces/${face.id}`);
    openFace(face.id);
  };

  return (
    <>
      <nav
        className="hidden md:flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto mf-scroll"
        style={{
          width: 260,
          padding: "24px 14px",
          borderRight: "0.5px solid var(--mf-line)",
        }}
      >
        {/* Wordmark */}
        <div style={{ padding: "0 12px 28px" }}>
          <Wordmark size={26} />
        </div>

        {/* メインナビゲーション */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "11px 14px",
                  borderRadius: 11,
                  background: isActive ? "rgba(30,42,74,0.10)" : "transparent",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
              >
                <span
                  style={{
                    color: isActive
                      ? "var(--mf-brand)"
                      : "var(--mf-text-sub)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.icon(isActive)}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? "var(--mf-brand)" : "var(--mf-text)",
                      letterSpacing: 0.1,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
                {item.count && item.count > 0 ? (
                  <div
                    style={{
                      minWidth: 18,
                      height: 18,
                      padding: "0 6px",
                      borderRadius: 999,
                      background: "var(--mf-accent)",
                      color: "#fff",
                      fontSize: 10.5,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.count}
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* 投稿ボタン */}
        <button
          type="button"
          onClick={() => {}}
          style={{
            marginTop: 18,
            padding: "13px 16px",
            borderRadius: 12,
            background: "var(--mf-accent)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.3,
            boxShadow: "0 4px 14px rgba(212,146,42,0.25)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l1-3.5L13 4.5l3.5 3.5L7.5 17H3z" />
            <path d="M12 5.5l3.5 3.5" />
          </svg>
          新しいシードを書く
        </button>

        {/* マイフェイスセクション */}
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              padding: "0 14px 8px",
              fontSize: 10.5,
              color: "var(--mf-text-muted)",
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            マイフェイス
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 0 }}>
            {faces.map((face) => (
              <FaceNavItem
                key={face.id}
                face={face}
                activeFaceId={activeFaceId}
                onClick={handleFaceNavItemClick}
              />
            ))}
          </ul>
        </div>

        {/* 新規フェイス作成ボタン */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 14px",
            marginTop: 8,
            borderRadius: 8,
            background: "transparent",
            border: "1.5px dashed var(--mf-line)",
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--mf-text-muted)",
          }}
        >
          <svg width={14} height={14} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M10 4v12M4 10h12" />
          </svg>
          新規フェイス作成
        </button>

        <div style={{ flex: 1 }} />

        {/* ユーザーピル — クリックでアカウントメニュー */}
        <button
          type="button"
          onClick={() => setMenuOpen((p) => !p)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 12,
            background: "var(--mf-surface)",
            border: "0.5px solid var(--mf-line)",
            cursor: "pointer",
            width: "100%",
          }}
        >
          {faces[0] ? (
            <FaceBadge face={faces[0]} size={36} radius={999} />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--mf-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {currentUser.name.slice(0, 1)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--mf-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "left",
              }}
            >
              {currentUser.name}
            </div>
          </div>
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="var(--mf-text-faint)" strokeWidth={1.5} strokeLinecap="round">
            <path d="M2 5l5 4 5-4" />
          </svg>
        </button>
      </nav>

      <AccountMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <CreateFaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};

export default SideNav;
