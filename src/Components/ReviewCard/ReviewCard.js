import React, { Component } from 'react';
import { Card, Grid } from '@material-ui/core';
import { Rating } from '@material-ui/lab';

class ReviewCard extends Component {
  render() {
    const { review, showName } = this.props;
    return (
      <Card>
        <div className='review-card-content'>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs>
              <h1> {review.eventName} </h1>
            </Grid>
            <Grid item xs>
              <Rating value={review.starRating} readOnly />
            </Grid>
          </Grid>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs>
              { showName &&
                <span className='review-name'> {review.revieweeName}: </span>
              }
              <span> {review.reviewMessage} </span>
            </Grid>
          </Grid>
        </div>
      </Card>
    )
  }
}

export default ReviewCard;
