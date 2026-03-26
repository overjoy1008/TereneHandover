
// PriceDisplay.tsx
import React, { useEffect, useMemo, ComponentType } from "react"
import { useStore } from "../Store/MainStore.tsx"
import { useFormStore } from "./ReservationForm.tsx"

import {
    calculateInitialPrices,
    filterCoupons,
    evaluateCoupons,
} from "./EvaluateCoupons.ts"
import { Category, DiscountCoupon } from "./DiscountEngine.ts"
import {
    useAdditionalServiceStore,
    createAdditionalServiceList,
} from "./AdditionalService.tsx"
import { formatDate, parseDate } from "../Utils/DateUtils.tsx"
import { motion } from "framer-motion"
import { useDayCategoryDefinitions } from "./useDayCategoryDefinitions.ts"

const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        // style={{ display: "contents" }}
    >
        {children}
    </motion.div>
)

// 공휴일 카테고리 가져오기 (v3 구조 대응)
export function useHolidayCategoryMap() {
    const [categories, setCategories] = React.useState<Record<string, string>>(
        {}
    )
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        fetch("https://terene-db-server.onrender.com/api/v3/days")
            .then((res) => res.json())
            .then((data) => {
                const map: Record<string, string> = {}
                for (const item of data) {
                    // ✅ days_250928 구조 반영
                    // item = { date, category, is_holiday, location, checkin_occupied, ... }
                    map[item.date] = item.category
                }
                setCategories(map)
            })
            .catch((err) => console.error("Holiday fetch error", err))
            .finally(() => setIsLoading(false))
    }, [])

    return { categories, isLoading }
}

// ✅ 문자열 → 카테고리 매핑
export function toCategoryMap(
    input: Record<string, string>
): Record<string, string> {
    return input
}

export function useCoupons(): {
    coupons: DiscountCoupon[]
    isLoading: boolean
} {
    const [coupons, setCoupons] = React.useState<DiscountCoupon[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchCoupons() {
            try {
                // Fetch definitions first
                const defRes = await fetch(
                    "https://terene-db-server.onrender.com/api/v2/coupon-definitions"
                )
                const definitions = await defRes.json()

                // Separate global and code types (ignore membership)
                const globalDefs = definitions.filter(
                    (def: any) => def.type === "global"
                )
                const codeDefs = definitions.filter(
                    (def: any) => def.type === "code"
                )

                // Fetch instances only if there are code definitions
                let codeInstances: any[] = []
                if (codeDefs.length > 0) {
                    const instRes = await fetch(
                        "https://terene-db-server.onrender.com/api/v2/coupon-instances"
                    )
                    const instances = await instRes.json()
                    codeInstances = instances.filter((inst: any) =>
                        codeDefs.some(
                            (def: any) =>
                                def.coupon_definition_id ===
                                inst.coupon_definition_id
                        )
                    )
                }

                // Merge code definitions and their instances
                const codeCoupons = codeInstances.map((inst: any) => {
                    const def = codeDefs.find(
                        (d: any) =>
                            d.coupon_definition_id === inst.coupon_definition_id
                    )
                    return {
                        ...def,
                        ...inst,
                    }
                })

                // Combine global and code coupons
                const combined: DiscountCoupon[] = [
                    ...globalDefs,
                    ...codeCoupons,
                ]

                // Sort by optional priority if present
                const sorted = combined.sort(
                    (a: any, b: any) => (a.priority || 0) - (b.priority || 0)
                )

                setCoupons(sorted)
            } catch (err) {
                console.error("Coupon fetch error:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCoupons()
    }, [])

    return { coupons, isLoading }
}

function useDiscountCalculation() {
    const queryParams =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams("")

    const first = queryParams.get("first")
    const second = queryParams.get("second")
    const firstDate = first ? parseDate(first) : null
    const secondDate = second ? parseDate(second) : null

    const [store] = useStore()
    const { categories, isLoading: categoryLoading } = useHolidayCategoryMap()
    const { coupons, isLoading: couponLoading } = useCoupons()
    const { categoryDefs, isLoading: categoryDefLoading } =
        useDayCategoryDefinitions()

    const isReady =
        (store.firstDate && store.secondDate) || (firstDate && secondDate)

    const result = useMemo(() => {
        if (!isReady || categoryLoading || couponLoading || categoryDefLoading)
            return null

        const categoryMap = toCategoryMap(categories)
        const { initialPrice, dailyItems } = calculateInitialPrices(
            store,
            categoryMap,
            categoryDefs,
            firstDate,
            secondDate
        )

        const { passedPrimaryCoupons, passedSecondaryCoupons } = filterCoupons(
            coupons,
            store,
            dailyItems
        )
        const { secondaryDiscountedPrice: discountedPrice } = evaluateCoupons(
            passedPrimaryCoupons,
            passedSecondaryCoupons,
            dailyItems,
            store
        )

        return { initialPrice, discountedPrice }
    }, [
        store,
        categories,
        coupons,
        firstDate,
        secondDate,
        categoryLoading,
        couponLoading,
    ])

    return {
        isLoading: !isReady || categoryLoading || couponLoading,
        data: result,
    }
}

export function displayInitialPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const [formStore] = useFormStore()

        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const { coupons, isLoading: couponLoading } = useCoupons()
        // console.log("### COUPONS ###")
        // console.log(JSON.stringify(coupons))
        const { categoryDefs, isLoading: categoryDefLoading } =
            useDayCategoryDefinitions()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (
            !isStoreReady ||
            categoryLoading ||
            couponLoading ||
            categoryDefLoading
        )
            return null

        const categoryMap = toCategoryMap(categories)
        const { initialPrice } = calculateInitialPrices(
            store,
            categoryMap,
            categoryDefs,
            firstDate,
            secondDate
        )

        const text =
            store.payment === "paypal"
                ? `KRW ${Math.max(initialPrice, 0).toLocaleString("ko-KR")}`
                : `${Math.max(initialPrice, 0).toLocaleString("ko-KR")} 원`

        return (
            // <FadeIn>
            <Component {...props} text={text} />
            // </FadeIn>
        )
    }
}

