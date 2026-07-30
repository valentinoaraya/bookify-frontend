import { useContext } from "react";
import { CompanyContext } from "@/features/company-panel/state/CompanyContext";

export const useCompany = () => {
    const context = useContext(CompanyContext);

    if (!context) {
        throw new Error("useCompany debe ser usado dentro de un CompanyProvider");
    }

    return context;
};
