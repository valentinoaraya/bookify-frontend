import "./FormLogin.css"
import { useParams } from "react-router-dom";
import Button from "../../../common/Button/Button.tsx"
import { useDataForm } from "../../../hooks/useDataForm.ts";
import Title from "../../../common/Title/Title.tsx";
import { Link } from "react-router-dom";
import LabelInputComponent from "../LabelInputComponent/LabelInputComponent.tsx";
import { useFetchData } from "../../../hooks/useFetchData.ts";

const FormLogin = () => {

    const { loginTo } = useParams();
    const { dataForm, handleChange } = useDataForm({ email: "", password: "" });
    const { data, isLoading, error, fetchData } = useFetchData(
        `${loginTo === "user" ? "users" : "companies"}/login`,
        "POST"
    );

    console.log(data)
    console.log(error)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(dataForm);
    }

    return (
        <div className="divFormLogin">
            <Title fontSize="2.2rem">Iniciar sesión como {loginTo === "user" ? "usuario" : "empresa"}</Title>
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
                <div className="divLinkForm">
                    <p className="pDescriptionForm">¿No tienes cuenta?</p>
                    <Link className="linkForm" to={"/register/" + loginTo}>
                        <p>Regístrate ahora.</p>
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default FormLogin;
