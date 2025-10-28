import "./Panel.css"

const Panel = () => {
    const handleGoHome = () => {
        window.location.href = "/";
    };

    return (
        <div className="mp-success-panel">
            <div className="mp-success-card">
                <div className="mp-success-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                        <circle cx="12" cy="12" r="10" className="mp-icon-bg" />
                        <path d="M9.2 12.8l-1.9-1.9a1 1 0 10-1.4 1.4l2.6 2.6a1 1 0 001.4 0l7-7a1 1 0 10-1.4-1.4l-6.3 6.3z" className="mp-icon-check" />
                    </svg>
                </div>
                <h1 className="mp-success-title">¡Vinculación exitosa!</h1>
                <p className="mp-success-text">
                    Tu cuenta de Mercado Pago se vinculó correctamente. Ya puedes continuar usando Bookify.
                </p>
                <button className="mp-success-button" onClick={handleGoHome}>
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}

export default Panel;
