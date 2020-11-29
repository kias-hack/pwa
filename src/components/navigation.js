import {Link} from "react-router-dom";

function Navigation(){
    return (
        <ul className="burger-menu">
            <li>
               <Link to="/">Главная</Link> 
            </li>
            <li>
               <Link to="/list/">Список заметок</Link> 
            </li>
            <li>
               <Link to="/current/">Текущие заметки</Link> 
            </li>
            <li>
               <Link to="/tgnotes/">Теги заметок</Link> 
            </li>
        </ul>
    );
}

export default Navigation;