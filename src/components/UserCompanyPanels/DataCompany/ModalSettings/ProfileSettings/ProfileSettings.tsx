import "./ProfileSettings.css"
import { Company } from "../../../../../types";
import { useDataForm } from "../../../../../hooks/useDataForm";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { ClipboardIcon, MemoryIcon, UserXIcon } from "../../../../../common/Icons/Icons";
import Button from "../../../../../common/Button/Button";
import { BACKEND_API_URL } from "../../../../../config";
import { useFetchData } from "../../../../../hooks/useFetchData";
import { useCompany } from "../../../../../hooks/useCompany";
import { useEffect, useState } from "react";

interface Props {
    data: Company
}

const ProfileSettings: React.FC<Props> = ({ data }) => {
    const { updateCompanyData } = useCompany()
    const token = localStorage.getItem("access_token")
    const [isDisabled, setIsDisabled] = useState(true)
    const { dataForm, handleChange } = useDataForm({
        name: data.name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        street: data.street,
        number: data.number,
        company_id: data.company_id
    })

    const { isLoading, error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/companies/update-company`,
        "PUT",
        token
    )

    if (error) notifyError("Error al actualizar los datos. Inténtalo de nuevo más tarde.")

    useEffect(() => {
        const checkData = () => {
            if (JSON.stringify({
                name: data.name,
                phone: data.phone,
                email: data.email,
                city: data.city,
                street: data.street,
                number: data.number,
                company_id: data.company_id
            }) === JSON.stringify(dataForm)) {
                setIsDisabled(true)
                return
            }
            setIsDisabled(false)
        }

        checkData()
    }, [dataForm])

    const updateData = async () => {
        if (JSON.stringify({
            name: data.name,
            phone: data.phone,
            email: data.email,
            city: data.city,
            street: data.street,
            number: data.number,
            company_id: data.company_id
        }) === JSON.stringify({
            name: (dataForm["name"] as string).trim(),
            phone: (dataForm["phone"] as string).trim(),
            email: (dataForm["email"] as string).trim(),
            city: (dataForm["city"] as string).trim(),
            street: (dataForm["street"] as string).trim(),
            number: dataForm["number"],
            company_id: (dataForm["company_id"] as string).trim()
        })) {
            notifyError("No hay cambios para guardar")
            return
        }

        if ((dataForm["name"] as string).trim() === "" ||
            (dataForm["phone"] as string).trim() === "" ||
            (dataForm["email"] as string).trim() === "" ||
            (dataForm["city"] as string).trim() === "" ||
            (dataForm["street"] as string).trim() === "" ||
            (dataForm["company_id"] as string).trim() === "" ||
            !dataForm["number"]
        ) {
            notifyError("Por favor, completa todos los campos")
            return
        }

        const response = await fetchData(dataForm)
        if (response?.data) {
            updateCompanyData(response.data)
            notifySuccess("Datos actualizados")
        }
        if (response?.error) notifySuccess("Error al actualizar los datos")
    }

    const handleLogout = async () => {
        localStorage.removeItem("access_token")
        window.location.href = "/"
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`https://bookify-aedes.vercel.app/company/${data.company_id}`);
        notifySuccess("¡Link copiado!")
    }

    return (
        <div>
            <div className="header-settings">
                <h2 className="titleSetting">Perfil de tu empresa</h2>
                <p>Edita los datos de contacto y ubicación de tu empresa.</p>
            </div>
            <div className="profile-settings">
                <div className="link-for-clients">
                    <h3>Link para tus clientes:</h3>
                    <div className="link-copy-container">
                        <label className="label-link">https://bookify-aedes.vercel.app/company/</label>
                        <input
                            className="input-link"
                            name="company_id"
                            required
                            type="text"
                            value={dataForm["company_id"]}
                            onChange={handleChange}
                        />
                        <button
                            className="button-copy"
                            onClick={copyToClipboard}
                        >
                            <ClipboardIcon
                                width="16"
                                height="16"
                                fill="#ffffff"
                            />
                            Copiar
                        </button>
                    </div>
                    <p>Con este link tus clientes podrán acceder a tus servicios y sacar turnos.</p>
                </div>
                <form>
                    <div className="profile-settings-item">
                        <label>Nombre:</label>
                        <input
                            name="name"
                            required
                            onChange={handleChange}
                            type="text"
                            value={dataForm["name"]}
                        />
                    </div>
                    <div className="profile-settings-item">
                        <label>Teléfono:</label>
                        <input
                            name="phone"
                            required
                            onChange={handleChange}
                            type="text"
                            value={dataForm["phone"]}
                        />
                    </div>
                    <div className="profile-settings-item">
                        <label>Email:</label>
                        <input
                            name="email"
                            required
                            onChange={handleChange}
                            type="email"
                            value={dataForm["email"]}
                        />
                    </div>
                    <div className="profile-settings-item">
                        <label>Ciudad:</label>
                        <input
                            name="city"
                            required
                            onChange={handleChange}
                            type="text"
                            value={dataForm["city"]}
                        />
                    </div>
                    <div className="profile-settings-item">
                        <label>Calle:</label>
                        <input
                            name="street"
                            required
                            onChange={handleChange}
                            type="text"
                            value={dataForm["street"]}
                        />
                    </div>
                    <div className="profile-settings-item">
                        <label>Número de calle:</label>
                        <input
                            name="number"
                            required
                            onChange={handleChange}
                            type="number"
                            value={dataForm["number"]}
                        />
                    </div>
                </form>
            </div>
            <div className="buttons-profile-settings">
                <Button
                    backgroundColor="#E74C3C"
                    width="auto"
                    margin="0"
                    fontSize="1rem"
                    padding=".5rem 1rem"
                    onSubmit={handleLogout}
                    iconSVG={
                        <UserXIcon
                            width="16px"
                            height="16px"
                            fill="white"
                        />
                    }
                >
                    Cerrar sesión
                </Button>
                <Button
                    backgroundColor={isDisabled ? "grey" : "green"}
                    width="auto"
                    margin="0"
                    fontSize="1rem"
                    padding=".5rem 1rem"
                    onSubmit={updateData}
                    disabled={isLoading}
                    cursor={isDisabled ? "default" : "pointer"}
                    iconSVG={
                        <MemoryIcon
                            width="16px"
                            height="16px"
                            fill="white"
                        />
                    }
                >
                    Guardar cambios
                </Button>
            </div>
        </div>
    );
}

export default ProfileSettings;
