import './App.css';
import React from 'react';
import SpaceScene from './SpaceScene';

class App extends React.Component {
  componentDidMount() {
    new SpaceScene();
  }
  render() {
    return (
      <div id="scene">
      </div>
    );
  }
}

export default App;
