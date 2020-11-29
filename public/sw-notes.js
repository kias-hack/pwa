let data = {
    notes: [
        {
            id: 0,
            name: "name",
            description: "desc name",
            date_start: "12.12.2020",
            date_end: "12.12.2020"
        },
        {
            id: 1,
            name: "name 1",
            description: "desc name 1",
            date_start: "12.12.2020",
            date_end: "12.12.2020"
        },
        {
            id: 2,
            name: "name 2",
            description: "desc name 2",
            date_start: "12.12.2020",
            date_end: "12.12.2020"
        },
        {
            id: 3,
            name: "name 3",
            description: "desc name 3",
            date_start: "12.12.2020",
            date_end: "12.12.2020"
        }
    ]
};

let counter = 3;

self.addEventListener('fetch',async (event, second) => {
    let handler = new EventHandler(event.request);

    if(event.request.url.indexOf("localhost:3000/api/") >= 0){
        let qq = await handler.getResponse();
        console.log(qq, handler);
        // event.respondWith(handler.getResponse());
        return false;
    }
        
    event.respondWith(fetch(event.request));
});




class EventHandler{
    constructor (request){
        this.request = request;
        this.response = false;
        this.setMiddleware();
    }

    setMiddleware = ()=>{
        this.middleware = [
            Note
        ];
    } 

    getResponse = async ()=>{
        return this.middleware.map(middleware=>{
            let obj_middleware = new middleware(this.request),
                answer = await obj_middleware.getResponse();

            if(answer)
                return answer;
        })[0];
    }
}

class Middleware{
    constructor(request){
        this.request = request;
    }
    
    run(){
        return false;
    }

    setResponse(response, status = true){
        let blob = new Blob([JSON.stringify(response)], {
            type: 'application/json'
        });

        let statusText = "";

        if(status){
            status = 200;
            statusText = "OK";
        }
        else{
            status = 404;
            statusText = "ERROR";
        }

        this.response = new Response(blob, {
            status: status,
            statusText: statusText,
            url: this.request.url,
        });
    }

    getResponse = ()=>{
        this.run();
        console.log(this.response);
        return this.response;
    };
}

class Note extends Middleware{
    constructor(request){
        super(request); 
    }

    run = ()=>{
        if(this.request.url.indexOf("/api/notes") >= 0)
            this.execute();   
    }

    execute = async ()=>{
        let request = this.request;
        // console.log("execute");
        switch(request.method){
            case "GET":
                this.setResponse({notes: data.notes});
                break;
            case "DELETE":
                const str = "localhost:3000/api/notes/";
                let idPtr = request.url.indexOf(str) + str.length,
                    id = parseInt(request.url[idPtr]);
                
                if(id === NaN){
                    this.setResponse({error: "Неверный ID"}, false)
                    break;
                }

                data.notes.map((note, index)=>{
                    if(note.id === id)
                        data.notes.splice(index, 1);
                })
                
                this.setResponse({notes: data.notes});
                break;
            case "POST":
                let body = await request.json();

                let flag = true;

                if(!body.name)
                    flag = false;

                if(!body.description)
                    flag = false;

                if(!flag){
                    this.setResponse({error: "Не все поля присутствуют"}, false);
                    break;
                }

                data.notes.push({
                    id: ++counter, 
                    name: body.name, 
                    description: body.description
                });

                this.setResponse({notes: data.notes});
                break;
        } 
    }
}