import "./ModalAddReminder.css"
import Button from "../../../../../../common/Button/Button";
import React, { useEffect, useState } from "react";
import { Service } from "../../../../../../types";

interface Props {
    isLoading: boolean
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    services: Service[]
    onSubmit: (reminder: {
        hoursBefore: number;
        services: string[];
    }) => void;
}

const emptyReminder = {
    hoursBefore: 0,
    services: [] as string[],
}

const ModalAddReminder: React.FC<Props> = ({ isOpen, setIsOpen, services, onSubmit, isLoading }) => {
    const [reminder, setReminder] = useState(emptyReminder)

    useEffect(() => {
        if (!isOpen) {
            setReminder(emptyReminder)
        }
    }, [isOpen])

    if (!isOpen) return null

    const close = () => {
        setReminder(emptyReminder)
        setIsOpen(false)
    }

    return (
        <section className="reminderFormPanel" aria-label="Agregar nuevo recordatorio">
            <div className="reminderFormHeader">
                <h3 className="reminderFormTitle">Nuevo recordatorio</h3>
                <button
                    type="button"
                    className="reminderFormClose"
                    onClick={close}
                    disabled={isLoading}
                    aria-label="Cerrar"
                >
                    ×
                </button>
            </div>

            <form
                className="formAddReminder"
                onSubmit={(e) => {
                    e.preventDefault()
                    if (!reminder.hoursBefore) return
                    onSubmit(reminder)
                }}
            >
                <div className="formGroup">
                    <label htmlFor="hoursBefore">Recordar</label>
                    <select
                        className="selectHoursBefore"
                        id="hoursBefore"
                        name="hoursBefore"
                        value={reminder.hoursBefore || ""}
                        required
                        onChange={(e) => setReminder({
                            ...reminder,
                            hoursBefore: parseInt(e.target.value),
                        })}
                    >
                        <option value="" disabled>Selecciona una opción</option>
                        <option value={96}>4 días antes</option>
                        <option value={72}>3 días antes</option>
                        <option value={48}>2 días antes</option>
                        <option value={24}>1 día antes</option>
                        <option value={12}>12 horas antes</option>
                        <option value={6}>6 horas antes</option>
                        <option value={4}>4 horas antes</option>
                        <option value={2}>2 horas antes</option>
                        <option value={1}>1 hora antes</option>
                    </select>
                </div>

                <div className="formGroup">
                    <label>Servicios afectados</label>
                    <div className="checkboxGroup">
                        {services && services.length > 0 ? (
                            services.map((service) => {
                                const checked = reminder.services.includes(service._id)
                                return (
                                    <label className="checkboxItem" key={service._id} htmlFor={service._id}>
                                        <input
                                            type="checkbox"
                                            id={service._id}
                                            name="services"
                                            value={service._id}
                                            checked={checked}
                                            onChange={() => {
                                                setReminder({
                                                    ...reminder,
                                                    services: checked
                                                        ? reminder.services.filter((s) => s !== service._id)
                                                        : [...reminder.services, service._id],
                                                })
                                            }}
                                        />
                                        <span>{service.title}</span>
                                    </label>
                                )
                            })
                        ) : (
                            <p>No hay servicios disponibles</p>
                        )}
                    </div>
                </div>

                <div className="formActions">
                    <Button
                        type="button"
                        padding=".5rem"
                        margin="0"
                        variant="neutral"
                        disabled={isLoading}
                        onSubmit={close}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        padding=".5rem"
                        margin="0"
                        variant="primary"
                        loading={isLoading}
                    >
                        Guardar
                    </Button>
                </div>
            </form>
        </section>
    );
}

export default ModalAddReminder;
