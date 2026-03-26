import * as React from "react"
import MinimalButton from "../../Components/MinimalButton.tsx"
import DualSelector from "../../Components/DualSelector.tsx"
import MultiPurposeInput from "../../Components/MultiPurposeInput.tsx"

type Props = {
    dates: string[]

    peak: "left" | "right" | null
    weekday: "left" | "right" | null
    canCheckin: "left" | "right" | null
    canCheckout: "left" | "right" | null

    onChangePeak?: (v: "left" | "right" | null) => void
    onChangeWeekday?: (v: "left" | "right" | null) => void
    onChangeHoliday?: (v: string) => void
    onChangeCanCheckin?: (v: "left" | "right" | null) => void
    onChangeCanCheckout?: (v: "left" | "right" | null) => void

    holidayValue?: string
    dropdownOptions?: string[]
    disabled?: boolean
    onToggleEdit?: () => void
    isEditing?: boolean
}

export default function SpecificDateRow({
    dates,
    peak,
    weekday,
    canCheckin,
    canCheckout,
    holidayValue,
    onChangeHoliday,
    onChangePeak,
    onChangeWeekday,
    onChangeCanCheckin,
    onChangeCanCheckout,
    dropdownOptions,
    disabled,
    onToggleEdit,
    isEditing,
}: Props) {
    const isStandardCategory = peak !== null || weekday !== null

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "100%",
                fontFamily: "Pretendard Regular",
            }}
        >
            {/* Date Buttons */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                }}
            >
                {dates.map((d) => (
                    <MinimalButton
                        key={d}
                        label={d}
                        variant="border"
                        color="#000"
                        width={110}
                        height={25}
                        fontSize={14}
                        fontFamily="Pretendard Medium"
                    />
                ))}
            </div>

            {/* Header */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    height: 35,
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    fontFamily: "Pretendard SemiBold",
                }}
            >
                <div>시즌</div>
                <div>카테고리</div>
                <div>특별 연휴</div>
                <div>입실</div>
                <div>퇴실</div>
                <div>관리</div>
            </div>

            {/* Content */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: "10px",
                    borderTop: "1px solid #E0E0E0",
                    padding: "30px 0",
                }}
            >
                <DualSelector
                    leftLabel="성수기"
                    rightLabel="비수기"
                    color="#E6E6E6"
                    value={peak}
                    disabled={disabled}
                    onChange={onChangePeak}
                />

                <DualSelector
                    leftLabel="평일"
                    rightLabel="주말"
                    color="#E6E6E6"
                    value={weekday}
                    disabled={disabled}
                    onChange={onChangeWeekday}
                />

                <MultiPurposeInput
                    type="dropdown"
                    value={holidayValue}
                    onChange={onChangeHoliday}
                    height={35}
                    fontSize={14}
                    disabled={disabled}
                    dropdownUnit=""
                    dropdownMax={3}
                    dropdownDefaultText="선택"
                    dropdownDefaultAllowed={true}
                    dropdownOptions={dropdownOptions}
                />

                <DualSelector
                    leftLabel="가능"
                    rightLabel="불가능"
                    color="#E6E6E6"
                    value={canCheckin}
                    disabled={disabled}
                    onChange={onChangeCanCheckin}
                />

                <DualSelector
                    leftLabel="가능"
                    rightLabel="불가능"
                    color="#E6E6E6"
                    value={canCheckout}
                    disabled={disabled}
                    onChange={onChangeCanCheckout}
                />

                <MinimalButton
                    label={isEditing ? "저장" : "수정"}
                    variant="border"
                    color="#0066FF"
                    width="100%"
                    height={35}
                    fontSize={14}
                    onClick={onToggleEdit}
                />
            </div>
        </div>
    )
}
