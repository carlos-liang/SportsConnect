import React, { Component } from 'react';
import {
  Button,
  TextField,
  AppBar,
  Toolbar,
  BottomNavigation
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { ReactComponent as Logo } from '../../Assets/logo.svg';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <div>
        <BottomNavigation style={{ height: 40, backgroundColor: '#1F96ED', position: 'fixed', bottom: 0, width: '100%' }} >
          <Logo />
          
        </BottomNavigation>
      </div>
    );
  }
}

export default Footer;
