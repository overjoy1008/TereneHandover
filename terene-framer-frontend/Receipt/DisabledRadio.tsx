import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Props = {
    isDesktop: boolean
}

export default function DisabledRadio({ isDesktop }: Props) {
    const size = isDesktop ? 16 : 14

    const handleClick = () => {
        alert("현재는 무통장입금만 이용이 가능합니다.")
    }

    return (
        <div
            onClick={handleClick}
            style={{
                width: size,
                height: size,
                backgroundColor: "rgba(112, 112, 112, 0.2)",
                border: "1px solid rgba(136, 136, 136, 0.2)",
                borderRadius: "50%",
                // cursor: "pointer",
            }}
        />
    )
}

addPropertyControls(DisabledRadio, {
    isDesktop: {
        type: ControlType.Boolean,
        title: "Desktop",
        defaultValue: true,
    },
})
