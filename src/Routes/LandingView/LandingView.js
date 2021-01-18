import React, { Component } from 'react';
import db from '../../Model';
import {
  Card,
  DialogContent,
  Dialog,
  DialogTitle,
  Icon,
  IconButton } from '@material-ui/core';
import { Button } from '../../Components/Button/Button.js';
import {Link} from 'react-router-dom';
import { getEventImage } from '../../utils';
import soccer from '../../Assets/SportImages/soccer.jpg';
import afl from '../../Assets/SportImages/afl.jpg';
import cricket from '../../Assets/SportImages/cricket.jpg';
import union from '../../Assets/SportImages/union.jpg';
import league from '../../Assets/SportImages/league.jpg';
import netball from '../../Assets/SportImages/netball.jpg';
import SignUpForm from '../../Components/SignUpForm';
import app, {fs} from '../../base.js';

class LandingView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open_sign_up: false
    }
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  openSignUp() {
    // If signed in, go to dashboard instead.
    if (app.auth().currentUser) {
      this.props.history.push('/dashboard');
      return;
    }
    this.setState({ open_sign_up: true });
  }

  closeSignUp() {
    this.setState({ open_sign_up: false });
  }

  render() {
    var random= Math.floor(Math.random() * 6) + 0;
    var images = ["AFL",
                 "Soccer",
                 "Cricket",
                 "Union",
                 "League"];

    const img1 = getEventImage(images[random]);



    const { open_sign_up } = this.state;
    return (
      <div style={{textAlign: 'center'}}>
        <img src={img1} style={{ zIndex: '-1', position: 'fixed', left: '0', top: '76px', width: '100%', height: 'auto', opacity: '0.2'}} />
        <br/><br/><br/><br/>
        <h1>
            Find a sports event to join, or host your own
        </h1>

        <br/><br/>
        <txt1>
          SportsConnect aims to connect sports teams and sports players of all levels by creating a
          platform for both stakeholders to easily interact. Sports teams often face the issue of
          having players that miss games due to one-off commitments. As a result these teams are required
          to find players to replace missing team members in order to ensure they can partake in a game. SportsConnect is a platform
           that enables teams to post a sporting event that they need players for, and receive applications to join
           from potential players.
        </txt1>
        <br/><br/>
        <br/><br/>
        <Button onClick={this.openSignUp.bind(this)}><txt4> Get Started </txt4></Button> &nbsp;&nbsp;&nbsp;&nbsp;

        <Dialog open={open_sign_up} onClose={this.closeSignUp.bind(this)} maxWidth='sm' fullWidth >
          <DialogTitle style={{height: '20px'}}>
            <IconButton style={{ float: 'right', padding: '0', margin: '0'}} onClick={this.closeSignUp.bind(this)}>
              <Icon> close </Icon>
            </IconButton>
          </DialogTitle>
          <DialogContent >
            <SignUpForm />
          </DialogContent>
        </Dialog>

        <br/><br/><br/>
        <br/><br/><br/>
        <br/><br/><br/>

      </div>
    );
  }
}

export default LandingView;

// <Button buttonStyle="btn--primary--outline"><txt5>Learn More</txt5></Button>