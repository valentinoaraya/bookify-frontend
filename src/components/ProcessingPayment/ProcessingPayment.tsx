import "./ProcessingPayment.css"
import { useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

type Outcome =
    | "subscription"
    | "approved"
    | "pending"
    | "rejected"
    | "processing"
    | "empty"

type OutcomeContent = {
    tone: "success" | "pending" | "danger" | "neutral"
    title: string
    subtitle: string
    details?: string[]
    footnote?: string
    primaryCta: { label: string; to: string }
    secondaryCta?: { label: string; to: string }
}

const CONTENT: Record<Outcome, OutcomeContent> = {
    subscription: {
        tone: "pending",
        title: "Estamos activando tu plan",
        subtitle:
            "Mercado Pago nos devolvió a Bookify. Estamos confirmando la suscripción; en unos minutos tu plan debería actualizarse.",
        details: [
            "Si el pago se autorizó, tu plan quedará activo automáticamente.",
            "Si hubo un problema con el medio de pago, podés volver a intentarlo desde el panel.",
        ],
        footnote: "También revisá tu correo (y la carpeta de spam) por si llega una confirmación.",
        primaryCta: { label: "Volver al panel", to: "/company-panel" },
    },
    approved: {
        tone: "success",
        title: "Pago aprobado",
        subtitle:
            "Tu pago fue aprobado. Estamos confirmando el turno; en breve vas a recibir un correo con los detalles.",
        details: [
            "Si no ves el mail, revisá la carpeta de spam.",
            "La confirmación definitiva la procesamos apenas Mercado Pago nos notifica.",
        ],
        primaryCta: { label: "Ir al inicio", to: "/" },
    },
    pending: {
        tone: "pending",
        title: "Pago pendiente",
        subtitle:
            "Tu pago quedó pendiente de acreditación. Te avisaremos por correo cuando se confirme o se rechace.",
        details: [
            "Esto suele pasar con medios como Rapipago, Pago Fácil o transferencias.",
            "No hace falta que vuelvas a pagar mientras el pago siga pendiente.",
        ],
        primaryCta: { label: "Ir al inicio", to: "/" },
    },
    rejected: {
        tone: "danger",
        title: "El pago no se completó",
        subtitle:
            "Mercado Pago no pudo aprobar esta operación. No se confirmó el turno ni se cobró el monto.",
        details: [
            "Podés intentar de nuevo con otro medio de pago.",
            "Si el dinero fue debitado por error, Mercado Pago suele devolverlo en los próximos días.",
        ],
        primaryCta: { label: "Ir al inicio", to: "/" },
    },
    processing: {
        tone: "pending",
        title: "Estamos procesando tu pago",
        subtitle:
            "Estamos verificando la operación con tu medio de pago. En unos minutos vas a recibir un correo con el resultado.",
        details: [
            "Si el pago fue aprobado, te confirmamos el turno por email.",
            "Si no fue aprobado, te avisamos y, si corresponde, se gestiona la devolución.",
        ],
        footnote: "Ya podés cerrar esta pestaña o volver al inicio.",
        primaryCta: { label: "Ir al inicio", to: "/" },
    },
    empty: {
        tone: "neutral",
        title: "No hay un pago en curso",
        subtitle:
            "Esta página se usa cuando volvés desde Mercado Pago después de un pago o un cambio de plan. Si llegaste acá por accidente, podés volver al inicio o a tu panel.",
        primaryCta: { label: "Ir al inicio", to: "/" },
        secondaryCta: { label: "Ir al panel", to: "/company-panel" },
    },
}

function resolveOutcome(
    params: URLSearchParams,
    paymentFlag: string | null,
): Outcome {
    if (params.get("preapproval_id") || paymentFlag === "subscription") {
        return "subscription"
    }

    const status = (
        params.get("status") ||
        params.get("collection_status") ||
        ""
    ).toLowerCase()

    if (status === "approved") return "approved"
    if (status === "pending" || status === "in_process") return "pending"
    if (
        status === "rejected" ||
        status === "cancelled" ||
        status === "canceled" ||
        status === "null"
    ) {
        return "rejected"
    }

    if (
        params.get("payment_id") ||
        params.get("preference_id") ||
        params.get("collection_id") ||
        paymentFlag === "appointment" ||
        paymentFlag === "true"
    ) {
        return "processing"
    }

    return "empty"
}

const StatusIcon = ({ tone }: { tone: OutcomeContent["tone"] }) => {
    if (tone === "success") {
        return (
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="12" r="10" className="pp-icon-bg pp-icon-bg-success" />
                <path
                    d="M9.2 12.8l-1.9-1.9a1 1 0 10-1.4 1.4l2.6 2.6a1 1 0 001.4 0l7-7a1 1 0 10-1.4-1.4l-6.3 6.3z"
                    className="pp-icon-mark pp-icon-mark-success"
                />
            </svg>
        )
    }

    if (tone === "danger") {
        return (
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="12" r="10" className="pp-icon-bg pp-icon-bg-danger" />
                <path
                    d="M15.5 8.5a1 1 0 00-1.4 0L12 10.6 9.9 8.5a1 1 0 10-1.4 1.4L10.6 12l-2.1 2.1a1 1 0 101.4 1.4L12 13.4l2.1 2.1a1 1 0 001.4-1.4L13.4 12l2.1-2.1a1 1 0 000-1.4z"
                    className="pp-icon-mark pp-icon-mark-danger"
                />
            </svg>
        )
    }

    if (tone === "pending") {
        return (
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="12" r="10" className="pp-icon-bg pp-icon-bg-pending" />
                <path
                    d="M12 7a1 1 0 011 1v4.2l2.4 1.4a1 1 0 11-1 1.8l-2.9-1.7A1 1 0 0111 13V8a1 1 0 011-1z"
                    className="pp-icon-mark pp-icon-mark-pending"
                />
            </svg>
        )
    }

    return (
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <circle cx="12" cy="12" r="10" className="pp-icon-bg pp-icon-bg-neutral" />
            <path
                d="M12 8.2a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zm-1 4.3a1 1 0 011-1h.01a1 1 0 011 1v3.5a1 1 0 11-2 0v-3.5z"
                className="pp-icon-mark pp-icon-mark-neutral"
            />
        </svg>
    )
}

const ProcessingPayment = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const outcome = useMemo(() => {
        const paymentFlag = sessionStorage.getItem("paymentInProcess")
        return resolveOutcome(searchParams, paymentFlag)
    }, [searchParams])

    const content = CONTENT[outcome]

    useEffect(() => {
        if (outcome === "empty") return
        const timer = window.setTimeout(() => {
            sessionStorage.removeItem("paymentInProcess")
        }, 5000)
        return () => window.clearTimeout(timer)
    }, [outcome])

    return (
        <div className={`processingPaymentPanel processingPaymentPanel--${content.tone}`}>
            <div className="processingPaymentCard">
                <div className="processingPaymentIcon">
                    <StatusIcon tone={content.tone} />
                </div>

                <h1 className="processingPaymentTitle">{content.title}</h1>
                <p className="processingPaymentSubtitle">{content.subtitle}</p>

                {content.details && content.details.length > 0 && (
                    <ul className="processingPaymentUL">
                        {content.details.map((detail) => (
                            <li key={detail} className="processingPaymentLI">
                                <p>{detail}</p>
                            </li>
                        ))}
                    </ul>
                )}

                {content.footnote && (
                    <p className="processingPaymentParraf">{content.footnote}</p>
                )}

                <div className="processingPaymentActions">
                    <button
                        type="button"
                        className="processingPaymentButton"
                        onClick={() => navigate(content.primaryCta.to)}
                    >
                        {content.primaryCta.label}
                    </button>
                    {content.secondaryCta && (
                        <button
                            type="button"
                            className="processingPaymentButton processingPaymentButton--ghost"
                            onClick={() => navigate(content.secondaryCta!.to)}
                        >
                            {content.secondaryCta.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProcessingPayment
