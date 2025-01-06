import React from "react";
import "./Button.css"

interface Props {
    children: React.ReactNode;
    iconSVG?: React.ReactNode;
    onSubmit?: () => void;
    type?: "submit" | "button";
    disabled?: boolean;
}

const Button: React.FC<Props> = ({ children, iconSVG, onSubmit, type, disabled }) => {
    return (
        <button
            className="button"
            onClick={onSubmit}
            type={type}
            disabled={disabled}
        >
            <p>{disabled ? "Cargando..." : children}</p>
            {
                iconSVG &&
                <div className="divIcon">
                    {iconSVG}
                </div>
            }
        </button>
    );
}

export default Button;
