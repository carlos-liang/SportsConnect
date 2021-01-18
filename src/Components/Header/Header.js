import React, { Component } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListSubheader,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Badge,
  CircularProgress,
  Card
} from '@material-ui/core';
import { ReactComponent as Logo } from '../../Assets/logo.svg';
import { makeStyles } from '@material-ui/core/styles';
import SignInForm from '../SignInForm';
import SignUpForm from '../SignUpForm';
import { AuthConsumer } from "../../authContext.js";
import { Link, withRouter } from 'react-router-dom';
import db from '../../Model';
import app, {fs} from '../../base.js';

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open_login: false,
      open_sign_up: false,
      notifications: false,
      notifs: [], // List of notifications to display
      user: {},
      account: false,
      anchorEl: null,
      isLoading: true,
      message: '',
      notifLoading: false
    }
  }

  componentDidMount() {
    app.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) { // User signed in
        this.props.history.push('/dashboard');
        // Get account details (?)
        db.getAccountDetails().then(data => {
          this.setState({ user: data });
        }).catch(e => {
          this.setState({ isLoading: false });
        })
        // Subscribe to notifications
        db.onNotification(this.updateNotifs.bind(this)).then(() => {
          console.log('Subscribed to notifications.');
        });
      } else {
        // Signed out
        this.props.history.push('/');
      }
    });
  }

  updateNotifs(notificationsList) {
    this.setState({ notifs: notificationsList });
  }

  signOut() {
    db.signOut().then(() => {
      this.closeMenu();
      this.setState({ message: 'Signed out! Come back soon'});
      console.log('Successfully signed out.');
    }).catch((error) => {
      this.closeMenu();
      this.setState({ message: 'Failed to log out please try again soon'});
      console.log('Failed to sign out: ', error);
    });
  }

  openMenu(e) {
    const { currentTarget } = e;
    const { state } = this;
    state[currentTarget.name] = true;
    state.anchorEl = currentTarget;
    this.setState({ state });
  }

  closeMenu() {
    const { state } = this;
    state.notifications = false;
    state.account = false;
    state.anchorEl = null;
    this.setState({ state });
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

  closeMessage() {
    this.setState({ message: '' });
  }

  pushLink(notifcation) {
    this.setState({ notifLoading: true });
    db.dismissNotification(notifcation.logEntryId).then(() => {
      this.setState({ notifications: false, anchorEl: null });
      this.props.history.push('/');
      this.props.history.push(notifcation.link);
      this.setState({ notifLoading: false });
    }).catch(e => {
      console.log(e);
    })
  }

  // THIS HELPER FUNCTION IS COPIED/BORROWED DIRECTLY FROM STACKOVERFLOW:
  // https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time-eg-2-seconds-ago-one-week-ago-etc-best
  timeSince(timeStamp) {
    let now = new Date(),
      secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
    if(secondsPast < 60){
      // return parseInt(secondsPast) + 's';
      return '0m'
    }
    if(secondsPast < 3600){
      return parseInt(secondsPast/60) + 'm';
    }
    if(secondsPast <= 86400){
      return parseInt(secondsPast/3600) + 'h';
    }
    if(secondsPast > 86400){
        const day = timeStamp.getDate();
        const month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
        const year = timeStamp.getFullYear() == now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
        return day + " " + month + year;
    }
  }

  signedInView() {
    const { open_login, open_sign_up, notifications, account, anchorEl, message, notifs, user, notifLoading } = this.state;
    const getMessage = (message, keywordIndices) => {
      message = message.split('%%');
      keywordIndices = keywordIndices.split('%%');
      let htmlMessage = "";
      message.forEach((m, i) => {
        let isKeyword = false;
        keywordIndices.forEach((ki) => {
          if (ki == i.toString()) {
            isKeyword = true;
          }
        });
        if (isKeyword) {
          htmlMessage += '<b>' + m + '</b>';
        } else {
          htmlMessage += m;
        }
      });
      return htmlMessage;
    }
    console.log(notifs);
    let notifsList = (notifs || []).length ? notifs.sort((notif_1, notif_2) => {
      const time_1 = notif_1.timestamp ? notif_1.timestamp.toDate() : new Date(0);
      const time_2 = notif_2.timestamp ? notif_2.timestamp.toDate() : new Date(0);
      return time_2.getTime() - time_1.getTime()
    }) : [];
    notifsList = (notifsList || []).length ? notifsList.map(notif => {
      const time = this.timeSince(notif.timestamp ? notif.timestamp.toDate() : new Date(0));
      return (
        <MenuItem style={{paddingLeft: '6px', paddingRight: '6px', paddingTop: '3px', paddingBottom: '3px'}} onClick={() => { this.pushLink(notif) }}>
          <Card style={{width: '700px', opacity: '0.9'}}>
            <ListItemText>
              <span style={{color: '#1F96ED', margin: '5px'}} dangerouslySetInnerHTML={{__html: getMessage(notif.logMessage, notif.keywordIndices)}}></span>
              <span style={{color: 'grey', fontSize: '0.9em', float: 'right', margin: '5px'}}>{time}</span>
            </ListItemText>
          </Card>
        </MenuItem>
      )
    }) : (
      <MenuItem>
          <ListItemText style={{ color: 'grey' }}>
            No new notifications!
          </ListItemText>
        </MenuItem>
    );

    return (
      <div>
        <AppBar position='fixed'>
          <Toolbar style={{ height: 90, backgroundColor: '#1F96ED' }}>
            <Grid container justify='space-between' alignItems='center'>
              <Grid component={Link} to='/' item>
                <Logo />
              </Grid>
              <Grid item>
                <Button style={{ fontFamily: 'Quicksand' }} component={Link} to='/dashboard' color='inherit'>  Dashboard </Button>
                <Button style={{ fontFamily: 'Quicksand' }} component={Link} to='/events' color='inherit'>  Events </Button>
                <IconButton name='notifications' style={{ color: 'white' }} onClick={this.openMenu.bind(this)}>
                {  (
                    <Badge badgeContent={notifs.length} color='secondary'>
                      <Icon> notifications </Icon>
                    </Badge>
                  )
                }
                </IconButton>
                <IconButton name='account' style={{ color: 'white' }} onClick={this.openMenu.bind(this)}>
                  <Icon> person </Icon>
                </IconButton>
              </Grid>
            </Grid>
            <Menu style={{ maxHeight: '700px', overflow: 'auto'}} open={notifications} anchorEl={anchorEl} onClose={this.closeMenu.bind(this)}>
              { !notifLoading ? notifsList : <div style={{width: '100px', height: '100px'}}><CircularProgress/></div> }
            </Menu>
            <Menu open={account} anchorEl={anchorEl} onClose={this.closeMenu.bind(this)}>
              <ListSubheader component='div'>
                {user.firstName} {user.lastName}
              </ListSubheader>
              <ListSubheader component='div'>
                {user.email}
              </ListSubheader>
              <Link to='/myAccount' style={{ textDecoration: 'none' }} color='inherit' onClick={this.closeMenu.bind(this)}>
                <MenuItem>
                  <ListItemIcon>
                    <Icon> person </Icon>
                  </ListItemIcon>
                  <ListItemText style={{ color: 'black' }}>
                    My Account
                  </ListItemText>
                </MenuItem>
              </Link>
              <MenuItem onClick={this.signOut.bind(this)}>
                <ListItemIcon>
                  <Icon> exit_to_app </Icon>
                </ListItemIcon>
                <ListItemText style={{ color: 'black' }}>
                  Sign Out
                </ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      </div>
    )
  }

  signedOutView() {
    const { open_login, open_sign_up, notifications, account, anchorEl } = this.state;
    return (
      <div>
        <AppBar position='fixed'>
          <Toolbar style={{ height: 90, backgroundColor: '#1F96ED' }}>
            <Grid container justify='space-between' alignItems='center'>
              <Grid component={Link} to='/' item>
                <Logo />
              </Grid>
              <Grid item>
                <Button style={{ fontFamily: 'Quicksand' }} color='inherit' onClick={this.openLogin.bind(this)} > Login </Button>
                <Button style={{ fontFamily: 'Quicksand' }} color='inherit' variant='outlined' onClick={this.openSignUp.bind(this)} > Sign Up </Button>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <Dialog open={open_login} onClose={this.closeLogin.bind(this)} maxWidth='sm' fullWidth >
          <DialogTitle style={{height: '20px'}}>
            <IconButton style={{ float: 'right', padding: '0', margin: '0' }} onClick={this.closeLogin.bind(this)}>
              <Icon> close </Icon>
            </IconButton>
          </DialogTitle>
          <DialogContent >
            <SignInForm />
          </DialogContent>
        </Dialog>
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
      </div>
    )
  }

  render() {
    const { message } = this.state;
    return (
      <div>
        <AuthConsumer>
          {({signedIn}) => (
            <div>
              {signedIn ? this.signedInView() : this.signedOutView()}
            </div>
          )}
        </AuthConsumer>
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
          ]} />
      </div>
    );
  }
}

export default withRouter(Header);
