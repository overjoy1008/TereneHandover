import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { useStore } from "../../Store/MainStore.tsx"

type Device = "desktop" | "mobile"

interface Props {
    device?: Device
}

export default function MileageTable({ device = "desktop" }: Props) {
    const [store] = useStore()
    const [mileages, setMileages] = React.useState<any[]>([])
    const [filter, setFilter] = React.useState<"all" | "accumulate" | "use">(
        "all"
    )
    const isMobile = device === "mobile"

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

    const labelMap = { accumulate: "적립", use: "사용" }

    const tabs: { key: typeof filter; label: string }[] = [
        { key: "all", label: "전체 마일리지" },
        { key: "accumulate", label: "적립" },
        { key: "use", label: "사용" },
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
            <div
                style={{
                    display: "flex",
                    gap: isMobile ? 10 : 20,
                    height: 45,
                    paddingBottom: 10,
                    borderBottom: "1px solid #222",
                    fontFamily: "Pretendard SemiBold",
                    fontSize: isMobile ? 14 : 18,
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

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map((m, i) => (
                    <div
                        key={m.mileage_id || i}
                        style={{
                            padding: isMobile ? "30px 0" : 30,
                            borderBottom: "1px solid #222",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: isMobile ? 20 : 30,
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "Pretendard SemiBold",
                                    fontSize: isMobile ? 13 : 16,
                                    lineHeight: "1.8em",
                                    color: "#000",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                }}
                            >
                                {formatDate(m.issued_at)}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    flex: 1,
                                    gap: 5,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 5,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    "Pretendard SemiBold",
                                                fontSize: isMobile ? 14 : 16,
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            {labelMap[m.mileage_type]}
                                        </div>

                                        <div
                                            style={{
                                                fontFamily:
                                                    "Pretendard Regular",
                                                fontSize: 14,
                                                lineHeight: "1.8em",
                                            }}
                                        >
                                            {m.description}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            fontFamily: "Pretendard SemiBold",
                                            fontSize: isMobile ? 16 : 20,
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

                                {m.mileage_type === "accumulate" &&
                                    m.mileage_due && (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 6,
                                            }}
                                        >
                                            {/*<div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    fontFamily:
                                                        "Pretendard Regular",
                                                    fontSize: isMobile
                                                        ? 10
                                                        : 12,
                                                    lineHeight: "1.8em",
                                                    color: "#6e6e6e",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontFamily:
                                                            "Pretendard SemiBold",
                                                    }}
                                                >
                                                    {calcDDay(
                                                        m.mileage_due,
                                                        "accumulate"
                                                    )}
                                                </div>
                                                <div>
                                                    {formatDate(m.mileage_due)}{" "}
                                                    소멸 예정
                                                </div>
                                            </div>*/}
                                        </div>
                                    )}

                                {m.mileage_type === "use" && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 6,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 10,
                                                fontFamily:
                                                    "Pretendard Regular",
                                                fontSize: isMobile ? 10 : 12,
                                                lineHeight: "1.8em",
                                                color: "#6e6e6e",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "Pretendard SemiBold",
                                                }}
                                            >
                                                예약 번호 : {m.order_id || "-"}
                                            </div>
                                            <div>
                                                사용 일자 :{" "}
                                                {formatDate(m.issued_at)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

addPropertyControls(MileageTable, {
    device: {
        type: ControlType.Enum,
        options: ["desktop", "mobile"],
        optionTitles: ["Desktop", "Mobile"],
        defaultValue: "desktop",
        title: "Device",
    },
})
