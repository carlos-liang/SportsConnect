import React, { Component } from 'react';
import {
  Button,
  TextField,
  Grid,
  CircularProgress
} from '@material-ui/core';
import { validateForm } from '../../utils';
import { makeStyles } from '@material-ui/core/styles';
import db from '../../Model';

const fields = ['email', 'password'];
const FormState = {
  NORMAL: 0,
  LOADING: 1,
  ERROR_1: 2, // Incorrect email/password
  ERROR_2: 3 // User email doesn't exist or account is disabled
}

class SignInForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: FormState.NORMAL,
      user: {},
      errors: {},
      forgotPassword: false
    }
    this.displayResponse.bind(this);
  }

  submit(e) {
    e.preventDefault();
    const { user } = this.state;
    const errors = validateForm(user, fields);
    if (Object.keys(errors).length) {
      this.setState({ errors: errors });
      return;
    }
    console.log('Signing in...');
    this.setState({ formState: FormState.LOADING });
    db.signIn({
      email: user['email'],
      password: user['password']
    }).then(() => {
      console.log('Sign in successful.');
      this.displayResponse(FormState.NORMAL);
    }).catch((error) => {
      console.log('Sign in failed: ', error);
      if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password') {
        this.displayResponse(FormState.ERROR_1);
      } else if (error.code === 'auth/user-disabled' || error.code === 'auth/user-not-found') {
        this.displayResponse(FormState.ERROR_2);
      }
    });
  }

  submitForgotPassword() {
    console.log('Placeholder for forgotten password');
  }

  // Callback function called after a sign in request is made.
  displayResponse(signInAttemptState) {
    if (signInAttemptState === FormState.NORMAL) { // Success
      this.setState({formState: FormState.NORMAL});
      return;
    }
    if (signInAttemptState === FormState.ERROR_1) {
      this.setState({formState: FormState.ERROR_1});
    } else if (signInAttemptState === FormState.ERROR_2) {
      this.setState({formState: FormState.ERROR_2});
    } else {
      console.log('UNKNOWN ERROR AFTER SIGN IN ATTEMPT');
    }
  }

  onChange(e) {
    const { user, errors } = this.state;
    const { name, value } = e.target;
    user[name] = value;
    errors[name] = ''
    this.setState({ user: user, errors: errors });
  }

  changeForgotPassword() {
    const { forgotPassword } = this.state;
    this.setState({ forgotPassword: !forgotPassword });
  }

  render() {
    const { user, errors, formState, forgotPassword } = this.state;
    if (formState === FormState.LOADING) {
      return (
        <div>
          <CircularProgress />
        </div>
      );
    } else if (forgotPassword) {
      return (
        <form onSubmit={this.submitForgotPassword.bind(this)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField name='email' label='Email' type='email' variant='outlined' fullWidth onChange={this.onChange.bind(this)}
                error={Boolean(errors['email'])} helperText={errors['email']} />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' fullWidth variant='contained' color='primary' className='primary-button'>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      )
    } else {
      return (
        <form onSubmit={this.submit.bind(this)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField name='email' label='Email' type='email' variant='outlined' fullWidth onChange={this.onChange.bind(this)}
                error={Boolean(errors['email'])} helperText={errors['email']} />
            </Grid>
            <Grid item xs={12}>
              <TextField name='password' label='Password' type='password' variant='outlined' fullWidth onChange={this.onChange.bind(this)}
                error={Boolean(errors['password'])} helperText={errors['password']} />
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth variant='outlined' color='primary' className='primary-button' onClick={this.changeForgotPassword.bind(this)}>
                Forgot Password
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' fullWidth variant='contained' color='primary' className='primary-button'>
                Submit
              </Button>
            </Grid>
            {formState === FormState.ERROR_1 ?
              <Grid item xs={12}>
                <h3>Incorrect Email/Password - please try again.</h3>
              </Grid> : <div></div>}
            {formState === FormState.ERROR_2 ?
              <Grid item xs={12}>
                <h3>No account with this email exists, or it is disabled.</h3>
              </Grid> : <div></div>}
          </Grid>
        </form>
      );
    }
  }
}

export default SignInForm;
