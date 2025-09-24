import { Company } from "../../../../../types";

interface Props {
    data: Company
}

const AnticipationsSettings: React.FC<Props> = ({ data }) => {
    return (
        <div>
            <h2>Anticipación de reserva y cancelación</h2>
            <p>Puedes configurar el tiempo de anticipación de cancelación y reservas de turnos.</p>
        </div>
    );
}

export default AnticipationsSettings;
