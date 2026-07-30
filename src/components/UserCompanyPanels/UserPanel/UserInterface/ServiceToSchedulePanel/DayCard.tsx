import "./DayCard.css"

interface DayCardProps {
    dayName: string
    dayNameShort: string
    dayNumber: number
    month: string
    availableSlots: number
    isSelected: boolean
    onClick: () => void
}

const DayCard: React.FC<DayCardProps> = ({
    dayName,
    dayNameShort,
    dayNumber,
    month,
    availableSlots,
    isSelected,
    onClick
}) => {
    const isEmpty = availableSlots === 0

    return (
        <button
            type="button"
            className={`dayCard ${isSelected ? "selected" : ""} ${isEmpty ? "is-empty" : ""}`}
            onClick={onClick}
            aria-pressed={isSelected}
        >
            <div className="dayCardHeader">
                <span className="dayName dayName--full">{dayName}</span>
                <span className="dayName dayName--short">{dayNameShort}</span>
                <span className="dayNumber">{dayNumber}</span>
            </div>
            <div className="dayCardMonth">{month}</div>
            <div className="dayCardSlots">
                {isEmpty ? (
                    <span className="slotsEmpty">Sin turnos</span>
                ) : (
                    <>
                        <span className="slotsCount">{availableSlots}</span>
                        <span className="slotsLabel">
                            {availableSlots === 1 ? "turno" : "turnos"}
                        </span>
                    </>
                )}
            </div>
        </button>
    )
}

export default DayCard
