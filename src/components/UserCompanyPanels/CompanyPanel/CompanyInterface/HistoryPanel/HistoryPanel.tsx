import { useState, useEffect, useMemo } from "react";
import { DatePicker, Select, Input, Card, Empty, Statistic } from "antd";
import { SearchOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import Title from "../../../../../common/Title/Title";
import { type Company, type Appointment } from "../../../../../types";
import { BACKEND_API_URL } from "../../../../../config";
import LoadingSpinner from "../../../../../common/LoadingSpinner/LoadingSpinner";
import "./HistoryPanel.css";

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

  const historyData = useMemo(() => {
    return backendAppointments;
  }, [backendAppointments]);

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

      return true;
    });

    filtered.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    return filtered;
  }, [historyData, searchTerm, selectedService]);

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

    return {
      totalAppointments,
      mostPopularService,
    };
  }, [filteredAppointments]);

  return (
    <div className="divListContainerHistory">
      <Title margin="0 0 1rem 0">Historial de Turnos</Title>

      <div className="filtersContainer">
        <div className="filtersRow">
          <div className="filterItem">
            <Search
              placeholder="Buscar por cliente o email"
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="searchInput"
            />
          </div>
          <div className="filterItem">
            <Select
              placeholder="Filtrar por servicio"
              value={selectedService}
              onChange={setSelectedService}
              className="filterSelect"
            >
              <Option value="all">Todos los servicios</Option>
              {company.services.map((service) => (
                <Option key={service._id} value={service._id}>
                  {service.title}
                </Option>
              ))}
            </Select>
          </div>
          <div className="filterItem">
            <RangePicker
              placeholder={["Fecha inicio", "Fecha fin"]}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              className="dateRangePicker"
              format="DD/MM/YYYY"
            />
          </div>
        </div>
      </div>

      {statistics && (
        <div className="statisticsContainer">
          <div className="statsRow">
            <Card className="statCard">
              <Statistic title="Total de Turnos" value={statistics.totalAppointments} prefix={<CalendarOutlined />} />
            </Card>
            <Card className="statCard">
              <div className="popularService">
                <div className="statTitle">Servicio Más Popular</div>
                <div className="statValue">{statistics.mostPopularService}</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      <div className="appointmentsContainer">
        {loading ? (
          <LoadingSpinner
            shadow="none"
            text="Cargando historial..."
          />
        ) : filteredAppointments.length === 0 ? (
          <div className="noServicesAppointments">
            <Empty description="No se encontraron turnos en el historial" />
          </div>
        ) : (
          <div className="appointmentsList">
            {filteredAppointments.map((appointment) => (
              <HistoryAppointmentItem key={appointment._id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Subcomponente para cada turno como item de lista
const HistoryAppointmentItem = ({ appointment }: { appointment: Appointment }) => {
  return (
    <div className="appointmentItem">
      <div className="appointmentHeader">
        <div className="clientInfo">
          <h3 className="clientName">{`${appointment.name} ${appointment.lastName}`}</h3>
          <p className="clientEmail">{appointment.email}</p>
          {appointment.phone && <p className="clientPhone">{appointment.phone}</p>}
        </div>
      </div>
      <div className="appointmentDetails">
        <div className="serviceInfo">
          <h4 className="serviceTitle">{appointment.serviceId.title}</h4>
          <p className="serviceDuration">Duración: {appointment.serviceId.duration} min</p>
          <p className="servicePrice">Precio: ${appointment.serviceId.price}</p>
        </div>
        <div className="dateTimeInfo">
          <p className="appointmentDate">
            <CalendarOutlined /> {dayjs(appointment.date).format("DD/MM/YYYY")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
