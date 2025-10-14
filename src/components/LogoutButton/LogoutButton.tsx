import React from 'react';
import { logout } from '../../utils/tokenManager';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';

interface LogoutButtonProps {
    children?: React.ReactNode;
    onLogout?: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
    children = "Cerrar Sesión",
    onLogout
}) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();

            // Ejecutar callback personalizado si existe
            if (onLogout) {
                onLogout();
            }

            // Redirigir al login
            navigate('/login/company');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Aún así, limpiar tokens locales y redirigir
            navigate('/login/company');
        }
    };

    return (
        <Button
            onSubmit={handleLogout}
        >
            {children}
        </Button>
    );
};

export default LogoutButton;
