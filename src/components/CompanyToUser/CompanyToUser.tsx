import { useEffect, useState } from "react";
import "./CompanyToUser.css"
import { useParams } from "react-router-dom";
import { Company } from "../../types";

const CompanyToUser = () => {

    const [company, setCompany] = useState<Company | null>(null)
    const { id } = useParams()

    useEffect(() => {
        const getCompany = async (id: string) => {
            const fetchData = await fetch(`${import.meta.env.VITE_BACKEND_URL}/companies/company/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })

            const data = await fetchData.json()
            console.log(data.data)
            setCompany(data.data)
        }

        getCompany(id as string)

    }, [])

    return (
        <div className="companyToUserContainer">
            {
                company ?
                    <>
                        <div className="dataCompany">
                            <h1>{company.name}</h1>
                            <p>{company.location}</p>
                        </div>
                        <div className="servicesCompany">
                            <h2>Servicios: </h2>
                            {
                                company.services.map((service) => {
                                    return <div key={service._id} className="service">
                                        <div className="serviceNamePriceContainer">
                                            <h3>{service.title}</h3>
                                            <p><span className="price">$ {service.price}</span></p>
                                        </div>
                                        <p><span>Descripción:</span> {service.description}</p>
                                        <p><span>Duración:</span> {service.duration}</p>
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
