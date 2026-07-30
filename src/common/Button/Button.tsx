import React from "react";
import "./Button.css"

export type ButtonVariant =
    | "primary"
    | "success"
    | "danger"
    | "accent"
    | "neutral"
    | "ghost"
    | "danger-ghost";

interface Props {
    children?: React.ReactNode;
    iconSVG?: React.ReactNode;
    onSubmit?: () => void;
    variant?: ButtonVariant;
    backgroundColor?: string;
    type?: "submit" | "button";
    disabled?: boolean;
    loading?: boolean;
    fontSize?: string;
    padding?: string;
    fontWeight?: string;
    width?: string;
    margin?: string;
    reverse?: boolean;
    cursor?: string;
}

const Button: React.FC<Props> = ({
    children,
    iconSVG,
    onSubmit,
    variant = "primary",
    type,
    disabled,
    loading = false,
    fontSize,
    padding,
    fontWeight,
    width,
    margin,
    backgroundColor,
    reverse,
    cursor,
}) => {
    const isDisabled = Boolean(disabled || loading)

    return (
        <button
            className={`button button--${variant}`}
            onClick={onSubmit}
            type={type}
            disabled={isDisabled}
            aria-busy={loading ? true : undefined}
            style={{
                fontSize: fontSize,
                padding: padding,
                fontWeight: fontWeight,
                width: width,
                margin: margin,
                background: backgroundColor,
                flexDirection: reverse ? "row-reverse" : "row",
                cursor: cursor ? cursor : undefined,
                gap: children ? ".7rem" : "0",
            }}
        >
            {loading ? (
                <span className="buttonSpinner" aria-hidden="true" />
            ) : (
                iconSVG && <div className="bk-button-icon">{iconSVG}</div>
            )}
            <p>{loading ? "Cargando..." : children}</p>
        </button>
    );
}

export default Button;
