import Title from "../../../common/Title/Title";
import "./NavBar.css"

const NavBar = () => {
    return (
        <div className="navBar">
            <div className="navBarContent">
                <Title cursorPointer >Panel de administración</Title>
                <p className="parrafNavbar">Gestioná tus turnos de manera eficiente</p>
            </div>
        </div>
    );
}

export default NavBar;
