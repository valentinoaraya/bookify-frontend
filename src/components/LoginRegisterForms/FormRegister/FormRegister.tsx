import { useNavigate, useParams } from "react-router-dom";
import "./FormRegister.css"
import { useDataForm } from "../../../hooks/useDataForm";
import Title from "../../../common/Title/Title.tsx";
import LabelInputComponent from "../LabelInputComponent/LabelInputComponent.tsx";
import LabelSelectComponent from "../LabelSelectComponent/LabelSelectComponent.tsx";
import { Link } from "react-router-dom";
import Button from "../../../common/Button/Button.tsx";
import { useFetchData } from "../../../hooks/useFetchData.ts";
import { notifyError } from "../../../utils/notifications.ts";
import { ToastContainer } from "react-toastify";
import { BACKEND_API_URL } from "../../../config.ts";

const FormRegister = () => {

    const { registerTo } = useParams();
    const navigate = useNavigate()
    const { dataForm, handleChange } = useDataForm({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        province: "",
        city: "",
        street: "",
        number: "",
        password: "",
        confirmPassword: ""
    })
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/${registerTo === "user" ? "users" : "companies"}/register`,
        "POST"
    )

    if (error) {
        console.error(error)
        notifyError("Error del servidor: Inténtalo de nuevo más tarde")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (dataForm.password !== dataForm.confirmPassword) return notifyError("Las contraseñas no coinciden")
        const response = await fetchData(dataForm);
        if (response.data) {
            localStorage.setItem("access_token", response.data.access_token)
            navigate(registerTo === "user" ? "/user-panel" : "/company-panel")
        }
        if (response.error) {
            if (response.error === "Ya existe una cuenta con este email.") {
                notifyError('Ya existe una cuenta con este email.')
            } else {
                notifyError("Error: Inténtalo de nuevo más tarde")
            }
        }
    }

    if (registerTo === "company") return <h2>No estás autorizado a registrar empresas.</h2>

    return (
        <div className="divFormRegister">
            <ToastContainer />
            <Title textAlign="center" fontSize={window.innerWidth <= 630 ? "2rem" : "2.2rem"} margin="0 0 .5rem 0">Registrarse como {registerTo === "user" ? "usuario" : "empresa"}</Title>
            <form className="formRegister" onSubmit={handleSubmit}>
                <div className={registerTo === "company" ? "horizontalForm" : ""}>
                    <div className="divHalf divFirstHalf">
                        <LabelInputComponent
                            label="Nombre:"
                            type="text"
                            name="name"
                            required={true}
                            onChange={handleChange}
                        />
                        {
                            registerTo === "user" &&
                            <LabelInputComponent
                                label="Apellido:"
                                type="text"
                                name="lastName"
                                required={true}
                                onChange={handleChange}
                            />
                        }
                        {
                            registerTo === "company" &&
                            <>
                                <LabelSelectComponent
                                    onChange={handleChange}
                                />
                                <LabelInputComponent
                                    label="Calle:"
                                    type="text"
                                    name="street"
                                    required={true}
                                    onChange={handleChange}
                                />
                                <LabelInputComponent
                                    label="Número de calle:"
                                    type="text"
                                    name="number"
                                    required={true}
                                    onChange={handleChange}
                                />
                            </>
                        }
                    </div>
                    <div className="divHalf divSecondHalf">
                        <LabelInputComponent
                            label="Email:"
                            type="email"
                            name="email"
                            required={true}
                            onChange={handleChange}
                        />
                        <LabelInputComponent
                            label="Teléfono:"
                            type="tel"
                            name="phone"
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
                        <LabelInputComponent
                            label="Confirmar contraseña:"
                            type="password"
                            name="confirmPassword"
                            required={true}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    Registrarse
                </Button>
                <div className="divLinkForm">
                    <p className="pDescriptionForm">¿Ya tienes cuenta?</p>
                    <Link className="linkForm" to={"/login/" + registerTo}>
                        <p>Inicia sesión ahora.</p>
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default FormRegister;
