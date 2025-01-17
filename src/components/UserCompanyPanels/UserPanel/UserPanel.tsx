import { useEffect, useState } from "react";
import { useFetchData } from "../../../hooks/useFetchData";
import "./UserPanel.css"
import { type User } from "../../../types";
import UserInterface from "./UserInterface/UserInterface";
import { BACKEND_API_URL } from "../../../config";

const UserPanel = () => {

    const { isLoading, error, fetchData } = useFetchData(`${BACKEND_API_URL}/users/get-user`, "GET", true)
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
        <>
            {
                !user ?
                    <h2>Usuario no encontrado</h2>
                    :
                    <UserInterface
                        user={user}
                    />
            }
        </>
    );
}

export default UserPanel;
