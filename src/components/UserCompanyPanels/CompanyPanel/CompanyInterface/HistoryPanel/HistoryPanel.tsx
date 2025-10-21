import { useState, useEffect, useMemo } from "react";
import { DatePicker, Select, Input, Card, Empty, Statistic } from "antd";
import { SearchOutlined, CalendarOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import Title from "../../../../../common/Title/Title";
import { type Company, type Appointment } from "../../../../../types";
import { BACKEND_API_URL } from "../../../../../config";
import "./HistoryPanel.css";
import LoadingSpinner from "../../../../../common/LoadingSpinner/LoadingSpinner";
import HistoryAppointmentItem from "./HistoryAppointmentItem";
import { ArrowReturnIcon } from "../../../../../common/Icons/Icons";
import Button from "../../../../../common/Button/Button";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useAuthenticatedFetch } from "../../../../../hooks/useAuthenticatedFetch";

dayjs.extend(isBetween);
dayjs.extend(localizedFormat);
dayjs.locale("es");

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

interface HistoryPanelProps {
  company: Company;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ company }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchWithAuth } = useAuthenticatedFetch();
  const [selectedService, setSelectedService] = useState<string>("all");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([])
  const [isFilterPendingAppointments, setIsFilterPendingAppointments] = useState(false)
  const [loading, setLoading] = useState(true);
  const [backendAppointments, setBackendAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [statistics, setStatistics] = useState<{
    totalAppointments: number;
    mostPopularService: string;
    totalIncome: number;
  }>({
    totalAppointments: 0,
    mostPopularService: "N/A",
    totalIncome: 0,
  });

  const fetchHistoryFromBackend = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: "1",
        limit: "10",
        ...(dateRange?.[0] ? { from: dateRange?.[0].format("YYYY-MM-DD") } : {}),
        ...(dateRange?.[1] ? { to: dateRange?.[1].format("YYYY-MM-DD") } : {}),
      })

      const url = `${BACKEND_API_URL}/appointments/company-history/${company._id}?${queryParams.toString()}`;

      const response = await fetchWithAuth(url, { method: "GET" });

      if (response.data) {
        setBackendAppointments(response.data.data || []);
        setPendingAppointments(response.data.pendingAppointments)
        setHasMore(response.data.hasMore)
        setStatistics(response.data.stats || {
          totalAppointments: 0,
          mostPopularService: "N/A",
          totalIncome: 0,
        });
      } else if (response.code === "SESSION_EXPIRED") {
        // Si la sesión expiró, redirigir al login
        window.location.href = "/login/company";
      } else {
        setBackendAppointments([]);
      }
    } catch (error) {
      setBackendAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryFromBackend();
  }, [company._id, dateRange]);

  const handleLoadMore = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: "10",
        ...(dateRange?.[0] ? { from: dateRange?.[0].format("YYYY-MM-DD") } : {}),
        ...(dateRange?.[1] ? { to: dateRange?.[1].format("YYYY-MM-DD") } : {}),
      })

      const url = `${BACKEND_API_URL}/appointments/company-history/${company._id}?${queryParams.toString()}`;

      const response = await fetchWithAuth(url, { method: "GET" });

      if (response.data) {
        setBackendAppointments(prev => [...prev, ...(response.data.data || [])])
        setPage(prev => prev + 1)
        setHasMore(response.data.hasMore)
        setStatistics(response.data.stats || {
          totalAppointments: 0,
          mostPopularService: "N/A",
          totalIncome: 0,
        });
      }
    } catch (error) {
      console.error("Error al cargar más turnos:", error);
    } finally {
      setLoading(false);
    }
  }

  const processedAppointments = useMemo(() => {
    if (!backendAppointments.length) return [];

    const filtered = backendAppointments.filter((appointment) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${appointment.name.trim()} ${appointment.lastName.trim()}`
        const matchesClient =
          fullName.toLowerCase().includes(searchLower) ||
          appointment.email.toLowerCase().includes(searchLower) ||
          appointment.dni.toString().includes(searchLower);
        if (!matchesClient) return false;
      }

      if (selectedService !== "all" && appointment.serviceId._id !== selectedService) return false;

      return true;
    });

    filtered.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    return filtered;
  }, [backendAppointments, searchTerm, selectedService]);

  useEffect(() => {
    setFilteredAppointments(processedAppointments);
  }, [processedAppointments]);

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
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              className="history-date-range-picker"
              format="DD/MM/YYYY"
            />
          </div>
        </div>
      </div>

      {statistics && (
        <div className="history-statistics-container">
          <div className="history-stats-row">
            <Card className="history-stat-card animation-section">
              <Statistic
                title={`Ingresos totales en ${dayjs().locale("es").format("MMMM")[0].toUpperCase() + dayjs().locale("es").format("MMMM").slice(1)}`}
                value={statistics.totalIncome}
                prefix={<DollarOutlined />}
              />
            </Card>
            <Card className="history-stat-card animation-section">
              <div className="history-popular-service">
                <div className="history-stat-title">Servicio Más Popular</div>
                <div className="history-stat-value">{statistics.mostPopularService}</div>
              </div>
            </Card>
            <Card className="history-stat-card animation-section">
              <Statistic
                title={`Total de turnos en ${dayjs().locale("es").format("MMMM")[0].toUpperCase() + dayjs().locale("es").format("MMMM").slice(1)}`}
                value={statistics.totalAppointments}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </div>
        </div>
      )}

      <div>
        {
          filteredAppointments.length > 0 &&
          <div className="divInfoAppointments">
            {
              (searchTerm !== "" || selectedService !== "all" || (dateRange && (dateRange[0] !== null || dateRange[1] !== null)) || isFilterPendingAppointments) ?
                <>
                  <div
                    className="showAll"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedService("all")
                      setDateRange(null)
                      setIsFilterPendingAppointments(false)
                      setFilteredAppointments(backendAppointments)
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
                    <h3 className="latestAppointmentsTitle">{filteredAppointments.length === 1 ? "" : filteredAppointments.length} {filteredAppointments.length === 1 ? "turno" : "turnos"} {filteredAppointments.length === 1 ? "filtrado" : "filtrados"}</h3>
                  </div>
                </>
                :
                <h3 className="latestAppointmentsTitle">{backendAppointments.length === 1 ? "Último" : "Últimos"} {backendAppointments.length === 1 ? "" : backendAppointments.length} {backendAppointments.length === 1 ? "turno" : "turnos"}</h3>
            }
            {
              pendingAppointments.length > 0 &&
              <h3 className="pendingsAppointmentsTitle" onClick={() => {
                setFilteredAppointments(pendingAppointments)
                setIsFilterPendingAppointments(true)
              }}>
                Tienes {pendingAppointments.length} {pendingAppointments.length === 1 ? "turno" : "turnos"} {pendingAppointments.length === 1 ? "pendiente" : "pendientes"}
              </h3>
            }
          </div>
        }
        <div className="history-appointments-container animation-section">
          {loading ? (
            <LoadingSpinner
              text="Cargando historial..."
              shadow="none"
            />
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
                  setFilteredAppointments={setFilteredAppointments}
                  setCopyOfFilteredAppointments={setBackendAppointments}
                  setPendingAppointments={setPendingAppointments}
                  setIsFilteredPendingAppointments={setIsFilterPendingAppointments}
                />
              ))}
            </div>
          )}
        </div>
        {hasMore &&
          <div className="animation-section">
            <Button
              onSubmit={handleLoadMore}
              padding=".2rem .5rem"
              width="auto"
              margin="1rem 0 0 0"
              fontSize=".8rem"
              fontWeight="500"
              backgroundColor="#1282A2"
              disabled={loading}
            >
              Ver más
            </Button>
          </div>

        }
      </div>
    </div>
  );
};

export default HistoryPanel;