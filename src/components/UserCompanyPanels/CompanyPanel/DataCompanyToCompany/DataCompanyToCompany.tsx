import "./DataCompanyToCompany.css"
import DataCompany from "../../DataCompany/DataCompany";
import { Appointment, type Company } from "../../../../types";

interface Props {
    dataCompany: Company;
    servicesLength: number
    scheduledAppointments: Appointment[]
}

const DataCompanyToCompany: React.FC<Props> = ({ dataCompany, servicesLength, scheduledAppointments }) => {
    return (
        <>
            <DataCompany
                dataCompany={dataCompany}
                scheduledAppointments={scheduledAppointments}
                servicesLenght={servicesLength}
            >
                <p className="planBadge">
                    <span role="img" aria-label="plan">📝</span> Plan <span className="planName">{dataCompany.plan === "individual" ? "Individual" : dataCompany.plan === "individual_plus" ? "Individual Plus" : "Equipo"}</span>
                </p>
            </DataCompany>
        </>
    );
}

export default DataCompanyToCompany;
