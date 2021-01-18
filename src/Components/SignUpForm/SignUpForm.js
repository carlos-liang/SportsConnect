import React, { Component } from 'react';
import {
  Button,
  TextField,
  Grid,
  InputAdornment,
  Icon,
  IconButton,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@material-ui/core';
import {
  validateForm,
  verify_email,
  verify_password,
  verify_datetime,
  verify_firstName,
  verify_lastName,
  verify_dob,
  verify_gender,
  verify_phoneNumber,
  verify_typePreferences
} from '../../utils';
import { makeStyles } from '@material-ui/core/styles';
import db from '../../Model';

const fields = ['first_name', 'last_name', 'email', 'password', 'dob', 'phone', 'gender'];
const FormState = {
  NORMAL: 0,
  LOADING: 1,
  ERROR_1: 2, // Account already exists with this email.
  ERROR_2: 3, // Email is invalid.
  ERROR_3: 4, // Password is invalid.
  ERROR_4: 5  // Some issues with fields.
}

class SignUpForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: FormState.NORMAL,
      user: {},
      errors: {},
      showPassword: false
    }
    this.displayResponse.bind(this);
  }

  submit(e) {
    e.preventDefault();
    const { user } = this.state;
    // Confirm fields are non-empty
    const errors = validateForm(user, fields);
    // Verify each field is valid
    let fieldError = "";
    fieldError = fieldError + verify_firstName(user['first_name']);
    fieldError = fieldError + verify_lastName(user['last_name']);
    fieldError = fieldError + verify_email(user['email']);
    fieldError = fieldError + verify_password(user['password']);
    fieldError = fieldError + verify_datetime(new Date(user['dob']));
    fieldError = fieldError + verify_gender(user['gender']);
    fieldError = fieldError + verify_phoneNumber(user['phone']);
    if (fieldError != "") {
      console.log(fieldError);
    }
    console.log({
      email: user['email'],
      password: user['password'],
      dateOfBirth: new Date(user['dob']),
      phone_number: user['phone'],
      first_name: user['first_name'],
      last_name: user['last_name'],
      typePreferences: [],
      gender: user['gender'],
      photo_URL: ''
   });
    if (Object.keys(errors).length) {
      this.setState({ errors: errors });
      return;
    }
    console.log('Signing up...');
    this.setState({ formState: FormState.LOADING });
    db.signUp({
      email: user['email'],
      password: user['password'],
      dateOfBirth: new Date(user['dob']),
      phone_number: user['phone'],
      first_name: user['first_name'],
      last_name: user['last_name'],
      typePreferences: [],
      gender: user['gender'],
      photo_URL: ''
    }).then(() => {
      this.displayResponse(FormState.NORMAL);
      console.log('Sign up successful.');
    }).catch((error) => {
      console.log('Sign up failed: ', error);
      if (error.code === 'auth/email-already-in-use') {
        this.displayResponse(FormState.ERROR_1);
      } else if (error.code === 'auth/invalid-email') {
        this.displayResponse(FormState.ERROR_2);
      } else if (error.code === 'auth/weak-password') {
        this.displayResponse(FormState.ERROR_3);
      } else if (error.code === 'parameter-invalid') {
        this.displayResponse(FormState.ERROR_4);
      }
    });
  }

  // Callback function called after a sign up request is made.
  displayResponse(signUpAttemptState) {
    if (signUpAttemptState === FormState.NORMAL) { // Success
      this.setState({formState: FormState.NORMAL});
      return;
    }
    if (signUpAttemptState === FormState.ERROR_1) {
      this.setState({formState: FormState.ERROR_1});
    } else if (signUpAttemptState === FormState.ERROR_2) {
      this.setState({formState: FormState.ERROR_2});
    } else if (signUpAttemptState === FormState.ERROR_3) {
      this.setState({formState: FormState.ERROR_3});
    } else if (signUpAttemptState === FormState.ERROR_4) {
      this.setState({formState: FormState.ERROR_4});
    } else {
      console.log('UNKNOWN ERROR AFTER SIGN UP ATTEMPT');
    }
  }

  onChange(e) {
    let { user, errors } = this.state;
    const { name, value } = e.target;
    user[name] = value;
    errors[name] = '';
    this.setState({ user: user, errors: errors });
  }

  togglePassword() {
    const { showPassword } = this.state;
    this.setState( { showPassword: !showPassword });
  }

  render() {
    const { errors, user, showPassword, formState } = this.state;
    const passWordType = showPassword ? 'text' : 'password';
    if (formState === FormState.LOADING) {
      return (
        <div>
          <CircularProgress />
        </div>
      );
    } else {
      return (
        <form onSubmit={this.submit.bind(this)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField name='first_name' label='First Name' variant='outlined' fullWidth onChange={this.onChange.bind(this)} error={Boolean(errors['first_name'])} helperText={errors['first_name']} autoFocus />
            </Grid>
            <Grid item xs={12}>
              <TextField error={Boolean(errors['last_name'])} name='last_name' label='Last Name' variant='outlined' fullWidth onChange={this.onChange.bind(this)} helperText={errors['last_name']} />
            </Grid>
            <Grid item xs={12}>
              <TextField error={Boolean(errors['email'])} name='email' label='Email' variant='outlined' fullWidth onChange={this.onChange.bind(this)} helperText={errors['email']} />
            </Grid>
            <Grid item xs={12}>
              <TextField error={Boolean(errors['phone'])} name='phone' label='Phone Number' variant='outlined' fullWidth onChange={this.onChange.bind(this)} helperText={errors['phone']} />
            </Grid>
            <Grid item xs={12}>
              <TextField name='password' label='Password' type={passWordType} variant='outlined' fullWidth onChange={this.onChange.bind(this)}
                error={Boolean(errors['password'])} helperText={errors['password']} InputProps={{
                  endAdornment: (
                    <InputAdornment>
                      <IconButton onClick={this.togglePassword.bind(this)}>
                        <Icon> visibility </Icon>
                      </IconButton>
                    </InputAdornment>
                  )
                }}/>
            </Grid>
            <Grid item xs={12}>
              <TextField error={Boolean(errors['dob'])} name='dob' label='DOB' variant='outlined' fullWidth onChange={this.onChange.bind(this)} helperText={errors['dob']} type='date' defaultValue="2000-01-20"/>
            </Grid>
            <Grid item xs={12}>
              <RadioGroup label='Gender' name="gender" onChange={this.onChange.bind(this)} row>
                <FormControlLabel value="male" control={<Radio color='primary'/>} label="Male" />
                <FormControlLabel value="female" control={<Radio color='primary'/>} label="Female" />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              {formState === FormState.ERROR_1 ?
                <Grid item xs={12}>
                  <h3>Email address already in use - please use a different one.</h3>
                </Grid> : <div></div>}
              {formState === FormState.ERROR_2 ?
                <Grid item xs={12}>
                  <h3> Email address is invalid. </h3>
                </Grid> : <div></div>}
              {formState === FormState.ERROR_3 ?
                <Grid item xs={12}>
                  <h3> Password is invalid. </h3>
                </Grid> : <div></div>}
              {formState === FormState.ERROR_4 ?
                <Grid item xs={12}>
                  <h3> Please make sure all values are valid. </h3>
                </Grid> : <div></div>}
              <Button type='submit' fullWidth variant='contained' color='primary' className='primary-button'>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      )
    }
  }
}

export default SignUpForm;
