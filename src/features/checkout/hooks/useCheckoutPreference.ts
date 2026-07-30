import { useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { initMercadoPago } from "@mercadopago/sdk-react"
import { createPreference } from "@/shared/api/payments"
import { notifyError } from "@/utils/notifications"
import { PUBLIC_KEY_MP } from "@/config"
import type { UserData } from "@/types"

interface CreatePreferenceParams {
    companyId: string
    serviceId: string
    date: string
    dataUser: UserData
}

export function useCheckoutPreference() {
    useEffect(() => {
        initMercadoPago(PUBLIC_KEY_MP)
    }, [])

    const mutation = useMutation({
        mutationFn: async ({ companyId, serviceId, date, dataUser }: CreatePreferenceParams) => {
            const response = await createPreference(companyId, {
                serviceId,
                date,
                dataUser,
            })

            if (response.error) throw new Error(response.error)

            const initPoint =
                (response.data as { init_point?: string } | undefined)?.init_point
                ?? response.data?.data?.init_point

            if (!initPoint) throw new Error("No pudimos iniciar el pago. Intentá de nuevo más tarde.")

            return initPoint
        },
        onSuccess: (initPoint) => {
            sessionStorage.setItem("paymentInProcess", "true")
            window.location.href = initPoint
        },
        onError: (err: Error) => {
            console.error(err)
            notifyError(err.message)
        },
    })

    return {
        isLoading: mutation.isPending,
        buy: mutation.mutate,
    }
}
