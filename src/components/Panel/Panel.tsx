import "./Panel.css"
import { useLocation } from "react-router-dom"

const Panel = () => {
    const isError = useLocation().pathname.includes("mercadopago-error")

    const handleContinue = () => {
        window.location.href = "/company-panel"
    }

    return (
        <div className={`mp-success-panel ${isError ? "mp-error" : ""}`}>
            <div className="mp-success-card">
                <div className="mp-success-icon" aria-hidden="true">
                    {isError ? (
                        <svg viewBox="0 0 24 24" focusable="false">
                            <circle cx="12" cy="12" r="10" className="mp-icon-bg mp-icon-bg-error" />
                            <path
                                d="M15.5 8.5a1 1 0 00-1.4 0L12 10.6 9.9 8.5a1 1 0 10-1.4 1.4L10.6 12l-2.1 2.1a1 1 0 101.4 1.4L12 13.4l2.1 2.1a1 1 0 001.4-1.4L13.4 12l2.1-2.1a1 1 0 000-1.4z"
                                className="mp-icon-check mp-icon-error"
                            />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" focusable="false">
                            <circle cx="12" cy="12" r="10" className="mp-icon-bg" />
                            <path
                                d="M9.2 12.8l-1.9-1.9a1 1 0 10-1.4 1.4l2.6 2.6a1 1 0 001.4 0l7-7a1 1 0 10-1.4-1.4l-6.3 6.3z"
                                className="mp-icon-check"
                            />
                        </svg>
                    )}
                </div>
                <h1 className="mp-success-title">
                    {isError ? "No se pudo vincular la cuenta" : "¡Vinculación exitosa!"}
                </h1>
                <p className="mp-success-text">
                    {isError
                        ? "Hubo un problema al conectar Mercado Pago. Verificá que el redirect URI apunte a este entorno e intentá de nuevo."
                        : "Tu cuenta de Mercado Pago se vinculó correctamente. Ya podés cobrar señas desde Bookify."}
                </p>
                <button className="mp-success-button" onClick={handleContinue}>
                    Volver al panel
                </button>
            </div>
        </div>
    )
}

export default Panel
