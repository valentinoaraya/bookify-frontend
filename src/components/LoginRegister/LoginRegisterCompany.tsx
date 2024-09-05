import FormLogin from "./FormLogin";
import FormRegister from "./FormRegister";
import "./LoginRegister.css"

const LoginRegisterCompany = () => {
    return (
        <div className="loginRegisterContainer">
            <div className="loginContainer">
                <h2>¿Tienes una cuenta? Inicia sesión</h2>
                <FormLogin loginTo="companies" />
            </div>
            <div className="registerContainer">
                <h2>Si no tienes cuenta, regístrate</h2>
                <FormRegister loginTo="companies" />
            </div>
        </div>
    );
}

export default LoginRegisterCompany;
