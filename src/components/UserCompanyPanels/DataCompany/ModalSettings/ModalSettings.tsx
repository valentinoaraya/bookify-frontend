import "./ModalSettings.css"
import React, { useEffect, useState } from "react"
import { CreditCardIcon, ClockIcon, BellIcon, UserIcon, RocketIcon } from "../../../../common/Icons/Icons"
import ProfileSettings from "./ProfileSettings/ProfileSettings"
import PaymentMethodsSettings from "./PaymentMethodsSettings/PaymentMethodsSettings"
import RemindersSettings from "./RemindersSettings/RemindersSettings"
import AnticipationsSettings from "./AnticipationsSettings/AnticipationsSettings"
import { useCompany } from "../../../../hooks/useCompany"
import PlansSettings from "./PlansSettings/PlansSettings"
import ModalPlans from "./PlansSettings/ModalPlans"

interface Props {
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    active: string
    setActive: React.Dispatch<React.SetStateAction<string>>
}

const ModalSettings: React.FC<Props> = ({ isOpen, setIsOpen, active, setActive }) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [closing, setClosing] = useState(false);
    const { state } = useCompany()
    const [isModalPlansOpen, setIsModalPlansOpen] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setClosing(false);
            document.body.classList.add("settings-modal-open");
        } else {
            setClosing(true);
            document.body.classList.remove("settings-modal-open");

            const timeout = setTimeout(() => {
                setShouldRender(false);
                setClosing(false);
            }, 300);

            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    if (!shouldRender) return null

    return (
        <div className={`modalOverlaySettings ${closing ? "closing" : "opening"}`}>
            <div className="modalSettingsContent">
                <button className="modalCloseButton" onClick={() => setIsOpen(false)} >X</button>
                <div className="modalSettingsBody">
                    <div className="modalSettingsLateralBar">
                        <ul>
                            <li className={active === "profile" ? "active-settings" : ""} onClick={() => setActive("profile")}>
                                <UserIcon
                                    width="18"
                                    height="18"
                                    fill="#adadad"
                                />
                                {window.innerWidth <= 740 ? "" : "Perfil"}
                            </li>
                            <li className={active === "paymentmethods" ? "active-settings" : ""} onClick={() => setActive("paymentmethods")}>
                                <CreditCardIcon
                                    width="18"
                                    height="18"
                                    fill="#adadad"
                                />
                                {window.innerWidth <= 740 ? "" : "Medios de pago"}
                            </li>
                            <li className={active === "reminders" ? "active-settings" : ""} onClick={() => setActive("reminders")}>
                                <BellIcon
                                    width="18"
                                    height="18"
                                    fill="#adadad"
                                />
                                {window.innerWidth <= 740 ? "" : "Recordatorios"}
                            </li>
                            <li className={active === "anticipations" ? "active-settings" : ""} onClick={() => setActive("anticipations")}>
                                <ClockIcon
                                    width="18"
                                    height="18"
                                    fill="#adadad"
                                />
                                {window.innerWidth <= 740 ? "" : "Anticipaciones"}
                            </li>
                            <li className={active === "plans" ? "active-settings" : ""} onClick={() => setActive("plans")}>
                                <RocketIcon
                                    width="18"
                                    height="18"
                                    fill="#adadad"
                                />
                                {window.innerWidth <= 740 ? "" : "Planes"}
                            </li>
                            <button className="modalCloseButtonMobile" onClick={() => setIsOpen(false)} >X</button>
                        </ul>
                    </div>
                    <div className="modalSettingsMainContent">
                        {active === "profile" && <ProfileSettings data={state} />}
                        {active === "paymentmethods" && <PaymentMethodsSettings data={state} />}
                        {active === "reminders" && <RemindersSettings data={state} />}
                        {active === "anticipations" && <AnticipationsSettings data={state} />}
                        {active === "plans" && <PlansSettings data={state} setIsModalPlansOpen={setIsModalPlansOpen} setSelectedPlanId={setSelectedPlanId} />}
                    </div>
                </div>
            </div>
            <ModalPlans
                data={state}
                isModalPlansOpen={isModalPlansOpen}
                setIsModalPlansOpen={setIsModalPlansOpen}
                selectedPlanId={selectedPlanId}
            />
        </div>
    );
}

export default ModalSettings;
