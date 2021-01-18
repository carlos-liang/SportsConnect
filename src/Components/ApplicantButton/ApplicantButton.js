import React, { Component } from 'react';
import ReviewForm from '../ReviewForm';
import {
  Button,
  ButtonGroup,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Collapse,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Box
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import ReviewCard from '../../Components/ReviewCard';
import db from '../../Model';
import moment from 'moment';


class ApplicantButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      expandApplication: Boolean(props.open),
      openReview: false,
      reviews: [],
      isLoading: false
    }
  }

  componentDidMount() {
    const { application } = this.props;
    this.setState({ isLoading: true });
    db.getMyReviews(application.applicantUserId).then(data => {
      const personalReviews = data.reviewsForMe || [];
      this.setState({ reviews: personalReviews, isLoading: false });
    }).catch(e => {
      console.log(e);
    })
  }

  toggle() {
    const { expandApplication } = this.state;
    const expand = !expandApplication;
    this.setState({ expandApplication: expand });
  }

  showActions(e) {
    this.setState({ showActions: true, anchorEl: e.currentTarget });
  }

  closeActions() {
    this.setState({ showActions: false, anchorEl: null });
  }

  accept() {
    const { application, event } = this.props;
    this.setState({ isLoading: true });
    db.respondToApplication(application.applicationId, '', 'accepted', event.eventName).then((data) => {
      this.setState({ isLoading: false });
      if (this.props.onUpdate) {
        this.props.onUpdate();
      }
    }).catch(e => {
      console.log(e);
      this.setState({ isLoading: false });
    })
  }

  reject() {
    const { application, event } = this.props;
    this.setState({ isLoading: true });
    db.respondToApplication(application.applicationId, '', 'rejected', event.eventName).then((data) => {
      this.setState({ isLoading: false });
      if (this.props.onUpdate) {
        this.props.onUpdate();
      }
    }).catch(e => {
      console.log(e);
      this.setState({ isLoading: false });
    })
  }

  pending() {
    const { application, event } = this.props;
    this.setState({ isLoading: true });
    db.respondToApplication(application.applicationId, '', 'pending', event.eventName).then((data) => {
      this.setState({ isLoading: false });
      if (this.props.onUpdate) {
        this.props.onUpdate();
      }
    }).catch(e => {
      this.setState({ isLoading: false });
      console.log(e);
    })
  }

  openReview() {
    this.setState({ openReview: true });
  }

  closeReview() {
    this.setState({ openReview: false });
  }


  render() {
    const { anchorEl, showActions, expandApplication, isLoading, openReview, reviews } = this.state;
    const { application, event } = this.props;

    if (isLoading) return <CircularProgress />;

    const revs = (reviews || []).map(review => {
      return (
        <Grid item xs={4}>
          <ReviewCard review={review} showName />
        </Grid>
      )
    })

    const dateTimeNow = new Date();
    const isAfterEvent = dateTimeNow >= event.datetime && application.state === 'accepted' ? true : false;
    const reviewButton = isAfterEvent ? <Button fullWidth style={{backgroundColor: '#ffd700', color: 'white', margin: '15px'}} onClick={this.openReview.bind(this)}> Review Application </Button> : null;

    let actions = null;
    let statusColor = {}
    if (application.state === 'pending') {
      statusColor = { backgroundColor: '#ffa500', color: 'white' };
      actions = (
        <div>
          <Button fullWidth style={{backgroundColor: '#3CB371', color: 'white', margin: '15px'}} onClick={this.accept.bind(this)}> Accept Application </Button>
          <Button fullWidth style={{backgroundColor: '#B22222', color: 'white', margin: '15px'}} onClick={this.reject.bind(this)}> Reject Application </Button>
          {reviewButton}
        </div>
      );
    } else if (application.state === 'accepted') {
      statusColor = { backgroundColor: '#3CB371', color: 'white' };
      actions = (
        <div>
          <Button fullWidth style={{backgroundColor: '#B22222', color: 'white', margin: '15px'}} onClick={this.reject.bind(this)}> Reject Application</Button>
          <Button fullWidth style={{backgroundColor: '#ffa500', color: 'white', margin: '15px'}} onClick={this.pending.bind(this)}> Pend Application </Button>
          {reviewButton}
        </div>
      );
    } else if (application.state === 'rejected') {
      statusColor = { backgroundColor: '#B22222', color: 'white' };
      actions = (
        <div>
          <Button fullWidth style={{backgroundColor: '#3CB371', color: 'white', margin: '15px'}} onClick={this.accept.bind(this)}> Accept Application </Button>
          <Button fullWidth style={{backgroundColor: '#ffa500', color: 'white', margin: '15px'}} onClick={this.pending.bind(this)}> Pend Application </Button>
          {reviewButton}
        </div>
      );
    }

    const initials = `${application.firstName[0]}${application.lastName[0]}`;

    return (
      <div>
        <Button variant='contained' style={statusColor} fullWidth endIcon={<Icon>expand_more</Icon>} onClick={this.toggle.bind(this)}> {application.firstName} {application.lastName} </Button>
        <Collapse in={expandApplication}>
          <div className='application-container'>
            <Grid container spacing={3} alignItems='center'>
              <Grid item xs>
                <Avatar style={{ height: '300px', width: '300px', fontSize: '50px', backgroundColor: '#e8f4f8', color: 'black' }}> {initials} </Avatar>
              </Grid>
              <Grid item xs>
                <h2> {application.firstName} {application.lastName} </h2>
                <List>
                  <ListItem>
                    <ListItemAvatar> <Icon> date_range </Icon> </ListItemAvatar>
                    <ListItemText primary='Date of Birth' secondary={moment(application.dateOfBirth).format('DD MMMM YYYY')} />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar> <Icon> email </Icon> </ListItemAvatar>
                    <ListItemText primary='Email' secondary={application.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar> <Icon> phone </Icon> </ListItemAvatar>
                    <ListItemText primary='Phone Number' secondary={application.phone_number} />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar> <Icon> sentiment_satisfied </Icon> </ListItemAvatar>
                    <ListItemText primary='Gender' secondary={application.gender} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs>
                {actions}
              </Grid>
            </Grid>
            <Box style={{ padding: '50px', backgroundColor: '#e8f4f8' }}>
              <Grid container spacing={3} alignItems='center'>
                {revs}
              </Grid>
            </Box>
          </div>
          <Dialog open={openReview} onClose={this.closeReview.bind(this)} maxWidth='sm' fullWidth >
            <DialogTitle style={{height: '20px'}}>
              <h4>
                Review {application.firstName}
                <IconButton style={{ float: 'right', padding: '0', margin: '0'}} onClick={this.closeReview.bind(this)}>
                  <Icon> close </Icon>
                </IconButton>
              </h4>
            </DialogTitle>
            <DialogContent >
              <ReviewForm application={application} event={event} onSubmit={this.closeReview.bind(this)}/>
            </DialogContent>
          </Dialog>
        </Collapse>
      </div>
    )
  }
}

export default ApplicantButton;
