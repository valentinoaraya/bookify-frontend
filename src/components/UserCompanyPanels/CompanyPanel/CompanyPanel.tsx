import "./CompanyPanel.css"
import { useContext, useState } from "react";
import CompanyInterface from "./CompanyInterface/CompanyInterface";
import { CompanyContext } from "../../../contexts/CompanyContext";
import { ToastContainer } from "react-toastify";
import { useAuthenticatedPost } from "../../../hooks/useAuthenticatedFetch";
import { BACKEND_API_URL } from "../../../config";
import { notifyError, notifySuccess } from "../../../utils/notifications";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const CompanyPanel = () => {

    const { state, isLoading, error, fetchCompanyData } = useContext(CompanyContext)
    const { post, isLoading: isActing } = useAuthenticatedPost()
    const [payerEmail, setPayerEmail] = useState("")

    if (error) console.error(error)
    if (isLoading) return <h2>Cargando...</h2>

    const needsPayerEmail = !state.payer_email?.trim()

    const onGoBack = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/"
    }

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

    const redirectToCheckout = (initPoint: string | undefined) => {
        if (!initPoint) {
            notifyError("No pudimos iniciar el pago. Intentá de nuevo o contactá soporte.")
            return
        }
        window.location.href = initPoint
    }

    const onResumePayment = async () => {
        const body = buildPayerBody()
        if (!body) return

        const response = await post(`${BACKEND_API_URL}/suscriptions/resume`, body)
        if (response.error) {
            notifyError(response.error)
            return
        }
        redirectToCheckout(response.data?.data?.init_point)
    }

    const onResumeUpgrade = async () => {
        const body = buildPayerBody()
        if (!body) return

        const response = await post(`${BACKEND_API_URL}/suscriptions/resume-upgrade`, body)
        if (response.error) {
            notifyError(response.error)
            return
        }
        redirectToCheckout(response.data?.data?.init_point)
    }

    const onAbortUpgrade = async () => {
        const response = await post(`${BACKEND_API_URL}/suscriptions/abort-upgrade`, {})
        if (response.error) {
            notifyError(response.error)
            return
        }
        notifySuccess("Cambio de plan cancelado. Tu plan anterior sigue activo.")
        await fetchCompanyData()
    }

    const status = state.subscription?.status
    const canResumePayment = status === "pending" || status === "inactive"
    const isUpgrading = status === "upgrading"
    const isDowngrading = status === "downgrading"
    const isCancelling = status === "cancelling"

    const payerEmailField = needsPayerEmail ? (
        <div className="resumePayerEmailField">
            <label htmlFor="resume-payer-email">
                Email de Mercado Pago
            </label>
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
                Debe ser el mismo email de la cuenta de Mercado Pago con la que vas a pagar.
            </p>
        </div>
    ) : null

    return (
        <>
            <ToastContainer />
            {
                !state._id ?
                    <div className="notFoundedCompanyDiv">
                        <h2 className="notFoundedCompanyTitle">🔍 Empresa no encontrada</h2>
                        <p className="notFoundedCompanyDescription">No pudimos encontrar la empresa que intentas acceder. Por favor, contacta al soporte.</p>
                        <button
                            className="notFoundedCompanyButton"
                            onClick={onGoBack}
                        >
                            Volver
                        </button>
                    </div>
                    :
                    <>
                        {
                            status === "active" ?
                                <CompanyInterface />
                                :
                                <div className="notFoundedCompanyDiv">
                                    {
                                        isUpgrading ?
                                            <>
                                                <h2 className="notFoundedCompanyTitle">💳 Completá el cambio de plan</h2>
                                                <p className="notFoundedCompanyDescription">
                                                    Tu plan actual sigue activo. Completá el pago en Mercado Pago para subir de plan, o cancelá el cambio.
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
                                                    className="notFoundedCompanyButton"
                                                    onClick={onAbortUpgrade}
                                                    disabled={isActing}
                                                    style={{ marginTop: "0.75rem", background: "#c0392b" }}
                                                >
                                                    Cancelar cambio de plan
                                                </button>
                                                <button
                                                    className="notFoundedCompanyButton"
                                                    onClick={onGoBack}
                                                    style={{ marginTop: "0.75rem" }}
                                                >
                                                    Volver
                                                </button>
                                            </>
                                            :
                                        isDowngrading ?
                                            <>
                                                <h2 className="notFoundedCompanyTitle">⏱️ Estamos procesando tu cambio de plan</h2>
                                                <p className="notFoundedCompanyDescription">Te avisaremos por correo cuando esté listo, esto puede tomar algunos minutos.</p>
                                                <button
                                                    className="notFoundedCompanyButton"
                                                    onClick={onGoBack}
                                                >
                                                    Volver
                                                </button>
                                            </>
                                            :
                                        isCancelling ?
                                            <>
                                                <h2 className="notFoundedCompanyTitle">⏱️ Estamos cancelando tu suscripción</h2>
                                                <p className="notFoundedCompanyDescription">Esto puede tomar unos momentos. Si el estado no cambia, contactá soporte.</p>
                                                <button
                                                    className="notFoundedCompanyButton"
                                                    onClick={onGoBack}
                                                >
                                                    Volver
                                                </button>
                                            </>
                                            :
                                            canResumePayment ?
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
                                                        className="notFoundedCompanyButton"
                                                        onClick={onGoBack}
                                                        style={{ marginTop: "0.75rem" }}
                                                    >
                                                        Volver
                                                    </button>
                                                </>
                                                :
                                                <>
                                                    <h2 className="notFoundedCompanyTitle">🛑 Suscripción inactiva</h2>
                                                    <p className="notFoundedCompanyDescription">Tu suscripción ha expirado. Por favor, renueva tu suscripción para continuar usando el sistema, o contacta al soporte.</p>
                                                    <button
                                                        className="notFoundedCompanyButton"
                                                        onClick={onGoBack}
                                                    >
                                                        Volver
                                                    </button>
                                                </>
                                    }
                                </div>
                        }
                    </>
            }
        </>
    );
}

export default CompanyPanel;
