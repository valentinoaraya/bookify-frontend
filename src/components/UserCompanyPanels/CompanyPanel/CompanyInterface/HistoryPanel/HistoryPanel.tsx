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

  const historyData = useMemo(() => backendAppointments, [backendAppointments]);

  const processedAppointments = useMemo(() => {
    if (!historyData.length) return [];

    const filtered = historyData.filter((appointment) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesClient =
          appointment.name.toLowerCase().includes(searchLower) ||
          appointment.lastName.toLowerCase().includes(searchLower) ||
          appointment.email.toLowerCase().includes(searchLower);
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
  }, [historyData, searchTerm, selectedService, dateRange]);

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

    const isFiltered = searchTerm !== "" || selectedService !== "all" || dateRange !== null;

    let totalIncome;
    if (isFiltered) {
      totalIncome = filteredAppointments.reduce((acc, apt) => acc + apt.serviceId.price, 0);
    } else {
      const currentMonthStart = dayjs().startOf('month');
      const currentMonthEnd = dayjs().endOf('month');
      const currentMonthAppointments = historyData.filter(apt => dayjs(apt.date).isBetween(currentMonthStart, currentMonthEnd, 'day', '[]'));
      totalIncome = currentMonthAppointments.reduce((acc, apt) => acc + apt.serviceId.price, 0);
    }

    return {
      totalAppointments,
      mostPopularService,
      totalIncome,
    };
  }, [filteredAppointments, historyData, searchTerm, selectedService, dateRange]);

  return (
    <div className="history-list-container">
      <Title margin="0 0 1rem 0">Historial de Turnos</Title>

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
            <Card className="history-stat-card">
              <Statistic title="Total de Turnos" value={statistics.totalAppointments} prefix={<CalendarOutlined />} />
            </Card>
            <Card className="history-stat-card">
              <div className="history-popular-service">
                <div className="history-stat-title">Servicio Más Popular</div>
                <div className="history-stat-value">{statistics.mostPopularService}</div>
              </div>
            </Card>
            <Card className="history-stat-card">
              <Statistic title="Ingresos Totales" value={statistics.totalIncome} prefix={<DollarOutlined />} />
            </Card>
          </div>
        </div>
      )}

      <div className="history-appointments-container">
        {loading ? (
          <LoadingSpinner
            text="Cargando historial..."
            shadow="none"
          />
        ) : filteredAppointments.length === 0 ? (
          <div className="history-no-services-appointments">
            <Empty description="No se encontraron turnos en el historial" />
          </div>
        ) : (
          <div className="history-appointments-list">
            {filteredAppointments.map((appointment) => (
              <HistoryAppointmentItem key={appointment._id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryAppointmentItem = ({ appointment }: { appointment: Appointment }) => {
  const time = dayjs(appointment.date).format("HH:mm");

  return (
    <div className="history-appointment-item">
      <div className="history-appointment-header">
        <div className="history-client-info">
          <h3 className="history-client-name">{`${appointment.name} ${appointment.lastName}`}</h3>
          <p className="history-client-email">{appointment.email}</p>
          {appointment.phone && <p className="history-client-phone">{appointment.phone}</p>}
        </div>
      </div>
      <div className="history-appointment-details">
        <div className="history-service-info">
          <h4 className="history-service-title">{appointment.serviceId.title}</h4>
          <p className="history-service-duration">Duración: {appointment.serviceId.duration} min</p>
          <p className="history-service-price">Precio: ${appointment.serviceId.price}</p>
        </div>
        <div className="history-date-time-info">
          <p className="history-appointment-date">
            <CalendarOutlined /> {dayjs(appointment.date).format("DD/MM/YYYY")} {time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;