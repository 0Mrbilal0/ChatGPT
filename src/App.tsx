import React from 'react';
import './App.css';
import Chat from "./Components/Chat";

function App() {
  return (
      <div className={'cover-container d-flex w-100 h-100 p-3 mx-auto flex-column'}>
        <Chat />
      </div>
  );
}

export default App;
