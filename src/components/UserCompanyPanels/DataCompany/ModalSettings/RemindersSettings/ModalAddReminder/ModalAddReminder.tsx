import "./ModalAddReminder.css"
import Button from "../../../../../../common/Button/Button";
import React, { useState } from "react";
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

const ModalAddReminder: React.FC<Props> = ({ isOpen, setIsOpen, services, onSubmit, isLoading }) => {

    const [reminder, setReminder] = useState({
        hoursBefore: 0,
        services: [] as string[]
    })

    if (!isOpen) return null

    return (
        <div className="modalAddReminderOverlay">
            <div className="modalAddReminderContent">
                <div className="modalAddReminderBody">
                    <h2 className="titleSetting">Agregar nuevo recordatorio</h2>
                    <form className="formAddReminder" onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit(reminder)
                        setReminder({
                            hoursBefore: 0,
                            services: []
                        })
                    }}>
                        <div className="formGroup">
                            <label htmlFor="hoursBefore">Recordar</label>
                            <select className="selectHoursBefore" id="hoursBefore" name="hoursBefore" defaultValue="" required
                                onChange={(e) => setReminder({ ...reminder, hoursBefore: parseInt(e.target.value) })}
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
                            <label htmlFor="services">Servicios afectados</label>
                            <div className="checkboxGroup">
                                {
                                    services && services.length > 0 ?
                                        services.map(service => (
                                            <div className="checkboxItem" key={service._id}>
                                                <input type="checkbox" id={service._id} name="services" value={service._id} onClick={() => {
                                                    if (reminder.services.includes(service._id)) {
                                                        setReminder({
                                                            ...reminder,
                                                            services: reminder.services.filter(s => s !== service._id)
                                                        })
                                                    } else {
                                                        setReminder({
                                                            ...reminder,
                                                            services: [...reminder.services, service._id]
                                                        })
                                                    }
                                                }} />
                                                <label htmlFor={service._id}>{service.title}</label>
                                            </div>
                                        ))
                                        :
                                        <p>No hay servicios disponibles</p>
                                }

                            </div>
                        </div>
                        <div className="formActions">
                            <Button
                                disabled={isLoading}
                                type="submit"
                                padding=".5rem"
                                margin="0"
                                backgroundColor="#1282A2"
                            >
                                Guardar
                            </Button>
                            <Button
                                disabled={isLoading}
                                type="button"
                                padding=".5rem"
                                margin="0"
                                backgroundColor="grey"
                                onSubmit={() => {
                                    setReminder({
                                        hoursBefore: 0,
                                        services: []
                                    })
                                    setIsOpen(false)
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ModalAddReminder;
