import * as React from "react"
import { useStore } from "../../Calendar/MonthDisplay.tsx"

export default function MileageTable() {
    const [store] = useStore()
    const [mileages, setMileages] = React.useState<any[]>([])
    const [filter, setFilter] = React.useState<
        "all" | "accumulate" | "use" | "expire"
    >("all")

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(
                    "https://terene-db-server.onrender.com/api/v2/mileages"
                )
                const data = await res.json()
                const myData = data
                    .filter(
                        (m: any) =>
                            m.membership_number === store.membership_number
                    )
                    .sort(
                        (a: any, b: any) =>
                            new Date(b.issued_at).getTime() -
                            new Date(a.issued_at).getTime()
                    )
                setMileages(myData)
            } catch (err) {
                console.error("마일리지 가져오기 실패", err)
            }
        }

        if (store.membership_number) fetchData()
    }, [store.membership_number])

    const formatDate = (d: string) => new Date(d).toISOString().split("T")[0]

    const getKSTDate = () => {
        const now = new Date()
        const utc = now.getTime() + now.getTimezoneOffset() * 60000
        return new Date(utc + 9 * 60 * 60 * 1000)
    }

    const calcDDay = (targetDate: string, type: "accumulate" | "expire") => {
        const today = getKSTDate()
        const target = new Date(targetDate)
        const diff = Math.floor(
            (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (type === "accumulate") return `D-${Math.max(diff, 0)}`
        else return `D+${Math.abs(diff)}`
    }

    const formatAmount = (t: string, n: number) => {
        const abs = Math.abs(n)
        const sign = t === "accumulate" ? "+" : "-"
        return `${sign}${abs.toLocaleString()}p`
    }

    const labelMap = { accumulate: "적립", use: "사용", expire: "소멸" }

    const tabs: { key: typeof filter; label: string }[] = [
        { key: "all", label: "전체 마일리지" },
        { key: "accumulate", label: "적립" },
        { key: "use", label: "사용" },
        { key: "expire", label: "소멸" },
    ]

    const filtered =
        filter === "all"
            ? mileages
            : mileages.filter((m) => m.mileage_type === filter)

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    gap: 20,
                    height: 45,
                    paddingBottom: 10,
                    borderBottom: "1px solid #222",
                    fontFamily: "Pretendard Medium",
                    fontSize: 18,
                    letterSpacing: "0.2em",
                    lineHeight: "1.8em",
                }}
            >
                {tabs.map((tab) => (
                    <div
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            cursor: "pointer",
                            color: filter === tab.key ? "#000" : "#6e6e6e",
                            borderBottom:
                                filter === tab.key ? "2px solid #000" : "none",
                            paddingBottom: 2,
                        }}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            {/* CONTENT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map((m, i) => (
                    <div
                        key={m.mileage_id || i}
                        style={{
                            padding: 30,
                            borderBottom: "1px solid #222",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 30,
                            }}
                        >
                            {/* 날짜 */}
                            <div
                                style={{
                                    fontFamily: "Pretendard Medium",
                                    fontSize: 16,
                                    lineHeight: "1.8em",
                                    color: "#000",
                                }}
                            >
                                {formatDate(m.issued_at)}
                            </div>

                            {/* 내용 */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 5,
                                }}
                            >
                                {/* 적립/사용/소멸 */}
                                <div
                                    style={{
                                        fontFamily: "Pretendard SemiBold",
                                        fontSize: 16,
                                        lineHeight: "1.8em",
                                    }}
                                >
                                    {labelMap[m.mileage_type]}
                                </div>

                                {/* 설명 */}
                                <div
                                    style={{
                                        fontFamily: "Pretendard",
                                        fontSize: 14,
                                        lineHeight: "1.8em",
                                    }}
                                >
                                    {m.description}
                                </div>

                                {/* 부가 정보 */}
                                {m.mileage_type === "accumulate" &&
                                    m.mileage_due && (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 10,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "Pretendard SemiBold",
                                                    fontSize: 13,
                                                    lineHeight: "1.8em",
                                                }}
                                            >
                                                {calcDDay(
                                                    m.mileage_due,
                                                    "accumulate"
                                                )}
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "Pretendard Medium",
                                                    fontSize: 12,
                                                    color: "#6e6e6e",
                                                    lineHeight: "1.8em",
                                                }}
                                            >
                                                {formatDate(m.mileage_due)} 소멸
                                                예정
                                            </div>
                                        </div>
                                    )}

                                {m.mileage_type === "use" && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    "Pretendard SemiBold",
                                                fontSize: 13,
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            예약 번호 : {m.order_id || "-"}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: "Pretendard Medium",
                                                fontSize: 12,
                                                color: "#6e6e6e",
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            사용 일자 :{" "}
                                            {formatDate(m.issued_at)}
                                        </div>
                                    </div>
                                )}

                                {m.mileage_type === "expire" && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    "Pretendard SemiBold",
                                                fontSize: 13,
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            {calcDDay(m.issued_at, "expire")}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: "Pretendard Medium",
                                                fontSize: 12,
                                                color: "#6e6e6e",
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            {formatDate(m.issued_at)} 소멸 완료
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 포인트 수 */}
                            <div
                                style={{
                                    marginLeft: "auto",
                                    fontFamily: "Pretendard SemiBold",
                                    fontSize: 20,
                                    lineHeight: "1.8em",
                                    color:
                                        m.mileage_type === "accumulate"
                                            ? "#000"
                                            : "#aaa",
                                }}
                            >
                                {formatAmount(
                                    m.mileage_type,
                                    Number(m.mileage_amount)
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
