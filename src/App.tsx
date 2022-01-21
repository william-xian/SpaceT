import './App.css';
import React from 'react';
import SpaceScene from './SpaceScene';
import { Container, Content } from 'rsuite'

class App extends React.Component {
  componentDidMount() {
    new SpaceScene();
  }
  render() {
    return (
      <Container>
        <Content><div id="scene"></div></Content>
      </Container>
    );
  }
}

export default App;
