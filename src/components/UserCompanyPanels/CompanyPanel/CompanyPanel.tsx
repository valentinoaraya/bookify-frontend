import "./CompanyPanel.css"
import { useContext } from "react";
import CompanyInterface from "./CompanyInterface/CompanyInterface";
import { CompanyContext } from "../../../contexts/CompanyContext";
import { ToastContainer } from "react-toastify";


const CompanyPanel = () => {

    const { state, isLoading, error } = useContext(CompanyContext)

    if (error) console.error(error)
    if (isLoading) return <h2>Cargando...</h2>
    console.log(state)

    const onGoBack = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/"
    }

    return (
        <>
            <ToastContainer />
            {
                !state._id ?
                    <div className="notFoundedCompanyDiv">
                        <h2 className="notFoundedCompanyTitle">🔍 Empresa no encontrada</h2>
                        <p className="notFoundedCompanyDescription">No pudimos encontrar la empresa que intentas acceder. Por favor, contacta al soporte.</p>
                        <button
                            className="notFoundedCompanyButton"
                            onClick={onGoBack}
                        >
                            Volver
                        </button>
                    </div>
                    :
                    <>
                        {
                            state.suscription.status_suscription === "active" ?
                                <CompanyInterface />
                                :
                                <div className="notFoundedCompanyDiv">
                                    <h2 className="notFoundedCompanyTitle">🛑 Suscripción inactiva</h2>
                                    <p className="notFoundedCompanyDescription">Tu suscripción ha expirado. Por favor, renueva tu suscripción para continuar usando el sistema, o contacta al soporte.</p>
                                    <button
                                        className="notFoundedCompanyButton"
                                        onClick={onGoBack}
                                    >
                                        Volver
                                    </button>
                                </div>
                        }
                    </>
            }
        </>
    );
}

export default CompanyPanel;
