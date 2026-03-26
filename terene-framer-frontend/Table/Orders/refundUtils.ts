import {
    fetchRefundPolicies,
    getRefundPolicyByDays,
} from "../../Utils/refundPolicy.ts"

export const calculateRefundInfo = async (
    data: any,
    diffDays: number,
    variant: "customer" | "admin"
) => {
    const policies = await fetchRefundPolicies()
    const policy = getRefundPolicyByDays(policies, diffDays)
    if (!policy) return null

    const lodgingPercent =
        variant === "admin" ? policy.dva_percent : policy.dvc_percent
    const servicePercent =
        variant === "admin" ? policy.sva_percent : policy.svc_percent
    const depositPercent =
        variant === "admin" ? policy.dpa_percent : policy.dpc_percent

    const lodgingRefund =
        (data.discounted_price?.amount || 0) * 1.1 * (lodgingPercent / 100)

    const serviceRefund =
        (data.service_price?.amount || 0) * 1.1 * (servicePercent / 100)

    const depositRefund = (data.deposit_price || 0) * (depositPercent / 100)

    return {
        diffDays,
        lodgingPercent,
        servicePercent,
        depositPercent,
        lodgingRefund: Math.round(lodgingRefund),
        serviceRefund: Math.round(serviceRefund),
        depositRefund: Math.round(depositRefund),
        totalRefund: Math.round(lodgingRefund + serviceRefund + depositRefund),
    }
}
