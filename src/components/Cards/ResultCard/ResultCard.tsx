import "./ResultCard.css"
import { type AvailableAppointment, type CompanyToUser } from "../../../types";
import Button from "../../../common/Button/Button";
import { NewWindowIcon, ClockIcon } from "../../../common/Icons/Icons";

interface Props {
    _id: string;
    company: CompanyToUser;
    availableAppointments: AvailableAppointment[];
    description: string;
    duration: number;
    price: number;
    title: string;
    signPrice: number;
    setServiceToSchedule: React.Dispatch<React.SetStateAction<string | null>>
}

const ResultCard: React.FC<Props> = ({
    _id, company, availableAppointments, description, duration, price, title, signPrice, setServiceToSchedule
}) => {

    const quantityAvailable = availableAppointments.reduce((acc, appointment) => {
        return acc + appointment.capacity - appointment.taken;
    }, 0);

    return (
        <div className="divResultCard">
            <div className="titleResultCardContainer">
                <h2 className="titleResultCard">{title}</h2>
                {availableAppointments.length === 0 ?
                    <span className="spanResultCard noAvailables">0 disponibles</span>
                    :
                    <span className="spanResultCard availables">{quantityAvailable} disponibles</span>
                }
            </div>
            <div className="divDescriptionAndButtonsContainer">
                <div className="divDescriptionContainer">
                    <div>
                        <p className="parrafCompanyName"><span>En {company.name}</span></p>
                        <p className="parrafDescription">{description}</p>

                    </div>
                    <div className="durationPriceContainerResultCard">
                        <p className="parrafPriceResultCard"><span className="spanPriceResultCard">$</span> {price}</p>
                        <div className="divDurationResultCard">
                            <ClockIcon
                                width="18px"
                                height="18px"
                                fill="grey"
                            />
                            <p className="parrafDurationResultCard">{duration} mins</p>
                        </div>
                    </div>
                </div>
                <div className="divDataContainer">
                    <p className="parrafDataCompany"><span>Ciudad:</span> {company.city}</p>
                    <p className="parrafDataCompany"><span>Ubicación:</span>  {company.street} {company.number}</p>
                    {signPrice !== 0 ? <p className="parrafDataCompany withSignPrice"><span>Precio de la seña: $ {signPrice}</span></p> : <p className="parrafDataCompany withSignPrice"><span>Sin seña</span></p>}
                </div>
                <div>
                    <Button
                        margin="0"
                        onSubmit={() => setServiceToSchedule(_id)}
                        fontSize='1rem'
                        padding=".8rem"
                        backgroundColor="#4CAF50"
                    >
                        Ver turnos disponibles
                    </Button>
                    <Button
                        margin=".5rem 0 0 0"
                        fontSize='1rem'
                        padding=".8rem"
                        backgroundColor="#1282A2"
                        onSubmit={() => {
                            const location = `${company.street} ${company.number} ${company.city}`.replace(/ /g, "+")
                            window.open(`https://www.google.com/maps/search/?api=1&query=${location}`, '_blank')
                        }}
                        iconSVG={
                            <NewWindowIcon
                                width="14px"
                                height="14px"
                                fill="white"
                            />
                        }
                    >
                        Ver ubicación
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ResultCard;
