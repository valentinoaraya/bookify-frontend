import "./UserInterface.css"
import notImgUser from "../../assets/notImgUser.png"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Company, Service, User } from "../../types";


const UserInterface = () => {

    const [user, setUser] = useState<null | User>(null)
    const [companiesFound, setCompaniesFound] = useState([])
    const [servicesFound, setServicesFound] = useState([])
    let timeout: any = null

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/get-user`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                })

                const data = await response.json()
                if (data.data) setUser(data.data)
            } catch (error: any) {
                console.log(error)
            }
        }

        getUser()

    }, [])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearTimeout(timeout)

        timeout = setTimeout(async () => {
            try {
                const fetchData = await fetch(`${import.meta.env.VITE_BACKEND_URL}/companies/search?q=${e.target.value}`, {
                    method: "GET"
                })

                const data = await fetchData.json()

                console.log(data)

                if (data.data) {
                    setCompaniesFound(data.data.companies)
                    setServicesFound(data.data.services)
                } else {
                    setCompaniesFound([])
                    setServicesFound([])
                }

            } catch (error: any) {
                console.log(error)
            }
        }, 350)

    }

    return (
        <section className="sectionUserInterfaceContainer">
            {
                user ?
                    <>
                        <div className="imgDataContainer">
                            <div className="imgContainer">
                                <img className="imgUser" src={notImgUser} alt="Imagen del usuario" />
                                <p>Usuario</p>
                            </div>
                            <div className="dataUser">
                                <p><span>Nombre:</span> {user.name} {user.lastName}</p>
                                <p><span>Email:</span> {user.email}</p>
                                <p><span>Teléfono:</span> {user.phone}</p>
                            </div>
                        </div>
                        <div className="servicesAppointmentsContainer">
                            <div className="divSearchBar">
                                <input
                                    type="search"
                                    className="searchBar"
                                    placeholder="Buscar por empresa o servicio..."
                                    onChange={handleSearch}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                </svg>
                            </div>
                            {
                                companiesFound.length === 0 && servicesFound.length === 0 ?
                                    <>
                                        <div className="pendingAppointments">
                                            <h2>Turnos pendientes:</h2>
                                            {
                                                user.appointments.length === 0 ?
                                                    <h3>No hay turnos pendientes.</h3>
                                                    :
                                                    <ul>
                                                        {
                                                            user.appointments.map((appointment) => {
                                                                return <li key={appointment._id}>
                                                                    <p>{appointment.serviceId.title} en {appointment.companyId.name} a las {appointment.date}</p>
                                                                </li>
                                                            })
                                                        }
                                                    </ul>
                                            }
                                        </div>
                                        <div className="latestServices">
                                            <h2>Ultimos servicios utilizados:</h2>
                                            {
                                                user.servicesUsed ?
                                                    <h3>Si se utilizaron servicios aún.</h3>
                                                    :
                                                    <h3>No se utilizaron servicios.</h3>
                                            }
                                        </div>
                                    </>
                                    :
                                    <div className="divCompaniesServices">
                                        {
                                            companiesFound.length !== 0 &&
                                            <div className="companyServiceContanier">
                                                <h2>Empresas:</h2>
                                                <ul>
                                                    {
                                                        companiesFound.map((comp: Company) => {
                                                            return <Link key={comp._id} to={`/companies/company/${comp._id}`}>
                                                                <div>
                                                                    {comp.name}
                                                                </div>
                                                            </Link>
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        }
                                        {
                                            servicesFound.length !== 0 &&
                                            <div className="companyServiceContanier">
                                                <h2>Servicios:</h2>
                                                <ul>
                                                    {
                                                        servicesFound.map((serv: Service) => {
                                                            console.log(serv)
                                                            return <Link key={serv._id} to={`/companies/company/${serv.companyId}`}>
                                                                <div>
                                                                    {serv.title}
                                                                </div>
                                                            </Link>
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        }
                                    </div>
                            }
                        </div>
                    </>
                    :
                    <div className="notUser">
                        <h1>Usuario no disponible</h1>
                        <p>Inicia sesión o regístrate.</p>
                    </div>
            }
        </section>
    );
}

export default UserInterface;
