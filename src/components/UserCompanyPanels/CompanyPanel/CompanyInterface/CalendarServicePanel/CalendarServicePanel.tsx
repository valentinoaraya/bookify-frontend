import "./CalendarServicePanel.css"
import Title from "../../../../../common/Title/Title";
import { type Service } from "../../../../../types";

const CalendarServicePanel: React.FC<{ service: Service | null }> = ({ service }) => {
    return (
        <div className="calendarServiceContainer">
            <Title>
                Calendario para {service?.title}
            </Title>
        </div>
    );
}

export default CalendarServicePanel;
