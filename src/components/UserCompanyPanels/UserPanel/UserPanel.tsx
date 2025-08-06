import { useContext } from "react";
import "./UserPanel.css"
import UserInterface from "./UserInterface/UserInterface";
import { UserContext } from "../../../contexts/UserContext";

const UserPanel = () => {

    const { isLoading, error, state } = useContext(UserContext)

    if (error) console.error(error)
    if (isLoading) return <h2>Cargando...</h2>

    console.log(state)

    return (
        <>
            {
                !state._id ?
                    <h2>Usuario no encontrado</h2>
                    :
                    <UserInterface
                        company={state}
                    />
            }
        </>
    );
}

export default UserPanel;
