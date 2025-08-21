import { type Service, type CompanyToUser } from "../../../../../types";
import ResultCard from "../../../../Cards/ResultCard/ResultCard";
import "./ResultsPanel.css"

interface Props {
    results: Service[] | null
    setServiceToSchedule: React.Dispatch<React.SetStateAction<string | null>>
    company: CompanyToUser
}

const ResultsPanel: React.FC<Props> = ({ results, setServiceToSchedule, company }) => {
    return (
        <>
            {
                results?.length === 0 ?
                    <div className="noServicesAppointmentsUser">
                        <h3>No se encontraron resultados</h3>
                    </div>
                    :
                    <div className="resultCardsContainer divListContainerResultsPanel">
                        {
                            results?.map(service => {
                                return <ResultCard
                                    key={service._id}
                                    _id={service._id}
                                    company={company}
                                    capacityPerShift={service.capacityPerShift}
                                    availableAppointments={service.availableAppointments}
                                    scheduledAppointments={service.scheduledAppointments}
                                    description={service.description}
                                    duration={service.duration}
                                    price={service.price}
                                    title={service.title}
                                    signPrice={service.signPrice}
                                    setServiceToSchedule={setServiceToSchedule}
                                />
                            })
                        }
                    </div>
            }
        </>
    );
}

export default ResultsPanel;
