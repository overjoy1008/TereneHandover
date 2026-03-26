// AdditionalService.tsx
import { useEffect, useState, ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"

const useAdditionalServiceStore = createStore({
    adult: 1,
    teenager: 0,
    child: 0,

    // checkedBBQGrill: false,
    // checkedBBQFood: false,
    // checkedStretch: false,
    // checkedCatering: false,

    // BBQGrillValue: "0회",
    // BBQFoodValue: "인원수",
    // StretchValue: "인원수",
    // CateringValue: "인원수",

    // BBQGrillPrice: 25000,
    // BBQFoodPrice: 20000,
    // StretchPrice: 0,
    // CateringPrice: 0,
})

function extractNumber(value: string): number {
    const match = value.match(/^(\d+)(인|회)$/)
    return match ? Number(match[1]) : 0
}

// export function createAdditionalServiceList(myStore, store) {
//     // UNDER CONSTRUCTION /////////////////////////////////////
//     const serviceKeys = ["BBQGrill", "BBQFood", "Stretch", "Catering"]
//     const labels = {
//         BBQGrill: "BBQ 용품 준비",
//         BBQFood: "BBQ 식재료 준비",
//         Stretch: "모닝 스트레칭 클래스",
//         Catering: "케이터링 서비스",
//     }

//     const excludeValues = ["인원수", "횟수", "0회"]

//     if (store.membership === "All-Free") {
//         return serviceKeys
//             .filter(
//                 (key) =>
//                     myStore[`checked${key}`] &&
//                     !excludeValues.includes(myStore[`${key}Value`])
//             )
//             .map((key) => ({
//                 type: labels[key],
//                 amount: 0,
//             }))
//     }

//     return serviceKeys
//         .filter(
//             (key) =>
//                 myStore[`checked${key}`] &&
//                 !excludeValues.includes(myStore[`${key}Value`])
//         )
//         .map((key) => ({
//             type: labels[key],
//             amount:
//                 extractNumber(myStore[`${key}Value`]) * myStore[`${key}Price`],
//         }))
// }

export function createAdditionalServiceList(myStore: any, store: any) {
    const selected = (myStore.selectedServices || {}) as Record<string, any>

    // "All-Free" 멤버십일 경우 추가요금 전액 0원 처리
    if (store.membership === "All-Free") {
        return Object.values(selected)
            .filter((s: any) => s.checked)
            .map((s: any) => ({
                type: s.title,
                amount: 0,
            }))
    }

    // ✅ 일반 케이스
    return Object.values(selected)
        .filter((s: any) => s.checked)
        .map((s: any) => {
            const quantity = s.show_dropdown ? s.dropdownValue : 1
            return { ...s, quantity }
        })
        .filter((s: any) => s.quantity > 0)
        .map((s: any) => ({
            type: s.title,
            amount: (s.price || 0) * s.quantity,
        }))
}

const TOTAL_MAX = 10
const ADULT_MIN = 1
const ADULT_MAX = 8
const TEENAGER_MIN = 0
const TEENAGER_MAX = 6
const CHILD_MIN = 0
const CHILD_MAX = 8

// TODO: 12/31 Update for Dev006
// const TOTAL_MAX = 8
// const ADULT_MIN = 1
// const ADULT_MAX = 8
// const TEENAGER_MIN = 0
// const TEENAGER_MAX = 6
// const CHILD_MIN = 0
// const CHILD_MAX = 6

// 텍스트 표시: 성인 n명
export function displayAdult(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useAdditionalServiceStore()
        const label = `성인   ${store.adult}명`
        // TODO: 12/31 Update for Dev006
        // const label = `일반   ${store.adult}명`
        return <Component {...props} text={label} />
    }
}

// 텍스트 표시: 청소년/아동 n명
export function displayTeenager(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useAdditionalServiceStore()
        const label = `청소년/아동   ${store.teenager}명`
        return <Component {...props} text={label} />
    }
}

