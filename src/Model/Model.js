import app, {fs} from '../base.js';
import {
  verify_eventName,
  verify_datetime,
  verify_description,
  verify_location,
  verify_type,
  verify_level,
  verify_eventId,
  verify_applicationId,
  verify_message,
  verify_response,
  verify_email,
  verify_password,
  verify_firstName,
  verify_lastName,
  verify_dob,
  verify_gender,
  verify_phoneNumber,
  verify_photoURL,
  verify_typePreferences
} from '../utils.js';
const DEBUG = true;

// A backend model/implementation of functions for
// interfacing with firebase (firestore) (createEvent, updateEvent, etc)
class Model {

  unsubscribe = null;

  getUserDetails() {
    return this.getAccountDetails();
  }

  // Acc for testing: 12345@123.com, 123456
  signIn({ email, password }) {
    if (DEBUG) { console.log('Attempting to sign in...') }
    let p = new Promise((queryResolve, queryReject) => {
      // Confirm parameters are acceptable
      let paramError = "";
      paramError = paramError + verify_email(email);
      paramError = paramError + verify_password(password);
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot create event - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      return app.auth().signInWithEmailAndPassword(email, password)
      .then(() => { // success
        if (DEBUG) { console.log('Sign in successful.') }
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error signing in: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  signUp({email, password, dateOfBirth, phone_number, gender, first_name, last_name, photo_URL, typePreferences}) {
    if (DEBUG) { console.log('Attempting to sign up...') }
    let p = new Promise((queryResolve, queryReject) => {
      // Confirm parameters are acceptable
      let paramError = "";
      paramError = paramError + verify_email(email);
      paramError = paramError + verify_password(password);
      paramError = paramError + verify_firstName(first_name);
      paramError = paramError + verify_lastName(last_name);
      paramError = paramError + verify_dob(dateOfBirth);
      paramError = paramError + verify_gender(gender);
      paramError = paramError + verify_phoneNumber(phone_number);
      paramError = paramError + verify_photoURL(photo_URL);
      paramError = paramError + verify_typePreferences(typePreferences);
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot sign up - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      return app.auth().createUserWithEmailAndPassword(email, password).then(() => {
        console.log('Email/password account setup successful...');
        console.log('Updating profile info...');
        const userData = app.auth().currentUser;
        if (!userData) {
          throw {code: 'not-signed-in', message: 'Gotta wait till youre signed in...'};
        }
        return fs.collection('Users').doc(userData.uid).set({
          firstName: first_name,
          lastName: last_name,
          dateOfBirth: dateOfBirth,
          gender: gender,
          phone_number: phone_number,
          photo_URL: photo_URL,
          typePreferences: typePreferences
        });
      }).then(() => { // success
        if (DEBUG) { console.log('Sign up successful.') }
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error signing up: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  signOut() {
    if (DEBUG) { console.log('Attempting to sign out...') }
    let p = new Promise((queryResolve, queryReject) => {
      return app.auth().signOut()
      .then(() => { // success
        if (DEBUG) { console.log('Sign out successful.') }
        // Unsubsribe to notifications
        this.offNotification();
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error signing out: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // Inputs:
  //    eventName: (string)
  //    datetime: (Date) - A Date() object
  //    description: (string)
  //    location: (string)
  //    type: (string) - A string representing the sport. e.g. "Soccer"
  //    level: (string) - "Beginner" | "Intermediate" | "Experienced"
  // Returns a promise with new event data object; with error object on fail.
  createEvent({eventName, datetime, description, location, type, level}) {
    if (DEBUG) { console.log('Attempting to create event...') }
    let eventId = "";
    let p = new Promise((queryResolve, queryReject) => {
      // Confirm parameters are acceptable
      let paramError = "";
      paramError = paramError + verify_level(level);
      paramError = paramError + verify_type(type);
      paramError = paramError + verify_location(location);
      paramError = paramError + verify_description(description);
      paramError = paramError + verify_datetime(datetime);
      paramError = paramError + verify_eventName(eventName);
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot create event - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot create event - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to create an event.'};
      }
      // Add new document to Events collection, to store new event data.
      return fs.collection("Events").add({
        eventOwnerUserId: userData.uid,
        eventName: eventName,
        datetime: datetime,
        description: description,
        location: location,
        type: type,
        level: level
      }).then((docRef) => { // Event added to Events collection.
        if (DEBUG) { console.log('Event added (' + docRef.id + ').') }
        eventId = docRef.id;
        // Now add eventId (docRef.id) to list of myEvents in Users collection.
        return fs.collection("Users").doc(userData.uid).update({
          myEvents: app.firestore.FieldValue.arrayUnion(docRef.id)
        });
      }).then(() => { // success
        if (DEBUG) { console.log('EventId added to myEvents list in User collection.') }
        if (DEBUG) { console.log('Event successfully created.') }
        let newEventData = {
          eventId: eventId,
          eventName: eventName,
          datetime: datetime,
          description: description,
          location: location,
          type: type,
          level: level,
          applications: 0
        }
        queryResolve(newEventData); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error adding event document: ', error) }
        queryReject(error);
      });
    });
    // Calling catch() here will prevent uncaught exception issues.
    // Frontend should always call .catch() though
    // to actually observe for and deal with any errors.
    p.catch(() => {});
    return p;
  }

  deleteMyEvent(eventId){
    if (DEBUG) { console.log('Attempting to delete event...') }
    let eventData = null;
    let p = new Promise((queryResolve, queryReject) => {
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot delete event - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to delete an event.'};
      }
      // Confirm user owns event.
      return fs.collection("Users").doc(userData.uid).get()
      .then((userDoc) => {
        if (!userDoc.exists) { // User doc not retrieved.
          throw {code: 'user-not-found', message: 'User data... doesnt exist??.. in firestore..'};
        }
        let eventOwned = false;
        userDoc.data().myEvents.forEach((eId) => {
          if (eventId === eId) { eventOwned = true; }
        });
        if (!eventOwned) { throw {code: 'permission-denied', message: 'User does not own event.'}; }
        // User owns event - confirmed. Now, delete event.
        // Remove all associated applications first.
        // To do that, get list of applicationIds from event.applications
        return fs.collection("Events").doc(eventId).get().then((eventDoc) => {
          if (!eventDoc.exists) {
            throw {code: 'event-not-found', message: 'Event data... doesnt exist.. in firestore..'};
          }
          // Mark all applications as event deleted
          eventData = eventDoc.data();
          if (eventData.applications) { //(applications property does not exist if array/value is empty)
            return Promise.all(eventData.applications.map((applicationId) => {
              return fs.collection("Applications").doc(applicationId).update({
                // Mark application status as EVENT_DELETED. Applicant will delete application in their own time.
                state: 'EVENT_DELETED',
                eventName: eventData.eventName
              });
            }));
          }
          if (DEBUG) { console.log('Applications related to event updated to reflect event deletion...') }
        }).then(() => { // Remove event from Events collection
          return fs.collection("Events").doc(eventId).delete()
          .then(() => { // Remove eventId from user myEvents list
            if (DEBUG) { console.log('Event doc deleted from firestore...') }
            return fs.collection("Users").doc(userData.uid).update({
              myEvents: app.firestore.FieldValue.arrayRemove(eventId)
            });
          })
        })
      }).then(() => { // success
        if (DEBUG) { console.log('EventId deleted from Users myEvents list...') }
        if (DEBUG) { console.log('Event successfully deleted.') }
        // Add notification entry to each applicant's log
        if (eventData.applications) { //(applications property does not exist if array/value is empty)
          return Promise.all(eventData.applications.map((applicationId) => {
            return fs.collection("Applications").doc(applicationId).get().then((doc) => {
              return this.addToLog({
                logEntryOwnerId: doc.data().applicantUserId,
                isNotification: true,
                keywordIndices: '1%%3',
                logMessage: 'The event %%' + eventData.eventName + '%% has been %%cancelled%%!',
                link: '/dashboard'
              });
            });
          }));
        }
      }).then(() => {
        if (DEBUG) { console.log('Notifications to applicants sent out.') }
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error deleting event: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // Returns event object with updated values, but excludes number of applications
  // in applications field - the value would need to be retained on the frontend.
  updateMyEvent ({eventId, eventName, datetime, description, location, type, level}) {
    if (DEBUG) { console.log('Attempting to update event...') }
    let eventData = null;
    let p = new Promise((queryResolve, queryReject) => {
      // Confirm parameters are acceptable
      let paramError = "";
      paramError = paramError + verify_level(level);
      paramError = paramError + verify_type(type);
      paramError = paramError + verify_location(location);
      paramError = paramError + verify_description(description);
      paramError = paramError + verify_datetime(datetime);
      paramError = paramError + verify_eventName(eventName);
      paramError = paramError + verify_eventId(eventId);
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot update event - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot update event - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to update an event.'};
      }
      // Confirm user owns event.
      return fs.collection("Users").doc(userData.uid).get()
      .then((userDoc) => {
        if (!userDoc.exists) { // User doc not retrieved.
          throw {code: 'user-not-found', message: 'User data... doesnt exist??.. in firestore..'};
        }
        let eventOwned = false;
        userDoc.data().myEvents.forEach((eId) => {
          if (eventId === eId) { eventOwned = true; }
        });
        if (!eventOwned) { throw {code: 'permission-denied', message: 'User does not own event.'}; }
        // User owns event. Now, update event.
        return fs.collection("Events").doc(eventId).update({
          eventName: eventName,
          datetime: datetime,
          description: description,
          location: location,
          type: type,
          level: level
        })
      }).then(() => { // Event updated.
        if (DEBUG) { console.log('Event successfuly updated (' + eventId + ').') }
        // Now, retrieve event data again...
        // This seems redundant, but makes life easier on the frontend.
        // It also includes application data.
        return this.getEvent(eventId);
      }).then((updatedEvent) => { // Updated event retrieved
        eventData = updatedEvent; // Store it for later
        // Send notification to all applicants
        if (eventData.applications) { //(applications property does not exist if array/value is empty)
          return Promise.all(eventData.applications.map((application) => {
            return this.addToLog({
              logEntryOwnerId: application.applicantUserId,
              isNotification: true,
              keywordIndices: '1%%3',
              logMessage: 'The event %%' + eventData.eventName + '%% that you have applied for has been %%updated%%!',
              link: '/dashboard'
            });
          }));
        }
      }).then(() => {
        if (DEBUG) { console.log('Successfully notified applicants of event update.') }
        queryResolve(eventData); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error updating event document: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // Retrieve all active events signed-in user has created.
  // Return an array of objects - each object represents an event with the following fields:
  //    eventID: (int)
  //    eventName: (string)
  //    datetime: (Date) - A Date() object
  //    description: (string)
  //    location: (string)
  //    type: (string) - e.g. "Soccer"
  //    level: (string) - "Beginner" | "Intermediate" | "Experienced")
  //    applications: (int) - number of applications (regardless of state)
  getMyEvents() {
    if (DEBUG) { console.log('Attempting to retrieve my events...') }
    let result_myEvents = [];
    let p = new Promise((queryResolve, queryReject) => {
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot get events - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to get their events.'};
      }
      // Retrieve list of eventIds of events user owns.
      return fs.collection("Users").doc(userData.uid).get()
      .then((userDoc) => {
        if (!userDoc.exists) { // User doc not retrieved.
          throw {code: 'user-not-found', message: 'User data... doesnt exist??.. in firestore..'};
        }
        if (DEBUG) { console.log('EventIds from user.myEvents list successfully retrieved.') }
        // Get each event and add it to local list.
        if (!userDoc.data().myEvents) { return }
        return Promise.all(userDoc.data().myEvents.map((eventId) => {
          return fs.collection("Events").doc(eventId).get()
          .then((eventDoc) => {
            if (!eventDoc.exists) {
              throw {code: 'event-not-found', message: 'Event data... doesnt exist.. in firestore..'};
            }
            if (DEBUG) { console.log('Event (' + eventId + ') successfully retrieved.') }
            let v = eventDoc.data();
            // If arrays are empty in firestore, properties are undefined.
            // Check for this, and get number of applications.
            v.applications = (v.applications ? v.applications.length : 0);
            // Include eventId as property, so user can identify it.
            v.eventId = eventDoc.id;
            // Make sure datetime is a Date() object
            v.datetime = (v.datetime ? v.datetime.toDate() : new Date(0));
            // Add event object data to local results list.
            result_myEvents.push(v);
          });
        }));
      }).then(() => { // success
        if (DEBUG) { console.log('Events successfuly retrieved.') }
        queryResolve(result_myEvents); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error retrieving event documents: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // Get as many random public events as you can get/find.
  // Return array of objects - each object represents an event,
  // as with getMyEvents();
  getEvents() {
    if (DEBUG) { console.log('Attempting to get all events...') }
    let result_events = [];
    let p = new Promise((queryResolve, queryReject) => {
      // Retrieve all events.
      return fs.collection("Events").get().then((snapshot) => {
        snapshot.forEach((doc) => {
          let v = doc.data();
          // If arrays are empty in firestore, properties are undefined.
          // Check for this, and get number of applications.
          v.applications = (v.applications ? v.applications : []);
          // Include eventId as property, so user can identify it.
          v.eventId = doc.id;
          // Make sure datetime is a Date() object
          v.datetime = (v.datetime ? v.datetime.toDate() : new Date(0));
          // Add event object data to local results list.
          result_events.push(v);
        });
      }).then(() => { // success
        if (DEBUG) { console.log('All events successfuly retrieved.') }
        queryResolve(result_events); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error retrieving event documents: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  //    Result event object will have same fields as getMyEvents() or getEvents(),
  //    but applications field will be an array of objects (instead of a number), with fields:
  //      applicationId, applicantUserId, eventId, state (= pending, accepted, rejected),
  //      firstName, lastName, dateOfBirth, gender, phone_number, photo_URL
  getEvent(eventId){
    if (DEBUG) { console.log('Attempting to get my event...') }
    let result_myEvent = {};
    let p = new Promise((queryResolve, queryReject) => {
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot get event - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to get their events.'};
      }
      // Confirm user owns event.
      return fs.collection("Users").doc(userData.uid).get()
      .then((userDoc) => {
        if (!userDoc.exists) { // User doc not retrieved.
          throw {code: 'user-not-found', message: 'User data... doesnt exist??.. in firestore..'};
        }
        let eventOwned = false;
        userDoc.data().myEvents.forEach((eId) => {
          if (eventId === eId) { eventOwned = true; }
        });
        if (!eventOwned) { throw {code: 'permission-denied', message: 'User does not own event.'}; }
        // User owns event. Now, get event.
        return fs.collection("Events").doc(eventId).get();
      }).then((eventDoc) => {
        if (!eventDoc.exists) {
          throw {code: 'event-not-found', message: 'Event data... doesnt exist.. in firestore..'};
        }
        if (DEBUG) { console.log('Event (' + eventId + ') successfully retrieved.') }
        result_myEvent = eventDoc.data();
        // If arrays are empty in firestore, properties are undefined.
        // Check for this, and get applications array.
        result_myEvent.applications = (result_myEvent.applications ? result_myEvent.applications : []);
        // Include eventId as property, so user can identify it.
        result_myEvent.eventId = eventDoc.id;
        // Make sure datetime is a Date() object
        result_myEvent.datetime = (result_myEvent.datetime ? result_myEvent.datetime.toDate() : new Date(0));
        // For each application, create an object detailing information about the
        // application (applicationId, applicantId, eventId, status),
        // the user (firstName, lastName, dob, gender, phoneNumber, photoURL).
        if (!result_myEvent.applications.length) { return }
        return Promise.all(result_myEvent.applications.map((applicationId, index) => {
          if (DEBUG) { console.log('Getting application: ', applicationId) }
          return fs.collection('Applications').doc(applicationId).get().then((applicationDoc) => {
            if (!applicationDoc.exists) {
              throw {code: 'application-not-found', message: 'Application data... doesnt exist??.. in firestore..'};
            }
            result_myEvent.applications[index] = applicationDoc.data();
            result_myEvent.applications[index].applicationId = applicationDoc.id;
          });
        }));
      }).then(() => { // success
        if (DEBUG) { console.log('Initial application data for event retrieved...') }
        // Retrieve relevant applicant data
        return Promise.all(result_myEvent.applications.map((application, index) => {
          if (DEBUG) { console.log('Getting applicant details for application: ', application.applicantUserId) }
          return fs.collection('Users').doc(application.applicantUserId).get().then((applicantDoc) => {
            if (!applicantDoc.exists) {
              throw {code: 'application-not-found', message: 'Application data... doesnt exist??.. in firestore..'};
            }
            if (DEBUG) { console.log('Application (' + applicantDoc.id + ') successfully retrieved.') }
            const applicantData = applicantDoc.data();
            result_myEvent.applications[index].firstName = applicantData.firstName;
            result_myEvent.applications[index].lastName = applicantData.lastName;
            result_myEvent.applications[index].dateOfBirth = (applicantData.dateOfBirth ? applicantData.dateOfBirth.toDate() : new Date(0));
            result_myEvent.applications[index].gender = applicantData.gender;
            result_myEvent.applications[index].phone_number = applicantData.phone_number;
            result_myEvent.applications[index].photo_URL = applicantData.photo_URL;
          }).then(() => {
            return fs.collection("Reviews")
            .where("revieweeId", "==", application.applicantUserId)
            .where("revieweeIsApplicant", "==", true)
            .get().then((snapshot) => {
              let reviewsList = [];
              snapshot.forEach((doc) => {
                let r = doc.data();
                r.reviewId = doc.id;
                reviewsList.push(r);
              });
              result_myEvent.applications[index].reviews = reviewsList;
            });
          });
        }));
      }).then(() => { // success
        if (DEBUG) { console.log('Applicant data in application successfully populated...') }
        if (DEBUG) { console.log('Event successfuly retrieved.') }
        queryResolve(result_myEvent); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error retrieving event documents: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // Returns fields, as in Model.test.js comment at bottom of file.
  getAccountDetails() {
    if (DEBUG) { console.log('Attempting to retrieve account details...') }
    let accountDetails = {};
    let p = new Promise((queryResolve, queryReject) => {
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot retrieve account details - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to get their account details.'};
      }
      // Get user data
      return fs.collection('Users').doc(userData.uid).get().then((userDoc) => {
        if (!userDoc.exists) { // User doc not retrieved.
          throw {code: 'user-not-found', message: 'User data... doesnt exist??.. in firestore..'};
        }
        accountDetails = userData;
        const userDetails = userDoc.data();
        accountDetails.firstName = userDetails.firstName;
        accountDetails.lastName = userDetails.lastName;
        accountDetails.dateOfBirth = (userDetails.dateOfBirth ? userDetails.dateOfBirth.toDate() : new Date(0));
        accountDetails.gender = userDetails.gender;
        accountDetails.phone_number = userDetails.phone_number;
        accountDetails.photo_URL = userDetails.photo_URL;
        accountDetails.typePreferences = userDetails.typePreferences;
        this.getMyReviews().then(reviews => {
          accountDetails.reviews = reviews;
        });
      }).then(() => { // success
        if (DEBUG) { console.log('Account details successfully retrieved.') }
        queryResolve(accountDetails); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error retrieving account details: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  updateAccountDetails({ firstName, lastName, dateOfBirth, gender, phone_number, photo_URL, typePreferences }) {
    if (DEBUG) { console.log('Attempting to update account details...') }
    let p = new Promise((queryResolve, queryReject) => {
      // Confirm parameters are acceptable
      let paramError = "";
      paramError = paramError + verify_firstName(firstName);
      paramError = paramError + verify_lastName(lastName);
      paramError = paramError + verify_dob(dateOfBirth);
      paramError = paramError + verify_gender(gender);
      paramError = paramError + verify_phoneNumber(phone_number);
      paramError = paramError + verify_photoURL(photo_URL);
      paramError = paramError + verify_typePreferences(typePreferences);
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot update account details - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot update account details - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to update account details.'};
      }
      // Get user data
      return fs.collection('Users').doc(userData.uid).update({
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: dateOfBirth,
        phone_number: phone_number,
        photo_URL: photo_URL,
        typePreferences: typePreferences,
        gender: gender
      }).then(() => { // success
        if (DEBUG) { console.log('Account details successfully updated.') }
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error updating account details: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // Update email.
  updateEmail() {
    // TODO
  }

  // Update password.
  updatePassword(password) {
    // TODO
  }

  // Send an email link to reset password.
  resetPassword() {
    // TODO
  }

  // Message is a string that applicant wants event owner to read.
  // Returns application object, containing: applicationId, applicantUserId, eventId, message, state
  createApplication(eventId, message, eventOwnerUserId, eventName) {
    if (DEBUG) { console.log('Attempting to create application...') }
    let applicationId = "";
    let p = new Promise((queryResolve, queryReject) => {
      // Confirm parameters are acceptable
      let paramError = "";
      paramError = paramError + verify_message(message);
      paramError = paramError + verify_eventId(eventId);
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot create application - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot create application - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to create an application.'};
      }
      // Confirm user hasn't already applied for event.
      return fs.collection('Applications').
      where('applicantUserId', '==', userData.uid)
      .where('eventId', '==', eventId).get().then((snapshot) => {
        if (snapshot.docs.length) {
          throw {code: 'already-applied', message: 'User cannot have multiple simultaneous applications for event.'};
        }
        if (DEBUG) { console.log('User does not already have an application for this event...') }
        // Add new document to Applications collection, to store new application data.
        return fs.collection("Applications").add({
          applicantUserId: userData.uid,
          eventId: eventId,
          message: message,
          state: 'pending'
        });
      }).then((docRef) => { // Application added to Applications collection.
        if (DEBUG) { console.log('Application (' + docRef.id + ') added to Applications collection...') }
        // Now add applicationId (docRef.id) to list of myApplications in Users collection.
        applicationId = docRef.id; // This is for next then function.
        return fs.collection("Users").doc(userData.uid).update({
          myApplications: app.firestore.FieldValue.arrayUnion(docRef.id)
        });
      }).then(() => {
        if (DEBUG) { console.log('ApplicationId added to myApplications list...') }
        // Add applicationId to list of applications in event
        return fs.collection("Events").doc(eventId).update({
          applications: app.firestore.FieldValue.arrayUnion(applicationId)
        });
      }).then(() => { // success
        if (DEBUG) { console.log('ApplicationId added to myApplications list in User collection.') }
        if (DEBUG) { console.log('Application successfully created.') }
        // Need to create notification for event owner. First, get own name.
        return this.getAccountDetails().then((accountData) => {
          // Then, create notification for event owner.
          return this.addToLog({
            logEntryOwnerId: eventOwnerUserId,
            isNotification: true,
            keywordIndices: '0%%2',
            logMessage: accountData.firstName + " " + accountData.lastName + '%% applied for your event %%' + eventName + '%%!',
            link: `/events/${eventId}`
          });
        });
      }).then(() => {
        // Resolve with application data
        queryResolve({
          applicationId: applicationId,
          applicantUserId: userData.uid,
          eventId: eventId,
          message: message,
          state: 'pending'
        }); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error adding application document: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  deleteApplication(applicationId, eventOwnerUserId, eventName) {
    if (DEBUG) { console.log('Attempting to delete application...') }
    let eventId = "";
    let applicationState = "";
    let p = new Promise((queryResolve, queryReject) => {
      let paramError = "";
      paramError = paramError + verify_applicationId(applicationId);
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot delete application - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot delete application - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to delete an application.'};
      }
      // Confirm user owns application for event.
      return fs.collection("Users").doc(userData.uid).get()
      .then((userDoc) => {
        if (!userDoc.exists) { // User doc not retrieved.
          throw {code: 'user-not-found', message: 'User data... doesnt exist??.. in firestore..'};
        }
        let applicationOwned = false;
        userDoc.data().myApplications.forEach((aId) => {
          if (applicationId === aId) { applicationOwned = true; }
        });
        if (!applicationOwned) { throw {code: 'permission-denied', message: 'User does not own application.'}; }
        // User owns application - confirmed. Now, get eventId from application.
      }).then(() => {
        return fs.collection('Applications').doc(applicationId).get().then((docRef) => {
          if (!docRef.exists) {
            throw {code: 'application-not-found', message: 'Application data... doesnt exist??.. in firestore..'};
          }
          eventId = docRef.data().eventId;
          applicationState = docRef.data().state;
          if (DEBUG) { console.log('EventId and application state retrieved...') }
        });
      }).then(() => {
        return fs.collection('Applications').doc(applicationId).delete();
      }).then(() => {
        if (DEBUG) { console.log('Application doc deleted...') }
        // Remove applicationId from user myApplications list
        return fs.collection("Users").doc(userData.uid).update({
          myApplications: app.firestore.FieldValue.arrayRemove(applicationId)
        });
      }).then(() => {
        if (DEBUG) { console.log('ApplicationId deleted from users myApplications list...') }
        // Remove applicationId from event applications list, if event isn't deleted
        if (applicationState !== 'EVENT_DELETED') {
          return fs.collection("Events").doc(eventId).update({
            applications: app.firestore.FieldValue.arrayRemove(applicationId)
          });
        }
      }).then(() => { // success
        if (DEBUG) { console.log('Application successfully deleted.') }
        // Need to create notification for event owner, if event not deleted.
        if (applicationState != 'EVENT_DELETED') {
          // First, get own name.
          return this.getAccountDetails().then((accountData) => {
            // Then, create notification for event owner.
            return this.addToLog({
              logEntryOwnerId: eventOwnerUserId,
              isNotification: true,
              keywordIndices: '0%%2',
              logMessage: accountData.firstName + " " + accountData.lastName + '%% unapplied from your event %%' + eventName + '%%!',
              link: `/events/${eventId}`
            });
          });
        }
      }).then(() => {
        // Notification logging successful
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error deleting application document: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // Returns information about each application, and related events.
  // Returns list of objects, with the following fields:
  //  applicationId, applicantUserId, eventId, message, response, state,
  //  eventOwnerUserId, eventName, datetime, description, location, type, level,
  //  applications (int: how many people have applied)
  getMyApplications() {
    if (DEBUG) { console.log('Attempting to retrieve my applications...') }
    let result_myApplications = [];
    let p = new Promise((queryResolve, queryReject) => {
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot get applications - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to get their applications.'};
      }
      // Retrieve list of applicationIds of applications user owns.
      return fs.collection("Users").doc(userData.uid).get()
      .then((userDoc) => {
        if (!userDoc.exists) { // User doc not retrieved.
          throw {code: 'user-not-found', message: 'User data... doesnt exist??.. in firestore..'};
        }
        if (DEBUG) { console.log('ApplicationIds from user.myApplications list successfully retrieved.') }
        // Get each application and add it to local list.
        if (!userDoc.data().myApplications) { return }
        return Promise.all(userDoc.data().myApplications.map((applicationId) => {
          return fs.collection("Applications").doc(applicationId).get()
          .then((applicationDoc) => {
            if (!applicationDoc.exists) {
              throw {code: 'application-not-found', message: 'Application data... doesnt exist??.. in firestore..'};
            }
            if (DEBUG) { console.log('Application (' + applicationId + ') successfully retrieved...') }
            let v = applicationDoc.data();
            // Include applicationId as property, so user can identify it.
            v.applicationId = applicationDoc.id;
            // Add event object data to local results list.
            result_myApplications.push(v);
          });
        }));
      }).then(() => {
        if (DEBUG) { console.log('Initial applications data successfuly retrieved...') }
        if (!result_myApplications.length) { return }
        return Promise.all(result_myApplications.map((application, index) => {
          if (application.state === 'EVENT_DELETED') {
            return; // Don't attempt to retrieve event data if event is deleted.
          }
          return fs.collection('Events').doc(application.eventId).get()
          .then((eventDoc) => {
            if (!eventDoc.exists) {
              throw {code: 'Event-not-found', message: 'Event (' + application.eventId + ') data... doesnt exist??.. in firestore..'};
            }
            const eventData = eventDoc.data();
            result_myApplications[index].eventOwnerUserId = eventData.eventOwnerUserId;
            result_myApplications[index].eventName = eventData.eventName;
            result_myApplications[index].datetime = (eventData.datetime ? eventData.datetime.toDate() : new Date(0));
            result_myApplications[index].description = eventData.description;
            result_myApplications[index].location = eventData.location;
            result_myApplications[index].type = eventData.type;
            result_myApplications[index].level = eventData.level;
          });
        }));
      }).then(() => { // success
        if (DEBUG) { console.log('Related events data successfuly retrieved...') }
        if (DEBUG) { console.log('Applications successfuly retrieved.') }
        queryResolve(result_myApplications); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error retrieving application documents: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // response: an optional string containing a message from the event owner to the applicant,
  //    in response to the applicants' application/message.
  // newState: a string representing the state of the application; 'pending', 'accepted', 'rejected'
  respondToApplication(applicationId, response, newState, eventName) {
    if (DEBUG) { console.log('Attempting to respond to event...') }
    let applicationTemp = {};
    let p = new Promise((queryResolve, queryReject) => {
      // Confirm parameters are acceptable
      let paramError = "";
      // TODO ========================================== TODO: CHECK PARAMS
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot respond to event - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot respond to event - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to respond to an application.'};
      }
      // Confirm application exists
      return fs.collection('Applications').doc(applicationId).get().then((docRef) => {
        if (!docRef.exists) {
          throw {code: 'application-not-found', message: 'Application data... doesnt exist??.. in firestore..'};
        }
        // Stash application data (eventId, in particular) for later use
        applicationTemp = docRef.data();
      }).then(() => {
        if (DEBUG) { console.log('Application data found...') }
        // Confirm user owns event.
        return fs.collection('Users').doc(userData.uid).get()
      }).then((userDoc) => {
        if (!userDoc.exists) { // User doc not retrieved.
          throw {code: 'user-not-found', message: 'User data... doesnt exist??.. in firestore..'};
        }
        let eventOwned = false;
        userDoc.data().myEvents.forEach((eId) => {
          if (applicationTemp.eventId === eId) { eventOwned = true; }
        });
        if (!eventOwned) { throw {code: 'permission-denied', message: 'User does not own event.'}; }
        if (DEBUG) { console.log('Confirmed user owns event...') }
        // User owns event. Now, respond to application.
        return fs.collection("Applications").doc(applicationId).update({
          response: response,
          state: newState
        })
      }).then(() => { // Event updated.
        if (DEBUG) { console.log('Application successfuly responded to (' + applicationId + ').') }
        // Create notification for applicant.
        return this.addToLog({
          logEntryOwnerId: applicationTemp.applicantUserId,
          isNotification: true,
          keywordIndices: '1%%3',
          logMessage: 'Your application for %%' + eventName + '%% has been marked %%' + newState + '%%!',
          link: '/dashboard'
        });
      }).then(() => {
        // Logging successful
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error responding to event document: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // This will return a list of 3 events that the user has
  // not created or applied for, in the same format as getEvents(),
  // based on the user's sports preferences and previous data.
  // For now, it will just return 3 random events.
  getEventRecommendations(){
    // TODO
  }

  // This will return an object with two arrays: one is a list of
  // review objects that are reviews you've written, and one is a list of
  // review objects that are reviews you've received. Object contains:
  // 		reviewsByMe, reviewsForMe
  // Reviews can be both for the applicant by the event owner,
  // or for the event owner by the applicant. A Review object contains:
  //      reviewerId
	// 	    revieweeId
	// 	    revieweeIsApplicant (boolean: if false, reviewee is event owner)
	// 	    reviewerName
	// 	    revieweeName
	// 	    starRating (int)
	// 	    reviewMessage (string)
  // 	    eventId
  //      eventName
  // 	    ... other event details?
  // This function is intended to be called on
  // the My Account page to display the user's reviews.
  getMyReviews(accountId) {
    if (DEBUG) { console.log('Attempting to get my reviews...') }
    let reviewsByMe = [];
    let reviewsForMe = [];
    let p = new Promise((queryResolve, queryReject) => {
      // Confirm parameters are acceptable
      let paramError = "";
      // paramError = paramError + verify_applicationId(reviewId);
      // TODO ========================================================================= TODO
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot get my reviews - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot get my reviews - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to write a review.'};
      }

      const userId = accountId ? accountId : userData.uid;

      return fs.collection("Reviews")
      .where("reviewerId", "==", userId)
      .get()
      .then((snapshot) => { // Reviews retreived.
        if (DEBUG) { console.log('Reviews by me successfuly retrieved...') }
        snapshot.forEach((doc) => {
          let r = doc.data();
          r.reviewId = doc.id;
          reviewsByMe.push(r);
        });
      }).then(() => {
        return fs.collection("Reviews")
        .where("revieweeId", "==", userId)
        .get();
      }).then((snapshot) => { // Reviews retreived.
        if (DEBUG) { console.log('Reviews for me successfuly retrieved...') }
        snapshot.forEach((doc) => {
          let r = doc.data();
          r.reviewId = doc.id;
          reviewsForMe.push(r);
        });
      }).then(() => {
        queryResolve({reviewsByMe: reviewsByMe, reviewsForMe: reviewsForMe}); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error getting my reviews: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // This will delete a review written by the signed in user.
  // This will permanently remove the review for both parties.
  // NOTE: THIS CURRENT IMPLEMENTATION DOES NOT CHECK IF REVIEW
  // IS WRITTEN BY SIGNED IN USER -> WILL DELETE REVIEW ANYWAY.
  deleteReview(reviewId, revieweeId, eventName) {
    if (DEBUG) { console.log('Attempting to delete review...') }
    let p = new Promise((queryResolve, queryReject) => {
      // Confirm parameters are acceptable
      let paramError = "";
      // paramError = paramError + verify_applicationId(reviewId);
      // TODO ========================================================================= TODO
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot delete review - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot write review - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to write a review.'};
      }
      return fs.collection("Reviews")
      .doc(reviewId)
      .delete()
      .then(() => { // Review Deleted.
        if (DEBUG) { console.log('Review successfuly deleted.') }
        return this.getAccountDetails().then((reviewerData) => {
          // Create notification for other party.
          return this.addToLog({
            logEntryOwnerId: revieweeId,
            isNotification: true,
            keywordIndices: '0%%2',
            logMessage: reviewerData.firstName + '%% has deleted a review they left for you for the event %%' + eventName + '.',
            link: '/dashboard'
          });
        })
      }).then(() => {
        // Notification successful
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error deleting review: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // This is intended to be called when either reviewing an applicant
  // for an event they created, or for reviewing an event owner
  // for an event they were accepted in.
  // Detals about the reviewee should be passed in in an object - this information
  // should already be available; if the user can write a review about someone, their information
  // will already have been retrieved previously (from getEvent()). (Information about the reviewer
  // may not be, however, so that information will be retrieved in this function -
  // no need to pass that information in)
  writeReview({revieweeId, revieweeIsApplicant, revieweeFirstName, revieweeLastName, starRating, reviewMessage, eventId, eventName}) {
    if (DEBUG) { console.log('Attempting to write review...') }
    let p = new Promise((queryResolve, queryReject) => {
      // Confirm parameters are acceptable
      let paramError = "";
      // paramError = paramError + verify_applicationId(revieweeId);
      // TODO ========================================================================= TODO
      if (paramError != "") { // Not a valid paramater
        if (DEBUG) { console.log('Cannot write review - paramater is not valid.') }
        throw {code: 'parameter-invalid', message: paramError};
      }
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot write review - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to write a review.'};
      }
      // Get reviewer data
      return this.getAccountDetails().then((reviewerData) => {
        // Write the review
        return fs.collection('Reviews').add({
          reviewerId: userData.uid,
          revieweeId: revieweeId,
          revieweeIsApplicant: revieweeIsApplicant,
          reviewerName: reviewerData.firstName + ' ' + reviewerData.lastName,
          revieweeName: revieweeFirstName + ' ' + revieweeLastName,
          starRating: starRating,
          reviewMessage: reviewMessage,
          eventId: eventId,
          eventName: eventName
        });
      }).then(() => { // Review Written.
        if (DEBUG) { console.log('Review successfuly written.') }
        return this.getAccountDetails().then((reviewerData) => {
          // Create notification for other party.
          return this.addToLog({
            logEntryOwnerId: revieweeId,
            isNotification: true,
            keywordIndices: '0%%2',
            logMessage: reviewerData.firstName + '%% has left you a review for event %%' + eventName + '!',
            link: '/dashboard' // TODO: Where to go?
          });
        })
      }).then(() => {
        // Notification successful
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error writing review: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // This will return a list of log entries to be displayed on the My Account page (like a user history list).
  // Log entry objects contain:
  //    logEntryId, logEntryOwnerId, isNotification, isDismissed, logMessage, (... todo)
  //
  // Users should get notified when:
  // - someone applies to their event
  // - someone unapplies to their event
  // - their application has been responded to
  // - the event they've applied to has been updated
  // - the event they've applied to has been deleted/removed
  //
  // All above are added to a log list, with an attribute to determine if the entry is
  // a notification as well (isNotification). The log list is essentially a history list.
  // More things to log, that aren't notifications:
  // - when user creates, updates or deletes an event
  // - when user creates or deletes an application (apply/unapply)
  // - when user updates personal account info
  //
  // With a list of entries, and the ability to identify which are notifications,
  // it is possible to have two panes on the My Account Page to separate personal log entries
  // from other's (notifications) log entries. Or maybe we might want to hide all (dismissed)
  // notifications from being displayed. Or maybe we'll just show everything in one list if
  // it's easier.
  getMyLog() {
    // TODO
  }

  // This will accept a function as an argument, and will call it when a new notification is added.
  // (It will also be called once initially.)
  // It will pass into the callback an array, containing all the notifications that have not been dismissed.
  // The array will consist of log entry objects, in the same format as with getMyLog() above.
  //
  // The callback is expected to display the list of notifications in the dropdown in the header, and
  // update the notifications icon to have the number of notifications (length of array in argument)
  // hover over/next to it.
  onNotification(callback) {
    if (DEBUG) { console.log('Attempting to subscribe callback to notifications...') }
    let p = new Promise((queryResolve, queryReject) => {
      let resolveOnce = () => {
        resolveOnce = () => null; // Make future calls to here do nothing
        if (DEBUG) { console.log('Subscription to notifications successful.') }
        queryResolve();
      };
      let rejectOnce = (error) => {
        rejectOnce = (error) => null; // Make future calls to here do nothing
        if (DEBUG) { console.log('Error subscribing to notifications: ', error) }
        queryReject(error);
      };
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot subscribe to notifications - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to subscribe to notifications.'};
      }
      // Subscribe user to documents in logEntries that are notifications for that user.
      // Save reference to unsubscribe for later use elsewhere.
      this.unsubscribe = fs.collection("LogEntries")
      .where('logEntryOwnerId', '==', userData.uid)
      .where('isNotification', '==', true)
      .where('isDismissed', '==', false)
      .onSnapshot((snapshot) => {
        let notifications = [];
        if (DEBUG) { console.log('Notifications list changed...') }
        snapshot.forEach((doc) => {
          let notif = doc.data();
          notif.logEntryId = doc.id;
          notifications.push(notif);
        });
        callback(notifications);
        resolveOnce();
      }, (listenerError) => {
          console.log('Listener Error: ', listenerError);
          rejectOnce(listenerError);
      });
    });
    p.catch(() => {});
    return p;
  }

  // Check all events that user has created, and all events user has been accepted for,
  // to see if datetime has passed, and user has not already been notified to leave a review.
  // Send notification if needed, and mark it as sent so it doesn't keep sending.
  sendReviewNotifications() {
    // TODO
  }

  // Turns off the listener - removes all callbacks.
  offNotification() {
    if (DEBUG) { console.log('Unsubscribing from notifications...') }
    if (this.unsubscribe) {
      this.unsubscribe();
      if (DEBUG) { console.log('Notifications turned off.') }
    } else {
      if (DEBUG) { console.log('Notifications are already off.') }
    }
  }

  // This will accept a log entry Id and mark the entry as dismissed on the backend, so it doesn't show up in the
  // list of undismissed notifications that are passed into the callback function above.
  dismissNotification(logEntryId) {
    if (DEBUG) { console.log('Attempting to dismiss notification...') }
    let p = new Promise((queryResolve, queryReject) => {
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot add log entry - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to subscribe to notifications.'};
      }
      // Confirm entry is notification, and user owns it
      return fs.collection("LogEntries").doc(logEntryId).get().then((doc) => {
        if (!doc.data().isNotification) {
          throw {code: 'not-notification', message: 'Log entry must be a notification to be dismissed.'}
        }
        if (doc.data().logEntryOwnerId != userData.uid) {
          throw {code: 'permission-denied', message: 'User must own notification to dismiss it.'}
        }
      }).then(() => {
      // Update log entry/notification to mark it as dismissed
      return fs.collection("LogEntries").doc(logEntryId).update({
        isDismissed: true
      });
      }).then(() => {
        if (DEBUG) { console.log('Log entry updated - notification marked as dismissed.') }
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error marking entry as dismissed: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }

  // For backend internal use.
  // Adds a logEntry to the logEntries collection, storing a log of relevant actions, for
  // storing history and storing notifications.
  addToLog({ logEntryOwnerId, isNotification, keywordIndices, logMessage, link }) {
    if (DEBUG) { console.log('Attempting to add log entry...') }
    let p = new Promise((queryResolve, queryReject) => {
      // Get user reference and personal data
      const userData = app.auth().currentUser;
      // Confirm user is signed in
      if (userData === null) { // Not signed in
        if (DEBUG) { console.log('Cannot add log entry - user not signed in.') }
        throw {code: 'not-signed-in', message: 'User must be signed in to subscribe to notifications.'};
      }
      // Add log entry
      return fs.collection("LogEntries").add({
        logEntryOwnerId: logEntryOwnerId,
        isNotification: isNotification,
        isDismissed: false,
        link: link,
        keywordIndices: keywordIndices,
        logMessage: logMessage,
        timestamp: app.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        if (DEBUG) { console.log('Log entry added.') }
        queryResolve(); // Resolve promise
      }).catch((error) => {
        if (DEBUG) { console.log('Error adding entry to log: ', error) }
        queryReject(error);
      });
    });
    p.catch(() => {});
    return p;
  }
}

const db = new Model();
export default db;
