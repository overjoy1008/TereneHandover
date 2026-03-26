import * as React from "react"
import { MileagesPopup } from "./MileagesPopup.tsx"
import { MemberTotalsPopup } from "./MemberTotalsPopup.tsx"

export default function MileageManagement() {
    const [membershipNumber, setMembershipNumber] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [mileageValue, setMileageValue] = React.useState("")
    const [popupOpen, setPopupOpen] = React.useState(false)
    const [totalsOpen, setTotalsOpen] = React.useState(false)
    const [submitting, setSubmitting] = React.useState(false)

    const genMileageId = () => {
        const now = new Date()
        const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
        const yy = String(kst.getFullYear()).slice(2)
        const mm = String(kst.getMonth() + 1).padStart(2, "0")
        const dd = String(kst.getDate()).padStart(2, "0")
        const hh = String(now.getHours()).padStart(2, "0")
        const mi = String(kst.getMinutes()).padStart(2, "0")
        const alphabet =
            "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789"
        let tail = ""
        for (let i = 0; i < 8; i++) {
            const idx = Math.floor(Math.random() * alphabet.length)
            tail += alphabet[idx]
        }
        return `MI-${yy}${mm}${dd}-${hh}${mi}-${tail}`
    }

    const toKstDueIso = () => {
        const nowUtc = new Date()
        const kstNow = new Date(nowUtc.getTime() + 9 * 60 * 60 * 1000)
        const dueKst = new Date(kstNow)
        dueKst.setFullYear(dueKst.getFullYear() + 1)
        dueKst.setSeconds(dueKst.getSeconds() - 1)
        return dueKst.toISOString()
    }

    const handleSubmit = async () => {
        if (!membershipNumber.trim() || !mileageValue.trim()) {
            alert("회원번호와 마일리지 값을 입력하세요.")
            return
        }
        setSubmitting(true)
        try {
            const nowUtc = new Date()
            const issuedAtKst = new Date(
                nowUtc.getTime() + 9 * 60 * 60 * 1000
            ).toISOString()
            const payload = {
                mileage_id: genMileageId(),
                membership_number: membershipNumber.trim(),
                issued_at: issuedAtKst,
                mileage_amount: Number(mileageValue),
                mileage_type: "accumulate",
                description: description.trim() || null,
                mileage_due: toKstDueIso(),
                order_id: null,
            }
            const res = await fetch(
                "https://terene-db-server.onrender.com/api/v2/mileages",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            )
            if (!res.ok) throw new Error("업로드 실패")
            alert("마일리지를 부여했습니다.")
            setDescription("")
            setMileageValue("")
        } catch (e: any) {
            alert(e?.message ?? "오류가 발생했습니다.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 2000,
                margin: "0 auto",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                fontFamily: "Pretendard Regular",
            }}
        >
            <div
                style={{
                    fontFamily: "Pretendard SemiBold",
                    fontSize: 20,
                    marginBottom: 6,
                }}
            >
                마일리지 관리
            </div>

            <div style={{ display: "flex", gap: 10 }}>
                <input
                    placeholder="회원 번호"
                    value={membershipNumber}
                    onChange={(e) => setMembershipNumber(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "12px 14px",
                        border: "1px solid #d9d9d9",
                        borderRadius: 0,
                        fontFamily: "Pretendard Regular",
                    }}
                />
                <input
                    placeholder="설명 (선택)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "12px 14px",
                        border: "1px solid #d9d9d9",
                        borderRadius: 0,
                        fontFamily: "Pretendard Regular",
                    }}
                />
                <input
                    type="number"
                    placeholder="마일리지 값"
                    value={mileageValue}
                    onChange={(e) => setMileageValue(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "12px 14px",
                        border: "1px solid #d9d9d9",
                        borderRadius: 0,
                        fontFamily: "Pretendard Regular",
                    }}
                />
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: 0,
                        border: "1px solid #222",
                        background: "#111",
                        color: "#fff",
                        cursor: "pointer",
                        fontFamily: "Pretendard SemiBold",
                    }}
                >
                    마일리지 부여
                </button>
                <button
                    onClick={() => setPopupOpen(true)}
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: 0,
                        border: "1px solid #d9d9d9",
                        background: "#fafafa",
                        cursor: "pointer",
                        fontFamily: "Pretendard SemiBold",
                    }}
                >
                    마일리지 조회
                </button>
                <button
                    onClick={() => setTotalsOpen(true)}
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: 0,
                        border: "1px solid #d9d9d9",
                        background: "#f5f7ff",
                        cursor: "pointer",
                        fontFamily: "Pretendard SemiBold",
                    }}
                >
                    회원별 누계 조회
                </button>
            </div>

            <MileagesPopup
                visible={popupOpen}
                onClose={() => setPopupOpen(false)}
            />
            <MemberTotalsPopup
                visible={totalsOpen}
                onClose={() => setTotalsOpen(false)}
            />
        </div>
    )
}
