import "./FormLogin.css";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState } from "react";
import Button from "../../../common/Button/Button.tsx";
import { useDataForm } from "../../../hooks/useDataForm.ts";
import LabelInputComponent from "../LabelInputComponent/LabelInputComponent.tsx";
import { loginCompany, loginUser } from "@/shared/api/companies";
import { ToastContainer } from "react-toastify";
import { notifyError } from "../../../utils/notifications.ts";
import { setTokens } from "../../../utils/tokenManager.ts";
import {
    ArrowReturnIcon,
    CalendarCheckIcon,
    CompanyIcon,
    RocketIcon,
} from "../../../common/Icons/Icons.tsx";

const FormLogin = () => {
    const { loginTo } = useParams();
    const navigate = useNavigate();
    const { dataForm, handleChange } = useDataForm({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);

    const isCompany = loginTo !== "user";
    const token = localStorage.getItem("access_token");

    if (token && isCompany) {
        window.location.href = "/company-panel";
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            const response = isCompany
                ? await loginCompany(dataForm as { email: string; password: string })
                : await loginUser(dataForm as { email: string; password: string });

            if (response.data) {
                if (response.data.data.access_token && response.data.data.refresh_token) {
                    setTokens({
                        access_token: response.data.data.access_token,
                        refresh_token: response.data.data.refresh_token,
                    });
                } else {
                    localStorage.setItem("access_token", response.data.data.access_token);
                }

                navigate(isCompany ? "/company-panel" : "/user-panel");
            }

            if (response.error) {
                console.error(response.error);
                notifyError(`Error: ${response.error}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="loginPage">
            <ToastContainer />
            <div className="loginPage__bg" aria-hidden>
                <div className="loginPage__blob loginPage__blob--a" />
                <div className="loginPage__blob loginPage__blob--b" />
            </div>

            <aside className="loginAside">
                <Link to="/" className="loginAside__brand">
                    Bookify
                </Link>
                <div className="loginAside__copy">
                    <h1>
                        {isCompany
                            ? "Bienvenido de nuevo a tu panel"
                            : "Ingresá para continuar"}
                    </h1>
                    <p>
                        {isCompany
                            ? "Gestioná turnos, señas y tu agenda en un solo lugar. Todo listo para que te enfoques en atender."
                            : "Accedé con tus datos para gestionar tu reserva."}
                    </p>
                </div>
                {isCompany && (
                    <ul className="loginAside__perks">
                        <li>
                            <span className="loginAside__perkIcon">
                                <CalendarCheckIcon width="18" height="18" fill="currentColor" />
                            </span>
                            Turnos y recordatorios en tiempo real
                        </li>
                        <li>
                            <span className="loginAside__perkIcon">
                                <CompanyIcon width="18" height="18" fill="currentColor" />
                            </span>
                            Portal de reservas para tus clientes
                        </li>
                        <li>
                            <span className="loginAside__perkIcon">
                                <RocketIcon width="18" height="18" fill="currentColor" />
                            </span>
                            Cobros con Mercado Pago integrados
                        </li>
                    </ul>
                )}
                {isCompany && (
                    <p className="loginAside__register">
                        ¿No tenés cuenta? <Link to="/register">Registrate gratis</Link>
                    </p>
                )}
            </aside>

            <main className="loginMain">
                <header className="loginMain__header">
                    <button
                        className="loginBackBtn"
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        <ArrowReturnIcon width="18" height="18" fill="currentColor" />
                        <span>Volver</span>
                    </button>
                    <Link to="/" className="loginMain__brandMobile">
                        Bookify
                    </Link>
                </header>

                <section className="loginContent">
                    <div className="loginContent__intro">
                        <span className="loginContent__eyebrow">
                            {isCompany ? "Acceso empresas" : "Acceso usuario"}
                        </span>
                        <h2>
                            Iniciar sesión
                            {isCompany ? " como empresa" : ""}
                        </h2>
                        <p>
                            {isCompany
                                ? "Ingresá con el email de contacto de tu cuenta Bookify."
                                : "Completá tus datos para continuar."}
                        </p>
                    </div>

                    <form className="loginForm" onSubmit={handleSubmit}>
                        <LabelInputComponent
                            label="Email"
                            type="email"
                            name="email"
                            required
                            onChange={handleChange}
                        />
                        <LabelInputComponent
                            label="Contraseña"
                            type="password"
                            name="password"
                            required
                            onChange={handleChange}
                        />

                        <Button
                            type="submit"
                            loading={isLoading}
                            fontWeight="700"
                            padding="1rem 1.5rem"
                            margin="0.35rem 0 0"
                            iconSVG={
                                !isLoading && isCompany ? (
                                    <CompanyIcon width="18" height="18" fill="currentColor" />
                                ) : undefined
                            }
                            reverse={isCompany}
                        >
                            Iniciar sesión
                        </Button>
                    </form>

                    {isCompany && (
                        <p className="loginContent__footer">
                            ¿No tenés cuenta? <Link to="/register">Creá una ahora</Link>
                        </p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default FormLogin;
