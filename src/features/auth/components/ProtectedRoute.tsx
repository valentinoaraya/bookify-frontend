import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { hasValidTokens } from "@/utils/tokenManager"

interface Props {
    children: ReactNode
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    if (!hasValidTokens()) {
        return <Navigate to="/login/company" replace />
    }

    return <>{children}</>
}

export default ProtectedRoute
