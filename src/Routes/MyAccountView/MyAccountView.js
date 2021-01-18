import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  Icon,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Select,
  MenuItem,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Input,
  Chip,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Snackbar
} from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import ReviewCard from '../../Components/ReviewCard';
import db from '../../Model';
import { validateForm } from '../../utils';
import moment from 'moment';


const fields = ['firstName', 'lastName', 'email', 'phone_number', 'typePreferences'];

const options = ['soccer', 'union', 'league', 'AFL', 'cricket', 'tennis', 'basket']

class MyAccountView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      errors: {},
      preferenceOptions: options,
      isLoading: true,
      edit: false,
      changed: false,
      message: ''
    }
  }

  componentDidMount() {
    this.setAccount();
  }

  setAccount() {
    let { preferenceOptions } = this.state;
    this.setState({ isLoading: true });
    db.getUserDetails().then(data => {
      const account = {
        firstName: data.firstName || '-',
        lastName: data.lastName || '-',
        email: data.email || '-',
        typePreferences: data.typePreferences || [],
        dateOfBirth: new Date(data.dateOfBirth),
        phone_number: data.phone_number || '-',
        gender: data.gender || '-',
        photo_URL: data.photo_URL || '-',
        personalReviews: data.reviews.reviewsByMe || [],
        externalReviews: data.reviews.reviewsForMe || [],
      }

      preferenceOptions = preferenceOptions.filter(preference => {
        return !data.typePreferences.includes(preference);
      })

      this.setState({ account: account, isLoading: false, preferenceOptions: preferenceOptions });
    })
  }

  addPreference(preference) {
    let { account, preferenceOptions } = this.state;
    account.typePreferences.push(preference);

    preferenceOptions = (preferenceOptions || []).filter(pref => {
      return pref != preference;
    });

    this.setState({ account: account, preferenceOptions: preferenceOptions, changed: true });
  }

  deletePreference(preference) {
    let { account, preferenceOptions } = this.state;
    preferenceOptions.push(preference);

    account.typePreferences = (account.typePreferences || []).filter(pref => {
      return pref != preference;
    });

    this.setState({ account: account, preferenceOptions: preferenceOptions, changed: true });
  }


  onChange(event) {
    const { name, value } = event.target;
    const user = Object.assign({}, this.state.account);
    const { errors } = this.state;
    user[name] = value;
    errors[name] = ''
    this.setState({ account: user, errors: errors });
    console.log(user, errors);
  }

  onSubmit() {
    const { account } = this.state;
    this.setState({ isLoading: true });
    account.dateOfBirth = new Date(account.dateOfBirth);
    db.updateAccountDetails(account).then((updatedDetails) => {
      this.setState({ message: 'Account updated successfully' });
      console.log('Account updating successful: ', updatedDetails);
    }).catch((error) => {
      this.setState({ message: 'Error updating the account'});
    }).finally(() => {
      this.setState({ isLoading: false, edit: false, changed: false });
    });
  }

  onChangeSelect(typePreferencesEvent) {
    const { account } = this.state;
    account.typePreferences = typePreferencesEvent.target.value;;
    this.setState({ account: account });
    console.log(account);
  }

  closeMessage() {
    this.setState({ message: '' });
  }

  editAccount() {
    this.setState({ edit: true });
  }

  closeEdit() {
    this.setAccount();
    this.setState({ edit: false });
  }

  updateAccount(e) {
    const { account } = this.state;
    const { name, value } = e.target;
    account[name] = value;
    this.setState({ account: account });
  }

  render() {
    const { errors, account, isLoading, preferenceOptions, message, edit, changed } = this.state;
    if (isLoading) return <CircularProgress />;
    const initials = `${account.firstName[0]}${account.lastName[0]}`;

    const unCheckedpreferences = preferenceOptions.map(preference => {
      return (
        <Grid item xs={3}>
          <Chip
            avatar={<Avatar>{preference[0].toUpperCase()}</Avatar>}
            label={preference}
            clickable
            onDelete={() => this.addPreference(preference)}
            deleteIcon={<Icon> done </Icon>} />
        </Grid>
      )
    });

    const checkedpreferences = (account.typePreferences || []).map(preference => {
      return (
        <Grid item xs={3}>
          <Chip
            avatar={<Avatar>{preference[0].toUpperCase()}</Avatar>}
            label={preference}
            clickable
            color='primary'
            onDelete={() => this.deletePreference(preference)}
            deleteIcon={<Icon> close </Icon>} />
        </Grid>
      )
    });

    const dobText = edit ? <TextField name='dateOfBirth' value={moment(account.dateOfBirth).format('YYYY-MM-DD')} type='date' onChange={this.updateAccount.bind(this)} /> : moment(account.dateOfBirth).format('LL');
    const emailText = edit ? <TextField name='email' value={account.email} onChange={this.updateAccount.bind(this)} /> : account.email;
    const phoneText = edit ? <TextField name='phone_number'value={account.phone_number}  onChange={this.updateAccount.bind(this)} /> : account.phone_number;
    const genderText = edit ? <TextField name='gender' value={account.gender} onChange={this.updateAccount.bind(this)} /> : account.gender;

    const showButtons = changed || edit ? true : false;

    const reviewsForMe = (account.personalReviews || []).map(review => {
      return (
        <Grid item xs={6}>
          <ReviewCard review={review} showName />
        </Grid>
      )
    });

    const reviewsByMe = (account.externalReviews || []).map(review => {
      return (
        <Grid item xs={6}>
          <ReviewCard review={review} />
        </Grid>
      )
    });


    return (
      <div>
        <Card>
          <CardContent>
            <Grid container spacing={3} alignItems='center'>
              <Grid item xs>
                <Avatar style={{ height: '300px', width: '300px', fontSize: '50px', backgroundColor: '#e8f4f8', color: 'black' }}> {initials} </Avatar>
              </Grid>
              <Grid item xs>
                <div>
                  <h2>
                    {account.firstName} {account.lastName}
                    { !showButtons &&
                      <div style={{ float: 'right' }}>
                        <Button onClick={this.editAccount.bind(this)} color='primary' variant='outlined'> Edit </Button>
                      </div>
                    }
                    { showButtons && (
                      <div style={{ float: 'right' }}>
                        <Button onClick={this.onSubmit.bind(this)} color='primary' variant='contained'> Save </Button>
                        <Button onClick={this.closeEdit.bind(this)} color='secondary' variant='outlined'> Cancel </Button>
                      </div>
                    )}
                  </h2>
                </div>
                <List>
                  <ListItem>
                    <ListItemAvatar> <Icon> date_range </Icon> </ListItemAvatar>
                    <ListItemText primary='Date of Birth' secondary={dobText} />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar> <Icon> email </Icon> </ListItemAvatar>
                    <ListItemText primary='Email' secondary={emailText} />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar> <Icon> phone </Icon> </ListItemAvatar>
                    <ListItemText primary='Phone Number' secondary={phoneText} />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar> <Icon> sentiment_satisfied </Icon> </ListItemAvatar>
                    <ListItemText primary='Gender' secondary={genderText} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box style={{ padding: '50px', backgroundColor: '#e8f4f8' }}>
                  <Grid container spacing={3} alignItems='center'>
                    <Grid item xs={12}>
                      <h1> Preferences </h1>
                    </Grid>
                    {checkedpreferences}
                    {unCheckedpreferences}
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs>
                <Box style={{ padding: '50px', backgroundColor: '#e8f4f8' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <h1> Reviews on you </h1>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    {reviewsByMe}
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs>
                <Box style={{ padding: '50px', backgroundColor: '#e8f4f8' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <h1> Reviews written by you </h1>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    {reviewsForMe}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(message)}
          autoHideDuration={5000}
          onClose={this.closeMessage.bind(this)}
          message={<span> {message} </span>}
          action={[
            <IconButton color="inherit" onClick={this.closeMessage.bind(this)}>
              <Icon> close </Icon>
            </IconButton>,
          ]}
        />
      </div>
    );
  }
}

export default MyAccountView;
