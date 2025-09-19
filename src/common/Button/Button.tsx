import React from "react";
import "./Button.css"

interface Props {
    children: React.ReactNode;
    iconSVG?: React.ReactNode;
    onSubmit?: () => void;
    backgroundColor?: string;
    type?: "submit" | "button";
    disabled?: boolean;
    fontSize?: string;
    padding?: string;
    fontWeight?: string;
    width?: string;
    margin?: string;
    reverse?: boolean;
}

const Button: React.FC<Props> = ({ children, iconSVG, onSubmit, type, disabled, fontSize, padding, fontWeight, width, margin, backgroundColor, reverse }) => {
    return (
        <button
            className="button"
            onClick={onSubmit}
            type={type}
            disabled={disabled}
            style={{ fontSize: fontSize, padding: padding, fontWeight: fontWeight, width: width, margin: margin, background: backgroundColor, flexDirection: reverse ? "row-reverse" : "row" }}
        >
            {
                iconSVG &&
                <div className="divIcon">
                    {iconSVG}
                </div>
            }
            <p>{disabled ? "Cargando..." : children}</p>
        </button>
    );
}

export default Button;
