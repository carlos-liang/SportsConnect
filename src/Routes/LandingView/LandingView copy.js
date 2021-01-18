import React, { Component } from 'react';
import db from '../../Model';
import { Card } from '@material-ui/core';
import { Button } from '../../Components/Button/Button.js';
import {Link} from 'react-router-dom';

class LandingView extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <div style={{textAlign: 'center'}}>
      <br/><br/><br/>
        <h1>
            Find a sports event to join, or host your own 
        </h1>

        <h1> Test </h1>
        
        <h5>
          SportsConnect aims to connect sports teams and sports people of all levels by creating a 
          platform for both stakeholders to easily interact. Sports teams often face the issue of 
          having players that miss games due to one-off commitments as a result these teams are required 
          to find players to fill in order to ensure they can partake in a game. SportsConnect is a web-application
           that enables teams to post a sporting event that they need players for and receive applications to join 
           from potential players.
        </h5>
        <Button>Get Started</Button>&nbsp;&nbsp;&nbsp;&nbsp;<Button buttonStyle="btn--primary--outline">Learn More</Button>
      </div>
    );
  }
}

export default LandingView;