// 텍스트 표시: 영유아 n명
export function displayChild(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store] = useAdditionalServiceStore()
        const label = `영유아   ${store.child}명`
        // TODO: 12/31 Update for Dev006
        // const label = `유아   ${store.child}명`
        return <Component {...props} text={label} />
    }
}

// ✅ 체크 상태 토글 버튼
export function toggleBBQGrill(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()
        const toggle = () => {
            setStore({ checkedBBQGrill: !store.checkedBBQGrill })
        }
        return <Component {...props} onClick={toggle} />
    }
}

export function toggleBBQFood(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()
        const toggle = () => {
            setStore({ checkedBBQFood: !store.checkedBBQFood })
        }
        return <Component {...props} onClick={toggle} />
    }
}

export function toggleStretch(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()
        const toggle = () => {
            setStore({ checkedStretch: !store.checkedStretch })
        }
        return <Component {...props} onClick={toggle} />
    }
}

export function toggleCatering(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()
        const toggle = () => {
            setStore({ checkedCatering: !store.checkedCatering })
        }
        return <Component {...props} onClick={toggle} />
    }
}

export function handleBBQGrillDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()

        const handleChange = (event) => {
            const selectedValue = event.target.value
            setStore({ BBQGrillValue: selectedValue })
        }

        return (
            <Component
                {...props}
                value={store.BBQGrillValue}
                onChange={handleChange}
            />
        )
    }
}

export function handleBBQFoodDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()

        const handleChange = (event) => {
            const selectedValue = event.target.value
            setStore({ BBQFoodValue: selectedValue })
        }

        return (
            <Component
                {...props}
                value={store.BBQFoodValue}
                onChange={handleChange}
            />
        )
    }
}

export function handleStretchDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()

        const handleChange = (event) => {
            const selectedValue = event.target.value
            setStore({ StretchValue: selectedValue })
        }

        return (
            <Component
                {...props}
                value={store.StretchValue}
                onChange={handleChange}
            />
        )
    }
}

export function handleCateringDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()

        const handleChange = (event) => {
            const selectedValue = event.target.value
            setStore({ CateringValue: selectedValue })
        }

        return (
            <Component
                {...props}
                value={store.CateringValue}
                onChange={handleChange}
            />
        )
    }
}

// 증가 버튼: 성인
export function incrementAdult(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()
        const increment = () => {
            const total = store.adult + store.teenager
            if (store.adult < ADULT_MAX && total < TOTAL_MAX) {
                setStore({ adult: store.adult + 1 })
            }
        }
        return <Component {...props} onClick={increment} />
    }
}

// 감소 버튼: 성인
export function decrementAdult(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()
        const decrement = () => {
            if (store.adult > ADULT_MIN) {
                setStore({ adult: store.adult - 1 })
            }
        }
        return <Component {...props} onClick={decrement} />
    }
}

// 증가 버튼: 청소년/아동
export function incrementTeenager(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()
        const increment = () => {
            const total = store.adult + store.teenager
            if (store.teenager < TEENAGER_MAX && total < TOTAL_MAX) {
                setStore({ teenager: store.teenager + 1 })
            }
        }
        return <Component {...props} onClick={increment} />
    }
}

// 감소 버튼: 청소년/아동
export function decrementTeenager(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()
        const decrement = () => {
            if (store.teenager > TEENAGER_MIN) {
                setStore({ teenager: store.teenager - 1 })
            }
        }
        return <Component {...props} onClick={decrement} />
    }
}

// 증가 버튼: 영유아
export function incrementChild(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()
        const increment = () => {
            if (store.child < CHILD_MAX) {
                setStore({ child: store.child + 1 })
            }
        }
        return <Component {...props} onClick={increment} />
    }
}

// 감소 버튼: 영유아
export function decrementChild(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useAdditionalServiceStore()
        const decrement = () => {
            if (store.child > CHILD_MIN) {
                setStore({ child: store.child - 1 })
            }
        }
        return <Component {...props} onClick={decrement} />
    }
}

export { useAdditionalServiceStore }
