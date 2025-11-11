export const plans = [
    {
        id: "individual",
        name: "Individual",
        price: "$12.000",
        available: true,
        features: [
            "1 profesional",
            "Hasta 5 servicios",
            "Recordatorios y emails automáticos",
            "Pagos online con Mercado Pago",
            "Rembolsos automáticos",
            "Historial completo de movimientos",
            "Soporte por correo"
        ]
    },
    {
        id: "individual_plus",
        name: "Individual Plus",
        price: "$18.000",
        available: true,
        features: [
            "Incluye Plan Individual",
            "Servicios personalizados e ilimitados",
            "Métricas de rendimiento (ingresos, asistencias, etc.)",
            "Soporte prioritario"
        ]
    },
    {
        id: "team",
        name: "Equipo",
        price: "$35.000",
        available: false,
        features: [
            "Incluye Plan Individual Plus por profesional",
            "Hasta 5 profesionales",
            "Dashborard administrativo",
            "Gestión de agendas separadas",
            "Historial completo de movimientos por profesional",
            "Historial centralizado de clientes",
            "+ Profesionales adicionales: $5.000 / mes cada profesional",
        ],
    }
]