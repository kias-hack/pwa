import React from 'react';
import ReactDOM from 'react-dom';
import Main from "./components/main";

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("/sw-notes.js")
    .then(reg=>console.log(reg))
    .catch(reg=>console.log(reg));
}

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);
