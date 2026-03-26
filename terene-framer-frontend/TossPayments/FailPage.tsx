// import React from "react"
// import CssStyles from "./CssStyles.tsx" // ← 새로 만든 스타일 컴포넌트 import

// export function FailPage() {
//     // Parse query parameters from the URL
//     const params = new URLSearchParams(window.location.search)
//     const message = params.get("message") ?? ""
//     const code = params.get("code") ?? ""

//     return (
//         <>
//             <CssStyles /> {/* ← 전역 스타일 삽입 */}
//             <div id="info" className="box_section" style={{ width: "600px" }}>
//                 <img
//                     width="100px"
//                     src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png"
//                     alt="에러 이미지"
//                 />
//                 <h2>결제를 실패했어요</h2>

//                 <div
//                     className="p-grid typography--p"
//                     style={{ marginTop: "50px" }}
//                 >
//                     <div className="p-grid-col text--left">
//                         <b>에러메시지</b>
//                     </div>
//                     <div className="p-grid-col text--right" id="message">
//                         {message}
//                     </div>
//                 </div>
//                 <div
//                     className="p-grid typography--p"
//                     style={{ marginTop: "10px" }}
//                 >
//                     <div className="p-grid-col text--left">
//                         <b>에러코드</b>
//                     </div>
//                     <div className="p-grid-col text--right" id="code">
//                         {code}
//                     </div>
//                 </div>

//                 <div className="p-grid-col" style={{ marginTop: "20px" }}>
//                     <a
//                         href="https://docs.tosspayments.com/guides/v2/payment-widget/integration"
//                         target="_blank"
//                         rel="noopener noreferrer"
//                     >
//                         <button className="btn p-grid-col5">연동 문서</button>
//                     </a>
//                     <a
//                         href="https://discord.gg/A4fRFXQhRu"
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ marginLeft: "10px" }}
//                     >
//                         <button
//                             className="btn p-grid-col5"
//                             style={{
//                                 backgroundColor: "#e8f3ff",
//                                 color: "#1b64da",
//                             }}
//                         >
//                             실시간 문의
//                         </button>
//                     </a>
//                 </div>
//             </div>
//         </>
//     )
// }

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
