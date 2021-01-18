import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Link, BrowserRouter as Router } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import {AuthProvider} from './authContext.js';
import PrivateRoute from './Routes/PrivateRoute';
import LandingView from './Routes/LandingView';
import DashboardView from './Routes/DashboardView';
import MyAccountView from './Routes/MyAccountView';
import EventsView from './Routes/EventsView';
import EventView from './Routes/EventView';
import CoreLayout from './Layout/CoreLayout';
import './normalise.css';
import './index.css';

import ModelTest from './Model/Model.test.js'; // Temporary, for testing Model.js

const routing = (
  <AuthProvider >
    <Router>
      <CoreLayout>
        <Route exact path='/' component={LandingView} />
        <PrivateRoute exact path='/dashboard' component={DashboardView} />
        <PrivateRoute exact path='/myaccount' component={MyAccountView} />
        <PrivateRoute exact path='/events' component={EventsView} />
        <PrivateRoute exact path='/events/:id' component={EventView} />
      </CoreLayout>
    </Router>
  </AuthProvider>
);

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// Temporary for testing
// setTimeout(() => {
//   // ModelTest.runModelTest();
// }, 2000);
