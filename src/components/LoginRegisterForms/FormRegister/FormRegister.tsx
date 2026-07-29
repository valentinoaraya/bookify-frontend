import { useNavigate } from "react-router-dom";
import "./FormRegister.css"
import { useDataForm } from "../../../hooks/useDataForm.ts";
import Title from "../../../common/Title/Title.tsx";
import LabelInputComponent from "../LabelInputComponent/LabelInputComponent.tsx";
import LabelSelectComponent from "../LabelSelectComponent/LabelSelectComponent.tsx";
import { Link } from "react-router-dom";
import Button from "../../../common/Button/Button.tsx";
import { useAuthenticatedPost } from "../../../hooks/useAuthenticatedFetch.ts";
import { notifyError } from "../../../utils/notifications.ts";
import { ToastContainer } from "react-toastify";
import { BACKEND_API_URL } from "../../../config.ts";
import { setTokens } from "../../../utils/tokenManager.ts";
import PlanCard from "../PlanCard/PlanCard.tsx";
import { ArrowReturnIcon } from "../../../common/Icons/Icons.tsx";

const FormRegister = () => {
    const navigate = useNavigate();
    const { dataForm, handleChange } = useDataForm({
        name: "",
        email: "",
        phone: "",
        province: "",
        city: "",
        street: "",
        number: "",
        password: "",
        confirmPassword: "",
        plan: "",
        payer_email: ""
    })

    const { isLoading, post } = useAuthenticatedPost()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (dataForm.password !== dataForm.confirmPassword) {
            return notifyError("Las contraseñas no coinciden")
        }

        if (!dataForm.plan) {
            return notifyError("Por favor selecciona un plan")
        }

        const url = `${BACKEND_API_URL}/companies/register`;
        const response = await post(url, dataForm, { skipAuth: true });

        if (response.error) {
            notifyError(response.error)
            return
        }

        const initPoint = response.data?.data?.init_point
        if (!initPoint) {
            notifyError("No pudimos iniciar el pago. Intentá de nuevo o contactá soporte.")
            return
        }

        setTokens({
            access_token: response.data.data.access_token,
            refresh_token: response.data.data.refresh_token
        });
        window.location.href = initPoint
    }

    const plans = [
        {
            name: "Plan Individual",
            value: "individual",
            price: "$12.000",
            features: [
                "1 profesional",
                "Hasta 5 servicios",
                "Recordatorios y emails automáticos",
                "Pagos online con Mercado Pago",
                "Rembolsos automáticos",
                "Historial completo de movimientos",
                "Soporte por correo"
            ]
        },
        {
            name: "Plan Individual Plus",
            value: "individual_plus",
            price: "$18.000",
            features: [
                "Incluye Plan Individual",
                "Servicios personalizados e ilimitados",
                "Métricas de rendimiento (ingresos, asistencias, etc.)",
                "Soporte prioritario"
            ]
        },
        {
            name: "Plan Equipo",
            value: "team",
            price: "$35.000",
            features: [
                "Incluye Plan Individual Plus por profesional",
                "Hasta 5 profesionales",
                "Dashborard administrativo",
                "Gestión de agendas separadas",
                "Historial completo de movimientos por profesional",
                "Historial centralizado de clientes",
                "+ Profesionales adicionales: $5.000 / mes cada profesional",
            ],
            isComingSoon: true
        }
    ];

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="divFormRegister">
            <ToastContainer />
            <button className="backButtonForm" onClick={handleGoBack} type="button">
                <ArrowReturnIcon width="20" height="20" fill="var(--azul-oscuro)" />
                <span>Volver</span>
            </button>
            <Title textAlign="center">Registrarse como empresa</Title>

            <div className="plans-container">
                <h2 className="plans-title">Elige tu plan</h2>
                <div className="plans-grid">
                    {plans.map((plan, index) => (
                        <PlanCard
                            key={index}
                            planName={plan.name}
                            price={plan.price}
                            features={plan.features}
                            isSelected={dataForm.plan === plan.value}
                            onClick={() => handleChange({
                                target: {
                                    name: "plan",
                                    value: plan.value
                                }
                            } as React.ChangeEvent<HTMLInputElement>)}
                            isComingSoon={plan.isComingSoon}
                        />
                    ))}
                </div>
            </div>

            <form className="formRegister" onSubmit={handleSubmit}>
                <div className="horizontalForm">
                    <div className="divHalf divFirstHalf">
                        <LabelInputComponent
                            label="Nombre:"
                            type="text"
                            name="name"
                            value={dataForm["name"]}
                            required={true}
                            onChange={handleChange}
                        />
                        <LabelSelectComponent
                            onChange={handleChange}
                        />
                        <LabelInputComponent
                            label="Calle:"
                            type="text"
                            name="street"
                            value={dataForm["street"]}
                            required={true}
                            onChange={handleChange}
                        />
                        <LabelInputComponent
                            label="Número de calle:"
                            type="text"
                            name="number"
                            value={dataForm["number"]}
                            required={true}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="divHalf divSecondHalf">
                        <LabelInputComponent
                            label="Email del pagador:"
                            type="email"
                            name="payer_email"
                            value={dataForm["payer_email"]}
                            required={true}
                            onChange={handleChange}
                        />
                        <LabelInputComponent
                            label="Email de contacto:"
                            type="email"
                            name="email"
                            value={dataForm["email"]}
                            required={true}
                            onChange={handleChange}
                        />
                        <LabelInputComponent
                            label="Teléfono:"
                            type="tel"
                            name="phone"
                            value={dataForm["phone"]}
                            required={true}
                            onChange={handleChange}
                        />
                        <LabelInputComponent
                            label="Contraseña:"
                            type="password"
                            name="password"
                            value={dataForm["password"]}
                            required={true}
                            onChange={handleChange}
                        />
                        <LabelInputComponent
                            label="Confirmar contraseña:"
                            type="password"
                            name="confirmPassword"
                            value={dataForm["confirmPassword"]}
                            required={true}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <p className="infoParraf">
                    El email de pagador debe ser el mismo email asociado a la cuenta de Mercado Pago con la que se va a ejecutar el pago.
                </p>
                <p className="infoParraf">
                    El email de contacto es el que utilizarás para iniciar sesión y el que Bookify utilizará para enviar correos y notificaicones.
                </p>
                <p className="infoParraf">
                    Es posible usar el mismo correo para ambos campos.
                </p>
                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    Suscribirme
                </Button>
                <div className="divLinkForm">
                    <p className="pDescriptionForm">¿Ya tienes cuenta?</p>
                    <Link className="linkForm" to="/login/company">
                        <p>Inicia sesión.</p>
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default FormRegister;
