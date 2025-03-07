import "./SearchBar.css"
import { SearchIcon } from "../../../common/Icons/Icons";
import { useState, useEffect } from "react";
import { useFetchData } from "../../../hooks/useFetchData";
import { BACKEND_API_URL } from "../../../config";
import { notifyError } from "../../../utils/notifications";
import { type Service } from "../../../types";

interface Props {
    setResults: React.Dispatch<React.SetStateAction<Service[] | null>>
}

const SearchBar: React.FC<Props> = ({ setResults }) => {

    const [searchTerm, setSearchTerm] = useState("")
    const { error, fetchData } = useFetchData(
        `${BACKEND_API_URL}/services/search?query=${searchTerm}`,
        "GET",
        true
    )

    if (error) console.error("Error al obtener servicios")

    useEffect(() => {
        if (!searchTerm) {
            setResults(null)
            return
        }

        const fetchResults = async () => {
            const response = await fetchData(null)
            if (response.error) notifyError("Error al buscar servicios.")
            if (response.message) notifyError(response.message)
            if (response.data) setResults(response.data)
        };

        const debounce = setTimeout(fetchResults, 500)

        return () => clearTimeout(debounce)
    }, [searchTerm]);


    return (
        <div className="divSearchBarContainer">
            <input
                className="searchBarInput"
                type="text"
                placeholder="Buscar empresa o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon
                width="16"
                height="16"
                fill="#457B9D"
            />
        </div>
    );
}

export default SearchBar;
