import { type Company, type User, type View } from "../../../types";
import "./SideBar.css"
import Title from "../../../common/Title/Title";
import Button from "../../../common/Button/Button";
import { UserIcon, CompanyIcon, PencilIcon, CloseIcon } from "../../../common/Icons/Icons";
import ModalForm from "../../ModalForm/ModalForm";
import { useState } from "react";
import { useFetchData } from "../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../config";
import { notifyError, notifySuccess } from "../../../utils/notifications";

interface Props {
    data: User | Company;
    onViewChange?: (view: View) => void;
    onBack?: () => void;
    mobile?: boolean,
    setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
    isOpen?: boolean;
}

const SideBar: React.FC<Props> = ({ data, onViewChange, onBack, mobile, setIsOpen, isOpen }) => {
    const token = localStorage.getItem("access_token")
    const [dataSideBar, setDataSideBar] = useState<User | Company>(data)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/${data.type === "user" ? "users" : "companies"}/update-${data.type}`,
        "PUT",
        token
    )

    if (error) {
        console.error(error)
        notifyError("Error del servidor: Inténtalo de nuevo más tarde")
    }

    const updateData = async (data: { [key: string]: any }) => {
        const response = await fetchData(data)
        setIsModalOpen(false)
        if (response?.data) {
            setDataSideBar(response.data)
            notifySuccess("Datos actualizados")
        }
        if (response?.error) notifyError("Error al actualizar los datos")
    }

    const handleLogout = async () => {
        localStorage.removeItem("access_token")
        window.location.href = "/"
    }

    return (
        <div className={`sideBar ${isOpen ? "open" : ""}`}>
            {
                mobile ?
                    <div className="closeButton"
                        onClick={() => setIsOpen?.(false)}
                    >
                        <CloseIcon
                            width="32"
                            height="32"
                            fill="#457B9D"
                        />
                    </div>
                    :
                    <div
                        onClick={() => {
                            data.type === "company" ? onViewChange?.("appointments") : onBack?.()
                        }}
                    >
                        <Title cursorPointer fontSize="3.2rem">Bookify</Title>
                    </div>
            }
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
                        fontWeight={window.innerWidth <= 930 ? "500" : "700"}
                        padding={window.innerWidth <= 930 ? ".8rem" : ""}
                    >
                        Próximos turnos
                    </Button>
                    <Button
                        onSubmit={() => { onViewChange?.("services") }}
                        fontWeight={window.innerWidth <= 930 ? "500" : "700"}
                        padding={window.innerWidth <= 930 ? ".8rem" : ""}
                    >
                        Mis servicios
                    </Button>
                </div>
            }
            <div className="divConfigurations">
                <div
                    className="divIconParrafContainer"
                    onClick={() => setIsModalOpen(true)}
                >
                    <PencilIcon
                        width="16"
                        height="16"
                        fill="black"
                    />
                    <p className="parrafConfig">Editar datos</p>
                </div>
                <div
                    className="divIconParrafContainer"
                    onClick={handleLogout}
                >
                    <CloseIcon
                        width="16"
                        height="16"
                        fill="black"
                    />
                    <p className="parrafConfig">Cerrar sesión</p>
                </div>
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
                            { type: "text", name: "city", placeholder: "Ciudad", label: "Ciudad" },
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
