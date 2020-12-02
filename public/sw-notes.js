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
    if(event.request.url.indexOf("localhost:3000/api/") >= 0){
        console.log(event);
        // event.respondWith(event.response.text().then((body)=>{
        //     let handler = new EventHandler(event.request);
        //     handler.setBody(body);

        //     return handler.getResponse()
        // }));

        return;
    }
        
    event.respondWith(fetch(event.request));
});


class MatchRouteStrategy{
    constructor(route){
        this.route = route;
        this.path = route.path;
        this.method = route.method;
        this.map_regex = route.map_regex;
    }

    match(request){
        return false;
    }
}

class MatchRouteForURLStrategy extends MatchRouteStrategy{
    constructor(route){
        super(route);
        this.base_var_regex_macros = /({\w+})/g;
        this.base_var_regex = "(\\w+)";
    }

    clear_special_chars(url){
        return url.replaceAll('/', '\\/').replaceAll("?", "\\?");
    }

    fill_regex_var(){
        let fill_path = this.clear_special_chars(this.path);

        for (let key in this.map_regex)
            fill_path = fill_path.replace('{'+key+'}', this.map_regex[key])
    
        fill_path = fill_path.replaceAll(this.base_var_regex_macros, this.base_var_regex.toString());

        return fill_path;
    }

    path_match(url){
        let match = url.match(RegExp(this.fill_regex_var(), "g"));
        
        if(match)
            if(match[0].length === url.length)
                return true;
        
        return false;
    }

    getVarValues(path){
        let buff = path;

        const separator = "||";

        this.path
            .replaceAll(this.base_var_regex_macros, separator)
            .split(separator)
            .filter((el, index, self)=>{
                return ((self.indexOf(el) === index) && el.length);
            })
            .forEach(element => {
                buff = buff.replace(element, separator);
            })
        ;
            
        return buff.split(separator).filter((el, index, self)=>{
            return el.length > 0;
        });
    }

    getVarNames(){
        let matches = this.path.match(this.base_var_regex_macros)

        if(matches.length)
            return matches.map(el=>el.replace('{', '').replace("}", ''))
        
        return false;
    }

    arr2obj_bin(keys = [], values = []){
        if(keys.length === values.length){
            let result = {};

            keys.forEach((key, index) => {
                result[key] = values[index];
            });

            return result;
        }
        return false;
    }

    fill_variables(url){
        let result = this.arr2obj_bin(this.getVarNames(), this.getVarValues(url));
        
        if(result)
            this.route.variables = result;
    }

    match(request){
        if(this.path_match(request.url)){
            this.fill_variables(request.url);
          
            return true;
        }

        return false;
    }
}

class MatchRouteForHTTPMethodStrategy extends MatchRouteStrategy{
    constructor(route){
        super(route);
    }

    match(request){
        if(request.method === this.method)
            return true;

        return false;
    }
}


class Route{
    constructor(path = null, method = null, callback){
        this.callback = callback;
        this.method = method;
        this.path = path;
        this.map_regex = {};

        this.matching_strategy = [MatchRouteForURLStrategy, MatchRouteForHTTPMethodStrategy];
    }

    match(request){
        if(this.matching_strategy.length){
            let flag_match = true;
            for(let index in this.matching_strategy)
                if(!(new this.matching_strategy[index](this)).match(request))
                    flag_match = false;

            if(flag_match){
                this.callback(this.variables);

                return true;
            }
        }

        return false;
    }
}

class Router{
    routes = [];
    root_exp = "(.+:\/\/localhost:3000\/api)";
    method = null;
    url = null;

    constructor(request){
        this.method = request.method;
        this.url = request.url;
    }

    addRoute(path = null, method = 'GET', callback){
        let route = new Route(path, method, callback);
        this.routes.push(route);

        return route;
    }

    get(path = null, callback){        
        return this.addRoute(path, "GET", callback);
    }
}

let router = new Router({method: 'GET', url: "/api/notes/12/"});

router.addRoute("/api/notes/{id}/{id2}/?__a={mode}", "GET", params=>console.log(params)).match({url: "/api/notes/12/21/?__a=1", method: 'GET'});


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

    getResponse = ()=>{
        return this.middleware.map(middleware=>{
            let obj_middleware = new middleware(this.request, body),
                answer = obj_middleware.getResponse();

            if(answer)
                return answer;
        })[0];
    }

    setBody = (body_text)=>{
        this.body = body_text;
    }
}

class Middleware{
    constructor(request, body){
        this.request = request;
        this.body = body;
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