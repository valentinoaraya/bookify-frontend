import "./FormLogin.css"
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../common/Button/Button.tsx"
import { useDataForm } from "../../../hooks/useDataForm.ts";
import Title from "../../../common/Title/Title.tsx";
import { Link } from "react-router-dom";
import LabelInputComponent from "../LabelInputComponent/LabelInputComponent.tsx";
import { useAuthenticatedPost } from "../../../hooks/useAuthenticatedFetch.ts";
import { BACKEND_API_URL } from "../../../config.ts";
import { ToastContainer } from "react-toastify";
import { notifyError } from "../../../utils/notifications.ts";
import { setTokens } from "../../../utils/tokenManager.ts";

const FormLogin = () => {

    const { loginTo } = useParams();
    const navigate = useNavigate();
    const { dataForm, handleChange } = useDataForm({ email: "", password: "" });
    const { isLoading, error, post } = useAuthenticatedPost();

    const token = localStorage.getItem("access_token")

    if (token) {
        window.location.href = "/company-panel"
    }

    if (error) {
        console.error(error)
        notifyError("Error del servidor: Inténtalo de nuevo más tarde")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = `${BACKEND_API_URL}/${loginTo === "user" ? "users" : "companies"}/login`;
        const response = await post(url, dataForm, { skipAuth: true });

        if (response.data) {
            // Para empresas, guardar ambos tokens
            if (response.data.data.access_token && response.data.data.refresh_token) {
                setTokens({
                    access_token: response.data.data.access_token,
                    refresh_token: response.data.data.refresh_token
                });
            } else {
                // Para usuarios, mantener el comportamiento actual
                localStorage.setItem("access_token", response.data.data.access_token);
            }

            navigate(loginTo === "user" ? "/user-panel" : "/company-panel");
        }

        if (response.error) {
            console.error(response.error);
            notifyError(`Error: ${response.error}`);
        }
    }

    return (
        <div className="divFormLogin">
            <ToastContainer />
            <Title textAlign="center" fontSize={window.innerWidth <= 630 ? "2rem" : "2.2rem"} margin="0 0 .5rem 0">Iniciar sesión como {loginTo === "user" ? "usuario" : "empresa"}</Title>
            <form className="formLogin" onSubmit={handleSubmit}>
                <LabelInputComponent
                    label="Email:"
                    type="email"
                    name="email"
                    required={true}
                    onChange={handleChange}
                />
                <LabelInputComponent
                    label="Contraseña:"
                    type="password"
                    name="password"
                    required={true}
                    onChange={handleChange}
                />
                <Button
                    type={"submit"}
                    disabled={isLoading}
                >
                    Iniciar sesión
                </Button>
                {
                    loginTo !== "company" &&
                    <div className="divLinkForm">
                        <p className="pDescriptionForm">¿No tienes cuenta?</p>
                        <Link className="linkForm" to={"/register/" + loginTo}>
                            <p>Regístrate ahora.</p>
                        </Link>
                    </div>
                }
            </form>
        </div>
    );
}

export default FormLogin;
