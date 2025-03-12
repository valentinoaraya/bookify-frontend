import "./ResultCard.css"
import { type Company, type ServiceToSchedule } from "../../../types";
import Button from "../../../common/Button/Button";

interface Props {
    _id: string;
    company: Omit<Company, "type" | "services" | "scheduledAppointments">;
    availableAppointments: string[];
    scheduledAppointments: string[];
    description: string;
    duration: number;
    price: number;
    title: string;
    signPrice: number;
    setServiceToSchedule: React.Dispatch<React.SetStateAction<ServiceToSchedule | null>>
}

const ResultCard: React.FC<Props> = ({
    _id, company, availableAppointments, description, duration, price, title, signPrice, scheduledAppointments, setServiceToSchedule
}) => {

    return (
        <div className="divResultCard">
            <h2 className="titleResultCard">{title}</h2>
            <p className="parrafCompanyName"><span>En {company.name}</span></p>
            <p className="parrafDescription">{description}</p>
            <div className="divDataContainer">
                <p className="parrafDataCompany"><span>Ciudad:</span> {company.city}</p>
                <p className="parrafDataCompany"><span>Ubicación:</span>  {company.street} {company.number}</p>
                <p className="parrafDataCompany"><span>Duración:</span> {duration} mins</p>
                <p className="parrafDataCompany"><span>Precio: </span> ${price}</p>
                {signPrice !== 0 ? <p className="parrafDataCompany"><span>Precio de la seña:</span> ${signPrice}</p> : <p className="parrafDataCompany"><span>Sin seña</span></p>}
            </div>
            <Button
                onSubmit={() => setServiceToSchedule({ _id, availableAppointments, title, companyId: company._id, scheduledAppointments, price, signPrice })}
                fontSize={window.innerWidth <= 930 ? "1rem" : "1.2rem"}
                padding=".8rem"
            >
                Ver turnos disponibles
            </Button>
        </div>
    );
}

export default ResultCard;
