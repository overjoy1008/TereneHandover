
import { motion } from "framer-motion"
import React from "react"

export function LoadingOverlay({
    visible,
    message = "예약 처리중입니다...\n약 10초 정도 소요될 수 있습니다",
}: {
    visible: boolean
    message?: string
}) {
    if (!visible) return null

    return (
        <div style={overlayStyle}>
            <div style={contentStyle}>
                <motion.div
                    style={spinnerStyle}
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                    }}
                />
                <div style={messageStyle}>{message}</div>
            </div>
        </div>
    )
}

// 전체 회색 배경 (클릭 차단 포함)
const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    pointerEvents: "auto",
}

// 중앙 콘텐츠 (스피너 + 문구)
const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    userSelect: "none",
}

// 스피너 스타일
const spinnerStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    border: "4px solid rgba(255, 255, 255, 0.2)",
    borderTop: "4px solid white",
    borderRadius: "50%",
}

// 문구 스타일
const messageStyle: React.CSSProperties = {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Pretendard Medium, sans-serif",
    textAlign: "center",
    lineHeight: "1.6",
    whiteSpace: "pre-line",
}
