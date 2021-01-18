import React, { Component } from 'react';
import db from '../../Model';
import { validateForm } from '../../utils';
import Map from './Map';
// import db from '../../Model/Model.dashboard.events.test.js';
import {
  Button,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  ListItem,
  Icon,
  CircularProgress,
} from '@material-ui/core';
import moment from 'moment';

const fields = ['eventName', 'datetime', 'location', 'type', 'level', 'description'];
class EventForm extends Component {
  constructor(props) {
    super(props);
    if (this.props.event) {
      this.state = {
        event: {
          eventName: this.props.event.eventName || '',
          datetime: this.props.event.datetime ? moment(this.props.event.datetime.toString()).format('YYYY-MM-DDTHH:mm') : '2020-05-24T10:30',
          location: this.props.event.location || '',
          type: this.props.event.type || 'soccer',
          level: this.props.event.level || 'Beginner',
          description: this.props.event.description || '',
          eventId: this.props.event.eventId || ''
        },
        errors: {},
        isLoading: false
      }
    } else {
      this.state = {
        event: {
          eventName: '',
          datetime: '2020-05-24T10:30',
          location: '',
          type: 'soccer',
          level: 'Beginner',
          description: ''
        },
        errors: {},
        isLoading: false
      }
    }
    
  }

  componentDidMount() {
    // if (this.props.event) {
    //   let eventData = this.props.event;
    //   eventData.datetime = this.props.event.datetime.toString();
    //   eventData.datetime = moment(eventData.datetime).format('YYYY-MM-DDTHH:mm');
    //   this.setState({ event: eventData });
    // }
  }

  submit(e) {
    e.preventDefault();
    console.log('submit create event form...');
    const { event } = this.state;
    const errors = validateForm(event, fields);
    console.log(errors);
    if (Object.keys(errors).length) {
      this.setState({ errors: errors });
      console.log('errorrrrrrrr');
      return;
    }
    const request = {
      eventName: event.eventName,
      datetime: new Date(event.datetime),
      description: event.description,
      location: event.location,
      type: event.type,
      level: event.level,
      eventId: event.eventId
    }
    this.setState({ isLoading: true });
    if (this.props.onSubmit) {
      console.log('Submitting: ', request);
      this.props.onSubmit(request);
    }
  }

  onChange(e) {
    const { name, value } = e.target;
    let { event, errors } = this.state;
    event[name] = value;
    errors[name] = ''
    this.setState({ event: event, errors: errors });
  }

  onUpdate(name, value){
    console.log('onUpdate called; name, value:', name, value);
    let { event, errors } = this.state;
    event[name] = value;
    errors[name] = ''
    this.setState({event: event});
  }

  onSuggestSelect = (place: Suggest) => {
    console.log(place);
  }

  render() {
    const { event, errors, isLoading } = this.state;
    const buttonText = isLoading ? <CircularProgress style={{ color: 'white' }}/> : 'Submit';

    return (
      <form onSubmit={this.submit.bind(this)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField name='eventName' value={event.eventName} label='Event Name' variant='outlined' fullWidth onChange={this.onChange.bind(this)} error={Boolean(errors['eventName'])} helperText={errors['eventName']} />
          </Grid>
          <Grid item xs={12}>
            <TextField name='datetime' value={event.datetime} label='Date' type='datetime-local' InputLabelProps={{ shrink: true }} variant='outlined' fullWidth onChange={this.onChange.bind(this)} error={Boolean(errors['datetime'])} helperText={errors['datetime']} />
          </Grid>
          <Grid item xs={12}>
            <div style={{ marginBottom: '160px' }}>
              <Map
      					google={this.props.google}
      					center={{lat: -33.8732, lng: 151.2061}}
      					height='240px'
                zoom={15}
                name='location'
                value={event.location}
                onUpdate={this.onUpdate.bind(this)}
                error={Boolean(errors['location'])}
      				/>
            </div>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel style={{ marginLeft: 10 }}htmlFor='type'>Type</InputLabel>
              <Select value={event.type} name='type' label='Type' variant='outlined' fullWidth inputProps={{ id: 'type', name: 'type' }} onChange={this.onChange.bind(this)} error={Boolean(errors['type'])} helperText={errors['type']}>
              <MenuItem value='soccer'>
                <ListItem><Icon>sports_soccer</Icon><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>Soccer</ListItem>
              </MenuItem>
              <MenuItem value='union' stl>
                <ListItem><Icon>sports_rugby</Icon><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>Rugby Union</ListItem>
              </MenuItem>
              <MenuItem value='league'>
                <ListItem><Icon>sports_rugby</Icon><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>Rugby League</ListItem>
              </MenuItem>
              <MenuItem value='AFL'>
                <ListItem><Icon>sports_football</Icon><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>Aussie Rules</ListItem>
              </MenuItem>
              <MenuItem value='cricket'>
                <ListItem><Icon>sports_cricket</Icon><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>Cricket</ListItem>
              </MenuItem>
              <MenuItem value='tennis'>
                <ListItem><Icon fontSize='small'> sports_tennis </Icon><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>Tennis</ListItem>
              </MenuItem>
              <MenuItem value='netball'>
                <ListItem><Icon>sports_volleyball</Icon><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>Netball</ListItem>
              </MenuItem>
              <MenuItem value='basket'>
                <ListItem><Icon>sports_basketball</Icon><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>Basket Ball</ListItem>
              </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel style={{ marginLeft: 10 }}htmlFor='level'>Level</InputLabel>
              <Select value={event.level} name='level' variant='outlined' fullWidth inputProps={{ id: 'level', name: 'level' }} onChange={this.onChange.bind(this)} error={Boolean(errors['level'])} helperText={errors['level']}>
                <MenuItem value={'Beginner'}>
                  <ListItemText> Beginner </ListItemText>
                </MenuItem>
                <MenuItem value={'Intermediate'}>
                  <ListItemText> Intermediate </ListItemText>
                </MenuItem>
                <MenuItem value={'Experienced'}>
                  <ListItemText> Experienced </ListItemText>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField name='description' value={event.description} multiline rows='5' label='Description...' variant='outlined' fullWidth onChange={this.onChange.bind(this)} error={Boolean(errors['description'])} helperText={errors['description']}/>
          </Grid>
          <Grid item xs={12}>
            <Button type='submit' fullWidth variant='contained' color='primary' className='primary-button'>
              {buttonText}
            </Button>
          </Grid>
        </Grid>
      </form>
    )
  }

}

export default EventForm;
