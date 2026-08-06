import "./WorkScheduleSettings.css"
import { useEffect, useMemo, useState } from "react"
import type { Service, WorkSchedule, WorkScheduleBlock } from "@/types"
import { updateWorkSchedule } from "@/shared/api/services"
import Button from "../../../../../../common/Button/Button"
import { notifyError, notifySuccess } from "../../../../../../utils/notifications"
import { useCompany } from "../../../../../../hooks/useCompany"

interface Props {
    service: Service
}

const WEEK_DAYS: { value: number; label: string; short: string }[] = [
    { value: 1, label: "Lunes", short: "L" },
    { value: 2, label: "Martes", short: "M" },
    { value: 3, label: "Miércoles", short: "X" },
    { value: 4, label: "Jueves", short: "J" },
    { value: 5, label: "Viernes", short: "V" },
    { value: 6, label: "Sábado", short: "S" },
    { value: 0, label: "Domingo", short: "D" },
]

const defaultSchedule = (): WorkSchedule => ({
    days: [1, 2, 3, 4, 5],
    blocks: [{ start: "09:00", end: "18:00" }],
    turnIntervalMinutes: 30,
    graceMinutes: 0,
})

const schedulesEqual = (a: WorkSchedule, b: WorkSchedule) =>
    JSON.stringify(a) === JSON.stringify(b)

