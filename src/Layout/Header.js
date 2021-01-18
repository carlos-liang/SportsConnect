// Do we need this file? We're using src/components/header/header.js file instead, aren't we?
/*

import React, { Component } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Dialog,
  TextField,
  FormGroup,
  FormControl
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open_login: false,
      open_sign_up: false
    }
  }

  openLogin() {
    this.setState({ open_login: true });
  }

  closeLogin() {
    this.setState({ open_login: false });
  }

  openSignUp() {
    this.setState({ open_sign_up: true });
  }

  closeSignUp() {
    this.setState({ open_sign_up: false });
  }

  submit(values) {
    console.log(values);
  }



  render() {
    const { open_login, open_sign_up } = this.state;
    return (
      <div>
        <AppBar position='static'>
          <Toolbar style={{ height: 120, backgroundColor: '#1F96ED' }}>
            <Button color='inherit' onClick={this.openLogin.bind(this)}> Login </Button>
            <Button color='inherit' variant='outlined' onClick={this.openSignUp.bind(this)}> Sign Up </Button>
          </Toolbar>
        </AppBar>
      <Dialog open={open_login} onClose={this.closeLogin.bind(this)} maxWidth='sm' fullWidth>
        <form>
        </form>
      </Dialog>
      <Dialog open={open_sign_up} onClose={this.closeSignUp.bind(this)} maxWidth='sm' fullWidth>
        <form>
        </form>
      </Dialog>
      </div>
    );
  }
}

export default Header;

*/