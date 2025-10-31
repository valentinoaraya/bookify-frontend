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
                <p
                    style={{
                        background: "linear-gradient(90deg, #7b2ff2, #1e90ff)",
                        color: "#fff",
                        padding: "0.4rem 1rem",
                        borderRadius: "5px",
                        display: "inline-block",
                        fontWeight: 600,
                        fontSize: "1rem",
                        margin: "0.5rem 0 0 0",
                        boxShadow: "0 1px 3px rgba(60,98,85,0.09)"
                    }}
                >
                    <span role="img" aria-label="plan">📝</span> Plan <span>{dataCompany.plan === "individual" ? "Individual" : dataCompany.plan === "individual_plus" ? "Individual Plus" : "Equipo"}</span>
                </p>
            </DataCompany>
        </>
    );
}

export default DataCompanyToCompany;
