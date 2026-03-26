
import React from "react"

export function CouponLogPopup({
    visible,
    onClose,
    content,
}: {
    visible: boolean
    onClose: () => void
    content: string
}) {
    if (!visible) return null

    // ESC로 창 닫기
    React.useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [onClose])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content)
            alert("복사되었습니다.")
        } catch (err) {
            alert("복사에 실패했습니다.")
        }
    }

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 9999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
                fontFamily: "Pretendard, sans-serif",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    width: "90%",
                    maxWidth: 600,
                    maxHeight: "80vh",
                    overflowY: "auto",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    position: "relative",
                    fontFamily: "Pretendard, sans-serif",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                    }}
                >
                    <strong style={{ fontSize: 16 }}>쿠폰 발급 결과</strong>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={handleCopy}
                            style={{
                                fontSize: 13,
                                padding: "4px 10px",
                                backgroundColor: "#f0f0f0",
                                border: "1px solid #ccc",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontFamily: "Pretendard, sans-serif",
                            }}
                        >
                            복사
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                background: "transparent",
                                border: "none",
                                fontSize: 20,
                                cursor: "pointer",
                                color: "#666",
                                fontFamily: "Pretendard, sans-serif",
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div
                    style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "#333",
                        whiteSpace: "pre-wrap",
                        backgroundColor: "#f7f7f7",
                        padding: 16,
                        borderRadius: 8,
                        fontFamily: "Pretendard, sans-serif",
                    }}
                >
                    {content}
                </div>
            </div>
        </div>
    )
}
