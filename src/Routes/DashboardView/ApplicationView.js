import React, { Component } from 'react';
import { CircularProgress, Grid } from '@material-ui/core';
import EventCard from '../../Components/ApplicantEventCard';
import db from '../../Model';

class ApplicationView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      applications: [],
      isLoading: true
    }
  }

  componentDidMount() {
    db.getMyApplications().then(data => {
      this.setState({ applications: data});
    }).catch((error) => {
      console.log('Error getting my applications: ', error.message);
      alert('Error getting my applications: ' + error.message);
    }).finally(() => {
      this.setState({ isLoading: false });
    });
  }

  render() {
    const { applications, isLoading } = this.state;
    if (isLoading) return <CircularProgress />;

    const applicationList = (applications || []).map(application => {
      return (
        <Grid key={application.applicationId  + ':grid'} item xs={4}>
          <EventCard key={application.applicationId} event={application} myApplications={applications} where='dashboard_page'/>
        </Grid>
      )
    });

    return (
      <Grid container spacing={3}>
        {applicationList.length ? applicationList : <h4>You currently have no applications to any events. See the events page to apply for events.</h4>}
      </Grid>
    )
  }

}

export default ApplicationView;
