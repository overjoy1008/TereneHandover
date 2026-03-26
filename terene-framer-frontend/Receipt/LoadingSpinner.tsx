import { motion } from "framer-motion"
import React from "react"

export default function LoadingSpinner() {
    return (
        <div style={containerStyle}>
            <motion.div
                style={spinnerStyle}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
        </div>
    )
}

const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 9999,
    pointerEvents: "none",
}

const spinnerStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    border: "4px solid rgba(255, 255, 255, 0.2)",
    borderTop: "4px solid white",
    borderRadius: "50%",
}
