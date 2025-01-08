import { useEffect, useState } from "react";
import { useFetchData } from "../../../hooks/useFetchData";
import "./UserPanel.css"
import { type User } from "../../../types";

const UserPanel = () => {

    const { isLoading, error, fetchData } = useFetchData("users/get-user", "GET")
    const [user, setUser] = useState<User | null>(null)

    if (error) console.error(error)

    useEffect(() => {
        const getUser = async () => {
            const response = await fetchData(null)
            if (response.data) setUser(response.data)
        }
        getUser()
    }, [])

    if (isLoading) return <h2>Cargando...</h2>

    return (
        <div>
            {
                !user ?
                    <h2>Usuario no encontrado</h2>
                    :
                    <div>
                        <h2>{user.name} {user.lastName}</h2>

                    </div>
            }
        </div>
    );
}

export default UserPanel;
