import "./PlansSettings.css"
import { Company } from "../../../../../types"
import PlanCard from "../../../../LoginRegisterForms/PlanCard/PlanCard"
import Button from "../../../../../common/Button/Button"
import { UserXIcon } from "../../../../../common/Icons/Icons"
import { confirmDelete } from "../../../../../utils/alerts"
import { plans } from "../../../../../utils/plans"
import { cancelSubscription } from "@/shared/api/subscriptions"
import LoadingModal from "../../../../../common/LoadingModal/LoadingModal"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

interface Props {
    data: Company
    setIsModalPlansOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedPlanId: React.Dispatch<React.SetStateAction<string | null>>
}

const PlansSettings: React.FC<Props> = ({ data, setIsModalPlansOpen, setSelectedPlanId }) => {

    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleOpenModal = (planId: string) => {
        if (planId === data.subscription?.plan) {
            return
        }
        setSelectedPlanId(planId)
        setIsModalPlansOpen(true)
    }

    const cancelSuscription = async () => {
        const desicion = await confirmDelete({
            question: "¿Seguro que quieres cancelar tu suscripción a Bookify?",
            message: "Al cancelar tu suscripción, no podrás volver a crear una cuenta con el mismo email utilizado para esta.",
            icon: "warning",
            confirmButtonText: "Aceptar",
            cancelButton: true,
            cancelButtonText: "Cancelar"
        })

        if (desicion) {
            setIsLoading(true)
            try {
                const response = await cancelSubscription(
                    data.subscription?.mpPreapprovalId ?? "",
                    { companyId: data._id }
                )

                if (response.data && response.data.data === "Suscription cancelled") {
                    const decision = await confirmDelete({
                        question: "Suscripción cancelada",
                        icon: "success",
                        cancelButton: false,
                        confirmButtonText: "Aceptar",
                        message: "¡Gracias por confiar en nosotros!"
                    })

                    if (decision) {
                        navigate("/")
                    }
                }
            } finally {
                setIsLoading(false)
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
                                isSelected={p.id === data.subscription?.plan}
                                onClick={() => handleOpenModal(p.id)}
                                isComingSoon={p.id === "team"}
                                isSettings
                            />
                        })
                    }
                </div>
                <div className="plans-actions">
                    <Button
                        variant="danger-ghost"
                        width="auto"
                        margin="0"
                        fontSize="1rem"
                        padding=".5rem 1rem"
                        fontWeight="600"
                        iconSVG={
                            <UserXIcon
                                width="18"
                                height="18"
                                fill="currentColor"
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
