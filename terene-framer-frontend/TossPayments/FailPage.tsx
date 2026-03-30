import { useEffect, useState } from "react"
import type { ComponentType } from "react"

export const withFailParams = (
    Component: ComponentType<any>
): ComponentType<any> => {
    return function FailParamsOverride(props) {
        const [text, setText] = useState("")

        useEffect(() => {
            const params = new URLSearchParams(window.location.search)
            const code = params.get("code") ?? ""
            const message = params.get("message") ?? ""
            const decCode = decodeURIComponent(code)
            const decMessage = decodeURIComponent(message)
            const t =
                code || message
                    ? `결제를 실패했습니다\n\n오류 코드: ${decCode}\n오류 원인: ${decMessage}`
                    : ""
            setText(t)
        }, [])

        return <Component {...props} text={text} />
    }
}
