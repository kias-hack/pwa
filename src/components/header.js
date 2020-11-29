import Navigation from "./navigation";
import Logo from "./logo";

function Header(){
    return (
        <header>
            <ul>
                <li key="navigation"><Navigation/></li>
                <li key="logo"><Logo/></li>
            </ul>
        </header>
    );
}

export default Header;