import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { useStore } from "../../Store/MainStore.tsx"

type DetailRowData = {
    category: string
    nights: number
    statuses: string[]
    dates: string[]
    branches: string[]
    bookingNumbers: string[]
    discounts: string[]
    grays: boolean[]
}

const flexes = [2, 1, 2, 2, 2, 2, 1]

const CATEGORY_LABELS: Record<string, string> = {
    peak: "PEAK SEASON - 성수기",
    weekend: "WEEKEND - 주말",
    weekday: "WEEK DAY - 평일",
}

const STATUS_TEXT: Record<string, string> = {
    available: "사용 가능",
    used: "사용 완료",
    expired: "소멸 완료",
    disabled: "소멸 완료",
}

export function MembershipTableDetail({
    viewMode = "desktop",
}: {
    viewMode?: "desktop" | "tablet" | "mobile"
}) {
    const [store] = useStore()
    const [detailRows, setDetailRows] = React.useState<DetailRowData[]>([])
    const [year, setYear] = React.useState(() => {
        const currentYear = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
        ).getFullYear()
        return `${currentYear}-${currentYear + 1}`
    })

    const [isFocused, setIsFocused] = React.useState(false)
    const [signupDate, setSignupDate] = React.useState<string | undefined>(
        undefined
    )

    React.useEffect(() => {
        const fetchMember = async () => {
            const res = await fetch(
                "https://terene-db-server.onrender.com/api/v2/customers"
            )
            const all = await res.json()
            const found = all.find(
                (item) => item.membership_number === store.membership_number
            )
            if (found) setSignupDate(found.signup_date)
        }

        if (store.membership_number) fetchMember()
    }, [store.membership_number])

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [defRes, instRes] = await Promise.all([
                    fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-definitions"
                    ),
                    fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-instances"
                    ),
                ])

                const defs = await defRes.json()
                const insts = await instRes.json()

                const membershipDefs = defs.filter(
                    (d) => d.type === "membership"
                )

                const [sy, ey] = year.split("-").map((v) => parseInt(v, 10))

                const combined = insts
                    .filter(
                        (c) =>
                            c.membership_number === store.membership_number &&
                            c.coupon_due?.slice(0, 4) === String(ey)
                    )
                    .map((inst) => {
                        const def = membershipDefs.find(
                            (d) =>
                                d.coupon_definition_id ===
                                inst.coupon_definition_id
                        )
                        return def ? { ...inst, definition: def } : null
                    })
                    .filter(Boolean)

                const rowsMap: Record<string, DetailRowData> = {
                    peak: {
                        category: CATEGORY_LABELS.peak,
                        nights: 0,
                        statuses: [],
                        dates: [],
                        branches: [],
                        bookingNumbers: [],
                        discounts: [],
                        grays: [],
                    },
                    weekend: {
                        category: CATEGORY_LABELS.weekend,
                        nights: 0,
                        statuses: [],
                        dates: [],
                        branches: [],
                        bookingNumbers: [],
                        discounts: [],
                        grays: [],
                    },
                    weekday: {
                        category: CATEGORY_LABELS.weekday,
                        nights: 0,
                        statuses: [],
                        dates: [],
                        branches: [],
                        bookingNumbers: [],
                        discounts: [],
                        grays: [],
                    },
                }

                for (const coupon of combined) {
                    const desc = coupon.definition.description || ""
                    const status = coupon.status || "available"
                    const gray = status !== "available"

                    let cat: "peak" | "weekend" | "weekday" = "weekday"
                    if (desc.includes("성수기")) cat = "peak"
                    else if (desc.includes("주말")) cat = "weekend"

                    rowsMap[cat].nights += 1
                    rowsMap[cat].statuses.push(
                        STATUS_TEXT[status] || "알 수 없음"
                    )
                    rowsMap[cat].dates.push(
                        coupon.used_timestamp
                            ? new Date(coupon.used_timestamp)
                                  .toISOString()
                                  .split("T")[0]
                                  .replace(/-/g, ".")
                            : "-"
                    )
                    rowsMap[cat].branches.push(coupon.used_location || "-")
                    rowsMap[cat].bookingNumbers.push(coupon.order_id || "-")
                    rowsMap[cat].discounts.push(
                        coupon.used_amount
                            ? `${Number(coupon.used_amount).toLocaleString()}원`
                            : "-"
                    )
                    rowsMap[cat].grays.push(gray)
                }

                const finalRows = Object.values(rowsMap).filter(
                    (r) => r.nights > 0
                )
                setDetailRows(finalRows)
            } catch (err) {
                console.error("멤버십 쿠폰 데이터 불러오기 실패", err)
            }
        }

        if (store.membership_number) fetchData()
    }, [store.membership_number, year])

    const fontSize14 = viewMode === "mobile" ? 12 : 14
    const fontSize12 = viewMode === "mobile" ? 9 : 12
    const showCategoryHeader = viewMode === "mobile"

    const HeaderCell = ({ text, flex }: { text: string; flex: number }) => (
        <div
            style={{
                flex,
                fontFamily: "Pretendard SemiBold",
                fontSize: fontSize14,
                color: "#000000",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                height: "100%",
            }}
        >
            {text}
        </div>
    )

    const DataCell = ({
        text,
        flex,
        gray,
    }: {
        text: string
        flex: number
        gray: boolean
    }) => (
        <div
            style={{
                flex,
                fontFamily: "Pretendard Regular",
                fontSize: fontSize14,
                color: gray ? "#888888" : "#000000",
                textAlign: "left",
            }}
        >
            {text}
        </div>
    )

    const DetailGroup = ({ row }: { row: DetailRowData }) => (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 15,
                paddingTop: 15,
                paddingBottom: 15,
                borderBottom: "1px solid #ebebeb",
            }}
        >
            {showCategoryHeader && (
                <div
                    style={{
                        fontFamily: "Pretendard SemiBold",
                        fontSize: fontSize14,
                        color: "#000000",
                        textAlign: "left",
                    }}
                >
                    {row.category}
                </div>
            )}

            {row.statuses.map((_, idx) => (
                <div
                    key={idx}
                    style={{ display: "flex", flexDirection: "row", gap: 10 }}
                >
                    {!showCategoryHeader && (
                        <DataCell
                            text={idx === 0 ? row.category : ""}
                            flex={flexes[0]}
                            gray={false}
                        />
                    )}
                    <DataCell
                        text={
                            idx === 0 && !showCategoryHeader
                                ? `${row.nights}박`
                                : idx === 0 && showCategoryHeader
                                  ? `${row.nights}박`
                                  : ""
                        }
                        flex={flexes[1]}
                        gray={false}
                    />
                    <DataCell
                        text={row.statuses[idx]}
                        flex={flexes[2]}
                        gray={row.grays[idx]}
                    />
                    <DataCell
                        text={row.dates[idx]}
                        flex={flexes[3]}
                        gray={row.grays[idx]}
                    />
                    <DataCell
                        text={row.branches[idx]}
                        flex={flexes[4]}
                        gray={row.grays[idx]}
                    />
                    <DataCell
                        text={row.bookingNumbers[idx]}
                        flex={flexes[5]}
                        gray={row.grays[idx]}
                    />
                    <DataCell
                        text={row.discounts[idx]}
                        flex={flexes[6]}
                        gray={row.grays[idx]}
                    />
                </div>
            ))}
        </div>
    )

    const formatUsagePeriod = (signupDateStr?: string): string => {
        if (!signupDateStr) return "-"

        const signupDate = new Date(signupDateStr)
        if (isNaN(signupDate.getTime())) return "-"

        const month = signupDate.getMonth() + 1
        const day = signupDate.getDate()

        let startYear: number
        let endYear: number
        if (typeof year === "string" && year.includes("-")) {
            const [sy, ey] = year.split("-").map((v) => parseInt(v, 10))
            startYear = sy
            endYear = ey
        } else {
            const y = parseInt(String(year), 10)
            startYear = y
            endYear = y + 1
        }

        // 시작일: startYear.month.day
        const startDate = new Date(startYear, month - 1, day)
        // 종료일: 다음 해 같은 월/일의 전날 = 1년 후 - 1일
        const endDate = new Date(startDate)
        endDate.setFullYear(endDate.getFullYear() + 1)
        endDate.setDate(endDate.getDate() - 1)

        const pad = (n: number) => String(n).padStart(2, "0")

        return `${startDate.getFullYear()}.${pad(startDate.getMonth() + 1)}.${pad(startDate.getDate())} ~ ${endDate.getFullYear()}.${pad(endDate.getMonth() + 1)}.${pad(endDate.getDate())}`
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 60,
                width: "100%",
            }}
        >
            {/* Year Selector */}
            <div style={{ position: "relative", width: "100%" }}>
                {isFocused && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "#EBEBEB",
                            zIndex: 0,
                        }}
                    />
                )}
                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        width: "100%",
                        height: 36,
                        padding: "0 12px",
                        fontFamily: "Pretendard Regular",
                        fontSize: 14,
                        lineHeight: "1.8em",
                        letterSpacing: "0.1em",
                        backgroundColor: "transparent",
                        border: "none",
                        borderBottom: "1px solid #222222",
                        outline: "none",
                        color: year === "" ? "#999999" : "#000000",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <option value="" disabled>
                        연도를 선택하세요
                    </option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                </select>
            </div>

            {/* Table */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    width: "100%",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        height: 35,
                        gap: 10,
                    }}
                >
                    {!showCategoryHeader && <HeaderCell text="구분" flex={2} />}
                    <HeaderCell text="사용기준" flex={1} />
                    <HeaderCell text="사용여부" flex={2} />
                    <HeaderCell text="날짜" flex={2} />
                    <HeaderCell text="지점" flex={2} />
                    <HeaderCell text="예약번호" flex={2} />
                    <HeaderCell text="할인금액" flex={1} />
                </div>

                {/* Content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                        borderTop: "1px solid #bdbdbd",
                        borderBottom: "1px solid #bdbdbd",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 20,
                            paddingTop: 10,
                            paddingBottom: 10,
                            borderBottom: "1px solid #bdbdbd",
                        }}
                    >
                        <div
                            style={{
                                height: 35,
                                fontFamily: "Pretendard Regular",
                                fontSize: fontSize12,
                                color: "#000000",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            연도{" "}
                            <span
                                style={{
                                    fontFamily: "Pretendard SemiBold",
                                    marginLeft: 4,
                                }}
                            >
                                {year}
                            </span>
                        </div>
                        <div
                            style={{
                                height: 35,
                                fontFamily: "Pretendard Regular",
                                fontSize: fontSize12,
                                color: "#000000",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            사용기한{" "}
                            <span
                                style={{
                                    fontFamily: "Pretendard SemiBold",
                                    marginLeft: 4,
                                }}
                            >
                                {formatUsagePeriod(signupDate)}
                            </span>
                        </div>
                    </div>

                    {/* Detail rows */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 15,
                        }}
                    >
                        {detailRows.map((row, idx) => (
                            <DetailGroup key={idx} row={row} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

addPropertyControls(MembershipTableDetail, {
    viewMode: {
        type: ControlType.Enum,
        title: "View",
        options: ["desktop", "tablet", "mobile"],
        optionTitles: ["Desktop", "Tablet", "Mobile"],
        defaultValue: "desktop",
    },
})
