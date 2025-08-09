import Title from "../../../common/Title/Title";
import "./NavBar.css"

const NavBar: React.FC<{ nameCompany: string }> = ({ nameCompany }) => {
    return (
        <div className="navBar">
            <div className="navBarContent">
                <Title cursorPointer >{nameCompany}</Title>
            </div>
        </div>
    );
}

export default NavBar;
