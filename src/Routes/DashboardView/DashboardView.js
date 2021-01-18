import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ApplicationView from './ApplicationView';
import EventView from './EventView';
import db from '../../Model';
import {
  Container,
  Paper,
  Grid,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Icon
} from '@material-ui/core';

class DashboardView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand_events: true,
      expand_applications: true,
    }
  }

  expandApplication() {
    const { expand_applications } = this.state;
    this.setState( { expand_applications: !expand_applications });
  }

  expandEvents() {
    const { expand_events } = this.state;
    this.setState( { expand_events: !expand_events });
  }


  render() {
    const { expand_events, expand_applications } = this.state;
    return (
      <div>
      <br/>
        <ExpansionPanel name='expand_events' expanded={expand_events} onChange={this.expandEvents.bind(this)}>
          <ExpansionPanelSummary style={{ height: 125 }} expandIcon={<Icon> expand_more </Icon>}>
            <div>
              <h1> My Events <Icon> event_available </Icon> </h1>
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <EventView />
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel name='expand_applications' expanded={expand_applications} onChange={this.expandApplication.bind(this)}>
          <ExpansionPanelSummary style={{ height: 125 }} expandIcon={<Icon> expand_more </Icon>}>
            <div>
              <h1> My Applications <Icon> assignment </Icon> </h1>
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <ApplicationView />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    )
  }
}

export default DashboardView;
