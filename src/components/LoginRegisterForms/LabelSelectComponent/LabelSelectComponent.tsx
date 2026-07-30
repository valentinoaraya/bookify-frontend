import "./LabelSelectComponent.css"
import { fetchMunicipalities, fetchProvinces } from "@/shared/api/geo";
import { useEffect, useState } from "react";

interface Province {
    id: string
    nombre: string
}

interface Municipality {
    id: string
    nombre: string
}

interface LabelSelectComponentProps {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const LabelSelectComponent: React.FC<LabelSelectComponentProps> = ({ onChange }) => {

    const [provinces, setProvinces] = useState<Province[]>([])
    const [cities, setCities] = useState<Municipality[]>([])

    useEffect(() => {
        const getProvinces = async () => {
            const response = await fetchProvinces()
            if (response.data?.provincias) {
                setProvinces(response.data.provincias)
            } else if (response.error) {
                console.error(response.error)
            }
        }
        getProvinces()
    }, [])

    const handleChangePronvince = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            if (!e.target.value) return
            const selectedProvince = provinces.find(
                (province) => province.nombre === e.target.value
            )
            if (!selectedProvince) return

            const response = await fetchMunicipalities(selectedProvince.id)
            if (response.data?.municipios) {
                setCities(response.data.municipios)
            } else if (response.error) {
                console.error(response.error)
            }
            onChange(e)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <div className="divInput">
                <label>Provincia:</label>
                <select
                    name="province"
                    required
                    onChange={handleChangePronvince}
                >
                    <option value="">Selecciona tu provincia...</option>
                    {
                        provinces.map((prov) => {
                            return <option
                                key={prov.id}
                                value={prov.nombre}
                            >
                                {prov.nombre}
                            </option>
                        })
                    }
                </select>
            </div>
            <div className="divInput">
                <label>Ciudad:</label>
                <select
                    name="city"
                    required
                    onChange={onChange}
                >
                    <option value="">Selecciona tu ciudad...</option>
                    {
                        cities.map((city) => {
                            return <option
                                key={city.id}
                                value={city.nombre}
                            >
                                {city.nombre}
                            </option>
                        })
                    }
                </select>
            </div>
        </>
    );
}

export default LabelSelectComponent;
