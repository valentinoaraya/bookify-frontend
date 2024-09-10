import "./UserInterface.css"
import notImgUser from "../../assets/notImgUser.png"
import { useEffect, useState } from "react";

interface ServiceUsed {
    dateUsed: string
    serviceName: string
    companyName: string
}

interface Appointment {
    _id: string
    serviceId: {
        title: string
    }
    companyId: {
        name: string
    }
    date: string
}

interface User {
    name: string
    lastName: string
    email: string
    phone: string
    appointments: Appointment[]
    servicesUsed: ServiceUsed[]
}

const UserInterface = () => {

    const [user, setUser] = useState<null | User>(null)

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/users/get-user`, {
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
                            <div className="searchBar">
                                Barra de búsqueda
                            </div>
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
