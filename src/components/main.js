import {React} from "react";
import { BrowserRouter } from "react-router-dom";
import { Route, Switch } from "react-router-dom/cjs/react-router-dom.min";
import Header from "./header";
import ListNotes from "./lists";

function Main(){
    return (
        <BrowserRouter>
            <Header/>
            <Switch>

                <Route path="/list/">
                    <ListNotes/>
                </Route>
            
            </Switch>
        </BrowserRouter>
    );
}

export default Main;