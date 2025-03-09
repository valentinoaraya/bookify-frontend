import "./CheckoutConfirmAppointment.css"
import { useLocation } from "react-router-dom";
import Title from "../../common/Title/Title";
import { useEffect, useState } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { BACKEND_API_URL, PUBLIC_KEY_MP } from "../../config";
import { useFetchData } from "../../hooks/useFetchData";
import { notifyError } from "../../utils/notifications";
import { ToastContainer } from "react-toastify";

const CheckoutConfirmAppointment = () => {

    initMercadoPago(PUBLIC_KEY_MP, {
        locale: 'es-AR'
    })

    const token = localStorage.getItem("access_token")
    const location = useLocation()
    const { date, service } = location.state
    const [preferenceId, setPreferenceId] = useState<string | null>(null)
    const [isWalletLoading, setIsWalletLoading] = useState(true)
    const { isLoading, error, fetchData } = useFetchData(`${BACKEND_API_URL}/mercadopago/create-preference`,
        "POST",
        token
    )

    if (!date || !service) return <h2>Checkout no disponible.</h2>

    if (error) notifyError("Error del servidor. Inténtelo de nuevo más tarde.")

    useEffect(() => {

        const handleBuy = async () => {
            const response = await fetchData({
                serviceId: service.serviceId,
                title: `Seña de turno para ${service.title}`,
                price: service.price * 0.5,
            })

            if (response.data) setPreferenceId(response.data)
            if (response.error) {
                console.error(response.error)
                notifyError("Error al generar el pago.")
            }
        }

        handleBuy()

    }, [])

    if (isLoading) return <h2>Cargando...</h2>

    return (
        <div className="checkoutContainer">
            <ToastContainer />
            <Title fontSize={window.innerWidth <= 530 ? "1.5rem" : "2rem"} >Pagar seña para el turno de {service.title}</Title>
            <div className="divDataCheckout">
                <div className="divExplicationCheckout">
                    <p className="explicationCheckout">Hola, para confirmar el turno debes abonar una seña que cobra la empresa que ofrece el servicio.</p>
                    <p className="explicationCheckout">Al abonar mediante Mercado Pago, el turno será agendado automáticamente.</p>
                </div>
                <ul>
                    <li><p className="parrafDataCheckout"><span>Fecha del turno:</span> {date} hs</p></li>
                    <li><p className="parrafDataCheckout"><span>Precio total del turno:</span> $ {service.price}</p></li>
                    <li><p className="parrafDataCheckout"><span>Precio de la seña:</span> $ {service.price * 0.5}</p></li>
                </ul>
            </div>
            {
                isWalletLoading &&
                <div className="divWait">
                    <h3>Aguarde a que se muestre el botón de Mercado Pago...</h3>
                </div>
            }
            {
                preferenceId &&
                <Wallet
                    onReady={() => setIsWalletLoading(false)}
                    initialization={{
                        preferenceId: preferenceId,
                        redirectMode: "self"
                    }}
                    customization={{
                        valueProp: "smart_option"
                    }}
                />
            }
        </div>
    );
}

export default CheckoutConfirmAppointment;
