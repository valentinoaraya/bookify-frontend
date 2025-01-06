import { useParams } from "react-router-dom";
import "./FormRegister.css"
import { useDataForm } from "../../../hooks/useDataForm";
import Title from "../../../common/Title/Title.tsx";
import LabelInputComponent from "../LabelInputComponent/LabelInputComponent.tsx";
import { Link } from "react-router-dom";
import Button from "../../../common/Button/Button.tsx";

const FormRegister = () => {

    const { registerTo } = useParams();
    const { dataForm, handleChange } = useDataForm({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        street: "",
        number: "",
        password: "",
        confirmPassword: ""
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(dataForm);
    }

    return (
        <div className="divFormRegister">
            <Title fontSize="2.2rem">Registrarse como {registerTo === "user" ? "usuario" : "empresa"}</Title>
            <form className="formRegister" onSubmit={handleSubmit}>
                <LabelInputComponent
                    label="Nombre:"
                    type="text"
                    name="name"
                    required={true}
                    onChange={handleChange}
                />
                <LabelInputComponent
                    label="Apellidos:"
                    type="text"
                    name="lastName"
                    required={true}
                    onChange={handleChange}
                />
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
                    label="Ciudad:"
                    type="text"
                    name="city"
                    required={true}
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
                    label="Número:"
                    type="number"
                    name="number"
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
                <Button type="submit" >Registrarse</Button>
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
