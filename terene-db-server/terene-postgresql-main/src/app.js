// src/app.js
import express from "express"
import cors from "cors"
import holidayRoutes from "./routes/holiday.routes.js"
import dayRoutes from "./routes/day.routes.js"
import customerRoutes from "./routes/customer.routes.js"
import couponRoutes from "./routes/coupon.routes.js"
import orderRoutes from "./routes/order.routes.js"
import entitiesRoutes from "./routes/entities.routes.js"
import v3Routes from "./routes/v3.routes.js"
import testRoutes from "./routes/test.routes.js"

const app = express()
app.use(express.json())

// CORS 미들웨어 먼저 설정
app.use(cors({
    origin: "*", // 또는 origin: ["https://glad-button-137794.framer.app"]
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

// 명시적으로 OPTIONS 응답을 처리 (직접 응답)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204) // No Content
  } else {
    next()
  }
})

// 라우터 설정
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Terene DB Server is healthy",
        timestamp: new Date().toISOString(),
    })
})
app.use("/api/holidays", holidayRoutes)
app.use("/api/days", dayRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/orders", orderRoutes)

// 정규화된 주문 관련 API (v2)
app.use("/api/v2", entitiesRoutes)

// patch_250928 적용 API (v3)
app.use("/api/v3", v3Routes)

// test routes
app.use("/api/test", testRoutes)

export default app
