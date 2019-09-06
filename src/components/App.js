import React from 'react';
import Home from './Home';
import './App.css';

const Route = require("react-router-dom").Route;
const Switch = require("react-router-dom").Switch;

const App = (props) => {
  const {preloadedState} = props;
  return (
    <Switch>
      <Route 
        exact
        path="/item/:id" 
        render={(props) => (<Home {...props} preloadedState={preloadedState} />)}
      />
    </Switch>
  );
};

export default App;
