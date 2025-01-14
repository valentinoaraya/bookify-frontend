import "./SearchBar.css"
import { SearchIcon } from "../../common/Icons/Icons";

const SearchBar = () => {
    return (
        <div className="divSearchBarContainer">
            <input
                className="searchBarInput"
                type="text"
                placeholder="Buscar empresa o servicio..."
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
