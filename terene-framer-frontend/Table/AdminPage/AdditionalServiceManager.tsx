import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { ServiceItem } from "./ServiceItem.tsx"
import MinimalButton from "../../Components/MinimalButton.tsx"
import { PaginationArrow } from "../../Components/PaginationArrow.tsx"

export default function AdditionalServiceManager() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [newlyAddedId, setNewlyAddedId] = useState(null)
    const itemsPerPage = 2

    useEffect(() => {
        fetch(
            "https://terene-db-server.onrender.com/api/v3/additional-services"
        )
            .then((r) => r.json())
            .then((d) => {
                const sorted = [...d].sort((a, b) => {
                    if (a.available !== b.available) return a.available ? -1 : 1
                    if (a.manual_order !== b.manual_order)
                        return (a.manual_order ?? 0) - (b.manual_order ?? 0)
                    return (a.title || "").localeCompare(b.title || "")
                })
                setItems(sorted)
            })
            .finally(() => setLoading(false))
    }, [])

    const addItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            manual_order: items.length + 1,
            title: null,
            description: null,
            price_description: null,
            category: "package",
            paid: false,
            type: "fixed",
            price: null,
            displayed_price_kor: null,
            displayed_price_eng: null,
            show_dropdown: false,
            default_allowed: false,
            unit: null,
            default_text: null,
            max_unit: null,
            available: true,
            image_url: null,
            image_file_id: null,
        }

        setItems((prev) => {
            const updated = [...prev, newItem].sort((a, b) => {
                if (a.available !== b.available) return a.available ? -1 : 1
                if (a.manual_order !== b.manual_order)
                    return (a.manual_order ?? 0) - (b.manual_order ?? 0)
                return (a.title || "").localeCompare(b.title || "")
            })
            const newIndex = updated.findIndex((x) => x.id === newItem.id)
            const newPage = Math.floor(newIndex / itemsPerPage) + 1
            setCurrentPage(newPage)
            setNewlyAddedId(newItem.id)
            return updated
        })
    }

    const handleSave = async (item) => {
        await fetch(
            "https://terene-db-server.onrender.com/api/v3/additional-services",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
            }
        )
    }

    const handleDelete = async (id, title) => {
        const confirmed = window.confirm(
            `"${title || "이 항목"}"을(를) 정말 삭제하시겠습니까?`
        )
        if (!confirmed) return
        await fetch(
            `https://terene-db-server.onrender.com/api/v3/additional-services/${id}`,
            {
                method: "DELETE",
            }
        )
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(items.length / itemsPerPage)),
        [items]
    )

    const paginatedItems = useMemo(
        () =>
            items.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
            ),
        [items, currentPage]
    )

    const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1))
    const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages)
    }, [totalPages])

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                fontFamily: "Pretendard Regular",
                width: "100%",
            }}
        >
            {/* 상단 버튼 영역 */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                }}
            >
                <MinimalButton
                    label="추가"
                    variant="background"
                    color="#545454"
                    width={200}
                    height={35}
                    fontSize={14}
                    onClick={addItem}
                />
            </div>

            {/* 버튼 아래 header (40px gap) */}
            <div
                style={{
                    marginTop: "40px",
                    display: "grid",
                    gridTemplateColumns: "0.15fr 2.2fr",
                    alignItems: "center",
                    height: "35px",
                    gap: "20px",
                    fontFamily: "Pretendard SemiBold",
                    fontSize: "14px",
                    letterSpacing: "0em",
                    lineHeight: "1.2em",
                    color: "#333",
                }}
            >
                <div>순서</div>
                <div>패키지 | 추가 서비스 관리</div>
            </div>

            {/* header 아래 항목들 (10px gap) */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                {loading ? (
                    <p>불러오는 중...</p>
                ) : (
                    <>
                        {paginatedItems.map((item, i) => (
                            <ServiceItem
                                key={item.id}
                                index={
                                    (currentPage - 1) * itemsPerPage + (i + 1)
                                }
                                data={item}
                                onSave={handleSave}
                                onDelete={() =>
                                    handleDelete(item.id, item.title)
                                }
                                autoEdit={item.id === newlyAddedId}
                            />
                        ))}

                        {/* 페이지네이션 */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 25,
                                padding: "24px 0",
                                fontSize: 16,
                                color: "#444",
                            }}
                        >
                            <PaginationArrow
                                direction="left"
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                size={16}
                            />
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <PaginationArrow
                                direction="right"
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                size={16}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
