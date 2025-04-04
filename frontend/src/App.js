import './App.css';
import { useState } from 'react';
import SoccerLineUp from 'react-soccer-lineup';

function App() {
  return (
    <div className="App">
         <SoccerLineUp
              size={ "small" }
              color={ "lightseagreen" }
              pattern={ "lines" }
            />
    </div>
  );
}

export default App;
