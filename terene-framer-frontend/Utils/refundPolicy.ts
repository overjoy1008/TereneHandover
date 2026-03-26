export type RefundPolicyRow = {
    policy_id: number

    start_dday: number
    end_dday: number

    dvc_percent: number
    svc_percent: number
    dpc_percent: number

    dva_percent: number
    sva_percent: number
    dpa_percent: number
}

let cachedPolicies: RefundPolicyRow[] | null = null

export const fetchRefundPolicies = async () => {
    if (cachedPolicies) return cachedPolicies

    const res = await fetch(
        "https://terene-db-server.onrender.com/api/v3/refund-policy"
    )
    const data = await res.json()
    cachedPolicies = data
    return data
}

export const getRefundPolicyByDays = (
    policies: RefundPolicyRow[],
    diffDays: number
) => {
    return policies
        .filter((p) => diffDays >= p.start_dday && diffDays <= p.end_dday)
        .sort((a, b) => a.policy_id - b.policy_id)[0]
}
