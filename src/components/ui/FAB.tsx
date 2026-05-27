"use client";

import { useState } from "react";
import PostModal from "@/components/ui/PostModal";

type Props = {
  defaultFaceId?: string;
};

const FAB = ({ defaultFaceId }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label="投稿する"
        className="md:hidden fixed z-40"
        style={{
          bottom: 88,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--mf-accent)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(212,146,42,0.35)",
          transition: "transform 0.15s, background 0.15s",
        }}
      >
        <svg width={22} height={22} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l1-3.5L13 4.5l3.5 3.5L7.5 17H3z" />
          <path d="M12 5.5l3.5 3.5" />
        </svg>
      </button>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultFaceId={defaultFaceId}
      />
    </>
  );
};

export default FAB;
