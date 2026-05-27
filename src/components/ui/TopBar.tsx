"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import PostModal from "@/components/ui/PostModal";

const PAGE_TITLES: Record<string, string> = {
  "/": "書く",
  "/faces": "振り返り",
  "/subscriptions": "蒐集",
  "/notifications": "通知",
  "/search": "検索",
};

const TopBar = () => {
  const pathname = usePathname();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleOpen = () => setIsPostModalOpen(true);
  const handleClose = () => setIsPostModalOpen(false);

  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/faces/") ? "フェイス詳細" : "MultiFace");

  return (
    <>
      <header
        className="hidden md:flex items-center justify-between sticky top-0 z-10"
        style={{
          height: 64,
          padding: "0 28px",
          borderBottom: "0.5px solid var(--mf-line)",
          background: "rgba(248,246,241,0.85)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: "var(--mf-brand)",
              letterSpacing: -0.2,
            }}
          >
            {title}
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 22px",
            borderRadius: 999,
            background: "var(--mf-accent)",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(212,146,42,0.25)",
          }}
        >
          <svg width={14} height={14} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l1-3.5L13 4.5l3.5 3.5L7.5 17H3z" />
            <path d="M12 5.5l3.5 3.5" />
          </svg>
          投稿
        </button>
      </header>

      {isPostModalOpen && (
        <PostModal isOpen={isPostModalOpen} onClose={handleClose} />
      )}
    </>
  );
};

export default TopBar;
