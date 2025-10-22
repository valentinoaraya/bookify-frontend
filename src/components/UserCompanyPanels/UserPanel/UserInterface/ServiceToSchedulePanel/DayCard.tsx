import "./DayCard.css"

interface DayCardProps {
    dayName: string
    dayNumber: number
    month: string
    availableSlots: number
    isSelected: boolean
    onClick: () => void
}

const DayCard: React.FC<DayCardProps> = ({
    dayName,
    dayNumber,
    month,
    availableSlots,
    isSelected,
    onClick
}) => {
    return (
        <div
            className={`dayCard ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="dayCardHeader">
                <span className="dayName">{dayName}</span>
                <span className="dayNumber">{dayNumber}</span>
            </div>
            <div className="dayCardMonth">{month}</div>
            <div className="dayCardSlots">
                <span className="slotsCount">{availableSlots}</span>
                <span className="slotsLabel">
                    {availableSlots === 1 ? 'turno' : 'turnos'}
                </span>
            </div>
        </div>
    )
}

export default DayCard
