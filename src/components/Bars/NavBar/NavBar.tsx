import Title from "../../../common/Title/Title";
import "./NavBar.css"
import { type User, type Company, type View } from "../../../types";
import { MenuIcon } from "../../../common/Icons/Icons";
import { SetStateAction } from "react";

interface Props {
    data: User | Company;
    onViewChange?: (view: View) => void;
    onBack?: () => void;
    setIsOpen: React.Dispatch<SetStateAction<boolean>>
}

const NavBar: React.FC<Props> = ({ data, onViewChange, onBack, setIsOpen }) => {

    return (
        <div className="navBar">
            <div onClick={() => {
                data.type === "company" ? onViewChange?.("appointments") : onBack?.()
            }}>
                <Title cursorPointer >Bookify</Title>
            </div>
            <div className="divIconContainer"
                onClick={() => setIsOpen(true)}
            >
                <MenuIcon
                    width="32"
                    height="32"
                    fill="#457B9D"
                />
            </div>
        </div>
    );
}

export default NavBar;
