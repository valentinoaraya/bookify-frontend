import "./PlansSettings.css"
import { Company } from "../../../../../types"
import PlanCard from "../../../../LoginRegisterForms/PlanCard/PlanCard"
import Button from "../../../../../common/Button/Button"
import { UserXIcon } from "../../../../../common/Icons/Icons"
import { confirmDelete } from "../../../../../utils/alerts"

interface Props {
    data: Company
}

const PlansSettings: React.FC<Props> = ({ data }) => {

    const plans = [
        {
            id: "individual",
            name: "Individual",
            price: "$12.000",
            available: true,
            features: [
                "1 profesional",
                "Hasta 5 servicios",
                "Recordatorios y emails automáticos",
                "Pagos online con Mercado Pago",
                "Rembolsos automáticos",
                "Historial completo de movimientos",
                "Soporte por correo"
            ]
        },
        {
            id: "individual_plus",
            name: "Individual Plus",
            price: "$18.000",
            available: true,
            features: [
                "Incluye Plan Individual",
                "Servicios personalizados e ilimitados",
                "Métricas de rendimiento (ingresos, asistencias, etc.)",
                "Soporte prioritario"
            ]
        },
        {
            id: "teams",
            name: "Equipo",
            price: "$35.000",
            available: false,
            features: [
                "Incluye Plan Individual Plus por profesional",
                "Hasta 5 profesionales",
                "Dashborard administrativo",
                "Gestión de agendas separadas",
                "Historial completo de movimientos por profesional",
                "Historial centralizado de clientes",
                "+ Profesionales adicionales: $5.000 / mes cada profesional",
            ],
        }
    ]

    const alertWorking = async () => {
        return await confirmDelete({
            question: "Estamos trabajando en esta sección...",
            mesasge: "Si quieres cambiar de plan o cancelarlo, comunícate con el soporte: aedestechnologies@gmail.com",
            icon: "info",
            confirmButtonText: "Aceptar",
            cancelButton: false
        })
    }

    return (
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
                            onClick={alertWorking}
                            isComingSoon={p.id === "teams"}
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
                    onSubmit={alertWorking}
                >
                    Cancelar suscripción
                </Button>
            </div>
        </div>
    )
}

export default PlansSettings;
