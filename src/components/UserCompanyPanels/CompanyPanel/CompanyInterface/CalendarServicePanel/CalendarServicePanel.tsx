import "./CalendarServicePanel.css";
import Title from "../../../../../common/Title/Title";
import {
	type View,
	type AvailableAppointmentWithPendings,
	type AvailableAppointment,
} from "../../../../../types";
import Button from "../../../../../common/Button/Button";
import FullCalendar from "@fullcalendar/react";
import type { FormatterInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid/index.js";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalForm from "../../../../ModalForm/ModalForm";
import {
	clearAvailableSlotsByDatetimes,
	enableAppointments,
} from "@/shared/api/services";
import {
	notifyError,
	notifySuccess,
	notifyWarn,
} from "../../../../../utils/notifications";
import { parseDateToString } from "../../../../../utils/parseDateToString";
import { useCompany } from "../../../../../hooks/useCompany";
import { useMediaQuery } from "../../../../../hooks/useMediaQuery";
import { CalendarCheckIcon } from "../../../../../common/Icons/Icons";
import {
	generateCalendarEventsFromService,
	getServiceSlots,
} from "../../../../../utils/cleanAppointmentsArray";
import ModalDisponibility from "./ModalDisponibility/ModalDisponibility";
import WorkScheduleSettings from "./WorkScheduleSettings/WorkScheduleSettings";

interface Props {
	setActiveView: (view: View) => void;
	serviceId: string;
}

type CalendarViewName = "dayGridWeek" | "dayGridFiveDay" | "dayGridThreeDay";

const DAY_HEADER_LONG: FormatterInput = {
	weekday: "long",
	month: "numeric",
	day: "numeric",
	omitCommas: true,
};

const DAY_HEADER_SHORT: FormatterInput = {
	weekday: "short",
	day: "numeric",
	omitCommas: true,
};

const DAY_HEADER_NARROW: FormatterInput = {
	weekday: "narrow",
	day: "numeric",
	omitCommas: true,
};

const toDatetimeKey = (date: Date) => {
	const { stringDate, time } = parseDateToString(date);
	return `${stringDate} ${time}`;
};

const buildAvailabilityHtml = (
	disponibility: number,
	taken: number,
	pendingCount: number,
) => `
    <div class="fc-event-metrics">
        <div class="fc-event-metric fc-event-metric--full">${disponibility} Disponible${disponibility !== 1 ? "s" : ""}</div>
        <div class="fc-event-metric fc-event-metric--short">${disponibility} Disp.</div>
        <div class="fc-event-metric fc-event-metric--full">${taken} Ocupado${taken !== 1 ? "s" : ""}</div>
        <div class="fc-event-metric fc-event-metric--short">${taken} Ocup.</div>
        ${
			pendingCount >= 1
				? `
            <div class="fc-event-metric fc-event-metric--full">${pendingCount} Pendiente${pendingCount !== 1 ? "s" : ""}</div>
            <div class="fc-event-metric fc-event-metric--short">${pendingCount} Pend.</div>
        `
				: ""
		}
    </div>
`;

const buildScheduledHtml = (scheduledCount: number) => `
    <div class="fc-event-metrics">
        <div class="fc-event-metric fc-event-metric--full">${scheduledCount} Ocupado${scheduledCount !== 1 ? "s" : ""}</div>
        <div class="fc-event-metric fc-event-metric--short">${scheduledCount} Ocup.</div>
    </div>
`;

const CalendarServicePanel: React.FC<Props> = ({
	serviceId,
	setActiveView,
}) => {
	const { state, updateServices } = useCompany();
	const calendarRef = useRef<FullCalendar>(null);
	const calendarContainerRef = useRef<HTMLDivElement>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isModalDisponibilityOpen, setIsModalDisponibilityOpen] =
		useState(false);
	const [appointment, setAppointment] = useState<
		AvailableAppointmentWithPendings | undefined
	>(undefined);
	const [isLoading, setIsLoading] = useState(false);
	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedDatetimes, setSelectedDatetimes] = useState<string[]>([]);
	const [isDeletingSelection, setIsDeletingSelection] = useState(false);

	const isNarrow = useMediaQuery("(max-width: 800px)");
	const isMobile = useMediaQuery("(max-width: 500px)");
	const isTiny = useMediaQuery("(max-width: 420px)");

	const calendarView: CalendarViewName = isMobile
		? "dayGridThreeDay"
		: isNarrow
			? "dayGridFiveDay"
			: "dayGridWeek";

	const contentHeight = isTiny ? "52vh" : isNarrow ? "58vh" : "71vh";

	const dayHeaderFormat = useMemo<FormatterInput>(() => {
		if (isTiny) return DAY_HEADER_NARROW;
		if (isNarrow) return DAY_HEADER_SHORT;
		return DAY_HEADER_LONG;
	}, [isNarrow, isTiny]);

	const service = state.services.find((s) => s._id === serviceId);

	useEffect(() => {
		const api = calendarRef.current?.getApi();
		if (!api) return;
		if (api.view.type !== calendarView) {
			api.changeView(calendarView);
		}
	}, [calendarView]);

	const { available: arrayEvents, scheduled: arrayEventsScheduled } =
		useMemo(() => {
			if (!service) return { available: [], scheduled: [] };
			return generateCalendarEventsFromService(service);
		}, [service]);

	const serviceSlots = useMemo(
		() => (service ? getServiceSlots(service) : []),
		[service],
	);

	const calendarEvents = useMemo(() => {
		const base = [...(arrayEvents || []), ...(arrayEventsScheduled || [])];
		if (!selectionMode) return base;
		return base.map((event) => {
			const start = event.start;
			const key =
				typeof start === "string" &&
				/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(start)
					? start
					: toDatetimeKey(new Date(start));
			const selected = selectedDatetimes.includes(key);
			const hasAvailability =
				event.extendedProps?.disponibility !== undefined &&
				(event.extendedProps.disponibility as number) > 0;
			return {
				...event,
				classNames: [
					selected ? "event--selected" : "",
					hasAvailability
						? "event--selectable"
						: "event--not-selectable",
				].filter(Boolean),
			};
		});
	}, [arrayEvents, arrayEventsScheduled, selectionMode, selectedDatetimes]);

	const exitSelectionMode = () => {
		setSelectionMode(false);
		setSelectedDatetimes([]);
	};

	const getAvailableDatetimesForDay = (day: string): string[] => {
		const pendingByDatetime: Record<string, number> = {};
		for (const pending of service?.pendingAppointments || []) {
			const key =
				typeof pending.datetime === "string"
					? pending.datetime
					: toDatetimeKey(new Date(pending.datetime));
			pendingByDatetime[key] = (pendingByDatetime[key] || 0) + 1;
		}

		return serviceSlots
			.filter((slot) => slot.datetime.startsWith(`${day} `))
			.filter((slot) => {
				const pendings = pendingByDatetime[slot.datetime] || 0;
				return slot.capacity - slot.taken - pendings > 0;
			})
			.map((slot) => slot.datetime);
	};

	const toggleDaySelection = (day: string) => {
		const daySlots = getAvailableDatetimesForDay(day);
		if (daySlots.length === 0) {
			notifyWarn("Ese día no tiene cupos disponibles para seleccionar.");
			return;
		}

		setSelectedDatetimes((prev) => {
			const allSelected = daySlots.every((dt) => prev.includes(dt));
			if (allSelected) {
				return prev.filter((dt) => !daySlots.includes(dt));
			}
			const merged = new Set([...prev, ...daySlots]);
			return [...merged];
		});
	};

	useEffect(() => {
		if (!selectionMode) return;
		const container = calendarContainerRef.current;
		if (!container) return;

		const onCalendarClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;
			if (!target) return;
			if (target.closest(".fc-event")) return;

			const dayEl =
				target.closest<HTMLElement>(".fc-daygrid-day[data-date]") ||
				target.closest<HTMLElement>(".fc-col-header-cell[data-date]");
			if (!dayEl) return;

			const day = dayEl.getAttribute("data-date");
			if (!day) return;
			toggleDaySelection(day);
		};

		container.addEventListener("click", onCalendarClick);
		return () => container.removeEventListener("click", onCalendarClick);
		// toggleDaySelection cierra sobre serviceSlots/service actuales
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectionMode, serviceSlots, service?.pendingAppointments]);

	if (!service)
		return (
			<div className="calendarServicePanel">
				<h1>Lo sentimos, no encontramos el servicio que buscabas...</h1>
			</div>
		);

	const onSubmitForm = async (data: { [key: string]: any }) => {
		setIsLoading(true);
		try {
			const response = await enableAppointments(serviceId, data);
			setIsModalOpen(false);
			if (response.data) {
				const newSlots = response.data
					.data as unknown as AvailableAppointment[];
				const serviceUpdated = {
					...service,
					availableAppointments: [...serviceSlots, ...newSlots],
					slots: [...(service.slots || serviceSlots), ...newSlots],
				};
				updateServices(serviceUpdated);
				notifySuccess("Turnos habilitados correctamente.");
			}
			if (response.error) {
				console.error(response.error);
				notifyError("Error al habilitar los turnos.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const onClickAppointment = (date: Date) => {
		const datetimeKey = toDatetimeKey(date);
		const appointment = serviceSlots.find(
			(app) => app.datetime === datetimeKey,
		);
		const scheduleds =
			(service.scheduledAppointments || []).filter(
				(d) => d === datetimeKey,
			).length ||
			(service.slots || []).find((s) => s.datetime === datetimeKey)
				?.taken ||
			0;
		const pendings = (service.pendingAppointments || []).filter(
			(p) => p.datetime === datetimeKey,
		).length;
		setAppointment(
			appointment
				? { ...appointment, pendings }
				: {
						datetime: datetimeKey,
						capacity: 0,
						taken: scheduleds,
						pendings,
					},
		);
		setIsModalDisponibilityOpen(true);
	};

	const toggleSelectedDatetime = (
		datetimeKey: string,
		hasAvailability: boolean,
	) => {
		if (!hasAvailability) {
			notifyWarn(
				"Solo podés seleccionar horarios con cupos disponibles.",
			);
			return;
		}
		setSelectedDatetimes((prev) =>
			prev.includes(datetimeKey)
				? prev.filter((d) => d !== datetimeKey)
				: [...prev, datetimeKey],
		);
	};

	const handleDeleteSelection = async () => {
		if (selectedDatetimes.length === 0) {
			notifyError("Seleccioná al menos un horario.");
			return;
		}
		setIsDeletingSelection(true);
		try {
			const response = await clearAvailableSlotsByDatetimes(
				serviceId,
				selectedDatetimes,
			);
			if (response.data) {
				const { service: updated, summary } = response.data.data;
				updateServices(updated);
				const parts: string[] = [];
				if (summary.deleted > 0) {
					parts.push(
						`${summary.deleted} horario${summary.deleted !== 1 ? "s" : ""} eliminado${summary.deleted !== 1 ? "s" : ""}`,
					);
				}
				if (summary.trimmed > 0) {
					parts.push(`${summary.trimmed} con reservas se ajustaron`);
				}
				if (summary.keptWithHolds > 0) {
					parts.push(
						`${summary.keptWithHolds} se conservaron por pago pendiente`,
					);
				}
				notifySuccess(
					parts.length > 0
						? parts.join(". ") + "."
						: "No había cupos disponibles en los horarios seleccionados.",
				);
				exitSelectionMode();
			}
			if (response.error) {
				notifyError(
					typeof response.error === "string"
						? response.error
						: "No se pudieron eliminar los horarios seleccionados.",
				);
			}
		} finally {
			setIsDeletingSelection(false);
		}
	};

	return (
		<div
			className={`calendarServicePanel animation-section${selectionMode ? " is-selecting" : ""}`}
		>
			<Title>Calendario para {service.title}</Title>
			{selectionMode && (
				<div className="selectionToolbar animation-section">
					<p className="selectionToolbarText">
						Tocá un horario o un día completo para seleccionar.{" "}
						<strong>
							{selectedDatetimes.length} seleccionado
							{selectedDatetimes.length !== 1 ? "s" : ""}
						</strong>
					</p>
					<div className="selectionToolbarActions">
						<Button
							margin="0"
							padding=".55rem 1rem"
							fontSize="0.95rem"
							width="auto"
							variant="ghost"
							disabled={isDeletingSelection}
							onSubmit={exitSelectionMode}
						>
							Cancelar
						</Button>
						<Button
							margin="0"
							padding=".55rem 1rem"
							fontSize="0.95rem"
							width="auto"
							variant="danger"
							disabled={
								selectedDatetimes.length === 0 ||
								isDeletingSelection
							}
							loading={isDeletingSelection}
							onSubmit={handleDeleteSelection}
						>
							Eliminar seleccionados
						</Button>
					</div>
				</div>
			)}
			<div className="calendarContainer" ref={calendarContainerRef}>
				<FullCalendar
					ref={calendarRef}
					plugins={[dayGridPlugin]}
					initialView={calendarView}
					views={{
						dayGridFiveDay: {
							type: "dayGrid",
							duration: { days: 5 },
						},
						dayGridThreeDay: {
							type: "dayGrid",
							duration: { days: 3 },
						},
					}}
					contentHeight={contentHeight}
					locale={"es"}
					eventClassNames={(arg) => [
						"event",
						"animation-section",
						...(arg.event.classNames || []),
					]}
					eventDisplay="block"
					eventTimeFormat={{
						hour: "numeric",
						minute: "2-digit",
						omitZeroMinute: false,
						meridiem: "short",
					}}
					buttonText={{
						today: "Hoy",
					}}
					dayHeaderFormat={dayHeaderFormat}
					titleFormat={{
						month: "long",
						day: "numeric",
					}}
					headerToolbar={{
						right: "prev,today,next",
					}}
					events={calendarEvents}
					eventDidMount={(info) => {
						const event = info.event;
						const extendedProps = event.extendedProps;
						const titleEl =
							info.el.querySelector(".fc-event-title");
						if (!titleEl) return;

						if (extendedProps.disponibility !== undefined) {
							titleEl.innerHTML = buildAvailabilityHtml(
								extendedProps.disponibility,
								extendedProps.taken || 0,
								extendedProps.pendingCount || 0,
							);
						} else if (extendedProps.scheduledCount !== undefined) {
							titleEl.innerHTML = buildScheduledHtml(
								extendedProps.scheduledCount,
							);
						}
					}}
					eventClick={(info) => {
						const date = info.event.start as Date;
						if (selectionMode) {
							const key = toDatetimeKey(date);
							const hasAvailability =
								info.event.extendedProps.disponibility !==
									undefined &&
								info.event.extendedProps.disponibility > 0;
							toggleSelectedDatetime(key, hasAvailability);
							return;
						}
						onClickAppointment(date);
					}}
				/>
			</div>
			<div className="divButtonsCalendar animation-section">
				<Button
					margin="0"
					padding=".65rem 1.15rem"
					fontSize="1rem"
					width="auto"
					onSubmit={() => setIsModalOpen(true)}
					variant="success"
					disabled={selectionMode}
					iconSVG={
						<CalendarCheckIcon
							width="18px"
							height="18px"
							fill="currentColor"
						/>
					}
				>
					Habilitar turnos
				</Button>
				<Button
					margin="0"
					padding=".65rem 1.15rem"
					fontSize="1rem"
					width="auto"
					onSubmit={() => {
						if (selectionMode) {
							exitSelectionMode();
						} else {
							setSelectionMode(true);
							setSelectedDatetimes([]);
						}
					}}
					variant={selectionMode ? "accent" : "neutral"}
				>
					{selectionMode
						? "Salir de selección"
						: "Seleccionar horarios"}
				</Button>
				<Button
					margin="0"
					padding=".65rem 1.15rem"
					fontSize="1rem"
					width="auto"
					variant="ghost"
					disabled={selectionMode}
					onSubmit={() => setActiveView("services")}
				>
					Volver
				</Button>
			</div>
			<WorkScheduleSettings service={service} />
			<ModalForm
				title="Selecciona los días para habilitar turnos"
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmitForm={(data) => onSubmitForm(data)}
				dayPicker
				horizontalForm
				inputs={[
					{
						type: "selectHour",
						name: "hourStart",
						label: "Selecciona hora de comienzo:",
					},
					{
						type: "selectHour",
						name: "hourFinish",
						label: "Selecciona hora del final:",
					},
					{
						type: "text",
						name: "turnEach",
						label: "Turnos cada (minutos):",
						placeholder: "Ej: 30",
					},
				]}
				disabledButtons={isLoading}
				initialData={{
					hourStart: "",
					hourFinish: "",
					turnEach: "",
					days: null,
				}}
			/>
			<ModalDisponibility
				serviceId={service._id}
				isOpen={isModalDisponibilityOpen}
				setIsOpen={setIsModalDisponibilityOpen}
				setAppointment={setAppointment}
				appointment={appointment}
			/>
		</div>
	);
};

export default CalendarServicePanel;
