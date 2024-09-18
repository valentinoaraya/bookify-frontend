import { useEffect, useState } from "react";
import "./CompanyInterface.css"
import { Company } from "../../types";

const CompanyInterface = () => {

    const [company, setCompany] = useState<null | Company>(null)

    console.log(company)

    useEffect(() => {
        const getCompany = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/companies/get-company`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                })

                const data = await response.json()
                setCompany(data.data)
            } catch (error: any) {
                console.log(error)
            }
        }

        getCompany()

    }, [])

    return (
        <div>
            {
                company ?
                    <h1>{company.name}</h1>
                    :
                    <h1>No se encontró empresa.</h1>
            }
        </div>
    );
}

export default CompanyInterface;
