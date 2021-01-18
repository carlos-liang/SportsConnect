import React, { Component } from 'react';
import EventCard from '../../Components/EventCard';
import EventForm from '../../Components/EventForm';
import db from '../../Model';
import {
  Grid,
  Icon,
  IconButton,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Button
} from '@material-ui/core';


class EventView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      open_modal: false,
      isLoading: true
    }
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    db.getMyEvents().then((events) => {
      this.setState({ events: events });
    }).catch((error) => {
      console.log(error.code, error.message);
      alert('Error: ' + error.message);
    }).finally(() => {
      this.setState({ isLoading: false });
    });
  }

  openModal() {
    this.setState({ open_modal: true });
  }

  closeModal() {
    this.setState({ open_modal: false });
  }

  createEvent(request) {
    return db.createEvent(request).then((newEventData) => {
      this.setState({open_modal: false });
      console.log('created event... ', newEventData);
      let { events } = this.state;
      events.push(newEventData);
      this.setState({events: events});
    }).catch((error) => {
      console.log(error.code, error.message);
      alert('Error: ' + error.message);
    }).finally(() => {
      this.setState({ isLoading: false});
    });
  }


  render() {
    const { open_modal, events, isLoading } = this.state;
    if (isLoading) return <CircularProgress />;

    const event_list = events.map(event => {
      return (
        <Grid key={event.eventId + ':grid'} item xs={4}>
          <EventCard key={event.eventId} event={event} />
        </Grid>
      )
    });

    const add_event_button = (
      <Grid key='addEventButton:grid' item xs={4}>
        <div className='create-event'>
          <Card style={{ height: '100%', minWidth: 250, backgroundColor: '#1F96ED' }}>
            <h1> Create Event </h1>
            <div className='create-event-text'>
              <span> SportsConnect allows you to easily link up with other avid sportspeople. </span>
              <br/><br/>
              <span> Click the button below to create your very own SportsConnect event. </span>
              <br/>
            </div>
            <div className='create-event-button'>
              <Button fullWidth style={{ backgroundColor: 'white', color: '#1F96ED' }} onClick={this.openModal.bind(this)} endIcon={<Icon> add </Icon>}>
                Create
              </Button>
              </div>
          </Card>
        </div>
      </Grid>
    )

    event_list.unshift(add_event_button);

    return (
      <div>
        <Grid container spacing={3}>
          {event_list}
        </Grid>
        <Dialog open={open_modal} onClose={this.closeModal.bind(this)} maxWidth='sm' fullWidth>
          <DialogTitle>
            <IconButton style={{ float: 'right' }} onClick={this.closeModal.bind(this)}>
              <Icon> close </Icon>
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <EventForm onSubmit={this.createEvent.bind(this)}/>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

}

export default EventView;
