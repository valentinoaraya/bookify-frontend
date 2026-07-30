import Button from "../../../../../common/Button/Button"
import LabelInputComponent from "../../../../LoginRegisterForms/LabelInputComponent/LabelInputComponent"
import { changeSubscriptionPlan } from "@/shared/api/subscriptions"
import React, { useState } from "react"
import { useDataForm } from "../../../../../hooks/useDataForm"
import { notifyError } from "../../../../../utils/notifications"
import { Company } from "../../../../../types"
import { plans } from "../../../../../utils/plans"
import { confirmDelete } from "../../../../../utils/alerts"
import { useNavigate } from "react-router-dom"
import ModalShell from "@/shared/ui/ModalShell"

interface Props {
    data: Company
    isModalPlansOpen: boolean
    setIsModalPlansOpen: React.Dispatch<React.SetStateAction<boolean>>
    selectedPlanId: string | null
}

const ModalPlans: React.FC<Props> = ({ data, isModalPlansOpen, setIsModalPlansOpen, selectedPlanId }) => {
    const [isLoading, setIsLoading] = useState(false)
    const { dataForm, handleChange, deleteData } = useDataForm({ payer_email: "" })
    const navigate = useNavigate()

    const handleCloseModal = () => {
        setIsModalPlansOpen(false)
        deleteData()
    }

    const handleSubmitEmail = async (e: React.FormEvent) => {
        e.preventDefault()

        const email = dataForm.payer_email as string

        if (!email || !email.includes("@")) {
            notifyError("Por favor, ingresa un email válido")
            return
        }

        if (!selectedPlanId) {
            notifyError("Error: No se seleccionó un plan")
            return
        }

        const planOrder = ["individual", "individual_plus", "team"]
        const currentIndex = planOrder.indexOf(data.subscription?.plan ?? "")
        const newIndex = planOrder.indexOf(selectedPlanId)

        if (newIndex === -1) {
            notifyError("Plan no válido")
            return
        }

        const changeType = newIndex > currentIndex ? "upgrade" : "downgrade"

        try {
            setIsLoading(true)
            const response = await changeSubscriptionPlan(
                changeType,
                data.subscription?.mpPreapprovalId ?? "",
                {
                    companyId: data._id,
                    newPlan: selectedPlanId,
                    payer_email: email
                }
            )

            if (response.error) {
                notifyError("No se pudo cambiar el plan: " + response.error)
                return
            }

            const payload = response.data?.data
            if (payload && typeof payload === "object" && payload.init_point) {
                window.location.href = payload.init_point;
            }

            if (payload === "Plan changed succesfully") {
                const decision = await confirmDelete({
                    question: "Cambio de plan realizado con éxito",
                    icon: "success",
                    cancelButton: false,
                    confirmButtonText: "Aceptar",
                    message: "Vuelve a iniciar sesión y verás los cambios reflejados."
                })

                if (decision) {
                    navigate("/")
                }
            }
        } catch (error) {
            notifyError("Ocurrió un error cambiando el plan")
        } finally {
            setIsLoading(false)
        }
    }

    const selectedPlan = plans.find(p => p.id === selectedPlanId)

    return (
        <ModalShell isOpen={isModalPlansOpen} overlayClassName="modalFormPlansOverlay" bodyClass="modal-plans-open">
            <div className="modalFormPlansContent">
                <button
                    className="modalFormPlansCloseButton"
                    onClick={handleCloseModal}
                    aria-label="Cerrar modal"
                >
                    X
                </button>
                <div className="modalFormPlansHeader">
                    <h2>🚀 Cambiar plan a <span className="spanFormPlans">{selectedPlanId === "individual_plus" ? "Individual Plus" : selectedPlanId === "individual" ? "Individual" : "Equipo"}</span></h2>
                    <p>Ingresa el email de la cuenta de Mercado Pago con la que vas a pagar para proceder con el cambio de plan</p>
                </div>
                <div className="divFeaturesPlan">
                    <ul className="ulFeaturesPlan">
                        {
                            selectedPlan?.features.map((f, i) => <li key={i} className="liFeaturesPlan"><span className="feature-checkmark">✓</span>{f}</li>)
                        }
                    </ul>
                </div>
                <form
                    className="modalFormPlansForm"
                    onSubmit={handleSubmitEmail}
                >
                    <LabelInputComponent
                        label="Email de Meracado Pago"
                        type="email"
                        name="payer_email"
                        placeholder="tu-mercadopago@email.com"
                        required={true}
                        value={dataForm.email}
                        onChange={handleChange}
                    />
                    <div className="modalFormPlansButtons">
                        <Button
                            type="submit"
                            loading={isLoading}
                        >
                            Continuar
                        </Button>
                        <Button
                            type="button"
                            variant="neutral"
                            onSubmit={handleCloseModal}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </ModalShell>
    );
}

export default ModalPlans;
