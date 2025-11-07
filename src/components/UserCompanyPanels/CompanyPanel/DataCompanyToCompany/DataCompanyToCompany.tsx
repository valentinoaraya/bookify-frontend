import "./DataCompanyToCompany.css"
import DataCompany from "../../DataCompany/DataCompany";
import { Appointment, type Company } from "../../../../types";
import { useState } from "react";

interface Props {
    dataCompany: Company;
    servicesLength: number
    scheduledAppointments: Appointment[]
}

const DataCompanyToCompany: React.FC<Props> = ({ dataCompany, servicesLength, scheduledAppointments }) => {

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [active, setActive] = useState<string>("")

    return (
        <>
            <DataCompany
                dataCompany={dataCompany}
                scheduledAppointments={scheduledAppointments}
                servicesLenght={servicesLength}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                active={active}
                setActive={setActive}
            >
                <p className="planBadge" onClick={() => {
                    setActive("plans")
                    setIsModalOpen(true)
                }}>
                    <span role="img" aria-label="plan">🚀</span> Plan <span className="planName">{dataCompany.plan === "individual" ? "Individual" : dataCompany.plan === "individual_plus" ? "Individual Plus" : "Equipo"}</span>
                </p>
            </DataCompany>
        </>
    );
}

export default DataCompanyToCompany;
