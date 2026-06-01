"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import FaceBadge from "./FaceBadge";
import { getFaceTitle, getFaceColor } from "@/lib/display";

const MAX_IMAGES = 4;
const MAX_LENGTH = 5000;

type AttachedImage = {
  file: File;
  objectUrl: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultFaceId?: string;
};

const PostModal = ({ isOpen, onClose, defaultFaceId }: Props) => {
  const currentUser = userRepository.getCurrentUser();
  const myFaces = useMemo(
    () => faceRepository.listByUserId(currentUser.id),
    [currentUser.id],
  );
  const initialSelectedFaceId = useMemo(
    () => defaultFaceId ?? myFaces[0]?.id ?? "",
    [defaultFaceId, myFaces],
  );
  const [selectedFaceId, setSelectedFaceId] = useState<string>(initialSelectedFaceId);
  const [text, setText] = useState("");
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [showFacePicker, setShowFacePicker] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedFace = myFaces.find((f) => f.id === selectedFaceId);

  useEffect(() => {
    if (!isOpen) {
      setImages((prev) => {
        prev.forEach((img) => URL.revokeObjectURL(img.objectUrl));
        return [];
      });
      setText("");
      setSelectedFaceId(initialSelectedFaceId);
      setShowFacePicker(false);
    } else {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [initialSelectedFaceId, isOpen]);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.objectUrl));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);
    setImages((prev) => [
      ...prev,
      ...toAdd.map((file) => ({ file, objectUrl: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].objectUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  if (!isOpen) return null;

  const canPost = text.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="投稿"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "var(--mf-bg-light)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* トップバー */}
      <div
        style={{
          height: 52,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "0.5px solid var(--mf-line)",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 14,
            color: "var(--mf-text-sub)",
            fontWeight: 500,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 4px",
          }}
        >
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
          キャンセル
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* 公開設定 */}
          <button
            type="button"
            onClick={() => setVisibility(v => v === "public" ? "private" : "public")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 10px",
              background: "var(--mf-surface-tint)",
              borderRadius: 999,
              fontSize: 11.5,
              color: "var(--mf-text-sub)",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            {visibility === "public" ? (
              <>
                <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                  <circle cx={8} cy={8} r={6} />
                  <path d="M2.5 8c0-1 1-3 5.5-3s5.5 2 5.5 3-1 3-5.5 3S2.5 9 2.5 8z" />
                  <circle cx={8} cy={8} r={2} fill="currentColor" />
                </svg>
                公開
              </>
            ) : (
              <>
                <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                  <rect x={4} y={7} width={8} height={7} rx={1.5} />
                  <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
                </svg>
                非公開
              </>
            )}
          </button>

          {/* 投稿ボタン */}
          <button
            type="button"
            disabled={!canPost}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: canPost ? "var(--mf-accent)" : "var(--mf-surface-tint)",
              color: canPost ? "#fff" : "var(--mf-text-faint)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.3,
              border: "none",
              cursor: canPost ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
              boxShadow: canPost ? "0 2px 10px rgba(212,146,42,0.25)" : "none",
              transition: "background 0.15s, box-shadow 0.15s",
            }}
          >
            投稿
          </button>
        </div>
      </div>

      {/* フェイス選択ピル */}
      <div style={{ padding: "4px 18px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setShowFacePicker((p) => !p)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 12px 6px 6px",
              background: selectedFace ? `${getFaceColor(selectedFace.id)}12` : "var(--mf-surface-tint)",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {selectedFace && <FaceBadge face={selectedFace} size={22} radius={6} />}
            <span style={{ fontSize: 13, fontWeight: 700, color: selectedFace ? getFaceColor(selectedFace.id) : "var(--mf-text-muted)" }}>
              {selectedFace ? getFaceTitle(selectedFace) : "フェイスを選択"}
            </span>
            <svg width={9} height={9} viewBox="0 0 10 7" fill="none" stroke={selectedFace ? getFaceColor(selectedFace.id) : "var(--mf-text-muted)"} strokeWidth={1.6} strokeLinecap="round">
              <path d="M1 1l4 4 4-4" />
            </svg>
          </button>
          <span style={{ fontSize: 11.5, color: "var(--mf-text-muted)" }}>このフェイスに書く</span>
        </div>

        {/* フェイス選択ドロップダウン */}
        {showFacePicker && (
          <div
            style={{
              marginTop: 8,
              background: "var(--mf-surface)",
              borderRadius: 12,
              border: "0.5px solid var(--mf-line)",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(30,42,74,0.1)",
            }}
          >
            {myFaces.map((face) => (
              <button
                key={face.id}
                type="button"
                onClick={() => {
                  setSelectedFaceId(face.id);
                  setShowFacePicker(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: face.id === selectedFaceId ? "var(--mf-hover)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <FaceBadge face={face} size={28} radius={8} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--mf-brand)" }}>
                  {getFaceTitle(face)}
                </span>
                {face.id === selectedFaceId && (
                  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="var(--mf-accent)" strokeWidth={2} strokeLinecap="round" style={{ marginLeft: "auto" }}>
                    <path d="M2 7l4 4 6-7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 書き込みキャンバス */}
      <div style={{ flex: 1, padding: "16px 18px", overflowY: "auto" }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH}
          placeholder="気軽に書き留めてみましょう…"
          style={{
            width: "100%",
            height: "100%",
            minHeight: 200,
            resize: "none",
            border: "none",
            background: "transparent",
            fontSize: 17,
            lineHeight: 1.9,
            color: "var(--mf-ink)",
            outline: "none",
            fontFamily: "var(--mf-font-sans)",
            caretColor: "var(--mf-accent)",
          }}
        />

        {/* 画像プレビュー */}
        {images.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 3,
              borderRadius: 14,
              overflow: "hidden",
              height: 150,
              border: "0.5px solid var(--mf-line-soft)",
              marginTop: 12,
            }}
          >
            {images.slice(0, 3).map((img, index) => (
              <div
                key={img.objectUrl}
                style={{
                  position: "relative",
                  ...(index === 0 ? {} : { display: "flex" }),
                  ...(index > 0 && images.length > 2 ? { flexDirection: "column" } : {}),
                  gridRow: index === 0 ? "1 / 3" : undefined,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.objectUrl}
                  alt={`添付画像${index + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "rgba(20,24,36,0.70)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                  aria-label={`画像${index + 1}を削除`}
                >
                  <svg width={10} height={10} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M5 5l10 10M15 5L5 15" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ボトムバー */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "0.5px solid var(--mf-line)",
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
        }}
      >
        {/* 画像添付 + リンクボタン */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            disabled={images.length >= MAX_IMAGES}
            onClick={() => fileInputRef.current?.click()}
            aria-label="画像を添付"
            style={{
              position: "relative",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "none",
              border: "none",
              cursor: images.length >= MAX_IMAGES ? "not-allowed" : "pointer",
              color: images.length >= MAX_IMAGES ? "var(--mf-text-faint)" : "var(--mf-brand)",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <rect x={3} y={3} width={14} height={14} rx={2} />
              <circle cx={7} cy={7.5} r={1.2} />
              <path d="M3 14l4-4 4 4 3-3 3 3" />
            </svg>
            {images.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 1,
                  right: 1,
                  background: "var(--mf-accent)",
                  color: "#fff",
                  borderRadius: 999,
                  fontSize: 9,
                  fontWeight: 700,
                  minWidth: 14,
                  height: 14,
                  padding: "0 3px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}
              >
                {images.length}
              </span>
            )}
          </button>

          {/* リンクボタン */}
          <button
            type="button"
            aria-label="リンクを追加"
            style={{
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--mf-brand)",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 9.5a3.54 3.54 0 005 0l2-2a3.54 3.54 0 00-5-5l-1 1" />
              <path d="M9.5 6.5a3.54 3.54 0 00-5 0l-2 2a3.54 3.54 0 005 5l1-1" />
            </svg>
          </button>
        </div>

        {/* 文字数カウント + 下書き */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11.5, color: "var(--mf-text-muted)", whiteSpace: "nowrap" }}>
          <span>{text.length} 文字</span>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--mf-line-soft)" }} />
          <span>下書き保存済</span>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
