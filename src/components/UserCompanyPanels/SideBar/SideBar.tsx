import { type Company, type User, type View } from "../../../types";
import "./SideBar.css"
import Title from "../../../common/Title/Title";
import Button from "../../../common/Button/Button";
import { UserIcon, CompanyIcon } from "../../../common/Icons/Icons";

interface Props {
    data: User | Company
    onViewChange?: (view: View) => void
}

const SideBar: React.FC<Props> = ({ data, onViewChange }) => {
    return (
        <div className="sideBar">
            <Title fontSize="3.5rem">Bookify</Title>
            <div className="dataUserCompany">
                <div className="titleContainer">
                    {
                        data.type === "user" ?
                            <UserIcon
                                width="32"
                                height="32"
                                fill="#457B9D"
                            />
                            :
                            <CompanyIcon
                                width="32"
                                height="32"
                                fill="#457B9D"
                            />
                    }
                    <Title fontSize="1.5rem">
                        {data.type === "user" ? "Mis datos:" : "Mi empresa:"}
                    </Title>
                </div>
                <div className="dataContainer">
                    <p className="parrafData">
                        <span>Nombre: </span>
                        {
                            data.type === "user" ?
                                `${data.name} ${data.lastName}`
                                :
                                `${data.name}`
                        }
                    </p>
                    <p className="parrafData">
                        <span>Teléfono: </span>
                        {data.phone}
                    </p>
                    <p className="parrafData">
                        <span>Email: </span>
                        {data.email}
                    </p>
                    {
                        data.type === "company" &&
                        <p className="parrafData">
                            <span>Ubicación: </span>
                            {data.city} - {data.street} {data.number}
                        </p>
                    }
                </div>
            </div>
            {
                data.type === "company" &&
                <div className="divButtonsCompany">
                    <Button
                        onSubmit={() => { onViewChange?.("appointments") }}
                        fontWeight="700"
                    >
                        Proximos turnos
                    </Button>
                    <Button
                        onSubmit={() => { onViewChange?.("services") }}
                        fontWeight="700"
                    >
                        Mis servicios
                    </Button>
                </div>
            }
            <div className="divConfigurations">
                <p>Editar datos</p>
                <p>Cerrar sesíon</p>
            </div>
        </div>
    );
}

export default SideBar;
