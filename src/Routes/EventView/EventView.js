import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { getEventImage } from '../../utils';
import {
  Card,
  CardMedia,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  Icon,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar
} from '@material-ui/core';
import EventForm from '../../Components/EventForm';
import ApplicantButton from '../../Components/ApplicantButton';
import db from '../../Model';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

class EventView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      isLoading: true,
      openEdit: false,
      message: '',
      noEvent: false
    }
  }

  componentDidMount() {
    this.getEvent();
  }

  getEvent() {
    const { id } = this.props.match.params;
    this.setState({ isLoading: true });
    db.getEvent(id).then(data => {
      console.log(data);
      this.setState({ isLoading: false, event: data });
    }).catch((error) => {
      console.log('getEvent failed: ', error.message);
      if (error.code === 'permission-denied') {
        this.setState({noEvent: true, isLoading: false});
      }
    });
  }

  openEdit() {
    this.setState({ openEdit: true });
  }

  closeEdit() {
    this.setState({ openEdit: false });
  }

  deleteEvent() {
    console.log('getEvent failed: ');
    const { id } = this.props.match.params;
    db.deleteMyEvent(id).then(() => {
      console.log('Event deleted');
      this.setState({ isLoading: false, openEdit: false, isLoading: true, message: 'Successfully Deleted Event' });
      this.props.history.push('/dashboard');
    }).catch((error) => {
      this.setState({ message: 'Failed to Delete Event'});
      console.log('Event deletion failed: ', error);
    }).finally(() => {
      // do nothing
    });
  }

  delete = () => {
    confirmAlert({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            confirmAlert({
              title: 'Deleting event...',
              message: 'Please wait...'
            });
            this.deleteEvent();
          }
        },
        {
          label: 'No',
          onClick: () => console.log("Do Nothing")
        }
      ]
    });
  };

  updateEvent(request) {
    this.setState({ isLoading: true });
    db.updateMyEvent(request).then((updatedEventData) => {
      this.setState({ isLoading: false, openEdit: false,  event: updatedEventData, message: 'Successfully updated the event' });
    }).catch((error) => {
      this.setState({ isLoading: false, openEdit: false, message: 'Failed to update the event' });
      console.log(error.code, error.message);
    });
  }

  closeMessage() {
    this.setState({ message: '' });
  }

  render() {
    const { event, isLoading, openEdit, message, noEvent } = this.state;
    if (isLoading) return <CircularProgress />;
    if (noEvent) {
      return <div>
        <h2>The event you are looking for either does not exist or does not belong to you.</h2>
      </div>
    }

    const image = getEventImage(event.type);
    const avatar = (
      <div>
        <Icon> person </Icon> {(event.applicants || []).length}
      </div>
    );

    const time = moment(event.datetime).format('LLL');
    const title = (
      <Grid container spacing={3} alignItems='center'>
        <Grid item xs>
          <h1> {event.eventName} </h1>
        </Grid>
        <Grid item xs>
          <IconButton style={{ float: 'right' }} onClick={this.openEdit.bind(this)}>
            <Icon style={{ float: 'right' }}> edit </Icon>
          </IconButton>
          <IconButton style={{ float: 'right' }} onClick={this.delete}>
            <Icon style={{ float: 'right' }}> delete </Icon>
          </IconButton>
        </Grid>
      </Grid>
    )

    const apps = (event.applications || []).map((application, index) => {
      const show = (index === 0) || (index === 1)
      return (
        <ApplicantButton key={application.applicationId} application={application} event={event} open={show} onUpdate={this.getEvent.bind(this)} />
      )
    })

    return (
      <div>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader style={{ backgroundColor: '#F8F8F8', height: 75 }} title={title} avatar={avatar} />
              <CardMedia
                style={{ height: 250 }}
                image={ image } />
              <CardContent>
                <Grid style={{paddingLeft: '50px'}} container spacing={1}>
                  <Grid item xs={3}>
                    <Icon style={{ fontSize: 35}}> directions_running </Icon>
                  </Grid>
                  <Grid item xs={3}>
                    <Icon style={{ fontSize: 35}}> directions_running </Icon>
                  </Grid>
                  <Grid item xs={3}>
                    <Icon style={{ fontSize: 35}}> access_time </Icon>
                  </Grid>
                  <Grid item xs={3}>
                    <Icon style={{ fontSize: 35}}> map </Icon>
                  </Grid>
                </Grid>
                <Grid style={{paddingLeft: '50px'}} container spacing={1}>
                  <Grid item xs={3}>
                    <h6> {event.type} </h6>
                  </Grid>
                  <Grid item xs={3}>
                    <h6> {event.level} </h6>
                  </Grid>
                  <Grid item xs={3}>
                    <h6> {time} </h6>
                  </Grid>
                  <Grid item xs={3}>
                    <h6> {event.location} </h6>
                  </Grid>
                </Grid>
                <hr />
              </CardContent>
              <CardContent style={{paddingLeft: '50px', paddingRight: '50px'}} >
                <h1> Event Details </h1>
                <span> <h2> {event.description} </h2> </span>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
            <div className='application-container'>
              <h1> Applications </h1>
              {apps.length ? apps : <h4>There are currently no applicants for your event.</h4>}
            </div>
            </Card>
          </Grid>
        </Grid>
        <Dialog open={openEdit} onClose={this.closeEdit.bind(this)} maxWidth='sm' fullWidth>
          <DialogTitle>
            <IconButton style={{ float: 'right' }} onClick={this.closeEdit.bind(this)}>
              <Icon> close </Icon>
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <EventForm event={event} onSubmit={this.updateEvent.bind(this)} />
          </DialogContent>
        </Dialog>
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

export default EventView;
