
import * as React from "react"
import { motion } from "framer-motion"

export function DayComponent({
    index,
    variant,
    onClick,
    isToday = false,
    dayCategory,
    bgColor,
    checkinStatus,
    checkoutStatus,
}: {
    index: number
    variant:
        | "Start"
        | "Middle"
        | "End"
        | "Holiday"
        | "Day"
        | "Disabled"
        | "Invisible"
    onClick: () => void
    isToday?: boolean
    dayCategory?: any
    bgColor?: string
    checkinStatus?: "blocked" | "allfree" | "unavailable" | null
    checkoutStatus?: "blocked" | "allfree" | "unavailable" | null
}) {
    const isActive =
        variant === "Start" || variant === "Middle" || variant === "End"

    // const getBackgroundColor = () => {
    //     if (variant === "Invisible") return "transparent"
    //     if (isActive) return "#C2C2C2"
    //     // if (variant === "Disabled") return "transparent"

    //     switch (dayCategory) {
    //         case "Peak-Weekend":
    //             return "#DFDBD9"
    //         case "Peak-Weekday":
    //             return "#EFECEA"
    //         case "Weekend":
    //             return "#EFEFEF"
    //         case "Special-1":
    //             return "#E0CECE"
    //         default:
    //             return "transparent"
    //     }
    // }

    const getBackgroundColor = () => {
        if (variant === "Invisible") return "transparent"
        if (isActive) return "#C2C2C2"
        if (bgColor) return bgColor
        return "transparent"
    }

    const getTextColor = () => {
        if (variant === "Invisible") return "transparent"
        if (isToday) return "#000000"
        switch (variant) {
            case "Holiday":
                return "#DB4242"
            case "Disabled":
                return "#707070"
            case "Start":
            case "Middle":
            case "End":
                return "#F8F8F8"
            default:
                return "#707070"
        }
    }

    const getSubText = () => {
        if (variant === "Invisible") return null
        if (variant === "Start") return "입실"
        if (variant === "End") return "퇴실"
        if (variant === "Middle") return "\u00A0"
        if (isToday) return "오늘"
        return null
    }

    const getStatusColor = (
        status?: "blocked" | "allfree" | "unavailable" | null
    ) => {
        switch (status) {
            case "blocked":
                return "#919191"
            case "allfree":
                return "#D7D0FF"
            case "unavailable":
                return "#FFD0D1"
            default:
                return null
        }
    }

    return (
        <motion.div
            layout="position"
            onClick={onClick}
            style={{
                flex: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "Pretendard Light, sans-serif",
                fontWeight: 300,
                fontSize: 16,
                lineHeight: "1.2em",
                boxSizing: "border-box",
                cursor:
                    variant === "Disabled" || variant === "Invisible"
                        ? "default"
                        : "pointer",
                transition: "background-color 0.3s ease-in-out",
                backgroundColor: getBackgroundColor(),
                color: getTextColor(),
                // opacity: variant === "Disabled" ? 0.3 : 1,
            }}
        >
            <div
                style={{
                    transform: isActive ? "translateY(-2px)" : "translateY(0)",
                    transition: "transform 0.3s ease-in-out",
                    backgroundColor: isToday ? "#D0E8FF" : "transparent",
                    borderRadius: isToday ? "50%" : "0",
                    width: isToday ? 24 : "auto",
                    height: isToday ? 24 : "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: variant === "Disabled" ? 0.3 : 1,
                }}
            >
                {variant === "Invisible" ? null : index}
            </div>

            <motion.div
                layout
                style={{
                    fontSize: 10,
                    marginTop: 4,
                    fontFamily: "Pretendard Light, sans-serif",
                    fontWeight: isToday ? 600 : 500,
                    lineHeight: "1.2em",
                    height: "1em",
                    visibility: getSubText() ? "visible" : "hidden",
                    color: getTextColor(),
                    opacity: variant === "Disabled" ? 0.3 : 1,
                }}
            >
                {Boolean(checkinStatus || checkoutStatus) ? (
                    <div
                        style={{
                            display: "flex",
                            width: 24,
                            justifyContent: "space-between",
                        }}
                    >
                        {/* 체크아웃 (왼쪽) */}
                        <span
                            style={{
                                color:
                                    getStatusColor(checkoutStatus) ??
                                    "transparent",
                            }}
                        >
                            ◀
                        </span>

                        {/* 체크인 (오른쪽) */}
                        <span
                            style={{
                                color:
                                    getStatusColor(checkinStatus) ??
                                    "transparent",
                            }}
                        >
                            ▶
                        </span>
                    </div>
                ) : (
                    <span
                        style={{
                            visibility: getSubText() ? "visible" : "hidden",
                            color: getTextColor(),
                        }}
                    >
                        {getSubText()}
                    </span>
                )}
            </motion.div>
        </motion.div>
    )
}