export function displayDiscountedPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const [formStore] = useFormStore()

        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const { coupons, isLoading: couponLoading } = useCoupons()
        const { categoryDefs, isLoading: categoryDefLoading } =
            useDayCategoryDefinitions()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (
            !isStoreReady ||
            categoryLoading ||
            couponLoading ||
            categoryDefLoading
        )
            return null

        const categoryMap = toCategoryMap(categories)
        const { dailyItems } = calculateInitialPrices(
            store,
            categoryMap,
            categoryDefs,
            firstDate,
            secondDate
        )

        const { passedPrimaryCoupons, passedSecondaryCoupons } = filterCoupons(
            coupons,
            store,
            dailyItems
        )
        const { secondaryDiscountedPrice: discountedPrice } = evaluateCoupons(
            passedPrimaryCoupons,
            passedSecondaryCoupons,
            dailyItems,
            store
        )

        const text =
            store.payment === "paypal"
                ? `KRW ${Math.max(discountedPrice, 0).toLocaleString("ko-KR")}`
                : `${Math.max(discountedPrice, 0).toLocaleString("ko-KR")} 원`

        return (
            <FadeIn>
                <Component {...props} text={text} />
            </FadeIn>
        )
    }
}

function transitionStyle(visible: boolean): React.CSSProperties {
    return {
        opacity: visible ? 1 : 0,
        color: "inherit",
        transition: "opacity 0.3s ease-in-out",
        display: "inline-block",
    }
}

