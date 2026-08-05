export const plans = [
    {
        id: "individual",
        name: "Individual",
        price: "Gratis",
        available: true,
        features: [
            "1 profesional",
            "Hasta 3 servicios",
            "Recordatorios y emails automáticos",
            "Reservas online sin seña",
            "Historial completo de movimientos",
            "Soporte por correo"
        ]
    },
    {
        id: "individual_plus",
        name: "Individual Plus",
        price: "$9.900",
        available: true,
        features: [
            "Incluye Plan Individual",
            "Servicios personalizados e ilimitados",
            "Pagos online con Mercado Pago",
            "Rembolsos automáticos",
            "Métricas de rendimiento (ingresos, asistencias, etc.)",
            "Soporte prioritario"
        ]
    },
    {
        id: "team",
        name: "Equipo",
        price: "$19.900",
        available: false,
        features: [
            "Incluye Plan Individual Plus por profesional",
            "Hasta 5 profesionales",
            "Dashboard administrativo",
            "Gestión de agendas separadas",
            "Historial completo de movimientos por profesional",
            "Historial centralizado de clientes",
            "+ Profesionales adicionales: $5.000 / mes cada profesional",
        ],
    }
]
