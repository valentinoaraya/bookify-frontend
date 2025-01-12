import "./ServiceCard.css"
import Button from "../../../common/Button/Button"

interface Props {
    duration: number
    price: number
    title: string
    description: string
}

const ServiceCard: React.FC<Props> = ({ duration, price, title, description }) => {
    return (
        <div className="serviceCard">
            <div className="dataService">
                <h2 className="titleService">{title}</h2>
                <p className="parrafService"><span>Duración:</span> {duration} hs</p>
                <p className="parrafService"><span>Precio:</span> ${price}</p>
                <p className="parrafService">{description}</p>
            </div>
            <div className="divButtons">
                <Button
                    fontSize="1.2rem"
                    padding=".8rem"

                >
                    Habilitar turnos
                </Button>
                <Button
                    fontSize="1.2rem"
                    padding=".8rem"
                >
                    Editar servicio
                </Button>
                <Button
                    fontSize="1.2rem"
                    padding=".8rem"
                >
                    Eliminar servicio
                </Button>
            </div>
        </div>
    );
}

export default ServiceCard;
