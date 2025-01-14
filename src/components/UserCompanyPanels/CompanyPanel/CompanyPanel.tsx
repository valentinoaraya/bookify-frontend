import { useState, useEffect } from "react";
import { useFetchData } from "../../../hooks/useFetchData";
import { type Company } from "../../../types";
import "./CompanyPanel.css"
import CompanyInterface from "./CompanyInterface/CompanyInterface";
import { BACKEND_API_URL } from "../../../config";

const CompanyPanel = () => {

    const { isLoading, error, fetchData } = useFetchData(`${BACKEND_API_URL}/companies/get-company`, "GET", true)
    const [company, setCompany] = useState<Company | null>(null)

    if (error) console.error(error)

    useEffect(() => {
        const getCompany = async () => {
            const resopnse = await fetchData(null)
            if (resopnse.data) setCompany(resopnse.data)
        }
        getCompany()
    }, [])

    if (isLoading) return <h2>Cargando...</h2>

    return (
        <>
            {
                !company ?
                    <h2>Empresa no encontrada</h2>
                    :
                    <CompanyInterface
                        company={company}
                    />
            }
        </>
    );
}

export default CompanyPanel;
