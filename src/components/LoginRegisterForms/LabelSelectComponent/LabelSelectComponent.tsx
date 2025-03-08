import "./LabelSelectComponent.css"
import { useFetchData } from "../../../hooks/useFetchData";
import { PROVINCES_API_URL } from "../../../config";
import { useEffect, useState } from "react";

interface LabelSelectComponentProps {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const LabelSelectComponent: React.FC<LabelSelectComponentProps> = ({ onChange }) => {

    const [provinces, setProvinces] = useState([])
    const [cities, setCities] = useState([])
    const { fetchData, error } = useFetchData(`${PROVINCES_API_URL}/provincias?campos=id,nombre`, "GET")

    useEffect(() => {
        const getProvinces = async () => {
            const response = await fetchData(null)
            setProvinces(response.provincias)
        }
        getProvinces()
    }, [])

    if (error) console.error(error)

    const handleChangePronvince = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            console.log(e.target.value)
            if (!e.target.value) return
            const data = await fetch(`${PROVINCES_API_URL}/departamentos?provincia=${e.target.value}&max=100&campos=id,nombre`)
            const resopnse = await data.json()
            setCities(resopnse.departamentos)
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
                        provinces.map((prov: any) => {
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
                        cities.map((prov: any) => {
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
        </>
    );
}

export default LabelSelectComponent;
