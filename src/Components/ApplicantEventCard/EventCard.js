import React, { Component } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardHeader,
  Grid,
  Icon,
  IconButton,
  Button,
  Collapse,
  CircularProgress,
    Snackbar
} from '@material-ui/core';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment';
import db from '../../Model';
import { getEventImage } from '../../utils';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const message = 'Message';

class MyEventCard extends Component {
  constructor(props) {
    super(props);
    let applicationData = null;
    let eventsApplied = [];
    if (props.where === 'events_page') {
      eventsApplied = props.myApplications.filter(application => {
        if (application.eventId === props.event.eventId) {
          // Side effect: update events object to application object for each match
          applicationData = application;
          // Then, return boolean for match.
          return true;
        }
      });
    }
    this.state = {
      where: props.where, // Where this card will be used ('dashboard_page' | 'events_page')
      myApplications: props.myApplications || [],
      dashboard_applied: true, // Whether or not the event has been applied to - relevant to the dashboard page
      events_applied: !!eventsApplied.length,
      message: '', // Popup feedback message
      event: applicationData || props.event, // This is really an application object with event data included, if you're on dashboard page. Otherwise, it's just event object.
      showDescription: false,
      isLoading: false,
      gone: false
    }
  }

  pushEvent() {
    const { eventId } = this.state.event;
    this.props.history.push(`events/${eventId}`);
  }

  toggleDescription() {
    const { showDescription } = this.state;
    this.setState({ showDescription: !showDescription });
  }

  apply() {
    const { event } = this.state;
    this.setState({ isLoading: true });
    db.createApplication(event.eventId, message, event.eventOwnerUserId, event.eventName).then((data) => {
      let e = event;
      e.applicationId = data.applicationId; // Update new application data
      e.state = data.state;
      this.setState({ isLoading: false, message: 'Successfully applied', event: e, dashboard_applied: true, events_applied: true });
    }).catch(e => {
      this.setState({ isLoading: false, message: 'Error applying to an event, please try again' });
    });
  }

  deleteApplication() {
    const { event } = this.state;
    this.setState({ isLoading: true });
    db.deleteApplication(event.applicationId, event.eventOwnerUserId, event.eventName).then((data) => {
      this.setState({ isLoading: false, message: 'Successfully unapplied', dashboard_applied: false, events_applied: false });
    }).catch(e => {
      this.setState({ isLoading: false, message: 'Error deleting application, please try again' });
    })
  }

  confirmation = () => {
    confirmAlert({
      title: 'Unapply From Event',
      message: 'Are you sure you want to unapply from this event?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => this.deleteApplication(this)
        },
        {
          label: 'No',
          onClick: () => console.log("Do Nothing")
        }
      ]
    });
  };

  deleteApplicationForDeletedEvent() {
    const { event } = this.state;
    this.setState({ isLoading: true });
    db.deleteApplication(event.applicationId, 'event owner wont get notification so this userId field doesnt matter', event.eventName).then((data) => {
      this.setState({ isLoading: false, message: 'Successfully deleted application', gone: true });
    }).catch(e => {
      this.setState({ isLoading: false, message: 'Error deleting application, please try again' });
    })
  }

  closeMessage() {
    this.setState({ message: '' });
  }

  render() {
    const { event, dashboard_applied, events_applied, gone } = this.state;
    const { showDescription, isLoading, myApplications, message } = this.state;

    if (isLoading) return <CircularProgress />;

    if (gone) return null; // Will be blank space in list (since deleted application of deleted event shouldnt show up, and component isnt removed from parent list)

    const deletedEventMessage_1 = 'The owner of the event ';
    const deletedEventMessage_2 = ' has cancelled the event.';
    if (event.state === 'EVENT_DELETED') {
      return (
        <Card style={{height: '100%', width: '100%'}}>
          <div style={{ paddingLeft: '5%', paddingRight: '5%', height: '100%', fontSize: '1.2em', backgroundColor: 'lightgrey', color: '#1F96ED', textAlign: 'center'}}>
            <br/><br/><br/><br/>
            {deletedEventMessage_1}
            <div style={{fontWeight: 'bold'}}>{event.eventName}</div>
            {deletedEventMessage_2}
            <br/><br/><br/><br/>
            <Button variant='contained' color='primary' className='primary-button' onClick={this.deleteApplicationForDeletedEvent.bind(this)}> Ok </Button>
          </div>
        </Card>
      );
    }

    let time = 'Unknown time...';
    if (event.datetime) {
      time = moment(event.datetime).format('llll');
    }
    const image = getEventImage(event.type);

    const body = (
      <div>
        <CardMedia
          style={{ height: 150 }}
          image={ image } />
        <CardContent>
          <div className='event-card-title'>
            {event.eventName}
          </div>
          <Grid container spacing={3}>
            <Grid item xs>
              <Icon> directions_running </Icon>
            </Grid>
            <Grid item xs>
              <Icon> bar_chart </Icon>
            </Grid>
            <Grid item xs>
              <Icon> access_time </Icon>
            </Grid>
            <Grid item xs>
              <Icon> map </Icon>
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs>
              <txt2> {event.type} </txt2>
            </Grid>
            <Grid item xs>
              <txt2> {event.level} </txt2>
            </Grid>
            <Grid item xs>
              <txt2> {time} </txt2>
            </Grid>
            <Grid item xs>
              <txt2> {event.location} </txt2>
            </Grid>
          </Grid>
        </CardContent>
        <hr />
      </div>
    );

    const dashboardPage = (this.state.where === 'dashboard_page');

    return (
      <div>
        <Card>
          <CardContent>
            {body}
          </CardContent>
          <CardContent>
            <Collapse in={showDescription} timeout='auto' unmountOnExit>
              <h5> {event.description} </h5>
            </Collapse>
            <Grid container spacing={3}>
              <Grid item xs>
                <Button fullWidth variant='outlined' color='primary' className='learn-button' onClick={this.toggleDescription.bind(this)}> {dashboardPage ? 'See More' : 'Learn More'} </Button>
              </Grid>
              { ((dashboardPage && !dashboard_applied) || (!dashboardPage && !events_applied)) &&
                <Grid item xs>
                  <Button fullWidth variant='contained' color='primary' className='primary-button' onClick={this.apply.bind(this)}> Apply </Button>
                </Grid>
              }
              { ((dashboardPage && dashboard_applied) || (!dashboardPage && events_applied)) &&
                <Grid item xs>
                  <Button fullWidth variant='contained' color='secondary' className='delete-button' onClick={this.confirmation}> Unapply </Button>
                </Grid>
              }
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

export default withRouter(MyEventCard);
