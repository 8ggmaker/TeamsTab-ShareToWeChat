import React from 'react';
import logo from './logo.svg';
import './App.css';
import { TeamFiles } from './compoents/TeamFiles';
import { AuthEnd } from './compoents/AuthEnd';
import{BrowserRouter  as Router,Route} from 'react-router-dom'
import { AuthStart } from './compoents/AuthStart';
import { Config } from './compoents/Config';
import { Remove } from './compoents/Remove';

const App: React.FC = () => {
  return (<Router>
      <Route path={["/files"]} component={TeamFiles} />
      <Route path="/authstart" component={AuthStart}/>
        <Route path="/authend" component={AuthEnd} />
        <Route path="/config" component={Config}/>
        <Route path="/remove" component={Remove} />
  </Router>
  );
}

export default App;
