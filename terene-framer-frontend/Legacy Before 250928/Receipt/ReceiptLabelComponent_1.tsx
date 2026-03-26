// ReceiptLabelComponent.tsx
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { useStore } from "../Calendar/MonthDisplay.tsx"
import {
    useHolidayCategoryMap,
    useCoupons,
    toCategoryMap,
} from "./PriceDisplay.tsx"
import {
    calculateInitialPrices,
    filterCoupons,
    evaluateCoupons,
} from "./EvaluateCoupons.ts"
import {
    useAdditionalServiceStore,
    createAdditionalServiceList,
} from "./AdditionalService.tsx"
import { parseDate } from "./CheckAuth.tsx"
import { motion } from "framer-motion"

const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
    >
        {children}
    </motion.div>
)

export function ReceiptLabelComponent({ variant }) {
    const queryParams = new URLSearchParams(window.location.search)
    const first = queryParams.get("first")
    const second = queryParams.get("second")
    const firstDate = first ? parseDate(first) : null
    const secondDate = second ? parseDate(second) : null

    const [store] = useStore()
    const [additionalServiceStore] = useAdditionalServiceStore()

    const { categories, isLoading: categoryLoading } = useHolidayCategoryMap()
    const { coupons, isLoading: couponLoading } = useCoupons()

    const isStoreReady =
        (store.firstDate && store.secondDate) || (firstDate && secondDate)

    const isReceiptLike =
        variant.startsWith("Receipt") ||
        variant === "Primary" ||
        variant === "Secondary"
    const isPrimary = variant === "Primary"
    const isSecondary = variant === "Secondary"

    if (!isStoreReady || categoryLoading || couponLoading)
        return (
            <div style={getRowStyle(variant)}>
                <div
                    style={{
                        ...getMainLabelStyle(variant),
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <span>
                        {isPrimary
                            ? "객실요금"
                            : isSecondary
                              ? "특별할인"
                              : isReceiptLike
                                ? "할인요금"
                                : variant.startsWith("Additional")
                                  ? "추가 서비스 이용료"
                                  : "기본할인"}
                    </span>
                </div>
                <div style={couponContainerStyle(variant)}>
                    <div style={getLineStyle(variant)}></div>
                </div>
            </div>
        )

    const categoryMap = toCategoryMap(categories)
    const { initialPrice, dailyItems } = calculateInitialPrices(
        store,
        categoryMap,
        firstDate,
        secondDate
    )

    const { passedPrimaryCoupons, passedSecondaryCoupons } = filterCoupons(
        coupons,
        store,
        dailyItems
    )

    const { primaryDiscountedPrice, primaryDetails, secondaryDetails } =
        evaluateCoupons(
            passedPrimaryCoupons,
            passedSecondaryCoupons,
            dailyItems,
            store
        )

    const additionalServiceList = createAdditionalServiceList(
        additionalServiceStore,
        store
    )

    const couponDetailsToRender = isPrimary
        ? primaryDetails
        : isSecondary
          ? secondaryDetails
          : []

    return (
        <FadeIn>
            <div style={getRowStyle(variant)}>
                <div
                    style={{
                        ...getMainLabelStyle(variant),
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <span>
                        {isPrimary
                            ? "객실요금"
                            : isSecondary
                              ? "특별할인"
                              : isReceiptLike
                                ? "할인요금"
                                : variant.startsWith("Additional")
                                  ? "추가 서비스 이용료"
                                  : "기본할인"}
                    </span>
                    {isPrimary && (
                        <span style={getRightPriceStyle(variant)}>
                            {primaryDiscountedPrice.toLocaleString("ko-KR")} 원
                        </span>
                    )}
                </div>

                {isPrimary && (
                    <div style={getLineStyle(variant)}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                            }}
                        >
                            <span style={getLeftDescriptionStyle(variant)}>
                                기본요금
                            </span>
                            <span style={getRightPriceStyle(variant)}>
                                {initialPrice.toLocaleString("ko-KR")} 원
                            </span>
                        </div>
                    </div>
                )}

                <div style={couponContainerStyle(variant)}>
                    {variant.startsWith("Additional")
                        ? additionalServiceList.map(({ type, amount }) => (
                              <div key={type} style={getLineStyle(variant)}>
                                  <div
                                      style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          width: "100%",
                                      }}
                                  >
                                      <span
                                          style={getLeftDescriptionStyle(
                                              variant
                                          )}
                                      >
                                          {type}
                                      </span>
                                      <span style={getRightPriceStyle(variant)}>
                                          +{amount.toLocaleString("ko-KR")} 원
                                      </span>
                                  </div>
                              </div>
                          ))
                        : couponDetailsToRender.map(
                              ({ id, name, description, amount }) => {
                                  const label =
                                      id === "phase-1"
                                          ? `Phase-1 계정 숙박비 전액 할인`
                                          : id === "all-free"
                                            ? "Admin 계정 전액 할인"
                                            : description || name || id

                                  return (
                                      <div
                                          key={id}
                                          style={getLineStyle(variant)}
                                      >
                                          <div
                                              style={{
                                                  display: "flex",
                                                  justifyContent:
                                                      "space-between",
                                                  width: "100%",
                                              }}
                                          >
                                              <span
                                                  style={getLeftDescriptionStyle(
                                                      variant
                                                  )}
                                              >
                                                  {label}
                                              </span>
                                              {isReceiptLike && (
                                                  <span
                                                      style={getRightPriceStyle(
                                                          variant
                                                      )}
                                                  >
                                                      -
                                                      {amount.toLocaleString(
                                                          "ko-KR"
                                                      )}{" "}
                                                      원
                                                  </span>
                                              )}
                                          </div>
                                      </div>
                                  )
                              }
                          )}
                </div>
            </div>
        </FadeIn>
    )
}

