import { type Company, type User, type View } from "../../../types";
import "./SideBar.css"
import Title from "../../../common/Title/Title";
import Button from "../../../common/Button/Button";
import { UserIcon, CompanyIcon } from "../../../common/Icons/Icons";
import ModalForm from "../../ModalForm/ModalForm";
import { useState } from "react";
import { useFetchData } from "../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../config";
import { notifyError, notifySuccess } from "../../../utils/notifications";

interface Props {
    data: User | Company
    onViewChange?: (view: View) => void
}

const SideBar: React.FC<Props> = ({ data, onViewChange }) => {

    const [dataSideBar, setDataSideBar] = useState<User | Company>(data)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/${data.type === "user" ? "users" : "companies"}/update-${data.type}`,
        "PUT",
        true
    )
    const { isLoading: _isLoadingLogout, error: errorLogout, fetchData: fetchDataLogout } = useFetchData(
        `${BACKEND_API_URL}/${data.type === "user" ? "users" : "companies"}/logout`,
        "POST",
        true
    )

    if (error || errorLogout) {
        console.error(error || errorLogout)
        notifyError("Error del servidor: Inténtalo de nuevo más tarde")
    }

    const updateData = async (data: { [key: string]: any }) => {
        const response = await fetchData(data)
        console.log(response)
        setIsModalOpen(false)
        if (response?.data) {
            setDataSideBar(response.data)
            notifySuccess("Datos actualizados")
        }
        if (response?.error) notifyError("Error al actualizar los datos")
    }

    const handleLogout = async () => {
        const response = await fetchDataLogout({})
        if (response?.data) {
            window.location.href = "/"
        }
        if (response?.error) notifyError("Error al cerrar sesión")
    }

    return (
        <div className="sideBar">
            <Title fontSize="3.5rem">Bookify</Title>
            <div className="dataUserCompany">
                <div className="titleContainer">
                    {
                        dataSideBar.type === "user" ?
                            <UserIcon
                                width="32"
                                height="32"
                                fill="#457B9D"
                            />
                            :
                            <CompanyIcon
                                width="32"
                                height="32"
                                fill="#457B9D"
                            />
                    }
                    <Title fontSize="1.5rem">
                        {dataSideBar.type === "user" ? "Mis datos:" : "Mi empresa:"}
                    </Title>
                </div>
                <div className="dataContainer">
                    <p className="parrafData">
                        <span>Nombre: </span>
                        {
                            dataSideBar.type === "user" ?
                                `${dataSideBar.name} ${dataSideBar.lastName}`
                                :
                                `${dataSideBar.name}`
                        }
                    </p>
                    <p className="parrafData">
                        <span>Teléfono: </span>
                        {dataSideBar.phone}
                    </p>
                    <p className="parrafData">
                        <span>Email: </span>
                        {dataSideBar.email}
                    </p>
                    {
                        dataSideBar.type === "company" &&
                        <p className="parrafData">
                            <span>Ubicación: </span>
                            {dataSideBar.city} - {dataSideBar.street} {dataSideBar.number}
                        </p>
                    }
                </div>
            </div>
            {
                dataSideBar.type === "company" &&
                <div className="divButtonsCompany">
                    <Button
                        onSubmit={() => { onViewChange?.("appointments") }}
                        fontWeight="700"
                    >
                        Próximos turnos
                    </Button>
                    <Button
                        onSubmit={() => { onViewChange?.("services") }}
                        fontWeight="700"
                    >
                        Mis servicios
                    </Button>
                </div>
            }
            <div className="divConfigurations">
                <p
                    className="parrafConfig"
                    onClick={() => setIsModalOpen(true)}
                >
                    Editar datos
                </p>
                <p
                    className="parrafConfig"
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </p>
            </div>
            <ModalForm
                title={`Editar datos de ${dataSideBar.type === "user" ? "usuario" : "empresa"}`}
                inputs={
                    dataSideBar.type === "user" ?
                        [
                            { type: "text", name: "name", placeholder: "Nombre", label: "Nombre" },
                            { type: "text", name: "lastName", placeholder: "Apellido", label: "Apellido" },
                            { type: "text", name: "phone", placeholder: "Teléfono", label: "Teléfono" },
                            { type: "email", name: "email", placeholder: "Email", label: "Email" }
                        ]
                        :
                        [
                            { type: "text", name: "name", placeholder: "Nombre", label: "Nombre" },
                            { type: "text", name: "phone", placeholder: "Teléfono", label: "Teléfono" },
                            { type: "email", name: "email", placeholder: "Email", label: "Email" },
                            { type: "text", name: "city", placeholder: "Ciudad", label: "Ciudadd" },
                            { type: "text", name: "street", placeholder: "Calle", label: "Calle" },
                            { type: "number", name: "number", placeholder: "Número", label: "Número" }
                        ]
                }
                initialData={
                    dataSideBar.type === "user" ?
                        {
                            name: dataSideBar.name,
                            lastName: dataSideBar.lastName,
                            phone: dataSideBar.phone,
                            email: dataSideBar.email
                        }
                        :
                        {
                            name: dataSideBar.name,
                            phone: dataSideBar.phone,
                            email: dataSideBar.email,
                            city: dataSideBar.city,
                            street: dataSideBar.street,
                            number: dataSideBar.number
                        }
                }
                isOpen={isModalOpen}
                disabledButtons={isLoading}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => updateData(data)}
            />
        </div>
    );
}

export default SideBar;
