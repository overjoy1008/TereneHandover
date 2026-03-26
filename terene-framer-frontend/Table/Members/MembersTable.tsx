// MembersTable.tsx
import React, { useMemo, useState } from "react"
import { MembersTableLogic } from "./MembersTableLogic.tsx"
import { MembersTableElement } from "./MembersTableElement.tsx"
import { PaginationArrow } from "../../Components/PaginationArrow.tsx"
import { MembersTableToolbar } from "./MembersTableToolbar.tsx"

export function MembersTableComponent() {
    const [tab, setTab] = useState<"전체" | "개인" | "법인" | "블랙리스트">(
        "전체"
    )
    const [detailMember, setDetailMember] = useState<any | null>(null)
    const [detailMode, setDetailMode] = useState<"edit" | "create">("edit")

    const {
        sortedRows,
        itemsPerPage,
        currentPage,
        prevPage,
        nextPage,
        setFilters,
        toggleSort,
        sortConfig,
        updateMember,
        createMember,
        deleteMember,
        makeNewMemberTemplate,
        reload,
    } = MembersTableLogic()

    const paginatedRows = useMemo(() => {
        return sortedRows.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
    }, [sortedRows, currentPage, itemsPerPage])

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(sortedRows.length / itemsPerPage))
    }, [sortedRows, itemsPerPage])

    return (
        <div
            style={{
                width: "100%",
                fontFamily: "Pretendard Regular",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 40,
            }}
        >
            <MembersTableToolbar
                tab={tab}
                onChangeTab={(next) => {
                    setTab(next)
                    setFilters((prev) => ({ ...prev, tab: next }))
                }}
                onSearch={(q) =>
                    setFilters((prev) => ({
                        ...prev,
                        tab,
                        query: q && q.trim() ? q.trim() : undefined,
                    }))
                }
                onCreate={() => {
                    setDetailMode("create")
                    setDetailMember(makeNewMemberTemplate())
                }}
                onChangeGrade={(grade) =>
                    setFilters((prev) => ({
                        ...prev,
                        tab,
                        membership_grade: grade || undefined,
                    }))
                }
                onChangeRole={(role) =>
                    setFilters((prev) => ({
                        ...prev,
                        tab,
                        member_role: role || undefined,
                    }))
                }
                onChangeNationality={(nationality) =>
                    setFilters((prev) => ({
                        ...prev,
                        tab,
                        nationality: nationality || undefined,
                    }))
                }
                onReload={reload}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(8, 1fr)",
                            columnGap: 10,
                            padding: "12px 0",
                            fontFamily: "Pretendard SemiBold",
                            fontSize: 14,
                            color: "#333",
                        }}
                    >
                        <div
                            onClick={() => toggleSort("membership_number")}
                            style={{ cursor: "pointer" }}
                        >
                            회원번호{" "}
                            {sortConfig?.key === "membership_number" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>

                        <div
                            onClick={() => toggleSort("member_type")}
                            style={{ cursor: "pointer" }}
                        >
                            구분{" "}
                            {sortConfig?.key === "member_type" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>

                        <div
                            onClick={() => toggleSort("name_kor")}
                            style={{ cursor: "pointer" }}
                        >
                            이름/상호{" "}
                            {sortConfig?.key === "name_kor" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>

                        <div
                            onClick={() => toggleSort("identifier")}
                            style={{ cursor: "pointer" }}
                        >
                            식별 번호{" "}
                            {sortConfig?.key === "identifier" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>

                        <div
                            onClick={() => toggleSort("membership_grade")}
                            style={{ cursor: "pointer" }}
                        >
                            회원 등급{" "}
                            {sortConfig?.key === "membership_grade" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>

                        <div
                            onClick={() => toggleSort("phone")}
                            style={{ cursor: "pointer" }}
                        >
                            연락처{" "}
                            {sortConfig?.key === "phone" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>

                        <div
                            onClick={() => toggleSort("address")}
                            style={{ cursor: "pointer" }}
                        >
                            주소{" "}
                            {sortConfig?.key === "address" &&
                                (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </div>

                        <div style={{ cursor: "default" }}>ID | PW</div>
                    </div>

                    <div style={{ borderBottom: "1px solid #bdbdbd" }}>
                        {paginatedRows.map((row) => (
                            <MembersTableElement
                                key={row.membership_number}
                                data={row}
                                onOpenDetail={() => {
                                    setDetailMode("edit")
                                    setDetailMember(row)
                                }}
                                onUpdateMember={updateMember}
                            />
                        ))}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 25,
                        padding: "24px 0",
                        fontSize: 16,
                        color: "#444",
                        fontFamily: "Pretendard Regular",
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
            </div>

            {detailMember && (
                <MemberDetailOverlay
                    member={detailMember}
                    mode={detailMode}
                    onClose={() => setDetailMember(null)}
                    onDelete={async () => {
                        const deleted = await deleteMember(
                            detailMember.membership_number
                        )
                        if (deleted) setDetailMember(null)
                    }}
                    onSave={async (next) => {
                        if (detailMode === "create") {
                            const created = await createMember(next)
                            if (created) setDetailMember(null)
                            return
                        }
                        await updateMember(detailMember.membership_number, next)
                        setDetailMember(null)
                    }}
                />
            )}
        </div>
    )
}

function MemberDetailOverlay({
    member,
    mode,
    onClose,
    onSave,
    onDelete,
}: {
    member: any
    mode: "edit" | "create"
    onClose: () => void
    onSave: (next: any) => Promise<void>
    onDelete: () => Promise<void>
}) {
    const [temp, setTemp] = useState<any>({ ...member })
    const [saving, setSaving] = useState(false)

    const set = (k: string, v: any) => setTemp((p: any) => ({ ...p, [k]: v }))

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: 20,
                boxSizing: "border-box",
                fontFamily: "Pretendard Regular",
            }}
            onClick={() => {}}
        >
            <div
                style={{
                    width: "min(920px, 100%)",
                    background: "#fff",
                    borderRadius: 0,
                    padding: 24,
                    boxSizing: "border-box",
                    border: "1px solid #e6e6e6",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            fontFamily: "Pretendard SemiBold",
                            fontSize: 18,
                            letterSpacing: "0.12em",
                        }}
                    >
                        {mode === "create" ? "회원 등록" : "회원 상세"}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            all: "unset",
                            cursor: "pointer",
                            fontFamily: "Pretendard SemiBold",
                            fontSize: 18,
                            lineHeight: "1",
                            color: "#777",
                        }}
                    >
                        ×
                    </button>
                </div>

                <div
                    style={{
                        marginTop: 18,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 14,
                    }}
                >
                    <Field label="회원번호" value={temp.membership_number}>
                        <input
                            value={temp.membership_number ?? ""}
                            onChange={(e) =>
                                set("membership_number", e.target.value)
                            }
                            style={inputStyle}
                            disabled={mode !== "create"}
                        />
                    </Field>

                    <Field label="국적" value={temp.nationality ?? "domestic"}>
                        <select
                            value={temp.nationality ?? "domestic"}
                            onChange={(e) => set("nationality", e.target.value)}
                            style={selectStyle}
                        >
                            <option value="domestic">내국인</option>
                            <option value="foreign">외국인</option>
                        </select>
                    </Field>

                    <Field label="ID" value={temp.id ?? ""}>
                        <input
                            value={temp.id ?? ""}
                            onChange={(e) => set("id", e.target.value)}
                            style={inputStyle}
                        />
                    </Field>

                    <Field label="비밀번호" value={temp.password ?? ""}>
                        <input
                            value={temp.password ?? ""}
                            onChange={(e) => set("password", e.target.value)}
                            style={inputStyle}
                        />
                    </Field>

                    <Field
                        label="개인/법인"
                        value={temp.is_personal ? "개인" : "법인"}
                    >
                        <select
                            value={String(Boolean(temp.is_personal))}
                            onChange={(e) =>
                                set("is_personal", e.target.value === "true")
                            }
                            style={selectStyle}
                        >
                            <option value="true">개인</option>
                            <option value="false">법인</option>
                        </select>
                    </Field>

                    <Field label="이름(한글)" value={temp.name_kor ?? ""}>
                        <input
                            value={temp.name_kor ?? ""}
                            onChange={(e) => set("name_kor", e.target.value)}
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="이름(영문)" value={temp.name_eng ?? ""}>
                        <input
                            value={temp.name_eng ?? ""}
                            onChange={(e) => set("name_eng", e.target.value)}
                            style={inputStyle}
                        />
                    </Field>

                    <Field label="연락처" value={temp.phone ?? ""}>
                        <input
                            value={temp.phone ?? ""}
                            onChange={(e) => set("phone", e.target.value)}
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="이메일" value={temp.email ?? ""}>
                        <input
                            value={temp.email ?? ""}
                            onChange={(e) => set("email", e.target.value)}
                            style={inputStyle}
                        />
                    </Field>

                    {/* ✅ 개인 전용 입력 */}
                    {Boolean(temp.is_personal) && (
                        <>
                            <Field
                                label="생년월일(YYYYMMDD)"
                                value={temp.birthdate ?? ""}
                            >
                                <input
                                    value={temp.birthdate ?? ""}
                                    onChange={(e) =>
                                        set("birthdate", e.target.value)
                                    }
                                    style={inputStyle}
                                />
                            </Field>

                            <Field label="성별" value={temp.gender ?? ""}>
                                <select
                                    value={temp.gender ?? ""}
                                    onChange={(e) =>
                                        set("gender", e.target.value)
                                    }
                                    style={selectStyle}
                                >
                                    <option value="">선택</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </Field>
                        </>
                    )}

                    {/* ✅ 법인 전용 입력 */}
                    {!Boolean(temp.is_personal) && (
                        <>
                            <Field
                                label="사업자등록번호"
                                value={temp.business_registration_number ?? ""}
                            >
                                <input
                                    value={
                                        temp.business_registration_number ?? ""
                                    }
                                    onChange={(e) =>
                                        set(
                                            "business_registration_number",
                                            e.target.value
                                        )
                                    }
                                    style={inputStyle}
                                />
                            </Field>

                            <Field
                                label="담당자 이름"
                                value={temp.contact_person_name ?? ""}
                            >
                                <input
                                    value={temp.contact_person_name ?? ""}
                                    onChange={(e) =>
                                        set(
                                            "contact_person_name",
                                            e.target.value
                                        )
                                    }
                                    style={inputStyle}
                                />
                            </Field>

                            <Field
                                label="담당자 연락처"
                                value={temp.contact_person_phone ?? ""}
                            >
                                <input
                                    value={temp.contact_person_phone ?? ""}
                                    onChange={(e) =>
                                        set(
                                            "contact_person_phone",
                                            e.target.value
                                        )
                                    }
                                    style={inputStyle}
                                />
                            </Field>
                        </>
                    )}

                    <Field label="주소" value={temp.address ?? ""} wide>
                        <input
                            value={temp.address ?? ""}
                            onChange={(e) => set("address", e.target.value)}
                            style={inputStyle}
                        />
                    </Field>

                    {/* ✅ 등급: input -> dropdown */}
                    <Field label="등급" value={temp.membership_grade ?? ""}>
                        <select
                            value={temp.membership_grade ?? "Non-Member"}
                            onChange={(e) =>
                                set("membership_grade", e.target.value)
                            }
                            style={selectStyle}
                        >
                            {[
                                "Non-Member",
                                "TERENE 6",
                                "TERENE 9",
                                "TERENE 12",
                                "TERENE 24",
                                "All-Free",
                            ].map((g) => (
                                <option key={g} value={g}>
                                    {g}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* ✅ Phase: input -> dropdown */}
                    <Field label="Phase" value={temp.phase ?? ""}>
                        <select
                            value={temp.phase ?? "Phase-1"}
                            onChange={(e) => set("phase", e.target.value)}
                            style={selectStyle}
                        >
                            {["Phase-1", "Phase-2", "Phase-3"].map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="블랙리스트"
                        value={temp.blacklist ? "true" : "false"}
                    >
                        <select
                            value={String(Boolean(temp.blacklist))}
                            onChange={(e) =>
                                set("blacklist", e.target.value === "true")
                            }
                            style={selectStyle}
                        >
                            <option value="false">false</option>
                            <option value="true">true</option>
                        </select>
                    </Field>

                    <Field label="가입일" value={temp.signup_date ?? ""}>
                        <input
                            value={temp.signup_date ?? ""}
                            onChange={(e) => set("signup_date", e.target.value)}
                            style={inputStyle}
                        />
                    </Field>
                </div>

                <div
                    style={{
                        marginTop: 18,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    {mode === "edit" ? (
                        <button
                            type="button"
                            onClick={onDelete}
                            style={{
                                height: 36,
                                padding: "0 16px",
                                backgroundColor: "transparent",
                                color: "#ff0000",
                                cursor: "pointer",
                                fontFamily: "Pretendard SemiBold",
                                fontSize: 14,
                                border: "1px solid #ff0000",
                            }}
                        >
                            삭제
                        </button>
                    ) : (
                        <div />
                    )}

                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={btnStyleBright}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={async () => {
                                setSaving(true)
                                try {
                                    await onSave(temp)
                                } finally {
                                    setSaving(false)
                                }
                            }}
                            style={{
                                ...btnStyleDark,
                                opacity: saving ? 0.5 : 1,
                                cursor: saving ? "not-allowed" : "pointer",
                            }}
                        >
                            {mode === "create" ? "등록" : "저장"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Field({
    label,
    value,
    children,
    wide,
}: {
    label: string
    value: string
    children?: React.ReactNode
    wide?: boolean
}) {
    return (
        <div style={{ gridColumn: wide ? "1 / span 2" : undefined }}>
            <div
                style={{
                    fontFamily: "Pretendard SemiBold",
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    color: "#444",
                    marginBottom: 6,
                }}
            >
                {label}
            </div>
            {children ?? (
                <div
                    style={{
                        fontFamily: "Pretendard Regular",
                        fontSize: 14,
                        color: "#111",
                        padding: "10px 12px",
                        borderBottom: "1px solid #222",
                    }}
                >
                    {value || "-"}
                </div>
            )}
        </div>
    )
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 36,
    padding: "0 12px",
    border: "none",
    borderBottom: "1px solid #222",
    outline: "none",
    fontFamily: "Pretendard Regular",
    fontSize: 14,
    letterSpacing: "0.06em",
    background: "transparent",
    boxSizing: "border-box",
}

const selectStyle: React.CSSProperties = {
    width: "100%",
    height: 36,
    padding: "0 12px",
    border: "none",
    borderBottom: "1px solid #222",
    outline: "none",
    fontFamily: "Pretendard Regular",
    fontSize: 14,
    letterSpacing: "0.06em",
    background: "transparent",
    boxSizing: "border-box",
}

const btnStyleBright: React.CSSProperties = {
    height: 36,
    padding: "0 16px",
    backgroundColor: "#ebebeb",
    border: "none",
    cursor: "pointer",
    fontFamily: "Pretendard SemiBold",
    fontSize: 14,
    width: "100%",
}

const btnStyleDark: React.CSSProperties = {
    height: 36,
    padding: "0 16px",
    color: "#ffffff",
    backgroundColor: "#545454",
    border: "none",
    cursor: "pointer",
    fontFamily: "Pretendard SemiBold",
    fontSize: 14,
    width: "100%",
}
