import { forwardRef, type ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import { getKSTDate } from "../Utils/KST.tsx"

const now = getKSTDate()

const useStore = createStore({
    dayInfoLoaded: false,

    year: now.getFullYear(),
    monthIndex: now.getMonth(), // 0 = January, …, 11 = December

    prevMonthVariant: "Disabled",
    nextMonthVariant: "Default",

    location: "UNMU",
    firstDate: null, // 입실일
    secondDate: null, // 퇴실일

    membership_number: null,
    name: null,
    birthdate: null,
    phone: null,
    email: null,
    nationality: null,

    membership: "Non-Member",
    phase: null,
    signup_date: null,
    revisit: null,

    enteredCouponCode: [],
    usedMileage: 0,
    totalMileage: 0,

    payment: "toss",

    initialPrice: null,
    discountedPrice: null,
    integratedPrice: null,
    additionalPrice: 0,
    exchangeMarginPrice: null,
    vatPrice: null,
    depositPrice: null,
    finalPrice: null,

    couponDetails: [],

    remarks: [],

    selectedDates: [],
    lastSelectedDate: null,
    daysVersion: 0,
})

export { useStore }
