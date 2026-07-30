import { useContext } from "react";
import "./UserPanel.css"
import UserInterface from "./UserInterface/UserInterface";
import { UserContext } from "../../../contexts/UserContext";
import LoadingSpinner from "@/common/LoadingSpinner/LoadingSpinner";

const UserPanel = () => {
    const { isLoading, error, state } = useContext(UserContext)

    if (error) console.error(error)
    if (isLoading) {
        return (
            <div className="userPanelLoading">
                <LoadingSpinner text="Cargando empresa..." />
            </div>
        )
    }

    if (!state._id) {
        return (
            <div className="userPanelNotFound">
                <h2>Usuario no encontrado</h2>
                <p>No pudimos cargar la información de esta empresa.</p>
            </div>
        )
    }

    return <UserInterface company={state} />
}

export default UserPanel;
