import React, { Component } from 'react';
import { Rating } from '@material-ui/lab';
import { Button, TextField, Card, Snackbar, IconButton, Icon } from '@material-ui/core';
import db from '../../Model';

class ReviewForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reviewRating: 0,
      reviewMessage: '',
      errorMessage: ''
    }
  }

  onSubmit(e) {
    e.preventDefault();
    const { reviewRating, reviewMessage } = this.state;
    const { application, event } = this.props;

    if (reviewRating <= 0) {
      this.setState({ errorMessage: 'Please give a review rating between 1 - 5' });
      return;
    }

    const review = {
      revieweeId: application.applicantUserId,
      revieweeIsApplicant: true,
      revieweeFirstName: application.firstName,
      revieweeLastName: application.lastName,
      starRating: parseInt(reviewRating),
      reviewMessage: reviewMessage,
      eventId: application.eventId,
      eventName: event.eventName
    }

    db.writeReview(review).then(() => {
      console.log('Review written.');
      if (this.props.onSubmit) {
        this.props.onSubmit();
      }
    }).catch(() => {
      console.log('Error writing review: ');
    });
  }

  onReviewChange(e) {
    const { value } = e.target;
    this.setState({ reviewRating: value });
  }

  onMessageChange(e) {
    const { value } = e.target;
    console.log(value);
    this.setState({ reviewMessage: value });
  }

  closeMessage() {
    this.setState({ errorMessage: '' });
  }


  render() {
    const { reviewRating, reviewMessage, errorMessage } = this.state;
    return (
      <div className='review-container'>
          <form onSubmit={this.onSubmit.bind(this)}>
            <div className='review-card'>
              <span> Please give an honest review between 1 - 5 </span>
              <Rating value={reviewRating} onChange={this.onReviewChange.bind(this)} />
              <TextField margin='normal' variant='outlined' fullWidth onChange={this.onMessageChange.bind(this)} multiline rows={4} label='Review' />
              <Button type='submit' value={reviewMessage} color='primary' variant='contained' fullWidth> Submit Review </Button>
            </div>
          </form>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(errorMessage)}
          autoHideDuration={5000}
          onClose={this.closeMessage.bind(this)}
          message={<span> {errorMessage} </span>}
          action={[
            <IconButton color="inherit" onClick={this.closeMessage.bind(this)}>
              <Icon> close </Icon>
            </IconButton>,
          ]} />
      </div>
    )
  }
}

export default ReviewForm;
