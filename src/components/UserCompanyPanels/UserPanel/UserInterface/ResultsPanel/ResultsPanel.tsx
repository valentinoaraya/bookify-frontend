import { type Service, type Company, type ServiceToSchedule } from "../../../../../types";
import ResultCard from "../../../../Cards/ResultCard/ResultCard";
import "./ResultsPanel.css"

interface Props {
    results: Service[] | null
    setServiceToSchedule: React.Dispatch<React.SetStateAction<ServiceToSchedule | null>>
}

const ResultsPanel: React.FC<Props> = ({ results, setServiceToSchedule }) => {

    return (
        <>
            {
                results?.length === 0 ?
                    <div className="noServicesAppointmentsUser">
                        <h3>No se encontraron resultados</h3>
                    </div>
                    :
                    <div className={`resultCardsContainer ${results?.length === 1 ? "oneCard" : "divListContainer"}`}>
                        {
                            results?.map(service => {
                                return <ResultCard
                                    key={service._id}
                                    _id={service._id}
                                    company={service.companyId as unknown as Omit<Company, "type" | "services" | "scheduledAppointments">}
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
