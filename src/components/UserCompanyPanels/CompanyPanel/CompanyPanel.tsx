import "./CompanyPanel.css"
import { useState } from "react"
import CompanyInterface from "./CompanyInterface/CompanyInterface"
import { useCompany } from "@/hooks/useCompany"
import { ToastContainer } from "react-toastify"
import { useSubscriptionGate } from "@/features/subscriptions/hooks/useSubscriptionGate"
import LoadingSpinner from "@/common/LoadingSpinner/LoadingSpinner"

const CompanyPanel = () => {
    const { state, isLoading, error, fetchCompanyData } = useCompany()
    const [payerEmail, setPayerEmail] = useState("")

    const needsPayerEmail = !state.payer_email?.trim()
    const {
        isActing,
        goHome,
        onResumePayment,
        onResumeUpgrade,
        onAbortUpgrade,
    } = useSubscriptionGate({
        needsPayerEmail,
        payerEmail,
        onAbortSuccess: fetchCompanyData,
    })

    if (error) console.error(error)
    if (isLoading) return (
        <div className="mainPage">
            <LoadingSpinner text="Cargando tu panel..." />
        </div>
    )

    const status = state.subscription?.status
    const canResumePayment = status === "pending" || status === "inactive"
    const isUpgrading = status === "upgrading"
    const isDowngrading = status === "downgrading"
    const isCancelling = status === "cancelling"

    const payerEmailField = needsPayerEmail ? (
        <div className="resumePayerEmailField">
            <label htmlFor="resume-payer-email">Email de Mercado Pago</label>
            <input
                id="resume-payer-email"
                type="email"
                name="payer_email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                placeholder="tu-mercadopago@email.com"
                required
                autoComplete="email"
            />
            <p className="resumePayerEmailHint">
                Debe ser el mismo email de la cuenta de Mercado Pago con la que
                vas a pagar.
            </p>
        </div>
    ) : null

    return (
        <>
            <ToastContainer />
            {!state._id ? (
                <div className="notFoundedCompanyDiv">
                    <h2 className="notFoundedCompanyTitle">
                        🔍 Empresa no encontrada
                    </h2>
                    <p className="notFoundedCompanyDescription">
                        No pudimos encontrar la empresa que intentas acceder. Por
                        favor, contacta al soporte.
                    </p>
                    <button className="notFoundedCompanyButton" onClick={goHome}>
                        Volver
                    </button>
                </div>
            ) : status === "active" ? (
                <CompanyInterface />
            ) : (
                <div className="notFoundedCompanyDiv">
                    {isUpgrading ? (
                        <>
                            <h2 className="notFoundedCompanyTitle">
                                💳 Completá el cambio de plan
                            </h2>
                            <p className="notFoundedCompanyDescription">
                                Tu plan actual sigue activo. Completá el pago en
                                Mercado Pago para subir de plan, o cancelá el
                                cambio.
                            </p>
                            {payerEmailField}
                            <button
                                className="notFoundedCompanyButton"
                                onClick={onResumeUpgrade}
                                disabled={isActing}
                            >
                                {isActing ? "Procesando..." : "Reintentar pago"}
                            </button>
                            <button
                                className="notFoundedCompanyButton danger"
                                onClick={onAbortUpgrade}
                                disabled={isActing}
                            >
                                Cancelar cambio de plan
                            </button>
                            <button
                                className="notFoundedCompanyButton secondary"
                                onClick={goHome}
                            >
                                Volver
                            </button>
                        </>
                    ) : isDowngrading ? (
                        <>
                            <h2 className="notFoundedCompanyTitle">
                                ⏱️ Estamos procesando tu cambio de plan
                            </h2>
                            <p className="notFoundedCompanyDescription">
                                Te avisaremos por correo cuando esté listo, esto
                                puede tomar algunos minutos.
                            </p>
                            <button
                                className="notFoundedCompanyButton"
                                onClick={goHome}
                            >
                                Volver
                            </button>
                        </>
                    ) : isCancelling ? (
                        <>
                            <h2 className="notFoundedCompanyTitle">
                                ⏱️ Estamos cancelando tu suscripción
                            </h2>
                            <p className="notFoundedCompanyDescription">
                                Esto puede tomar unos momentos. Si el estado no
                                cambia, contactá soporte.
                            </p>
                            <button
                                className="notFoundedCompanyButton"
                                onClick={goHome}
                            >
                                Volver
                            </button>
                        </>
                    ) : canResumePayment ? (
                        <>
                            <h2 className="notFoundedCompanyTitle">
                                {status === "pending"
                                    ? "💳 Completá el pago de tu suscripción"
                                    : "🛑 Suscripción inactiva"}
                            </h2>
                            <p className="notFoundedCompanyDescription">
                                {status === "pending"
                                    ? "Tu cuenta está creada, pero la suscripción aún no está activa. Completá el pago en Mercado Pago para empezar a usar Bookify."
                                    : "Tu suscripción no está activa. Podés reintentar el pago para reactivarla, o contactar al soporte."}
                            </p>
                            {payerEmailField}
                            <button
                                className="notFoundedCompanyButton"
                                onClick={onResumePayment}
                                disabled={isActing}
                            >
                                {isActing
                                    ? "Redirigiendo..."
                                    : status === "pending"
                                      ? "Completar pago"
                                      : "Reintentar pago"}
                            </button>
                            <button
                                className="notFoundedCompanyButton secondary"
                                onClick={goHome}
                            >
                                Volver
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="notFoundedCompanyTitle">
                                🛑 Suscripción inactiva
                            </h2>
                            <p className="notFoundedCompanyDescription">
                                Tu suscripción ha expirado. Por favor, renueva tu
                                suscripción para continuar usando el sistema, o
                                contacta al soporte.
                            </p>
                            <button
                                className="notFoundedCompanyButton"
                                onClick={goHome}
                            >
                                Volver
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    )
}

export default CompanyPanel
