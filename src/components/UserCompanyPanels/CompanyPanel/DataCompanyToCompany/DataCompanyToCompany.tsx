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
            </DataCompany>
        </>
    );
}

export default DataCompanyToCompany;