// ===== 스타일 함수 동일 =====

function getRowStyle(variant: string): React.CSSProperties {
    const base: React.CSSProperties = { display: "flex" }

    switch (variant) {
        case "Receipt":
        case "ReceiptMobile":
        case "Additional":
        case "AdditionalMobile":
        case "Primary":
        case "Secondary":
            return {
                ...base,
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
                gap: "15px",
            }
        case "CalendarMobile":
            return {
                ...base,
                flexDirection: "row",
                alignItems: "center",
                gap: "14px",
            }
        default:
            return {
                ...base,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "14px",
            }
    }
}

function getMainLabelStyle(variant: string): React.CSSProperties {
    const base: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
    }

    switch (variant) {
        case "Receipt":
        case "Primary":
        case "Secondary":
            return {
                ...base,
                fontFamily: "Pretendard Regular, sans-serif",
                fontSize: "14px",
                height: "18px",
                width: "100%",
                color: "#000000",
            }
        case "ReceiptMobile":
            return {
                ...base,
                fontFamily: "Pretendard Regular, sans-serif",
                fontSize: "12px",
                height: "18px",
                width: "100%",
                color: "#000000",
            }
        case "Additional":
            return {
                ...base,
                fontFamily: "Pretendard Regular, sans-serif",
                fontSize: "14px",
                height: "18px",
                width: "104px",
                color: "#000000",
            }
        case "AdditionalMobile":
            return {
                ...base,
                fontFamily: "Pretendard Regular, sans-serif",
                fontSize: "12px",
                height: "18px",
                width: "89px",
                color: "#000000",
            }
        case "CalendarMobile":
            return {
                ...base,
                fontFamily: "Pretendard Light, sans-serif",
                fontSize: "12px",
                height: "20px",
                width: "42px",
                color: "#000000",
            }
        case "Calendar":
        default:
            return {
                ...base,
                fontFamily: "Pretendard Light, sans-serif",
                fontSize: "16px",
                height: "20px",
                width: "56px",
                color: "#000000",
            }
    }
}

function couponContainerStyle(variant: string): React.CSSProperties {
    return {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "100%",
        flex: 1,
    }
}

function getLineStyle(variant: string): React.CSSProperties {
    const isReceiptOrAdditional =
        variant.startsWith("Receipt") ||
        variant.startsWith("Additional") ||
        variant === "Primary" ||
        variant === "Secondary"

    return {
        display: "flex",
        alignItems: "center",
        width: "100%",
        ...(isReceiptOrAdditional ? { height: "18px" } : {}),
    }
}

function getLeftDescriptionStyle(variant: string): React.CSSProperties {
    return {
        fontFamily: "Pretendard Light, sans-serif",
        fontSize: ["ReceiptMobile", "AdditionalMobile"].includes(variant)
            ? "9px"
            : "12px",
        color: "#4D4D4D",
    }
}

function getRightPriceStyle(variant: string): React.CSSProperties {
    return {
        fontFamily: "Pretendard Light",
        fontWeight: 300,
        fontSize: ["ReceiptMobile", "AdditionalMobile"].includes(variant)
            ? "12px"
            : "14px",
        color: "#000000",
        whiteSpace: "nowrap",
    }
}

addPropertyControls(ReceiptLabelComponent, {
    variant: {
        type: ControlType.Enum,
        title: "Variant",
        options: [
            "Calendar",
            "CalendarMobile",
            "Receipt",
            "ReceiptMobile",
            "Additional",
            "AdditionalMobile",
            "Primary",
            "Secondary",
        ],
        optionTitles: [
            "객실요금",
            "객실요금 Mobile",
            "할인요금",
            "할인요금 Mobile",
            "추가 서비스 이용료",
            "추가 서비스 이용료 Mobile",
            "객실요금_v2",
            "특별할인_v2",
        ],
        defaultValue: "Receipt",
    },
})
