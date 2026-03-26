import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import MinimalButton from "../../Components/MinimalButton.tsx"
import MultiPurposeInput from "../../Components/MultiPurposeInput.tsx"
import { LoadingOverlay } from "../../Components/LoadingOverlay.tsx"

type RefundPolicy = {
    policy_id: number

    start_dday: number
    end_dday: number

    dvc_percent: number
    svc_percent: number
    dpc_percent: number

    dva_percent: number
    sva_percent: number
    dpa_percent: number
}

type Props = {
    variant?: "customer" | "admin"
}

const toIntString = (v: number) => String(v).split(".")[0]

export default function RefundPolicies({ variant = "customer" }: Props) {
    const [items, setItems] = React.useState<RefundPolicy[]>([])
    const [editingKey, setEditingKey] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const fetchPolicies = async () => {
        setIsLoading(true)
        const res = await fetch(
            "https://terene-db-server.onrender.com/api/v3/refund-policy"
        )
        const data = await res.json()

        data.sort(
            (a: RefundPolicy, b: RefundPolicy) => a.policy_id - b.policy_id
        )

        setItems(data)
        setIsLoading(false)
    }

    React.useEffect(() => {
        fetchPolicies()
    }, [])

    const updateItem = (key: string, patch: Partial<RefundPolicy>) => {
        setItems((prev) =>
            prev.map((p) =>
                String(p.policy_id) === key ? { ...p, ...patch } : p
            )
        )
    }

    const saveItem = async (item: RefundPolicy) => {
        setIsLoading(true)

        await fetch(
            "https://terene-db-server.onrender.com/api/v3/refund-policy",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
            }
        )

        await fetchPolicies()
        setEditingKey(null)
        setIsLoading(false)
    }

    const renderDateCell = (
        p: RefundPolicy,
        isEditing: boolean,
        onChange: (patch: Partial<RefundPolicy>) => void
    ) => {
        if (!isEditing) {
            if (p.end_dday >= 9999) {
                return `체크인 ${p.start_dday}일 전까지`
            }
            return `체크인 ${p.start_dday}~${p.end_dday}일 전까지`
        }

        return (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>체크인</span>

                <MultiPurposeInput
                    type="number"
                    value={String(p.start_dday)}
                    width={60}
                    height={30}
                    fontSize={13}
                    onChange={(v) => onChange({ start_dday: Number(v) })}
                />

                <span>~</span>

                <MultiPurposeInput
                    type="number"
                    value={String(p.end_dday)}
                    width={60}
                    height={30}
                    fontSize={13}
                    onChange={(v) => onChange({ end_dday: Number(v) })}
                />

                <span>일 전까지</span>
            </div>
        )
    }

    const renderPercentCell = (
        value: number,
        isEditing: boolean,
        onChange: (v: number) => void
    ) => {
        if (!isEditing) {
            if (Number(value) === 0) {
                return (
                    <span style={{ fontSize: 14 }}>
                        총 결제금액의 0% - 환불 불가
                    </span>
                )
            }

            return (
                <span style={{ fontSize: 14 }}>
                    총 결제금액의 {toIntString(value)}%
                </span>
            )
        }

        return (
            <MultiPurposeInput
                type="number"
                value={toIntString(value)} // ← split 여기
                height={35}
                fontSize={14}
                onChange={
                    (v) => onChange(Math.floor(Number(v))) // ← floor 여기
                }
            />
        )
    }

    const isCustomer = variant === "customer"

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                paddingTop: 30,
                borderTop: "1px solid #000000",
                fontFamily: "Pretendard Regular",
                position: "relative",
            }}
        >
            {/* TITLE */}
            <div
                style={{
                    height: 35,
                    display: "flex",
                    alignItems: "center",
                    fontFamily: "Pretendard Medium",
                    fontSize: 18,
                }}
            >
                예약 취소 시 환불 규정
            </div>

            {/* HEADER */}
            <div
                style={{
                    height: 35,
                    display: "flex",
                    gap: 10,
                    fontFamily: "Pretendard SemiBold",
                    fontSize: 14,
                    paddingBottom: 10,
                    borderBottom: "1px solid #E0E0E0",
                }}
            >
                <div style={{ flex: 1 }}>기준일</div>
                <div style={{ flex: 1 }}>숙박 요금 *</div>
                <div style={{ flex: 1 }}>패키지 / 추가 서비스 *</div>
                <div style={{ flex: 1 }}>보증금 *</div>
                <div style={{ flex: 1 }}>관리</div>
            </div>

            {/* ROWS */}
            {items.map((p) => {
                const key = String(p.policy_id)
                const isEditing = editingKey === key

                return (
                    <div
                        key={key}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            paddingBottom: 20,
                            borderBottom: "1px solid #E0E0E0",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                            }}
                        >
                            <div style={{ flex: 1, fontSize: 14 }}>
                                {renderDateCell(p, isEditing, (patch) =>
                                    updateItem(key, patch)
                                )}
                            </div>

                            {isCustomer ? (
                                <>
                                    <div style={{ flex: 1 }}>
                                        {renderPercentCell(
                                            p.dvc_percent,
                                            isEditing,
                                            (v) =>
                                                updateItem(key, {
                                                    dvc_percent: v,
                                                })
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        {renderPercentCell(
                                            p.svc_percent,
                                            isEditing,
                                            (v) =>
                                                updateItem(key, {
                                                    svc_percent: v,
                                                })
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        {renderPercentCell(
                                            p.dpc_percent,
                                            isEditing,
                                            (v) =>
                                                updateItem(key, {
                                                    dpc_percent: v,
                                                })
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ flex: 1 }}>
                                        {renderPercentCell(
                                            p.dva_percent,
                                            isEditing,
                                            (v) =>
                                                updateItem(key, {
                                                    dva_percent: v,
                                                })
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        {renderPercentCell(
                                            p.sva_percent,
                                            isEditing,
                                            (v) =>
                                                updateItem(key, {
                                                    sva_percent: v,
                                                })
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        {renderPercentCell(
                                            p.dpa_percent,
                                            isEditing,
                                            (v) =>
                                                updateItem(key, {
                                                    dpa_percent: v,
                                                })
                                        )}
                                    </div>
                                </>
                            )}

                            <div style={{ flex: 1 }}>
                                <MinimalButton
                                    label={isEditing ? "저장" : "수정"}
                                    variant="border"
                                    color="#0066FF"
                                    width="100%"
                                    height={35}
                                    fontFamily="Pretendard Medium"
                                    fontSize={14}
                                    onClick={() => {
                                        if (isEditing) saveItem(p)
                                        else setEditingKey(key)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )
            })}

            {isLoading && (
                <LoadingOverlay
                    visible
                    mode="component"
                    message="환불 규정을 불러오는 중입니다..."
                />
            )}
        </div>
    )
}

addPropertyControls(RefundPolicies, {
    variant: {
        type: ControlType.Enum,
        title: "Variant",
        options: ["customer", "admin"],
        defaultValue: "customer",
    },
})
