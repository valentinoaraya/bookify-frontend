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
        <div
            className={`timeSlotCard animation-section ${isAvailable ? 'available' : 'unavailable'}`}
            onClick={isAvailable ? onClick : undefined}
        >
            <div className="timeSlotTime">{time}</div>
            <div className="timeSlotAvailability">
                {isAvailable ? (
                    <>
                        <span className="availablePlaces">{availablePlaces}</span>
                        <span className="availabilityLabel">
                            {availablePlaces === 1 ? 'lugar' : 'lugares'} disponibles
                        </span>
                        <span className="totalCapacity">de {totalCapacity}</span>
                    </>
                ) : (
                    <span className="unavailableText">Completo</span>
                )}
            </div>
        </div>
    )
}

export default TimeSlotCard
