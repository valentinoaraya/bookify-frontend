import FormLogin from "./FormLogin";
import FormRegister from "./FormRegister";
import "./LoginRegister.css"

const LoginRegisterUser = () => {
    return (
        <div className="loginRegisterContainer">
            <div className="loginContainer">
                <h2>¿Tienes una cuenta? Inicia sesión</h2>
                <FormLogin loginTo="users" />
            </div>
            <div className="registerContainer">
                <h2>Si no tienes cuenta, regístrate</h2>
                <FormRegister loginTo="users" />
            </div>
        </div>
    );
}

export default LoginRegisterUser;
