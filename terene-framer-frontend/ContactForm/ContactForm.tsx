import { forwardRef, useEffect, useState, type ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import * as React from "react"
import { useStore } from "../Store/MainStore.tsx"

export const useFormStore = createStore({
    surname: null,
    name: null,

    phone: null,

    email: null,
    emailDomain: null,

    state: null,
    address: null,

    job: null,
    specificJob: null,

    interestedLocation: null,
    interestedMembership: null,
    interestRate: null,

    meetingDate: null,
    meetingTime: null,

    recommend: null,
    recommendName: null,

    additionalRequest: null,

    privacy_policy: false,
    marketing_consent: false,
})

export function toggleSurname(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            setStore({ surname: event.target.value })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleName(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            setStore({ name: event.target.value })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function togglePhone(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            setStore({ phone: event.target.value })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleEmail(Component: ComponentType<any>): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            setStore({ email: event.target.value })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function handleEmailDomainDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            const v = event.target.value
            if (v && v !== "직접 입력") setStore({ emailDomain: v })
            else setStore({ emailDomain: null })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function handleStateDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            const v = event.target.value
            if (v && v !== "시 / 군") setStore({ state: v })
            else setStore({ state: null })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleAddress(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            setStore({ address: event.target.value })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function handleJobDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            const v = event.target.value
            if (v && v !== "직업") setStore({ job: v })
            else setStore({ job: null })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleSpecificJob(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            setStore({ specificJob: event.target.value })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function handleInterestedLocationDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            const v = event.target.value
            if (v && v !== "지점을 선택하세요")
                setStore({ interestedLocation: v })
            else setStore({ interestedLocation: null })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function handleInterestedMembershipDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            const v = event.target.value
            if (v && v !== "멤버쉽을 선택하세요")
                setStore({ interestedMembership: v })
            else setStore({ interestedMembership: null })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function handleInterestRateDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            const v = event.target.value
            if (v && v !== "관심도를 선택하세요") setStore({ interestRate: v })
            else setStore({ interestRate: null })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleMeetingDate(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            setStore({ meetingDate: event.target.value })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function handleMeetingTimeDropdown(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            const v = event.target.value
            if (v && v !== "평일 09시~20시 1시간단위로 선택")
                setStore({ meetingTime: v })
            else setStore({ meetingTime: null })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleRecommend(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            setStore({ recommend: event.target.value })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleRecommendName(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            setStore({ recommendName: event.target.value })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function toggleAdditionalRequest(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [, setStore] = useFormStore()
        const handleChange = (event) => {
            setStore({ additionalRequest: event.target.value })
        }
        return <Component {...props} onChange={handleChange} />
    }
}

export function togglePrivacyPolicy(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()
        const handleClick = () => {
            setStore({ privacy_policy: !store.privacy_policy })
        }
        return <Component {...props} onClick={handleClick} />
    }
}

export function toggleMarketingConsent(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [store, setStore] = useFormStore()
        const handleClick = () => {
            setStore({ marketing_consent: !store.marketing_consent })
        }
        return <Component {...props} onClick={handleClick} />
    }
}

export function sendNotification(
    Component: ComponentType<any>
): ComponentType<any> {
    return (props) => {
        const [formStore] = useFormStore()
        const [, setCalendarStore] = useStore()

        const getKSTDate = (baseDate = new Date()) => {
            const utc =
                baseDate.getTime() + baseDate.getTimezoneOffset() * 60000
            return new Date(utc + 9 * 60 * 60 * 1000)
        }
        const pad = (n: number) => String(n).padStart(2, "0")
        const getKSTISOString = (date = new Date()) => {
            const d = getKSTDate(date)
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}+09:00`
        }

        const isBlank = (v: any) =>
            v === null || v === undefined || String(v).trim() === ""
        const requiredFields: Array<keyof typeof formStore> = [
            "surname",
            "name",
            "phone",
            "email",
            "state",
            "interestedLocation",
            "interestedMembership",
            "interestRate",
            "meetingDate",
            "meetingTime",
        ]

        const handleClick = async () => {
            for (const k of requiredFields) {
                // @ts-ignore
                if (isBlank(formStore[k])) {
                    alert("필수 항목을 모두 입력해주세요.")
                    return
                }
            }
            if (!formStore.privacy_policy) {
                alert("개인정보 보호정책에 동의해 주세요.")
                return
            }

            const fullName =
                `${formStore.surname || ""}${formStore.name || ""}`.trim()
            const contact = String(formStore.phone || "").replace(/-/g, "")
            if (isBlank(fullName) || isBlank(contact)) {
                alert("이름과 연락처를 확인해 주세요.")
                return
            }

            try {
                const res = await fetch(
                    "https://terene-notifier-server.onrender.com/api/queue/O",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contact,
                            templateParams: { name: fullName },
                            enqueuedAt: getKSTISOString(),
                        }),
                    }
                )
                if (!res.ok) throw new Error(await res.text())

                window.location.href = `/contact-form-success`
            } catch (e: any) {
                alert(`상담 폼 처리 중 오류가 발생했습니다: ${e?.message || e}`)
            }
        }

        return <Component {...props} onClick={handleClick} />
    }
}
