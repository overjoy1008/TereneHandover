// PriceDisplay.tsx
import * as React from "react"
import { useStore } from "../Calendar/MonthDisplay.tsx"
import { useEffect, useMemo, ComponentType } from "react"
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
import { formatDate, parseDate } from "./CheckAuth.tsx"
import { motion } from "framer-motion"

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

// ✅ 공휴일 카테고리 가져오기
export function useHolidayCategoryMap() {
    const [categories, setCategories] = React.useState<Record<string, string>>(
        {}
    )
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        fetch("https://terene-db-server.onrender.com/api/days")
            .then((res) => res.json())
            .then((data) => {
                const map: Record<string, string> = {}
                for (const item of data) {
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
): Record<string, Category> {
    const allowed: Category[] = [
        "Weekday",
        "Weekend",
        "Peak-Weekday",
        "Peak-Weekend",
    ]
    const result: Record<string, Category> = {}

    for (const key in input) {
        const value = input[key]
        result[key] = allowed.includes(value as Category)
            ? (value as Category)
            : "Weekday"
    }

    return result
}

export function useCoupons(): {
    coupons: DiscountCoupon[]
    isLoading: boolean
} {
    const [coupons, setCoupons] = React.useState<DiscountCoupon[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        fetch("https://terene-db-server.onrender.com/api/coupons")
            .then((res) => res.json())
            .then((data) => {
                const sorted = (data || []).sort(
                    (a: DiscountCoupon, b: DiscountCoupon) =>
                        a.priority - b.priority
                )
                setCoupons(sorted)
            })
            .catch((err) => console.error("Coupon fetch error:", err))
            .finally(() => setIsLoading(false))
    }, [])

    return { coupons, isLoading }
}

function useDiscountCalculation() {
    const queryParams = new URLSearchParams(window.location.search)
    const first = queryParams.get("first")
    const second = queryParams.get("second")
    const firstDate = first ? parseDate(first) : null
    const secondDate = second ? parseDate(second) : null

    const [store] = useStore()
    const { categories, isLoading: categoryLoading } = useHolidayCategoryMap()
    const { coupons, isLoading: couponLoading } = useCoupons()

    const isReady =
        (store.firstDate && store.secondDate) || (firstDate && secondDate)

    const result = useMemo(() => {
        if (!isReady || categoryLoading || couponLoading) return null

        const categoryMap = toCategoryMap(categories)
        const { initialPrice, dailyItems } = calculateInitialPrices(
            store,
            categoryMap,
            firstDate,
            secondDate
        )

        const filtered = filterCoupons(coupons, store, dailyItems)
        const { discountedPrice } = evaluateCoupons(
            filtered,
            dailyItems,
            store.usedMileage,
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

// ✅ 안전하게 날짜가 모두 존재할 때만 가격 계산 및 렌더링
export function displayInitialPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams = new URLSearchParams(window.location.search)
        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()

        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const { coupons, isLoading: couponLoading } = useCoupons()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (!isStoreReady || categoryLoading || couponLoading) return null

        const categoryMap = toCategoryMap(categories)
        const { initialPrice } = calculateInitialPrices(
            store,
            categoryMap,
            firstDate,
            secondDate
        )

        return (
            // <FadeIn>
            <Component
                {...props}
                text={
                    initialPrice > 0
                        ? initialPrice.toLocaleString("ko-KR") + " 원"
                        : "0 원"
                }
            />
            // </FadeIn>
        )
    }
}

export function displayDiscountedPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams = new URLSearchParams(window.location.search)
        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const { coupons, isLoading: couponLoading } = useCoupons()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (!isStoreReady || categoryLoading || couponLoading) return null

        const categoryMap = toCategoryMap(categories)
        const { dailyItems } = calculateInitialPrices(store, categoryMap)

        const filtered = filterCoupons(coupons, store, dailyItems)
        const { discountedPrice } = evaluateCoupons(
            filtered,
            dailyItems,
            store.usedMileage,
            store
        )

        return (
            <FadeIn>
                <Component
                    {...props}
                    text={
                        discountedPrice > 0
                            ? discountedPrice.toLocaleString("ko-KR") + " 원"
                            : "0 원"
                    }
                />
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
        const queryParams = new URLSearchParams(window.location.search)
        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const { coupons, isLoading: couponLoading } = useCoupons()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (!isStoreReady || categoryLoading || couponLoading) return null

        const categoryMap = toCategoryMap(categories)
        const { initialPrice, dailyItems } = calculateInitialPrices(
            store,
            categoryMap
        )

        const filtered = filterCoupons(coupons, store, dailyItems)
        const { discountedPrice } = evaluateCoupons(
            filtered,
            dailyItems,
            store.usedMileage,
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

        return (
            <FadeIn>
                <Component {...props} style={barStyle} />
            </FadeIn>
        )
    }
}

export function displaySoftInitialPrice(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const queryParams = new URLSearchParams(window.location.search)
        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()

        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const { coupons, isLoading: couponLoading } = useCoupons()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (!isStoreReady || categoryLoading || couponLoading) return null

        const categoryMap = toCategoryMap(categories)
        const { initialPrice } = calculateInitialPrices(
            store,
            categoryMap,
            firstDate,
            secondDate
        )

        return (
            <FadeIn>
                <Component
                    {...props}
                    text={
                        initialPrice > 0
                            ? initialPrice.toLocaleString("ko-KR") + " 원"
                            : "0 원"
                    }
                />
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
        const queryParams = new URLSearchParams(window.location.search)
        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const additionalPrice = getAdditionalPrice()
        const { coupons, isLoading: couponLoading } = useCoupons()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (!isStoreReady || categoryLoading || couponLoading) return null

        const categoryMap = toCategoryMap(categories)
        const { dailyItems } = calculateInitialPrices(
            store,
            categoryMap,
            firstDate,
            secondDate
        )

        const filtered = filterCoupons(coupons, store, dailyItems)
        const { discountedPrice } = evaluateCoupons(
            filtered,
            dailyItems,
            store.usedMileage,
            store
        )

        const integratedPrice =
            store.membership === "All-Free"
                ? 0
                : Math.max(discountedPrice, 0) + additionalPrice
        const text =
            integratedPrice > 0
                ? integratedPrice.toLocaleString("ko-KR") + " 원"
                : "0 원"

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
        const queryParams = new URLSearchParams(window.location.search)
        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store] = useStore()
        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const additionalPrice = getAdditionalPrice()
        const { coupons, isLoading: couponLoading } = useCoupons()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (!isStoreReady || categoryLoading || couponLoading) return null

        const categoryMap = toCategoryMap(categories)
        const { dailyItems } = calculateInitialPrices(
            store,
            categoryMap,
            firstDate,
            secondDate
        )

        const filtered = filterCoupons(coupons, store, dailyItems)
        const { discountedPrice } = evaluateCoupons(
            filtered,
            dailyItems,
            store.usedMileage,
            store
        )

        const integratedPrice = Math.max(discountedPrice, 0) + additionalPrice
        const vatPrice =
            store.membership === "All-Free"
                ? 0
                : Math.round(integratedPrice * 0.1)
        const text =
            vatPrice > 0 ? vatPrice.toLocaleString("ko-KR") + " 원" : "0 원"

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
    const queryParams = new URLSearchParams(window.location.search)
    const first = queryParams.get("first")
    const second = queryParams.get("second")
    const firstDate = first ? parseDate(first) : null
    const secondDate = second ? parseDate(second) : null

    return (props) => {
        const [store] = useStore()
        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const { coupons, isLoading: couponLoading } = useCoupons()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        if (!isStoreReady || categoryLoading || couponLoading) return null

        const depositPrice = store.membership === "All-Free" ? 0 : 300_000

        const text =
            depositPrice > 0
                ? depositPrice.toLocaleString("ko-KR") + " 원"
                : "0 원"

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
        const queryParams = new URLSearchParams(window.location.search)
        const first = queryParams.get("first")
        const second = queryParams.get("second")
        const firstDate = first ? parseDate(first) : null
        const secondDate = second ? parseDate(second) : null

        const [store, setStore] = useStore()
        const { categories, isLoading: categoryLoading } =
            useHolidayCategoryMap()
        const additionalPrice = getAdditionalPrice()
        const { coupons, isLoading: couponLoading } = useCoupons()

        const isStoreReady =
            (store.firstDate && store.secondDate) || (firstDate && secondDate)

        const priceData = useMemo(() => {
            if (!isStoreReady || categoryLoading || couponLoading) return null

            const categoryMap = toCategoryMap(categories)
            const { dailyItems } = calculateInitialPrices(
                store,
                categoryMap,
                firstDate,
                secondDate
            )

            const initialPrice = dailyItems.reduce(
                (sum, item) => sum + item.price,
                0
            )

            const filtered = filterCoupons(coupons, store, dailyItems)
            const { discountedPrice, details } = evaluateCoupons(
                filtered,
                dailyItems,
                store.usedMileage,
                store
            )

            const integratedPrice =
                store.membership === "All-Free"
                    ? 0
                    : Math.max(discountedPrice, 0) + additionalPrice
            const vatPrice = Math.round(integratedPrice * 0.1)
            const finalPrice =
                store.membership === "All-Free"
                    ? 0
                    : integratedPrice + vatPrice + 300_000

            const text =
                finalPrice > 0
                    ? finalPrice.toLocaleString("ko-KR") + " 원"
                    : "0 원"

            return {
                initialPrice,
                discountedPrice,
                additionalPrice,
                integratedPrice,
                vatPrice,
                finalPrice,
                text,
                details,
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
                    prev.vatPrice === priceData.vatPrice

                if (isSame) return prev

                // alert("setStore")  -- 무한 반복형 코드 없는지 점검용

                return {
                    ...prev,
                    initialPrice: priceData.initialPrice,
                    discountedPrice: priceData.discountedPrice,
                    additionalPrice: priceData.additionalPrice,
                    integratedPrice: priceData.integratedPrice,
                    vatPrice: priceData.vatPrice,
                    finalPrice: priceData.finalPrice,
                    couponDetails: priceData.details,
                }
            })
        }, [
            priceData?.initialPrice,
            priceData?.discountedPrice,
            priceData?.additionalPrice,
            priceData?.integratedPrice,
            priceData?.vatPrice,
            priceData?.finalPrice,
        ])

        if (!priceData) return null

        return (
            <FadeIn>
                <Component {...props} text={priceData.text} />
            </FadeIn>
        )
    }
}
