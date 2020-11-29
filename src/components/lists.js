import {Component} from "react";
import onerror from "./error";

function NoteRow(props){
    let {id,name} = props.note;

    return (
        <li>
            {name}
            <span onClick={()=>{props.ondelete(id);}}>Удалить</span>
        </li>
    );
};

class ListNotes extends Component{
    constructor(props){
        super(props);
        this.state = {
            notes: []
        };
    }

    componentDidMount = ()=>{
        fetch("/api/notes/")
            .then(data=>data.json())
            .then(
                data => {this.setState({notes: data.notes});},
                onerror
            );
    }

    deleteNote = (id)=>{
        if(parseInt(id) === NaN)
            return false;

        fetch("/api/notes/"+id.toString(), {
            method: "DELETE"
        })
            .then(data=>data.json())
            .then(
                data=>{
                    this.setState({notes: data.notes});
                },
                onerror
            );
    }

    render(){
        let {notes} = this.state;
        
        let notes_row_arr = notes.map((note)=>
            <NoteRow note={note} ondelete={this.deleteNote} key={note.id}/>
        );

        return (
            <div>
                <ul>
                    {notes_row_arr}
                </ul>
            </div>
        );
    }
}

export default ListNotes;