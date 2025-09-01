import DataCompany from "../../DataCompany/DataCompany";
import { useState } from "react";
import { Appointment, type Company } from "../../../../types";
import { BACKEND_API_URL } from "../../../../config";
import { useFetchData } from "../../../../hooks/useFetchData";
import { notifySuccess, notifyError } from "../../../../utils/notifications";
import { confirmDelete } from "../../../../utils/alerts";
import Button from "../../../../common/Button/Button";
import { CloseIcon, PencilIcon, NewWindowIcon } from "../../../../common/Icons/Icons";
import ModalForm from "../../../ModalForm/ModalForm";

interface Props {
    dataCompany: Company;
    servicesLength: number
    scheduledAppointments: Appointment[]
}

const DataCompanyToCompany: React.FC<Props> = ({ dataCompany, servicesLength, scheduledAppointments }) => {

    const token = localStorage.getItem("access_token")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newData, setNewData] = useState<Company>(dataCompany)
    const { isLoading: isLoadingUpdate, error: errorUpdate, fetchData: fetchDataUpdate } = useFetchData(
        `${BACKEND_API_URL}/companies/update-company`,
        "PUT",
        token
    )
    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/mercadopago/oauth/generate-url/${dataCompany._id}`,
        "GET",
        token
    )

    const handleLogout = async () => {
        localStorage.removeItem("access_token")
        window.location.href = "/"
    }

    if (error) notifyError("Error en el servidor. Inténtalo de nuevo más tarde.")
    if (errorUpdate) notifyError("Error al actualizar los datos. Inténtalo de nuevo más tarde.")

    const vinculateMP = async () => {
        const confirm = await confirmDelete({
            question: "Al vincular con Mercado Pago...",
            mesasge: "Al vincular con Mercado Pago podrás cobrar señas a tus clientes directamente en tu cuenta de Mercado Pago.",
            cancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar"
        })

        if (confirm) {
            const response = await fetchData(null)
            if (response.url) window.location.href = response.url
            if (response.error) notifyError("Error al obtener URL.")
        }
    }

    const updateData = async (data: { [key: string]: any }) => {
        const response = await fetchDataUpdate(data)
        setIsModalOpen(false)
        if (response?.data) {
            setNewData({ ...dataCompany, ...response.data })
            notifySuccess("Datos actualizados")
        }
        if (response?.error) notifyError("Error al actualizar los datos")
    }

    return (
        <>
            <DataCompany
                dataCompany={newData}
                scheduledAppointments={scheduledAppointments}
                servicesLenght={servicesLength}
            >
                {
                    !dataCompany.connectedWithMP &&
                    <div className="divGenerateURL">
                        <p className="parrafVinculate">Vinculate con <span>Mercado Pago</span> para poder cobrar señas de turnos: </p>
                        <Button
                            fontSize={window.innerWidth <= 480 ? ".8rem" : "1rem"}
                            padding=".8rem .8rem"
                            width="100%"
                            margin=".5rem 0 0 0"
                            disabled={isLoading}
                            iconSVG={
                                <NewWindowIcon
                                    width="16px"
                                    height="16px"
                                    fill="white"
                                />
                            }
                            onSubmit={vinculateMP}
                        >
                            Vincular Mercado Pago
                        </Button>
                    </div>
                }
                <div className="configurationsContainer">
                    <div
                        className="divIconParrafContainer"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <PencilIcon
                            width="12"
                            height="12"
                            fill="#1282A2"
                        />
                        <p className="parrafConfig">Editar datos</p>
                    </div>
                    <div
                        className="divIconParrafContainer"
                        onClick={handleLogout}
                    >
                        <CloseIcon
                            width="12"
                            height="12"
                            fill="#1282A2"
                        />
                        <p className="parrafConfig">Cerrar sesión</p>
                    </div>
                </div>
            </DataCompany>
            <ModalForm
                title="Editar datos"
                inputs={
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
                    {
                        name: newData.name,
                        phone: newData.phone,
                        email: newData.email,
                        city: newData.city,
                        street: newData.street,
                        number: newData.number
                    }
                }
                isOpen={isModalOpen}
                disabledButtons={isLoadingUpdate}
                onClose={() => setIsModalOpen(false)}
                onSubmitForm={(data) => updateData(data)}
            />
        </>
    );
}

export default DataCompanyToCompany;
