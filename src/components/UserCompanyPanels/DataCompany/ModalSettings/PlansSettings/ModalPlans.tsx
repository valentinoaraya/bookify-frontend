import Button from "../../../../../common/Button/Button"
import LabelInputComponent from "../../../../LoginRegisterForms/LabelInputComponent/LabelInputComponent"
import { useAuthenticatedPost } from "../../../../../hooks/useAuthenticatedFetch"
import React, { useState, useEffect } from "react"
import { useDataForm } from "../../../../../hooks/useDataForm"
import { notifyError } from "../../../../../utils/notifications"
import { Company } from "../../../../../types"
import { BACKEND_API_URL } from "../../../../../config"
import { plans } from "../../../../../utils/plans"
import { confirmDelete } from "../../../../../utils/alerts"
import { useNavigate } from "react-router-dom"

interface Props {
    data: Company
    isModalPlansOpen: boolean
    setIsModalPlansOpen: React.Dispatch<React.SetStateAction<boolean>>
    selectedPlanId: string | null
}

const ModalPlans: React.FC<Props> = ({ data, isModalPlansOpen, setIsModalPlansOpen, selectedPlanId }) => {
    const { isLoading, error, post } = useAuthenticatedPost()
    const [shouldRenderPlans, setShouldRenderPlans] = useState(false)
    const [closingPlans, setClosingPlans] = useState(false)
    const { dataForm, handleChange, deleteData } = useDataForm({ payer_email: "" })
    const navigate = useNavigate()

    if (error) {
        notifyError("Error al cambiar de plan")
        console.log(error)
    }

    useEffect(() => {
        if (isModalPlansOpen) {
            setShouldRenderPlans(true)
            setClosingPlans(false)
            document.body.classList.add("modal-plans-open")
        } else {
            setClosingPlans(true)
            document.body.classList.remove("modal-plans-open")

            const timeout = setTimeout(() => {
                setShouldRenderPlans(false)
                setClosingPlans(false)
            }, 300)

            return () => clearTimeout(timeout)
        }
    }, [isModalPlansOpen])

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
        const currentIndex = planOrder.indexOf(data.suscription.plan)
        const newIndex = planOrder.indexOf(selectedPlanId)

        if (newIndex === -1) {
            notifyError("Plan no válido")
            return
        }

        const changeType = newIndex > currentIndex ? "upgrade" : "downgrade"

        try {
            const response = await post(
                `${BACKEND_API_URL}/suscriptions/${changeType}/${data.suscription.suscription_id}`,
                {
                    companyId: data._id,
                    newPlan: selectedPlanId,
                    payer_email: email
                },
                {
                    skipAuth: false
                }
            )

            if (response.error) {
                notifyError("No se pudo cambiar el plan: " + response.error)
                return
            }

            if (response.data && response.data.data.init_point) {
                window.location.href = response.data.data.init_point;
            }

            if (response.data && response.data.data === "Plan changed succesfully") {
                const decision = await confirmDelete({
                    question: "Cambio de plan realizado con éxito",
                    icon: "success",
                    cancelButton: false,
                    confirmButtonText: "Aceptar",
                    mesasge: "Vuelve a iniciar sesión y verás los cambios reflejados."
                })

                if (decision) {
                    navigate("/")
                }
            }
        } catch (error) {
            notifyError("Ocurrió un error cambiando el plan")
        }
    }

    if (!shouldRenderPlans) return null

    return (
        <div className={`modalFormPlansOverlay ${closingPlans ? "closing" : "opening"}`}>
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
                            plans.find(p => p.id === selectedPlanId)!.features.map((f, i) => <li key={i} className="liFeaturesPlan"><span className="feature-checkmark">✓</span>{f}</li>)
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
                            disabled={isLoading}
                        >
                            Continuar
                        </Button>
                        <Button
                            type="button"
                            backgroundColor="#f44336"
                            onSubmit={handleCloseModal}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalPlans;