export function displayDiscountBar(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const { coupons, isLoading: couponLoading } = useCoupons()
        const { categoryDefs, isLoading: categoryDefLoading } =
            useDayCategoryDefinitions()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (
            !isStoreReady ||
            categoryLoading ||
            couponLoading ||
            categoryDefLoading
        )
            return null

        const categoryMap = toCategoryMap(categories)
        const { initialPrice, dailyItems } = calculateInitialPrices(
            store,
            categoryMap,
            categoryDefs,
            firstDate,
            secondDate
        )
        const { passedPrimaryCoupons, passedSecondaryCoupons } = filterCoupons(
            coupons,
            store,
            dailyItems
        )
        const { secondaryDiscountedPrice: discountedPrice } = evaluateCoupons(
            passedPrimaryCoupons,
            passedSecondaryCoupons,
            dailyItems,
            store
        )

        const show = initialPrice !== Math.max(discountedPrice, 0)

        const baseStyle = transitionStyle(show)
        const width =
            initialPrice >= 100_000_000
                ? 144
                : initialPrice >= 10_000_000
                  ? 128
                  : 112

        const barStyle: React.CSSProperties = {
            ...baseStyle,
            width,
            position: "relative",
            right: 0,
            transform: `translateX(${92 - width}px)`,
        }
        // <Component {...props} style={barStyle} />

        return (
            <FadeIn>
                <Component {...props} style={baseStyle} />
            </FadeIn>
        )
    }
}

export function displaySoftInitialPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const [formStore] = useFormStore()

        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const { coupons, isLoading: couponLoading } = useCoupons()
        const { categoryDefs, isLoading: categoryDefLoading } =
            useDayCategoryDefinitions()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (
            !isStoreReady ||
            categoryLoading ||
            couponLoading ||
            categoryDefLoading
        )
            return null

        const categoryMap = toCategoryMap(categories)
        const { initialPrice } = calculateInitialPrices(
            store,
            categoryMap,
            categoryDefs,
            firstDate,
            secondDate
        )

        const text =
            store.payment === "paypal"
                ? `KRW ${Math.max(initialPrice, 0).toLocaleString("ko-KR")}`
                : `${Math.max(initialPrice, 0).toLocaleString("ko-KR")} 원`

        return (
            <FadeIn>
                <Component {...props} text={text} />
            </FadeIn>
        )
    }
}

export function getAdditionalPrice(): number {
    const [store] = useStore()
    const [additionalServiceStore] = useAdditionalServiceStore()

    const additionalServiceList = createAdditionalServiceList(
        additionalServiceStore,
        store
    )

    const totalAmount = additionalServiceList.reduce((sum, service) => {
        return sum + service.amount
    }, 0)

    return totalAmount
}

export function displayIntegratedPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const [formStore] = useFormStore()

        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const additionalPrice = getAdditionalPrice()
        const { coupons, isLoading: couponLoading } = useCoupons()
        const { categoryDefs, isLoading: categoryDefLoading } =
            useDayCategoryDefinitions()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (
            !isStoreReady ||
            categoryLoading ||
            couponLoading ||
            categoryDefLoading
        )
            return null

        const categoryMap = toCategoryMap(categories)
        const { dailyItems } = calculateInitialPrices(
            store,
            categoryMap,
            categoryDefs,
            firstDate,
            secondDate
        )

        const { passedPrimaryCoupons, passedSecondaryCoupons } = filterCoupons(
            coupons,
            store,
            dailyItems
        )
        const { secondaryDiscountedPrice: discountedPrice } = evaluateCoupons(
            passedPrimaryCoupons,
            passedSecondaryCoupons,
            dailyItems,
            store
        )

        const integratedPrice =
            store.membership === "All-Free"
                ? 0
                : Math.max(discountedPrice, 0) + additionalPrice

        const text =
            store.payment === "paypal"
                ? `KRW ${Math.max(integratedPrice, 0).toLocaleString("ko-KR")}`
                : `${Math.max(integratedPrice, 0).toLocaleString("ko-KR")} 원`

        return (
            <FadeIn>
                <Component {...props} text={text} />
            </FadeIn>
        )
    }
}

