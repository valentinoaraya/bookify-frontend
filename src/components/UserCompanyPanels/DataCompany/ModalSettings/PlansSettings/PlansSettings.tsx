import "./PlansSettings.css"
import { Company } from "../../../../../types"
import PlanCard from "../../../../LoginRegisterForms/PlanCard/PlanCard"
import Button from "../../../../../common/Button/Button"
import { UserXIcon } from "../../../../../common/Icons/Icons"
import { confirmDelete } from "../../../../../utils/alerts"
import { plans } from "../../../../../utils/plans"
import { useAuthenticatedDelete } from "../../../../../hooks/useAuthenticatedFetch"
import { notifyError } from "../../../../../utils/notifications"
import { BACKEND_API_URL } from "../../../../../config"
import LoadingModal from "../../../../../common/LoadingModal/LoadingModal"
import { useNavigate } from "react-router-dom"

interface Props {
    data: Company
    setIsModalPlansOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedPlanId: React.Dispatch<React.SetStateAction<string | null>>
}

const PlansSettings: React.FC<Props> = ({ data, setIsModalPlansOpen, setSelectedPlanId }) => {

    const { isLoading, error, delete: del } = useAuthenticatedDelete()
    const navigate = useNavigate()

    if (error) {
        notifyError("Error al cancelar suscripción")
        console.log(error)
    }

    const handleOpenModal = (planId: string) => {
        if (planId === data.suscription.plan) {
            return
        }
        setSelectedPlanId(planId)
        setIsModalPlansOpen(true)
    }

    const cancelSuscription = async () => {
        const desicion = await confirmDelete({
            question: "¿Seguro que quieres cancelar tu suscripción a Bookify?",
            mesasge: "Al cancelar tu suscripción, no podrás volver a crear una cuenta con el mismo email utilizado para esta.",
            icon: "warning",
            confirmButtonText: "Aceptar",
            cancelButton: true,
            cancelButtonText: "Cancelar"
        })

        if (desicion) {
            const url = `${BACKEND_API_URL}/suscriptions/cancel/${data.suscription.suscription_id}`
            const response = await del(url, { companyId: data._id }, { skipAuth: false })

            if (response.data && response.data.data === "Suscription cancelled") {
                const decision = await confirmDelete({
                    question: "Suscripción cancelada",
                    icon: "success",
                    cancelButton: false,
                    confirmButtonText: "Aceptar",
                    mesasge: "¡Gracias por confiar en nosotros!"
                })

                if (decision) {
                    navigate("/")
                }
            }
        }
    }

    return (
        <>
            <div className="plansSettings animation-section">
                <div className="header-settings">
                    <h2 className="titleSetting">Planes de Bookify</h2>
                    <p>Puedes cambiar de plan o cancelar tu suscripción cuando desees.</p>
                </div>
                <div className="plans-content">
                    {
                        plans.map(p => {
                            return <PlanCard
                                key={p.id}
                                planName={p.name}
                                features={p.features}
                                price={p.price}
                                isSelected={p.id === data.suscription.plan}
                                onClick={() => handleOpenModal(p.id)}
                                isComingSoon={p.id === "team"}
                                isSettings
                            />
                        })
                    }
                </div>
                <div className="plans-actions">
                    <Button
                        backgroundColor="#E74C3C"
                        width="auto"
                        margin="0"
                        fontSize="1rem"
                        padding=".5rem 1rem"
                        fontWeight="600"
                        iconSVG={
                            <UserXIcon
                                width="18"
                                height="18"
                                fill="white"
                            />
                        }
                        onSubmit={cancelSuscription}
                    >
                        Cancelar suscripción
                    </Button>
                </div>
            </div>
            <LoadingModal
                text="Cancelando suscripción..."
                isOpen={isLoading}
            />
        </>
    )
}

export default PlansSettings;
