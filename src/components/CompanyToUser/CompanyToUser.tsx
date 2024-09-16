import { useEffect, useState } from "react";
import "./CompanyToUser.css"
import { useParams } from "react-router-dom";

interface Company {
    _id: string
    name: string
    location: string
    email: string
    phone: string
    services: string[]
}

const CompanyToUser = () => {

    const [company, setCompany] = useState<Company | null>(null)
    const { id } = useParams()

    useEffect(() => {
        const getCompany = async (id: string) => {
            const fetchData = await fetch(`${import.meta.env.VITE_BACKEND_URL}/companies/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })

            const data = await fetchData.json()
            setCompany(data.data)
        }

        getCompany(id as string)

    }, [company])

    return (
        <div className="companyToUserContainer">
            {
                company ?
                    <>
                        <div>
                            <h1>{company.name}</h1>
                            <p>{company.location}</p>
                        </div>
                        <div>
                            <h2>Servicios: </h2>
                            {
                                company.services.map((service) => {
                                    return <div key={service}>
                                        <h3>{service}</h3>
                                    </div>
                                })
                            }
                        </div>
                    </>
                    :
                    <>
                        <h1>No se encontró la empresa.</h1>
                    </>
            }
        </div>
    );
}

export default CompanyToUser;
