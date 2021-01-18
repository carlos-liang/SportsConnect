import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../../Components/ApplicantEventCard';
import {
  Grid,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Select,
  Icon,
  Chip,
  ListItem
} from '@material-ui/core';
import db from '../../Model';

class EventsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      myApplications: [],
      searchName: "",
      searchLocation: "",
      searchType: [],
      searchDate: new Date(0,0,0),
      isLoading: true
    }
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    db.getEvents().then(data => {
      this.setState({ events: data });
    }).then(() => {
      return db.getMyApplications().then((data) => {
        this.setState({ myApplications: data, isLoading: false });
      });
    }).catch((error) => {
      console.log(error);
      console.log(error.code, error.message);
    });
  }

  onChangeType(e) {
    const { value } = e.target;
    this.setState({ searchType: value });
  }

  onchangename = e => {
    this.setState({ searchName: e.target.value });
  };

  onchangelocation = e => {
    this.setState({ searchLocation: e.target.value });
  };

  onchangedate = e => {
    this.setState({ searchDate: new Date(e.target.value) });
  };

  // onchangetype = e => {
  //   this.setState({ searchType: e.target.value });
  // }

  render() {
    const { events, myApplications, isLoading, searchName, searchLocation, searchDate, searchType } = this.state;
    if (isLoading) return <CircularProgress />;

    const filteredEventList = events.filter(event => {
      return (event.eventName.toLowerCase().indexOf(searchName.toLowerCase()) !== -1 || event.description.toLowerCase().indexOf(searchName.toLowerCase()) !== -1) && event.location.toLowerCase().indexOf(searchLocation.toLowerCase()) !== -1 && event.datetime - searchDate > 0 && (!searchType.length || (searchType || []).includes(event.type));
    });

    return (
      <div>
        <h1> Available Events </h1>
        <Grid container spacing={2}>
          <Grid item xs>
            <FormControl fullWidth>
              <InputLabel style={{ marginLeft: 15, zIndex: 10000 }} htmlFor='type'>Type</InputLabel>
              <Select
                style={{ backgroundColor: 'white' }}
                value={searchType}
                name='type'
                label='Type'
                multiple
                variant='outlined'
                fullWidth
                inputProps={{ id: 'type', name: 'type' }}
                onChange={this.onChangeType.bind(this)}
                renderValue={selected => {
                  return (
                    <div>
                      {(selected || []).map(value => {
                        return (
                          <Chip key={value} label={value} />
                        )
                      })}
                    </div>
                  )
                }}>
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
          <Grid item xs>
            <TextField style={{ backgroundColor: 'white' }} name='location' label='Location' variant='outlined' fullWidth onChange={this.onchangelocation}/>
          </Grid>
          <Grid item xs>
            <TextField style={{ backgroundColor: 'white' }} name='name' label='Event Name' variant='outlined' fullWidth onChange={this.onchangename}/>
          </Grid>
          <Grid item xs>
            <TextField style={{ backgroundColor: 'white' }} name='name' label='Date' type='date' InputLabelProps={{ shrink: true }} variant='outlined' fullWidth onChange={this.onchangedate}/>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          {filteredEventList.map(event => {
            return (
            <Grid key={event.eventId} item xs={4}>
              <EventCard event={event} myApplications={myApplications} where='events_page'/>
            </Grid>
            )
          })}
        </Grid>
        { !events.length && (
          <h5> No events currently available </h5>
        )}
      </div>
    );
  }
}

export default EventsView;
