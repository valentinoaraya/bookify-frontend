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

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

interface HistoryPanelProps {
  company: Company;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ company }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([])
  const [isFilterPendingAppointments, setIsFilterPendingAppointments] = useState(false)
  const [loading, setLoading] = useState(true);
  const [backendAppointments, setBackendAppointments] = useState<Appointment[]>([]);

  const fetchHistoryFromBackend = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const url = `${BACKEND_API_URL}/appointments/company-history/${company._id}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setBackendAppointments(result.data || []);
        setPendingAppointments(result.data.filter((apt: Appointment) => apt.status === "pending_action"))
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
  }, [company._id]);

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

      if (dateRange && dateRange[0] && dateRange[1]) {
        const aptDate = dayjs(appointment.date);
        if (!aptDate.isBetween(dateRange[0], dateRange[1], 'day', '[]')) {
          return false;
        }
      }

      return true;
    });

    filtered.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    return filtered;
  }, [backendAppointments, searchTerm, selectedService, dateRange]);

  useEffect(() => {
    setFilteredAppointments(processedAppointments);
  }, [processedAppointments]);

  const statistics = useMemo(() => {
    if (!filteredAppointments.length) return null;

    const totalAppointments = filteredAppointments.length;
    const serviceStats = filteredAppointments.reduce((acc, apt) => {
      const serviceTitle = apt.serviceId.title;
      acc[serviceTitle] = (acc[serviceTitle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPopularService = Object.entries(serviceStats).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

    let totalIncome;
    totalIncome = filteredAppointments.reduce((acc, apt) => {
      if (apt.status === "finished") {
        return acc + apt.serviceId.price
      }
      return acc
    }, 0);
    return {
      totalAppointments,
      mostPopularService,
      totalIncome,
    };
  }, [filteredAppointments, searchTerm, selectedService, dateRange]);

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
              <Statistic title="Ingresos Totales" value={statistics.totalIncome} prefix={<DollarOutlined />} />
            </Card>
            <Card className="history-stat-card animation-section">
              <div className="history-popular-service">
                <div className="history-stat-title">Servicio Más Popular</div>
                <div className="history-stat-value">{statistics.mostPopularService}</div>
              </div>
            </Card>
            <Card className="history-stat-card animation-section">
              <Statistic title="Total de Turnos" value={statistics.totalAppointments} prefix={<CalendarOutlined />} />
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
                  <ArrowReturnIcon
                    width="1rem"
                    height="1rem"
                    fill="#1282A2"
                  />
                  <h3 className="showAllText">Ver todos</h3>
                </div>
                :
                <h3 className="latestAppointmentsTitle">Tus últimos turnos</h3>
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
                  setFilteredAppointments={setFilteredAppointments}
                  setCopyOfFilteredAppointments={setBackendAppointments}
                  setPendingAppointments={setPendingAppointments}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;