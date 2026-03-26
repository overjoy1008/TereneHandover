import * as React from "react"
import { useState, useEffect } from "react"
import { FramerRadio } from "../../Components/FramerRadio.tsx"
import FramerInput from "../../Components/FramerInput.tsx"
import MinimalButton from "../../Components/MinimalButton.tsx"

const private_test_key = "private_DDcXA7aIKBgKc0kFzGZA+aBkEO8=:"
const private_official_key = "private_hO4qoS2CGYGJo690lEfRCS5RcgM=:"

export function ServiceItem({
    index,
    data,
    onSave,
    onDelete,
    autoEdit = false,
}) {
    const [edit, setEdit] = useState(autoEdit)
    const [form, setForm] = useState(data)

    useEffect(() => {
        if (autoEdit) setEdit(true)
    }, [autoEdit])

    const handleChange = (key, value) => setForm({ ...form, [key]: value })

    const handleDropdownChange = (show: boolean) => {
        setForm((prev) => ({
            ...prev,
            show_dropdown: show,
            default_allowed: show, // show=true면 true, false면 false
        }))
    }

    const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)
        formData.append("fileName", `${data.title}.jpg`)
        formData.append("useUniqueFileName", "false")

        const res = await fetch(
            "https://upload.imagekit.io/api/v1/files/upload",
            {
                method: "POST",
                headers: {
                    Authorization: "Basic " + btoa(private_official_key),
                },
                body: formData,
            }
        )

        const result = await res.json()

        setForm((prev) => ({
            ...prev,
            image_url: `${result.url}?v=${Date.now()}`,
            image_file_id: result.fileId,
        }))
    }

    // const handleImageDelete = async () => {
    //     if (!form.image_file_id) {
    //         setForm((prev) => ({ ...prev, image_url: "" }))
    //         return
    //     }

    //     const res = await fetch(
    //         `https://api.imagekit.io/v1/files/${form.image_file_id}`,
    //         {
    //             method: "DELETE",
    //             headers: {
    //                 Authorization: "Basic " + btoa(private_official_key),
    //             },
    //         }
    //     )

    //     if (res.ok) {
    //         setForm((prev) => ({
    //             ...prev,
    //             image_url: "",
    //             image_file_id: "",
    //         }))
    //     } else {
    //         alert("이미지 삭제 중 오류 발생")
    //     }
    // }

    const handleImageDelete = async () => {
        let alertMessage = ""

        if (!form.image_file_id) {
            setForm((prev) => ({ ...prev, image_url: "" }))
            alertMessage = "삭제할 이미지 파일 ID가 없어 URL만 초기화했습니다."
            alert(alertMessage)
            return
        }

        try {
            const res = await fetch(
                `https://api.imagekit.io/v1/files/${form.image_file_id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: "Basic " + btoa(private_official_key),
                    },
                }
            )

            if (res.ok) {
                setForm((prev) => ({
                    ...prev,
                    image_url: "",
                    image_file_id: "",
                }))
                alertMessage = "이미지가 정상적으로 삭제되었습니다."
            } else {
                const text = await res.text()
                alertMessage =
                    `이미지 삭제 실패\n\n` +
                    `status: ${res.status}\n` +
                    `statusText: ${res.statusText}\n` +
                    `response: ${text}`
            }
        } catch (e: any) {
            alertMessage =
                `이미지 삭제 중 네트워크 오류\n\n` +
                `message: ${e?.message ?? e}`
        }

        alert(alertMessage)
    }

    const handleSubmit = async () => {
        await onSave({ ...form })
        setEdit(false)
    }

    const displayImage = form.image_url

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                paddingTop: 30,
                paddingBottom: 30,
                borderTop: "1px solid #E0E0E0",
                fontFamily: "Pretendard Regular",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "0.15fr 0.4fr 1.5fr 0.3fr",
                    alignItems: "center",
                    gap: 20,
                }}
            >
                <FramerInput
                    disabled={!edit}
                    type="number"
                    placeholder="순서"
                    value={form.manual_order?.toString() || ""}
                    onChange={(v) => handleChange("manual_order", Number(v))}
                    width="100%"
                />

                <div
                    style={{
                        width: "100%",
                        height: 100,
                        background: "#f5f5f5",
                        borderRadius: 8,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    {displayImage ? (
                        <>
                            <img
                                src={displayImage}
                                alt="service"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                            {edit && (
                                <button
                                    onClick={handleImageDelete}
                                    style={{
                                        position: "absolute",
                                        top: 6,
                                        right: 6,
                                        background: "rgba(0,0,0,0.6)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 4,
                                        padding: "2px 6px",
                                        fontSize: 10,
                                        cursor: "pointer",
                                    }}
                                >
                                    삭제
                                </button>
                            )}
                        </>
                    ) : edit ? (
                        <label
                            style={{
                                fontSize: 12,
                                color: "#777",
                                cursor: "pointer",
                            }}
                        >
                            사진 첨부
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleImage}
                            />
                        </label>
                    ) : (
                        <div style={{ color: "#aaa", fontSize: 12 }}>
                            사진 없음
                        </div>
                    )}
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        width: "100%",
                    }}
                >
                    <FramerInput
                        disabled={!edit}
                        placeholder="옵션명 입력"
                        value={form.title}
                        onChange={(v) => handleChange("title", v)}
                        width="100%"
                    />
                    <FramerInput
                        disabled={!edit}
                        placeholder="세부 설명 입력"
                        value={form.description}
                        onChange={(v) => handleChange("description", v)}
                        width="100%"
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {edit ? (
                        <MinimalButton
                            label="저장"
                            variant="border"
                            color="#0022FF"
                            width={150}
                            height={30}
                            fontSize={14}
                            onClick={handleSubmit}
                        />
                    ) : (
                        <MinimalButton
                            label="수정"
                            variant="border"
                            color="#0022FF"
                            width={150}
                            height={30}
                            fontSize={14}
                            onClick={() => setEdit(true)}
                        />
                    )}
                    <MinimalButton
                        label="삭제"
                        variant="border"
                        color="#FF0000"
                        width={150}
                        height={30}
                        fontSize={14}
                        onClick={onDelete}
                    />
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 30,
                    paddingLeft: 100,
                    alignItems: "flex-start",
                    fontSize: 14,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "center",
                            height: 40,
                        }}
                    >
                        <FramerRadio
                            name={`category-${index}`}
                            value="package"
                            label="패키지"
                            checked={form.category === "package"}
                            disabled={!edit}
                            onChange={(value) =>
                                handleChange("category", value)
                            }
                        />
                        <FramerRadio
                            name={`category-${index}`}
                            value="additional"
                            label="추가 서비스"
                            checked={form.category === "additional"}
                            disabled={!edit}
                            onChange={(value) =>
                                handleChange("category", value)
                            }
                        />
                    </div>
                    <FramerInput
                        disabled={!edit}
                        placeholder="원 / 회 or 기본 제공"
                        value={form.displayed_price_kor || ""}
                        onChange={(v) => handleChange("displayed_price_kor", v)}
                        width={210}
                        height={40}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,
                        alignItems: "center",
                        height: 40,
                    }}
                >
                    <FramerRadio
                        name={`paid-${index}`}
                        value="free"
                        label="무료"
                        checked={!form.paid}
                        disabled={!edit}
                        onChange={() => handleChange("paid", false)}
                    />
                    <FramerRadio
                        name={`paid-${index}`}
                        value="paid"
                        label="유료"
                        checked={form.paid}
                        disabled={!edit}
                        onChange={() => handleChange("paid", true)}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,
                        alignItems: "center",
                        height: 40,
                    }}
                >
                    <FramerRadio
                        name={`type-${index}`}
                        value="fixed"
                        label="고정"
                        checked={form.type === "fixed"}
                        disabled={!edit}
                        onChange={() => handleChange("type", "fixed")}
                    />
                    <FramerRadio
                        name={`type-${index}`}
                        value="proportional"
                        label="비례"
                        checked={form.type === "proportional"}
                        disabled={!edit}
                        onChange={() => handleChange("type", "proportional")}
                    />
                    <FramerInput
                        type="number"
                        placeholder="비례 가격"
                        value={form.price?.toString() || ""}
                        onChange={(v) => handleChange("price", Number(v))}
                        width={140}
                        height={40}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,
                        alignItems: "flex-start",
                        minHeight: 40,
                    }}
                >
                    <FramerRadio
                        name={`dropdown-${index}`}
                        value="false"
                        label="미노출"
                        checked={!form.show_dropdown}
                        disabled={!edit}
                        onChange={() => handleDropdownChange(false)}
                    />
                    <FramerRadio
                        name={`dropdown-${index}`}
                        value="true"
                        label="노출"
                        checked={form.show_dropdown}
                        disabled={!edit}
                        onChange={() => handleDropdownChange(true)}
                    />

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            marginLeft: 10,
                        }}
                    >
                        <FramerInput
                            disabled={!edit || !form.show_dropdown}
                            placeholder="최초 단위 (인원수/횟수)"
                            value={form.default_text || ""}
                            onChange={(v) => handleChange("default_text", v)}
                            width={160}
                            height={40}
                        />
                        <FramerInput
                            disabled={!edit || !form.show_dropdown}
                            type="number"
                            placeholder="최대 수량"
                            value={form.max_unit?.toString() || ""}
                            onChange={(v) =>
                                handleChange("max_unit", Number(v))
                            }
                            width={160}
                            height={40}
                        />
                        <FramerInput
                            disabled={!edit || !form.show_dropdown}
                            placeholder="단위 (인/회)"
                            value={form.unit || ""}
                            onChange={(v) => handleChange("unit", v)}
                            width={160}
                            height={40}
                        />
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,
                        alignItems: "center",
                        height: 40,
                    }}
                >
                    <FramerRadio
                        name={`available-${index}`}
                        value="true"
                        label="활성화"
                        checked={form.available}
                        disabled={!edit}
                        onChange={() => handleChange("available", true)}
                    />
                    <FramerRadio
                        name={`available-${index}`}
                        value="false"
                        label="비활성화"
                        checked={!form.available}
                        disabled={!edit}
                        onChange={() => handleChange("available", false)}
                    />
                </div>
            </div>
        </div>
    )
}
