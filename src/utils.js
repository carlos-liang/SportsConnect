import React from 'react';
import { Menu, MenuItem, ListItemText, ListItemIcon, Icon } from '@material-ui/core';
import soccer from './Assets/SportImages/soccer.jpg';
import afl from './Assets/SportImages/afl.jpg';
import cricket from './Assets/SportImages/cricket.jpg';
import union from './Assets/SportImages/union.jpg';
import league from './Assets/SportImages/league.jpg';
import netball from './Assets/SportImages/netball.jpg';
import aussieRules from './Assets/SportImages/aussie rules.jpg';
import basketball from './Assets/SportImages/basketball.jpg';
import tennis from './Assets/SportImages/tennis.jpeg';


export const validateForm = (values, fields) => {
  const errors = {};
  console.log('validafteForm: ', values, fields);
  fields.forEach(field => {
    if(!values[field]) {
      errors[field] = `Please enter mandatory ${field} field`;
    }
  })
  return errors;
}

export const getEventImage = (sport) => {
  if (sport === 'Soccer') {
    return soccer;
  } else if (sport === 'AFL') {
    return afl;
  } else if (sport === 'cricket') {
    return cricket;
  } else if (sport === 'union' || sport === 'UNION'){
    return union;
  } else if (sport === 'league' || sport === 'LEAGUE'){
    return league;
  } else if (sport === 'tennis' || sport === 'TENNIS'){
    return tennis;
  } else if (sport === 'basket' || sport === 'BASKETBALL'){
    return basketball;
  } else if (sport === 'aussie rules' || sport === 'AUSSIE RULES'){
    return aussieRules;
  } else if (sport === 'soccer' || sport === 'SOCCER'){
    return soccer;
  } else if (sport === 'netball' || sport === 'NETBALL'){
    return netball;
  } else {
    return netball;
  }
}

// ============================================================
// Backend (and frontend) paramater verification functions

export const verify_eventName = (eventName) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof eventName != 'string') {
    return 'eventName must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_datetime = (datetime) => {
  // If error, return error string. Otherwise, return empty string.
  if (!datetime || Object.prototype.toString.call(datetime) != "[object Date]" || isNaN(datetime)) {
    return 'datetime must be a valid Date object. ';
  } else {
    return "";
  }
}

export const verify_description = (description) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof description != 'string') {
    return 'description must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_location = (location) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof location != 'string') {
    return 'location must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_type = (type) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof type != 'string') {
    return 'type must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_level = (level) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof level != 'string') {
    return 'level must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_eventId = (eventId) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof eventId != 'string') {
    return 'eventId must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_applicationId = (applicationId) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof applicationId != 'string') {
    return 'applicationId must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_message = (message) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof message != 'string') {
    return 'message must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_response = (response) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof response != 'string') {
    return 'response must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_firstName = (firstName) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof firstName != 'string') {
    return 'firstName must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_lastName = (lastName) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof lastName != 'string') {
    return 'lastName must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_dob = (dob) => {
  // If error, return error string. Otherwise, return empty string.
  if (!dob || Object.prototype.toString.call(dob) != "[object Date]" || isNaN(dob)) {
    return 'dateOfBirth must be a valid Date object. ';
  } else {
    return "";
  }
}

export const verify_gender = (gender) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof gender != 'string' || (gender != "male" && gender != "female" && gender != "")) {
    return 'gender must be a valid string; "male", "female" or "". ';
  } else {
    return "";
  }
}

export const verify_phoneNumber = (phoneNumber) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof phoneNumber != 'string' || isNaN(phoneNumber)) {
    return 'phoneNumber must be a valid string of numbers only. ';
  } else {
    return "";
  }
}

export const verify_photoURL = (photoURL) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof photoURL != 'string') {
    return 'photoURL must be a valid string. ';
  } else {
    return "";
  }
}

export const verify_typePreferences = (typePreferences) => {
  // If error, return error string. Otherwise, return empty string.
  let result = "";
  if (!typePreferences) return "typePreferences array must be specified ";
  if (!Array.isArray(typePreferences)) return "typePreferences must be an array ";
  typePreferences.forEach((preference) => {
    if (typeof preference != 'string') {
      result += 'typePreferences must be a valid array of strings. ';
    }
  });
  return result;
}

export const verify_email = (email) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof email != 'string') {
    return 'email must be a valid string. ';
  } else if (0 /* TODO.. check email is valid */ ) {
    return "";
  } else {
    return ""
  }
}

export const verify_password = (password) => {
  // If error, return error string. Otherwise, return empty string.
  if (typeof password != 'string') {
    return 'password must be a valid string. ';
  } else {
    return ""
  }
}

// ============================================================
