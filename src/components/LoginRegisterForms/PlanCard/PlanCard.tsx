import React from "react";
import "./PlanCard.css";

interface PlanCardProps {
    planName: string;
    features: string[];
    isSelected: boolean;
    onClick: () => void;
    isComingSoon?: boolean;
    price?: string;
    isSettings?: boolean
}

const PlanCard: React.FC<PlanCardProps> = ({ planName, features, isSelected, onClick, isComingSoon = false, price, isSettings }) => {
    return (
        <div
            className={`${isSettings ? "plan-card-settings" : "plan-card"} ${isSelected ? 'selected' : ''} ${isComingSoon ? 'coming-soon' : ''}`}
            onClick={!isComingSoon ? onClick : undefined}
        >
            {isComingSoon && (
                <div className="coming-soon-badge">Próximamente...</div>
            )}
            <h3 className="plan-title">{planName}</h3>
            {price && (
                <div className="plan-price">
                    <span className="price-amount">{price}</span>
                    <span className="price-period">/ mes</span>
                </div>
            )}
            <ul className="plan-features">
                {features.map((feature, index) => (
                    <li key={index} className="plan-feature">
                        <span className="feature-checkmark">✓</span>
                        {feature}
                    </li>
                ))}
            </ul>
            {isSelected && !isComingSoon && (
                <div className={`${isSettings ? "selected-indicator-settings" : "selected-indicator"} animation-section`}>{isSettings ? "🚀 Plan actual" : "Seleccionado"}</div>
            )}
        </div>
    );
};

export default PlanCard;
