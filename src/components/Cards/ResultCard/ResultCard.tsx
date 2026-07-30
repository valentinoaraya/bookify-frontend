import "./ResultCard.css"
import { type AvailableAppointment, type CompanyToUser } from "../../../types";
import Button from "../../../common/Button/Button";
import { NewWindowIcon } from "../../../common/Icons/Icons";

interface Props {
    _id: string;
    company: CompanyToUser;
    availableAppointments: AvailableAppointment[];
    description: string;
    duration: number;
    price: number;
    title: string;
    signPrice: number;
    mode?: "in-person" | "online" | "in-person-at-home";
    setServiceToSchedule: React.Dispatch<React.SetStateAction<string | null>>
}

const modeLabel: Record<NonNullable<Props["mode"]>, string> = {
    "in-person": "Presencial",
    online: "Virtual",
    "in-person-at-home": "A domicilio",
}

const ResultCard: React.FC<Props> = ({
    _id, company, availableAppointments, description, duration, price, title, signPrice, mode, setServiceToSchedule
}) => {
    const quantityAvailable = availableAppointments.reduce((acc, appointment) => {
        return acc + appointment.capacity - appointment.taken;
    }, 0);

    const hasLocation = Boolean(
        company.city && company.street && company.number && mode === "in-person"
    )
    const resolvedMode = mode ?? "in-person"
    const isEmpty = quantityAvailable === 0

    const openMaps = () => {
        const location = `${company.street} ${company.number} ${company.city}`.replace(/ /g, "+")
        window.open(`https://www.google.com/maps/search/?api=1&query=${location}`, "_blank")
    }

    return (
        <article className={`resultCard ${isEmpty ? "is-empty" : ""}`}>
            <div className="resultCardMain">
                <div className="resultCardBody">
                    <div className="resultCardTitleRow">
                        <h3 className="resultCardTitle">{title}</h3>
                        <span className={`resultCardBadge ${isEmpty ? "is-unavailable" : "is-available"}`}>
                            {isEmpty ? "Sin turnos" : `${quantityAvailable} disponibles`}
                        </span>
                    </div>

                    {description && (
                        <p className="resultCardDescription">{description}</p>
                    )}

                    <p className="resultCardMeta">
                        <span className={`resultCardMode resultCardMode--${resolvedMode === "online" ? "online" : "presencial"}`}>
                            {modeLabel[resolvedMode]}
                        </span>
                        <span className="resultCardDot" aria-hidden="true">·</span>
                        <span>{duration} min</span>
                        <span className="resultCardDot" aria-hidden="true">·</span>
                        <span className="resultCardPrice">${price}</span>
                    </p>

                    <div className="resultCardExtras">
                        <span className="resultCardChip">
                            {signPrice !== 0 ? `Seña $${signPrice}` : "Sin seña"}
                        </span>
                        {hasLocation && (
                            <span className="resultCardChip resultCardChip--muted">
                                {company.city} · {company.street} {company.number}
                            </span>
                        )}
                    </div>
                </div>

                <div className="resultCardActions">
                    <Button
                        margin="0"
                        fontSize="0.92rem"
                        padding="0.55rem 1.1rem"
                        fontWeight="600"
                        width="auto"
                        variant="success"
                        disabled={isEmpty}
                        onSubmit={() => setServiceToSchedule(_id)}
                    >
                        {isEmpty ? "Sin turnos" : "Ver turnos"}
                    </Button>
                    {hasLocation && (
                        <Button
                            margin="0"
                            fontSize="0.88rem"
                            padding="0.45rem 0.95rem"
                            fontWeight="600"
                            width="auto"
                            variant="ghost"
                            onSubmit={openMaps}
                            iconSVG={
                                <NewWindowIcon
                                    width="14px"
                                    height="14px"
                                    fill="currentColor"
                                />
                            }
                        >
                            Ver mapa
                        </Button>
                    )}
                </div>
            </div>
        </article>
    );
}

export default ResultCard;
