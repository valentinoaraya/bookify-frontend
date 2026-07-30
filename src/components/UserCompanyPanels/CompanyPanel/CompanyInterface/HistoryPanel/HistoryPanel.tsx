import { DatePicker, Select, Input, Card, Empty, Statistic } from "antd"
import { SearchOutlined, CalendarOutlined, DollarOutlined } from "@ant-design/icons"
import { dayjs, type Dayjs } from "@/shared/lib/date"
import Title from "../../../../../common/Title/Title"
import { type Company } from "../../../../../types"
import "./HistoryPanel.css"
import LoadingSpinner from "../../../../../common/LoadingSpinner/LoadingSpinner"
import HistoryAppointmentItem from "./HistoryAppointmentItem"
import { ArrowReturnIcon } from "../../../../../common/Icons/Icons"
import Button from "../../../../../common/Button/Button"
import { useCompanyHistory } from "@/features/company-panel/history/hooks/useCompanyHistory"

const { RangePicker } = DatePicker
const { Option } = Select
const { Search } = Input

interface HistoryPanelProps {
    company: Company
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ company }) => {
    const {
        searchTerm,
        setSearchTerm,
        selectedService,
        setSelectedService,
        dateRange,
        setDateRange,
        isFilterPendingAppointments,
        setIsFilterPendingAppointments,
        loading,
        hasMore,
        handleLoadMore,
        backendAppointments,
        pendingAppointments,
        filteredAppointments,
        statistics,
        setStatistics,
        setFilteredAppointments,
        setCopyOfFilteredAppointments,
        setPendingAppointments,
        resetFilters,
        refetch,
    } = useCompanyHistory(company._id)

    const monthLabel =
        dayjs().locale("es").format("MMMM")[0].toUpperCase() +
        dayjs().locale("es").format("MMMM").slice(1)

    return (
        <div className="history-list-container animation-section divSectionContainer">
            <Title>Historial de Turnos</Title>
            <div className="history-filters-container">
                <div className="history-filters-row">
                    <div className="history-filter-item">
                        <Search
                            placeholder="Buscar por cliente o email"
                            allowClear
                            enterButton={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="history-search-input"
                        />
                    </div>
                    <div className="history-filter-item">
                        <Select
                            placeholder="Filtrar por servicio"
                            value={selectedService}
                            onChange={setSelectedService}
                            className="history-filter-select"
                        >
                            <Option value="all">Todos los servicios</Option>
                            {company.services.map((service) => (
                                <Option key={service._id} value={service._id}>
                                    {service.title}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className="history-filter-item">
                        <RangePicker
                            placeholder={["Fecha inicio", "Fecha fin"]}
                            value={dateRange}
                            onChange={(dates) =>
                                setDateRange(
                                    dates as [Dayjs | null, Dayjs | null] | null
                                )
                            }
                            className="history-date-range-picker"
                            format="DD/MM/YYYY"
                        />
                    </div>
                </div>
            </div>

            {statistics && company.subscription?.plan !== "individual" && (
                <div className="history-statistics-container">
                    <div className="history-stats-row">
                        <Card className="history-stat-card animation-section">
                            <Statistic
                                title={`Ingresos totales en ${monthLabel}`}
                                value={statistics.totalIncome}
                                prefix={<DollarOutlined />}
                            />
                        </Card>
                        <Card className="history-stat-card animation-section">
                            <div className="history-popular-service">
                                <div className="history-stat-title">
                                    Servicio más Popular
                                </div>
                                <div className="history-stat-value">
                                    {statistics.mostPopularService}
                                </div>
                            </div>
                        </Card>
                        <Card className="history-stat-card animation-section">
                            <Statistic
                                title={`Total de turnos en ${monthLabel}`}
                                value={statistics.totalAppointments}
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                        <Card className="history-stat-card animation-section">
                            <Statistic
                                title={"Porcentaje de asistencias este mes"}
                                value={
                                    statistics.finishedAppointmentsPercentage.toPrecision(
                                        4
                                    ) + "%"
                                }
                            />
                        </Card>
                    </div>
                </div>
            )}

            <div>
                {filteredAppointments.length > 0 && (
                    <div className="divInfoAppointments">
                        {searchTerm !== "" ||
                        selectedService !== "all" ||
                        (dateRange &&
                            (dateRange[0] !== null || dateRange[1] !== null)) ||
                        isFilterPendingAppointments ? (
                            <div
                                className="showAll"
                                onClick={() => {
                                    resetFilters()
                                    void refetch()
                                }}
                            >
                                <div className="divArrowReturnIcon">
                                    <ArrowReturnIcon
                                        width="1rem"
                                        height="1rem"
                                        fill="#1282A2"
                                    />
                                    <h3 className="showAllText">Ver todos</h3>
                                </div>
                                <h3 className="latestAppointmentsTitle">
                                    {filteredAppointments.length}{" "}
                                    {filteredAppointments.length === 1
                                        ? "turno"
                                        : "turnos"}{" "}
                                    {filteredAppointments.length === 1
                                        ? "filtrado"
                                        : "filtrados"}
                                </h3>
                            </div>
                        ) : (
                            <h3 className="latestAppointmentsTitle">
                                {backendAppointments.length === 1
                                    ? "Último"
                                    : "Últimos"}{" "}
                                {backendAppointments.length === 1
                                    ? ""
                                    : backendAppointments.length}{" "}
                                {backendAppointments.length === 1
                                    ? "turno"
                                    : "turnos"}
                            </h3>
                        )}
                        {pendingAppointments.length > 0 && (
                            <h3
                                className="pendingsAppointmentsTitle"
                                onClick={() =>
                                    setIsFilterPendingAppointments(true)
                                }
                            >
                                Tienes {pendingAppointments.length}{" "}
                                {pendingAppointments.length === 1
                                    ? "turno"
                                    : "turnos"}{" "}
                                {pendingAppointments.length === 1
                                    ? "pendiente"
                                    : "pendientes"}
                            </h3>
                        )}
                    </div>
                )}
                <div className="history-appointments-container animation-section">
                    {loading && filteredAppointments.length === 0 ? (
                        <LoadingSpinner text="Cargando historial..." shadow="none" />
                    ) : filteredAppointments.length === 0 ? (
                        <div className="history-no-services-appointments animation-section">
                            <Empty description="No se encontraron turnos en el historial" />
                        </div>
                    ) : (
                        <div className="history-appointments-list">
                            {filteredAppointments.map((appointment) => (
                                <HistoryAppointmentItem
                                    key={appointment._id}
                                    appointment={appointment}
                                    setStatistics={setStatistics}
                                    setFilteredAppointments={
                                        setFilteredAppointments
                                    }
                                    setCopyOfFilteredAppointments={
                                        setCopyOfFilteredAppointments
                                    }
                                    setPendingAppointments={
                                        setPendingAppointments
                                    }
                                    setIsFilteredPendingAppointments={
                                        setIsFilterPendingAppointments
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
                {hasMore && (
                    <div className="animation-section">
                        <Button
                            onSubmit={() => void handleLoadMore()}
                            padding=".2rem .5rem"
                            width="auto"
                            margin="1rem 0 0 0"
                            fontSize=".8rem"
                            fontWeight="500"
                            variant="ghost"
                            disabled={loading}
                        >
                            Ver más
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HistoryPanel
