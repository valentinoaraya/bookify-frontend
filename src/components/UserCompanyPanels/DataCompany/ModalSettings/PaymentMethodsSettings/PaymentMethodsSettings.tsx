import "./PaymentMethodsSettings.css"
import { Company } from "../../../../../types";
import MercadoPagoLogo from "../../../../../assets/images/mp-logo.webp"
import PayPalLogo from "../../../../../assets/images/pp-logo.webp"
import ModoLogo from "../../../../../assets/images/md-logo.webp"
import { confirmDelete } from "../../../../../utils/alerts";
import { notifyError } from "../../../../../utils/notifications";
import { generateOAuthUrl } from "@/shared/api/payments";
import { useId, useState } from "react";

interface Props {
    data: Company
}

const questions = [
    {
        question: "¿Por qué vincular una cuenta?",
        answers: [
            "Vincular una cuenta de Mercado Pago te permitirá cobrar señas a tus clientes al momento de que reserven un turno. Esto puede ayudarte a reducir las ausencias y asegurar que tus clientes estén comprometidos con sus reservas.",
            "Además, al utilizar estas plataformas de pago reconocidas, puedes ofrecer a tus clientes una experiencia de pago segura y confiable, lo que puede aumentar la confianza en tu negocio.",
            "En resumen, vincular una cuenta de Mercado Pago no solo facilita el proceso de cobro, sino que también puede mejorar la gestión de tus reservas y la satisfacción de tus clientes.",
        ],
    },
    {
        question: "¿Cómo desvinculo mi cuenta?",
        answers: [
            "Si en algún momento deseas desvincular tu cuenta de Mercado Pago, puedes hacerlo desde la aplicación.",
            "1. Abre Mercado Pago",
            "2. Ingresa en al sección 'Más' en la parte inferior derecha.",
            "3. Selecciona 'Seguridad'.",
            "4. Luego, ve a 'Aplicaciones conectadas'.",
            "5. Busca 'Bookify' en la lista de aplicaciones conectadas y selecciona 'Quitar permisos'.",
            "Ten en cuenta que al desvincular tu cuenta, ya no podrás recibir pagos a través de esa plataforma, por lo que es importante asegurarte de que no tengas pagos pendientes antes de proceder.",
        ],
    },
    {
        question: "¿Es seguro vincular mi cuenta con Bookify?",
        answers: [
            "Sí, vincular tu cuenta de Mercado Pago con Bookify es seguro. Utilizamos protocolos de seguridad estándar de la industria para proteger tu información y garantizar que las transacciones se realicen de manera segura.",
            "Además, Mercado Pago es una plataforma de pago reconocida y confiable que cuenta con medidas de seguridad robustas para proteger a sus usuarios.",
            "Sin embargo, siempre es importante que mantengas tus credenciales de acceso seguras y no las compartas con terceros.",
        ],
    },
    {
        question: "¿Qué puede hacer Bookify con mi cuenta?",
        answers: [
            "Bookify solo utiliza tu cuenta de Mercado Pago para procesar pagos relacionados con las reservas que realicen tus clientes. No accedemos a tu información personal ni realizamos transacciones sin tu consentimiento.",
            "Además, puedes revisar y gestionar los permisos otorgados a Bookify desde la configuración de tu cuenta en Mercado Pago en cualquier momento.",
        ],
    },
]

const PaymentMethodsSettings: React.FC<Props> = ({ data }) => {
    const faqId = useId()
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const toggle = (index: number) => {
        setOpenIndex((prev) => (prev === index ? null : index))
    }

    const vinculateMP = async () => {
        const confirm = await confirmDelete({
            question: "Al vincular con Mercado Pago...",
            message: "Al vincular con Mercado Pago podrás cobrar señas a tus clientes directamente en tu cuenta de Mercado Pago.",
            cancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar"
        })

        if (confirm) {
            setIsLoading(true)
            try {
                const response = await generateOAuthUrl(data._id)
                const url = (response.data as { url?: string } | undefined)?.url
                if (url) window.location.href = url
                if (response.error) notifyError("Error al obtener URL.")
            } finally {
                setIsLoading(false)
            }
        }
    }

    return (
        <div className="paymentMethodsSettings animation-section">
            <div>
                <div className="header-settings">
                    <h2 className="titleSetting">Vincúlate para poder cobrar señas</h2>
                    <p>Puedes vincular tu cuenta de <strong>Mercado Pago</strong> para poder cobrar señas.</p>
                </div>
                <div className="divMethodsContainer">
                    <div className={`divMethod ${data.connectedWithMP ? "connected" : ""}`}>
                        <div className="divMethodInfo">
                            <div>
                                <img className="logo-pay-method" src={MercadoPagoLogo} alt="Logo Mercado Pago" />
                            </div>
                            <div>
                                <h3>Mercado Pago</h3>
                                <p>Permite cobrar señas en pesos argentinos.</p>
                            </div>
                        </div>
                        {
                            data.connectedWithMP ?
                                <p className="connectedText">¡Conectado!</p>
                                :
                                <button
                                    className="connectButton"
                                    onClick={vinculateMP}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Conectando..." : "Vincular cuenta"}
                                </button>
                        }
                    </div>
                </div>
                <div className="divMethod disabled">
                    <div className="divMethodInfo">
                        <div>
                            <img className="logo-pay-method" src={PayPalLogo} alt="Logo PayPal" />
                        </div>
                        <div>
                            <h3>PayPal</h3>
                            <p>Permite cobrar señas en dólares.</p>
                        </div>
                    </div>
                    <p className="pComingSoon">Próximamente</p>
                </div>
                <div className="divMethod disabled">
                    <div className="divMethodInfo">
                        <div>
                            <img className="logo-pay-method" src={ModoLogo} alt="Logo Modo" />
                        </div>
                        <div>
                            <h3>MODO</h3>
                            <p>Permite cobrar señas en pesos.</p>
                        </div>
                    </div>
                    <p className="pComingSoon">Próximamente</p>
                </div>
            </div>

            <section className="faqSection" aria-label="Preguntas frecuentes">
                <h3 className="faqSectionTitle">Preguntas frecuentes</h3>
                <div className="faqList">
                    {questions.map((item, index) => {
                        const isOpen = openIndex === index
                        const panelId = `${faqId}-panel-${index}`
                        const buttonId = `${faqId}-button-${index}`

                        return (
                            <div key={item.question} className={`faqItem ${isOpen ? "is-open" : ""}`}>
                                <h4 className="faqItemHeading">
                                    <button
                                        id={buttonId}
                                        type="button"
                                        className="faqTrigger"
                                        aria-expanded={isOpen}
                                        aria-controls={panelId}
                                        onClick={() => toggle(index)}
                                    >
                                        <span>{item.question}</span>
                                        <span className="faqChevron" aria-hidden="true" />
                                    </button>
                                </h4>
                                <div
                                    id={panelId}
                                    role="region"
                                    aria-labelledby={buttonId}
                                    className="faqPanel"
                                >
                                    <div className="faqPanelInner">
                                        {item.answers.map((ans) => (
                                            <p key={ans}>{ans}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>
        </div>
    );
}

export default PaymentMethodsSettings;
