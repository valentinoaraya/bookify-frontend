import React from "react";
import "./Button.css"

interface Props {
    children: React.ReactNode;
    iconSVG?: React.ReactNode;
    onSubmit?: () => void;
    type?: "submit" | "button";
    disabled?: boolean;
    fontSize?: string;
    padding?: string;
    fontWeight?: string;
}

const Button: React.FC<Props> = ({ children, iconSVG, onSubmit, type, disabled, fontSize, padding, fontWeight }) => {
    return (
        <button
            className="button"
            onClick={onSubmit}
            type={type}
            disabled={disabled}
            style={{ fontSize: fontSize, padding: padding, fontWeight: fontWeight }}
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