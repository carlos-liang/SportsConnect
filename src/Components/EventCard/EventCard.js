import React, { Component } from 'react';
import {
  Card,
  CardMedia,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  Icon
} from '@material-ui/core';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment';
import { getEventImage } from '../../utils';

class MyEventCard extends Component {
  pushEvent() {
    const { eventId } = this.props.event;
    this.props.history.push(`events/${eventId}`);
  }

  render() {
    const { event } = this.props;

    let time = 'Unknown time...';
    if (event.datetime) {
      time = moment(event.datetime).format('llll');
    }

    const avatar = (
      <div>
        <Icon> person </Icon> {event.applications}
      </div>
    );

    const image = getEventImage(event.type);

    return (
      <div>
        <Card>
          <CardActionArea onClick={this.pushEvent.bind(this)}>
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
                <h5> {event.type} </h5>
              </Grid>
              <Grid item xs>
                <h5> {event.level} </h5>
              </Grid>
              <Grid item xs>
                <h5> {time} </h5>
              </Grid>
              <Grid item xs>
                <h5> {event.location} </h5>
              </Grid>
            </Grid>
            <hr />
          </CardContent>
          <CardContent>
            <span> {event.description} </span>
          </CardContent>
          </CardActionArea>
        </Card>
      </div>
    );
  }
}

export default withRouter(MyEventCard);
