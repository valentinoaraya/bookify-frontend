import { useContext } from "react";
import "./CompanyPanel.css"
import CompanyInterface from "./CompanyInterface/CompanyInterface";
import { CompanyContext } from "../../../contexts/CompanyContext";
import { ToastContainer } from "react-toastify";


const CompanyPanel = () => {

    const { state, isLoading, error } = useContext(CompanyContext)

    if (error) console.error(error)
    if (isLoading) return <h2>Cargando...</h2>

    return (
        <>
            <ToastContainer />
            {
                !state._id ?
                    <h2>Empresa no encontrada</h2>
                    :
                    <CompanyInterface />
            }
        </>
    );
}

export default CompanyPanel;
