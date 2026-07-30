import { useMutation } from "@tanstack/react-query"
import {
    abortUpgrade,
    resumeSubscription,
    resumeUpgrade,
} from "@/shared/api/subscriptions"
import { notifyError, notifySuccess } from "@/utils/notifications"
import { clearTokens } from "@/utils/tokenManager"

const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const redirectToCheckout = (initPoint: string | undefined) => {
    if (!initPoint) {
        notifyError(
            "No pudimos iniciar el pago. Intentá de nuevo o contactá soporte."
        )
        return
    }
    window.location.href = initPoint
}

export function useSubscriptionGate(options: {
    needsPayerEmail: boolean
    payerEmail: string
    onAbortSuccess?: () => Promise<void> | void
}) {
    const { needsPayerEmail, payerEmail, onAbortSuccess } = options

    const buildPayerBody = (): { payer_email?: string } | null => {
        const body: { payer_email?: string } = {}
        if (needsPayerEmail) {
            const trimmed = payerEmail.trim()
            if (!trimmed || !isValidEmail(trimmed)) {
                notifyError("Ingresá el email de tu cuenta de Mercado Pago.")
                return null
            }
            body.payer_email = trimmed
        }
        return body
    }

    const resumePayment = useMutation({
        mutationFn: async () => {
            const body = buildPayerBody()
            if (!body) throw new Error("INVALID_PAYER_EMAIL")
            const response = await resumeSubscription(body)
            if (response.error) throw new Error(response.error)
            return response.data?.data?.init_point
        },
        onSuccess: redirectToCheckout,
        onError: (err: Error) => {
            if (err.message !== "INVALID_PAYER_EMAIL") notifyError(err.message)
        },
    })

    const resumeUpgradeMutation = useMutation({
        mutationFn: async () => {
            const body = buildPayerBody()
            if (!body) throw new Error("INVALID_PAYER_EMAIL")
            const response = await resumeUpgrade(body)
            if (response.error) throw new Error(response.error)
            return response.data?.data?.init_point
        },
        onSuccess: redirectToCheckout,
        onError: (err: Error) => {
            if (err.message !== "INVALID_PAYER_EMAIL") notifyError(err.message)
        },
    })

    const abortUpgradeMutation = useMutation({
        mutationFn: async () => {
            const response = await abortUpgrade()
            if (response.error) throw new Error(response.error)
        },
        onSuccess: async () => {
            notifySuccess(
                "Cambio de plan cancelado. Tu plan anterior sigue activo."
            )
            await onAbortSuccess?.()
        },
        onError: (err: Error) => notifyError(err.message),
    })

    const goHome = () => {
        clearTokens()
        window.location.href = "/"
    }

    const isActing =
        resumePayment.isPending ||
        resumeUpgradeMutation.isPending ||
        abortUpgradeMutation.isPending

    return {
        isActing,
        goHome,
        onResumePayment: () => resumePayment.mutate(),
        onResumeUpgrade: () => resumeUpgradeMutation.mutate(),
        onAbortUpgrade: () => abortUpgradeMutation.mutate(),
    }
}