const WorkScheduleSettings: React.FC<Props> = ({ service }) => {
    const { state, updateServices } = useCompany()
    const [schedule, setSchedule] = useState<WorkSchedule>(
        service.workSchedule ?? defaultSchedule()
    )
    const [autoGenerate, setAutoGenerate] = useState(!!service.autoGenerateSlots)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setSchedule(service.workSchedule ?? defaultSchedule())
        setAutoGenerate(!!service.autoGenerateSlots)
    }, [service._id, service.workSchedule, service.autoGenerateSlots])

    const savedSchedule = service.workSchedule ?? defaultSchedule()
    const hasChanges = useMemo(
        () =>
            autoGenerate !== !!service.autoGenerateSlots ||
            !schedulesEqual(schedule, savedSchedule),
        [autoGenerate, service.autoGenerateSlots, schedule, savedSchedule]
    )

    const stepMinutes = schedule.turnIntervalMinutes + schedule.graceMinutes
    const visibilityDays = state.slotsVisibilityDays ?? 7

    const toggleDay = (day: number) => {
        setSchedule((prev) => {
            const has = prev.days.includes(day)
            return {
                ...prev,
                days: has
                    ? prev.days.filter((d) => d !== day)
                    : [...prev.days, day].sort((a, b) => {
                          // Lunes primero en UI; orden numérico relativo
                          const order = [1, 2, 3, 4, 5, 6, 0]
                          return order.indexOf(a) - order.indexOf(b)
                      }),
            }
        })
    }

    const updateBlock = (index: number, patch: Partial<WorkScheduleBlock>) => {
        setSchedule((prev) => ({
            ...prev,
            blocks: prev.blocks.map((block, i) =>
                i === index ? { ...block, ...patch } : block
            ),
        }))
    }

    const addBlock = () => {
        setSchedule((prev) => ({
            ...prev,
            blocks: [...prev.blocks, { start: "14:00", end: "18:00" }],
        }))
    }

    const removeBlock = (index: number) => {
        setSchedule((prev) => ({
            ...prev,
            blocks: prev.blocks.filter((_, i) => i !== index),
        }))
    }

    const handleSave = async () => {
        if (!hasChanges) return
        if (schedule.days.length === 0) {
            notifyError("Seleccioná al menos un día de trabajo.")
            return
        }
        if (schedule.blocks.length === 0) {
            notifyError("Agregá al menos un bloque horario.")
            return
        }
        if (schedule.turnIntervalMinutes < 1) {
            notifyError("El intervalo debe ser al menos 1 minuto.")
            return
        }

        setIsLoading(true)
        try {
            const response = await updateWorkSchedule(service._id, {
                workSchedule: {
                    days: schedule.days,
                    blocks: schedule.blocks,
                    turnIntervalMinutes: Number(schedule.turnIntervalMinutes),
                    graceMinutes: Number(schedule.graceMinutes),
                },
                autoGenerateSlots: autoGenerate,
            })
            if (response.data) {
                updateServices(response.data.data)
                notifySuccess(
                    autoGenerate
                        ? "Horarios guardados y turnos sincronizados."
                        : "Horarios guardados."
                )
            }
            if (response.error) {
                notifyError(
                    typeof response.error === "string"
                        ? response.error
                        : "No se pudieron guardar los horarios."
                )
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="workScheduleSettings animation-section">
            <div className="workScheduleHeader">
                <h2 className="workScheduleTitle">Horarios de trabajo</h2>
                <p className="workScheduleDesc">
                    Definí una vez los días y bloques en los que ofrecés este servicio.
                    Si activás la generación automática, se crearán turnos para los
                    próximos {visibilityDays} días (según los días visibles de tu
                    empresa).
                </p>
            </div>

            <div className="workScheduleDays">
                <span className="workScheduleLabel">Días</span>
                <div className="workScheduleDayChips">
                    {WEEK_DAYS.map((day) => {
                        const active = schedule.days.includes(day.value)
                        return (
                            <button
                                key={day.value}
                                type="button"
                                className={`workScheduleDayChip${active ? " is-active" : ""}`}
                                onClick={() => toggleDay(day.value)}
                                aria-pressed={active}
                                title={day.label}
                            >
                                <span className="workScheduleDayShort">{day.short}</span>
                                <span className="workScheduleDayFull">{day.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="workScheduleBlocks">
                <div className="workScheduleBlocksHeader">
                    <span className="workScheduleLabel">Bloques horarios</span>
                    <button
                        type="button"
                        className="workScheduleLinkBtn"
                        onClick={addBlock}
                    >
                        + Agregar bloque
                    </button>
                </div>
                {schedule.blocks.map((block, index) => (
                    <div className="workScheduleBlockRow" key={index}>
                        <label className="workScheduleField">
                            <span>Desde</span>
                            <input
                                type="time"
                                value={block.start}
                                onChange={(e) =>
                                    updateBlock(index, { start: e.target.value })
                                }
                            />
                        </label>
                        <label className="workScheduleField">
                            <span>Hasta</span>
                            <input
                                type="time"
                                value={block.end}
                                onChange={(e) =>
                                    updateBlock(index, { end: e.target.value })
                                }
                            />
                        </label>
                        {schedule.blocks.length > 1 && (
                            <button
                                type="button"
                                className="workScheduleRemoveBtn"
                                onClick={() => removeBlock(index)}
                                aria-label="Quitar bloque"
                            >
                                Quitar
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="workScheduleNumbers">
                <label className="workScheduleField">
                    <span>Turnos cada (min)</span>
                    <input
                        type="number"
                        min={1}
                        value={schedule.turnIntervalMinutes}
                        onChange={(e) =>
                            setSchedule((prev) => ({
                                ...prev,
                                turnIntervalMinutes: Math.max(
                                    1,
                                    parseInt(e.target.value, 10) || 1
                                ),
                            }))
                        }
                    />
                </label>
                <label className="workScheduleField">
                    <span>Tiempo de gracia (min)</span>
                    <input
                        type="number"
                        min={0}
                        value={schedule.graceMinutes}
                        onChange={(e) =>
                            setSchedule((prev) => ({
                                ...prev,
                                graceMinutes: Math.max(
                                    0,
                                    parseInt(e.target.value, 10) || 0
                                ),
                            }))
                        }
                    />
                </label>
                <div className="workScheduleStepHint">
                    Distancia entre turnos: <strong>{stepMinutes} min</strong>
                </div>
            </div>

            <label className="workScheduleToggle">
                <input
                    type="checkbox"
                    checked={autoGenerate}
                    onChange={(e) => setAutoGenerate(e.target.checked)}
                />
                <span>
                    Generar turnos automáticamente
                    <small>
                        Se mantienen vacíos entre turno y turno según la gracia. Podés
                        seguir habilitando turnos manualmente si lo necesitás.
                    </small>
                </span>
            </label>

            <div className="workScheduleActions">
                {hasChanges && (
                    <span className="workScheduleDirtyHint">Hay cambios sin guardar</span>
                )}
                <Button
                    margin="0"
                    padding=".65rem 1.15rem"
                    fontSize="1rem"
                    width="auto"
                    variant="success"
                    disabled={!hasChanges || isLoading}
                    onSubmit={handleSave}
                >
                    {isLoading ? "Guardando..." : "Guardar horarios"}
                </Button>
            </div>
        </div>
    )
}

export default WorkScheduleSettings
