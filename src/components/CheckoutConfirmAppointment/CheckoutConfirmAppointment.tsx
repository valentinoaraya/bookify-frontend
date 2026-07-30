import "./CheckoutConfirmAppointment.css"
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../common/Title/Title";
import { ToastContainer } from "react-toastify";
import Button from "../../common/Button/Button";
import { formatDate } from "../../utils/formatDate";
import { useCheckoutPreference } from "@/features/checkout/hooks/useCheckoutPreference";

const CheckoutConfirmAppointment = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const { date, service, dataUser, cancellationAnticipationHours } = location.state

    const { isLoading, buy } = useCheckoutPreference()

    if (!date || !service || !dataUser) return <h2>Checkout no disponible.</h2>
    const hour = date.split(" ")[1]
    const formattedDate = formatDate(date.split(" ")[0])

    const handleBuy = () => {
        buy({
            companyId: service.companyId,
            serviceId: service.serviceId,
            date,
            dataUser,
        })
    }

    const handleGoBack = () => {
        navigate(-1)
    }

    return (
        <div className="checkoutContainer">
            <ToastContainer />
            <div className="checkoutCard">
                <div className="checkoutHeader">
                    <Title
                        textAlign="center"
                    >
                        Pagar seña para el turno de {service.title}
                    </Title>
                </div>

                <div className="checkoutContent">
                    <div className="divExplicationCheckout">
                        <p className="explicationCheckout">Hola, para confirmar el turno debes abonar la seña que cobra la empresa que ofrece el servicio.</p>
                        <p className="explicationCheckout">Al abonar mediante Mercado Pago, el turno será agendado automáticamente.</p>
                        <p className="explicationCheckout">En caso de que la empresa cancele el turno, se te devolverá la totalidad del dinero. En caso de que tú canceles el turno, se te devolverá un 50% del dinero abonado.</p>
                        {
                            cancellationAnticipationHours === 0 ?
                                <p className="explicationCheckout">Podrás cancelar el turno cuando desees.</p>
                                :
                                <p className="explicationCheckout">Ten en cuenta que solo puedes cancelar el turno con más de {cancellationAnticipationHours} {cancellationAnticipationHours > 1 ? "horas" : "hora"} de anticipación.</p>
                        }
                    </div>

                    <div className="divDataCheckout">
                        <ul>
                            <li>
                                <p className="parrafDataCheckout">
                                    <span>Fecha del turno:</span>
                                    {formattedDate} {hour} hs
                                </p>
                            </li>
                            <li>
                                <p className="parrafDataCheckout">
                                    <span>Precio total del turno:</span>
                                    ${service.totalPrice}
                                </p>
                            </li>
                            <li>
                                <p className="parrafDataCheckout">
                                    <span>Precio de la seña:</span>
                                    ${service.signPrice}
                                </p>
                            </li>
                            <li>
                                <p className="parrafDataCheckout">
                                    <span>Modalidad del turno:</span>
                                    {service.mode === "in-person" ? "Presencial en local" : service.mode === "online" ? "Virtual" : "Presencial a domicilio"}
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="checkoutButtonContainer">
                    <Button
                        onSubmit={handleBuy}
                        loading={isLoading}
                    >
                        {isLoading ? "Procesando..." : "Pagar seña con Mercado Pago"}
                    </Button>
                    <button
                        className="backButton"
                        onClick={handleGoBack}
                        disabled={isLoading}
                    >
                        ← Volver atrás
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CheckoutConfirmAppointment;
