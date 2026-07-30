import "./TimeSlotCard.css"

interface TimeSlotCardProps {
    time: string
    availablePlaces: number
    totalCapacity: number
    isAvailable: boolean
    onClick: () => void
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
    time,
    availablePlaces,
    totalCapacity,
    isAvailable,
    onClick
}) => {
    return (
        <button
            type="button"
            className={`timeSlotCard ${isAvailable ? "available" : "unavailable"}`}
            onClick={isAvailable ? onClick : undefined}
            disabled={!isAvailable}
            aria-label={
                isAvailable
                    ? `Reservar ${time}, ${availablePlaces} de ${totalCapacity} lugares`
                    : `Horario ${time} no disponible`
            }
        >
            <span className="timeSlotTime">{time}</span>
            <span className="timeSlotAvailability">
                {isAvailable ? (
                    <>
                        <span className="availablePlaces">{availablePlaces}/{totalCapacity}</span>
                        <span className="availabilityLabel">
                            {availablePlaces === 1 ? "lugar" : "lugares"}
                        </span>
                    </>
                ) : (
                    <span className="unavailableText">
                        {availablePlaces === 0 ? "Completo" : "Pasado"}
                    </span>
                )}
            </span>
        </button>
    )
}

export default TimeSlotCard
