"use client";

import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";
import { userRepository } from "@/repositories/user-repository";
import { notificationRepository } from "@/repositories/notification-repository";

const AppHeader = () => {
  const user = userRepository.getCurrentUser();
  const notifCount = notificationRepository.listAll().length;

  return (
    <header
      className="md:hidden flex items-center justify-between shrink-0"
      style={{
        height: 52,
        padding: "0 18px",
        background: "var(--mf-bg-light)",
        borderBottom: "0.5px solid var(--mf-line)",
      }}
    >
      <Wordmark size={19} />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* 通知ベルアイコン */}
        <Link
          href="/notifications"
          style={{ position: "relative", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}
          aria-label="通知"
        >
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none" stroke="var(--mf-brand)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 14.5h11l-1.3-1.7c-.5-.7-.8-1.5-.8-2.3V7.8a3.4 3.4 0 00-6.8 0v2.7c0 .8-.3 1.6-.8 2.3l-1.3 1.7z" />
            <path d="M8.5 16.5a1.5 1.5 0 003 0" />
          </svg>
          {notifCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 9,
                right: 9,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--mf-accent)",
                boxShadow: "0 0 0 2px var(--mf-bg-light)",
              }}
            />
          )}
        </Link>

        {/* アバター */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--mf-brand)",
            color: "#F8F6F1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {user.name.slice(0, 1)}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
