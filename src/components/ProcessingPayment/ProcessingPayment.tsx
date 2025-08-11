import "./ProcessingPayment.css"
import { useEffect, useState } from "react";

const ProcessingPayment = () => {

    const [isVisible, setIsVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        const paymentFlag = sessionStorage.getItem("paymentInProcess")

        if (paymentFlag) {
            setIsVisible(true)
            setIsLoading(false)
            const timer = setTimeout(() => {
                sessionStorage.removeItem("paymentInProcess")
            }, 5000)

            return () => clearTimeout(timer)
        }

        setIsLoading(false)
    }, [])

    if (isLoading) return <div>
        <h1>Cargando...</h1>
    </div>

    return (
        <div className="processingPaymentContainer">
            {
                isVisible ?
                    <>
                        <h1 className="processingPaymentTitle">Estamos procesando tu pago... 💳 ✨</h1>
                        <h3 className="processingPaymentSubtitle">Estamos verificando la operación con tu medio de pago.</h3>
                        <h3 className="processingPaymentSubtitle">En unos minutos recibirás un correo con la confirmación del turno.</h3>
                        <ul className="processingPaymentUL">
                            <li className="processingPaymentLI">
                                <p><span>✅ Si tu pago fue aprobado: </span> Te lo confirmaremos por email.</p>
                            </li>
                            <li className="processingPaymentLI">
                                <p><span>❌ Si tu pago no es aprobado: </span> Te avisaremos por email y realizaremos la devolución del dinero.</p>
                            </li>
                        </ul>
                        <p className="processingPaymentParraf">Por favor, mantente atento a tu bandeja de entrada (y revisa también la carpeta de spam por si acaso).</p>
                        <p className="processingPaymentParraf">Ya puedes cerrar esta pestaña.</p>
                    </>
                    :
                    <>
                        <h1 className="processingPaymentTitle">Nada que ver aquí... 👀</h1>
                    </>
            }
        </div>
    );
}

export default ProcessingPayment;
