import React from "react"
import { PaginationArrow } from "../Components/PaginationArrow.tsx"

export function CheckoutSwitchToForeignButton() {
    const handleClick = () => {
        if (typeof window === "undefined") return

        const url = new URL(window.location.href)

        // path만 교체 (query 그대로 유지)
        url.pathname = url.pathname.replace(
            "toss-payments",
            "toss-payments-foreign-card"
        )

        window.location.href = url.toString()
    }

    return (
        <div
            onClick={handleClick}
            style={{
                display: "flex",
                alignItems: "center",
                margin: "0 10px",
                gap: 6,
                cursor: "pointer",
                fontFamily: "Pretendard Regular",
                fontSize: 14,
                color: "#000",
                userSelect: "none",
            }}
        >
            <span>해외 결제</span>
            <PaginationArrow direction="right" size={10} color="#000" />
        </div>
    )
}