export function displayExchangeMarginPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const [formStore] = useFormStore()

        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const additionalPrice = getAdditionalPrice()
        const { coupons, isLoading: couponLoading } = useCoupons()
        const { categoryDefs, isLoading: categoryDefLoading } =
            useDayCategoryDefinitions()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (
            !isStoreReady ||
            categoryLoading ||
            couponLoading ||
            categoryDefLoading
        )
            return null

        const categoryMap = toCategoryMap(categories)
        const { dailyItems } = calculateInitialPrices(
            store,
            categoryMap,
            categoryDefs,
            firstDate,
            secondDate
        )

        const { passedPrimaryCoupons, passedSecondaryCoupons } = filterCoupons(
            coupons,
            store,
            dailyItems
        )
        const { secondaryDiscountedPrice: discountedPrice } = evaluateCoupons(
            passedPrimaryCoupons,
            passedSecondaryCoupons,
            dailyItems,
            store
        )

        const integratedPrice = Math.max(discountedPrice, 0) + additionalPrice
        const exchangeMarginPrice =
            store.membership === "All-Free" || store.payment !== "paypal"
                ? 0
                : Math.round(integratedPrice * 0.05) // 기존 가격의 5%만큼 환전 수수료 적용

        const text =
            store.payment === "paypal"
                ? `KRW ${Math.max(exchangeMarginPrice, 0).toLocaleString("ko-KR")}`
                : `${Math.max(exchangeMarginPrice, 0).toLocaleString("ko-KR")} 원`

        return (
            <FadeIn>
                <Component {...props} text={text} />
            </FadeIn>
        )
    }
}

export function displayVatPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const [formStore] = useFormStore()

        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const additionalPrice = getAdditionalPrice()
        const { coupons, isLoading: couponLoading } = useCoupons()
        const { categoryDefs, isLoading: categoryDefLoading } =
            useDayCategoryDefinitions()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (
            !isStoreReady ||
            categoryLoading ||
            couponLoading ||
            categoryDefLoading
        )
            return null

        const categoryMap = toCategoryMap(categories)
        const { dailyItems } = calculateInitialPrices(
            store,
            categoryMap,
            categoryDefs,
            firstDate,
            secondDate
        )

        const { passedPrimaryCoupons, passedSecondaryCoupons } = filterCoupons(
            coupons,
            store,
            dailyItems
        )
        const { secondaryDiscountedPrice: discountedPrice } = evaluateCoupons(
            passedPrimaryCoupons,
            passedSecondaryCoupons,
            dailyItems,
            store
        )

        const integratedPrice = Math.max(discountedPrice, 0) + additionalPrice
        const vatPrice =
            store.membership === "All-Free"
                ? 0
                : Math.round(integratedPrice * 0.1)

        const text =
            store.payment === "paypal"
                ? `KRW ${Math.max(vatPrice, 0).toLocaleString("ko-KR")}`
                : `${Math.max(vatPrice, 0).toLocaleString("ko-KR")} 원`

        return (
            <FadeIn>
                <Component {...props} text={text} />
            </FadeIn>
        )
    }
}

export function displayDepositPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    const queryParams =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams("")

    const first = queryParams.get("first")
    const second = queryParams.get("second")
    const firstDate = first ? parseDate(first) : null
    const secondDate = second ? parseDate(second) : null

    return (props) => {
        const [store] = useStore()
        const [formStore] = useFormStore()

        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const { coupons, isLoading: couponLoading } = useCoupons()
        const { categoryDefs, isLoading: categoryDefLoading } =
            useDayCategoryDefinitions()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (
            !isStoreReady ||
            categoryLoading ||
            couponLoading ||
            categoryDefLoading
        )
            return null

        const depositPrice = store.membership === "Non-Member" ? 300_000 : 0

        const text =
            store.payment === "paypal"
                ? `KRW ${Math.max(depositPrice, 0).toLocaleString("ko-KR")}`
                : `${Math.max(depositPrice, 0).toLocaleString("ko-KR")} 원`

        return (
            <FadeIn>
                <Component {...props} text={text} />
            </FadeIn>
        )
    }
}

