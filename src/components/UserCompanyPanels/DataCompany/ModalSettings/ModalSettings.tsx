import "./ModalSettings.css"
import { useEffect, useState } from "react"
import { CreditCardIcon, ClockIcon, BellIcon, UserIcon } from "../../../../common/Icons/Icons"
import ProfileSettings from "./ProfileSettings/ProfileSettings"
import PaymentMethodsSettings from "./PaymentMethodsSettings/PaymentMethodsSettings"
import RemindersSettings from "./RemindersSettings/RemindersSettings"
import AnticipationsSettings from "./AnticipationsSettings/AnticipationsSettings"
import { useCompany } from "../../../../hooks/useCompany"

interface Props {
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const ModalSettings: React.FC<Props> = ({ isOpen, setIsOpen }) => {

    const [active, setActive] = useState("profile")
    const { state } = useCompany()

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("settings-modal-open")
        } else {
            document.body.classList.remove("settings-modal-open")
        }

        return () => document.body.classList.remove("settings-modal-open")
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="modalOverlaySettings">
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
                                Perfil
                            </li>
                            <li className={active === "paymentmethods" ? "active-settings" : ""} onClick={() => setActive("paymentmethods")}>
                                <CreditCardIcon
                                    width="18"
                                    height="18"
                                    fill="#adadad"
                                />
                                Medios de pago
                            </li>
                            <li className={active === "reminders" ? "active-settings" : ""} onClick={() => setActive("reminders")}>
                                <BellIcon
                                    width="18"
                                    height="18"
                                    fill="#adadad"
                                />
                                Recordatorios
                            </li>
                            <li className={active === "anticipations" ? "active-settings" : ""} onClick={() => setActive("anticipations")}>
                                <ClockIcon
                                    width="18"
                                    height="18"
                                    fill="#adadad"
                                />
                                Anticipaciones
                            </li>
                        </ul>
                    </div>
                    <div className="modalSettingsMainContent">
                        {active === "profile" && <ProfileSettings data={state} />}
                        {active === "paymentmethods" && <PaymentMethodsSettings data={state} />}
                        {active === "reminders" && <RemindersSettings data={state} />}
                        {active === "anticipations" && <AnticipationsSettings data={state} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalSettings;
