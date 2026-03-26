import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { CustomCheckbox } from "./CustomCheckbox.tsx"
import { useFormStore } from "./ReservationForm.tsx"
import TermsAgreementContent from "./TermsAgreementContent.tsx"

type Agreement = {
    id: string
    label: string
    required: boolean
    storeKey?: string
}

type Props = {
    isMobile?: boolean
}

function TermsAgreementComponent({ isMobile = false }: Props) {
    const agreements: Agreement[] = [
        {
            id: "rules",
            label: "이용규칙 및 유의사항에 관한 동의",
            required: true,
            storeKey: "facility_policy",
        },
        {
            id: "cancel",
            label: "숙박요금 안내 및 예약취소 환불규정에 대한 동의",
            required: true,
            storeKey: "cancellation_policy",
        },
        {
            id: "personal",
            label: "개인정보 이용 및 수집에 대한 동의",
            required: true,
            storeKey: "privacy_policy",
        },
        {
            id: "marketing",
            label: "마케팅 및 광고성 정보 수신 동의",
            required: false,
            storeKey: "marketing_consent",
        },
    ]

    const [checked, setChecked] = useState<Record<string, boolean>>(
        agreements.reduce((acc, cur) => ({ ...acc, [cur.id]: false }), {})
    )
    const [expanded, setExpanded] = useState<Record<string, boolean>>(
        agreements.reduce((acc, cur) => ({ ...acc, [cur.id]: false }), {})
    )
    const [focusId, setFocusId] = useState<string | null>(null)

    const [store, setStore] = useFormStore()

    const toggleOne = (id: string) => {
        setChecked((prev) => {
            const nextChecked = !prev[id]
            const agreement = agreements.find((a) => a.id === id)
            if (agreement?.storeKey) {
                setStore({ [agreement.storeKey]: nextChecked })
            }
            if (nextChecked && expanded[id]) {
                setExpanded((prevExpanded) => ({
                    ...prevExpanded,
                    [id]: false,
                }))
            }
            return { ...prev, [id]: nextChecked }
        })
    }

    const toggleExpand = (id: string) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
    const allChecked = agreements.every((a) => checked[a.id])
    const toggleAll = () => {
        const nextValue = !allChecked
        setChecked(
            agreements.reduce((acc, cur) => {
                if (cur.storeKey) {
                    setStore({ [cur.storeKey]: nextValue })
                }
                return { ...acc, [cur.id]: nextValue }
            }, {})
        )
    }

    const getFontSize = (desktop: number, mobile: number) =>
        isMobile ? mobile : desktop
    const getCheckboxSize = (desktop: number, mobile: number) =>
        isMobile ? mobile : desktop

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                width: "100%",
                backgroundColor: "transparent",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: "20px 0",
                    borderTop: "1px solid #222222",
                    borderBottom: "1px solid #222222",
                }}
            >
                {agreements.map(({ id, label, required }) => (
                    <div
                        key={id}
                        style={{ display: "flex", flexDirection: "column" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                height: 28,
                                cursor: "pointer",
                            }}
                            onClick={() => toggleExpand(id)}
                        >
                            <div
                                style={{
                                    fontFamily: "Pretendard Light, sans-serif",
                                    fontWeight: 300,
                                    fontSize: getFontSize(13, 9),
                                    lineHeight: "28px",
                                    color: "#000000",
                                }}
                            >
                                {label}
                                <span style={{ marginLeft: 4 }}>
                                    ({required ? "필수" : "선택"})
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 24,
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => toggleOne(id)}
                                >
                                    <CustomCheckbox
                                        checked={checked[id]}
                                        onToggle={() => {}}
                                        isFocused={focusId === id}
                                        width={getCheckboxSize(16, 12)}
                                        height={getCheckboxSize(16, 12)}
                                    />
                                    <span
                                        style={{
                                            fontFamily:
                                                "Pretendard Light, sans-serif",
                                            fontWeight: 300,
                                            fontSize: getFontSize(13, 9),
                                            lineHeight: "28px",
                                            color: "#000000",
                                        }}
                                    >
                                        동의합니다
                                    </span>
                                </div>
                                <span
                                    onClick={() => toggleExpand(id)}
                                    style={{
                                        fontFamily:
                                            "Pretendard Light, sans-serif",
                                        fontWeight: 300,
                                        fontSize: getFontSize(11, 8),
                                        lineHeight: "11px",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        color: "#000000",
                                    }}
                                >
                                    약관 보기
                                </span>
                            </div>
                        </div>

                        <AnimatePresence initial={false}>
                            {expanded[id] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 60,
                                        mass: 1,
                                    }}
                                    style={{
                                        overflow: "hidden",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "100%",
                                            borderTop: "1px solid #A6A6A6",
                                        }}
                                    />
                                    <div
                                        style={{
                                            backgroundColor: "#fff",
                                            padding: 20,
                                        }}
                                    >
                                        <TermsAgreementContent
                                            id={id}
                                            isMobile={isMobile}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    height: 23,
                    cursor: "pointer",
                }}
                onClick={toggleAll}
            >
                <CustomCheckbox
                    checked={allChecked}
                    onToggle={() => {}}
                    isFocused={focusId === "all"}
                    width={getCheckboxSize(20, 16)}
                    height={getCheckboxSize(20, 16)}
                />
                <span
                    style={{
                        fontFamily: "Pretendard Regular, sans-serif",
                        fontSize: getFontSize(14, 12),
                        color: "#000000",
                    }}
                >
                    이용약관 확인 및 전체 동의
                </span>
            </div>
        </div>
    )
}

export default TermsAgreementComponent

// ✅ Framer Property Controls
addPropertyControls(TermsAgreementComponent, {
    isMobile: {
        type: ControlType.Boolean,
        title: "Mobile View",
        defaultValue: false,
    },
})