export function displayFinalPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams("")

        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store, setStore] = useStore()
        const [formStore] = useFormStore()

        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const additionalPrice = getAdditionalPrice()
        const { coupons, isLoading: couponLoading } = useCoupons()
        const { categoryDefs, isLoading: categoryDefLoading } =
            useDayCategoryDefinitions()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        const priceData = useMemo(() => {
            if (
                !isStoreReady ||
                categoryLoading ||
                couponLoading ||
                categoryDefLoading
            )
                return null

            const categoryMap = toCategoryMap(categories)
            const { dailyItems } = calculateInitialPrices(
                store,
                categoryMap,
                categoryDefs,
                firstDate,
                secondDate
            )

            const initialPrice = dailyItems.reduce(
                (sum, item) => sum + item.price,
                0
            )

            const { passedPrimaryCoupons, passedSecondaryCoupons } =
                filterCoupons(coupons, store, dailyItems)
            const {
                secondaryDiscountedPrice: discountedPrice,
                primaryDetails,
                secondaryDetails,
            } = evaluateCoupons(
                passedPrimaryCoupons,
                passedSecondaryCoupons,
                dailyItems,
                store
            )

            const integratedPrice =
                store.membership === "All-Free"
                    ? 0
                    : Math.max(discountedPrice, 0) + additionalPrice
            const exchangeMarginPrice =
                store.payment === "paypal"
                    ? Math.round(integratedPrice * 0.05) // 기존 가격의 5%만큼 환전 수수료 적용
                    : 0
            const vatPrice = Math.round(integratedPrice * 0.1)
            const depositPrice = store.membership === "Non-Member" ? 300_000 : 0
            const finalPrice =
                store.membership === "All-Free"
                    ? 0
                    : integratedPrice +
                      exchangeMarginPrice +
                      vatPrice +
                      depositPrice

            const text =
                store.payment === "paypal"
                    ? `KRW ${Math.max(finalPrice, 0).toLocaleString("ko-KR")}`
                    : `${Math.max(finalPrice, 0).toLocaleString("ko-KR")} 원`

            return {
                initialPrice,
                discountedPrice,
                additionalPrice,
                integratedPrice,
                exchangeMarginPrice,
                vatPrice,
                depositPrice,
                finalPrice,
                text,
                primaryDetails,
                secondaryDetails,
            }
        }, [
            isStoreReady,
            categoryLoading,
            couponLoading,
            store,
            categories,
            coupons,
            additionalPrice,
        ])

        useEffect(() => {
            if (!priceData) return

            setStore((prev) => {
                const isSame =
                    prev.finalPrice === priceData.finalPrice &&
                    prev.initialPrice === priceData.initialPrice &&
                    prev.discountedPrice === priceData.discountedPrice &&
                    prev.additionalPrice === priceData.additionalPrice &&
                    prev.integratedPrice === priceData.integratedPrice &&
                    prev.exchangeMarginPrice ===
                        priceData.exchangeMarginPrice &&
                    prev.vatPrice === priceData.vatPrice &&
                    prev.depositPrice === priceData.depositPrice

                if (isSame) return prev

                return {
                    ...prev,
                    initialPrice: priceData.initialPrice,
                    discountedPrice: priceData.discountedPrice,
                    additionalPrice: priceData.additionalPrice,
                    integratedPrice: priceData.integratedPrice,
                    exchangeMarginPrice: priceData.exchangeMarginPrice,
                    vatPrice: priceData.vatPrice,
                    depositPrice: priceData.depositPrice,
                    finalPrice: priceData.finalPrice,
                    couponPrimaryDetails: priceData.primaryDetails,
                    couponSecondaryDetails: priceData.secondaryDetails,
                }
            })
        }, [
            priceData?.initialPrice,
            priceData?.discountedPrice,
            priceData?.additionalPrice,
            priceData?.integratedPrice,
            priceData?.exchangeMarginPrice,
            priceData?.vatPrice,
            priceData?.depositPrice,
            priceData?.finalPrice,
            // priceData?.primaryDetails,
            // priceData?.secondaryDetails,
        ])

        if (!priceData) return null

        // console.log(priceData?.finalPrice)

        return (
            <FadeIn>
                <Component {...props} text={priceData.text} />
            </FadeIn>
        )
    }
}
