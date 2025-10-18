import { Link } from "react-router-dom";
import "./Home.css"
import Button from "../../common/Button/Button.tsx";
import Title from "../../common/Title/Title.tsx";
import { CompanyIcon } from "../../common/Icons/Icons.tsx";

const Home = () => {

    const token = localStorage.getItem("access_token")

    console.log(token)

    if (token) {
        window.location.href = "/company-panel"
    }

    return (
        <div className="divHome">
            <Title fontSize={window.innerWidth <= 560 ? "4.5rem" : "6rem"} margin="0 0 .5rem 0">Bookify</Title>
            <h2>Gestioná tus turnos de manera eficiente</h2>
            <div className="divButtonsHome">
                <Link className="linkButton" to={"/login/company"}>
                    <Button
                        reverse
                        iconSVG={
                            <CompanyIcon
                                width={"25"}
                                height={"25"}
                                fill="#FFFF"
                            />
                        }
                        fontWeight="600"
                    >
                        Ingresar como empresa
                    </Button>
                </Link>
                <p className="pDescription">Para gestionar los turnos de tus clientes.</p>
            </div>
        </div>
    );
}

export default Home;
