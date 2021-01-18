// A test script for Model.js

import db from './Model.js';
import app, {fs} from '../base.js';

class Test {
    constructor() {

    }

    runModelTest() {
		//  this.test_createEvent();
		//  this.test_updateMyEvent();
		//  this.test_deleteMyEvent();
		//  this.test_getMyEvents();
		//  this.test_getEvents();
		//  this.test_getEvent();

		//  this.test_createApplication();
		//  this.test_deleteApplication();
		//  this.test_getMyApplications();
		//  this.test_respondToApplication();

		//  this.test_getAccountDetails();
		//  this.test_updateAccountDetails();

		// this.test_Notifications();

	}

	test_Notifications() {
		let callbackFunction = (notifications) => {
			console.log('NOTIFICATIONS RECIEVED: ', notifications);
		}

		db.onNotification(callbackFunction).then(() => {
			// return db.addToLog({
			// 	logEntryOwnerId: app.auth().currentUser.uid,
			// 	isNotification: true,
			// 	logMessage: 'THIS IS A TEST NOTIFICATION!'
			// });
		}).then(() => {
			// console.log('LOG ADDED');
			// return db.dismissNotification('L90FxKqEip1CAsAWLM7J');
		}).catch((error) => {
			// console.log('ERROR: ', error);
		});

		// setTimeout(() => {
		// 	console.log('Turning notifs off...');
		// 	db.offNotification();
		// 	console.log('Notifs turned off...');
		// }, 5000);
	}

    test_createEvent() {
        const eventData = {
            eventName: 'A test eventName',
            datetime: new Date(),
            description: 'A test description.',
            location: 'Some Park, Melbourne',
            type: 'Hockey',
            level: 'Experienced'
        }
        db.createEvent(eventData).then(() => {
            // Event successfully created
            console.log('Event successfully created.');
        }).catch((error) => {
            // Event creation failed
            console.log('Event creation failed: ', error.code + '; ' + error.message);
        });
    }

    test_updateMyEvent() {
        const eventData = {
			eventId: '9Q4hJKTTd7auMYLvgpv2',
            eventName: 'TESTTTTTT',
            datetime: new Date(),
            description: 'Another description.',
            location: 'Some Place, Sydney',
            type: "Rugby",
            level: 'Experienced'
        }
        db.updateMyEvent(eventData).then(() => {
            // Event successfully updated
            console.log('Event successfully updated');
        }).catch((error) => {
            // Event creation failed
            console.log('Event updation failed: ', error.code + '; ' + error.message);
        });
	}
	
	test_deleteMyEvent() {
        db.deleteMyEvent("5BJUukbvmCEfN7k5XJUU").then(() => {
            console.log("Event deleted");
        }).catch((error) => {
            console.log('Event deletion failed: ', error.code + '; ' + error.message);
        });
    }

    test_getMyEvents() {
		// Returns list of objects; each object has fields:
		// 	  eventID: (int)
		//    eventName: (string)
		//    datetime: A Date() object
		//    description: (string)
		//    location: (string)
		//    type: (string) - e.g. "Soccer"
		//    level: (string) - "Beginner" | "Intermediate" | "Experienced")
		//    applications: (int) - number of applications/applicants for event (regardless of state)
        db.getMyEvents().then((myEvents) => {
            console.log('Events successfully retrieved.');
            console.log(myEvents);
        }).catch((error) => {
            console.log('Events retrieval failed: ', error.code + '; ' + error.message);
        });
	}

	test_getEvents() {
		// Returns data in same format as getMyEvents().
        db.getEvents().then((events) => {
            console.log(events);
        }).catch((error) => {
            console.log('Events retrieval failed: ', error.code + '; ' + error.message);
        });
	}
	
	test_getEvent() {
		//    Result event object will have same fields as getMyEvents() or getEvents(),
		//    but applications field will be an array of objects (instead of a number), with fields:
		//      applicationId, applicantId, eventId, state (= pending, accepted, rejected),
		//      firstName, lastName, dateOfBirth, gender, phone_number, photo_URL
        db.getEvent('5nYJlC67sDdmSWLrQZDu').then((event) => {
            console.log(event);
        }).catch((error) => {
            console.log('Event retrieval failed: ', error.code + '; ' + error.message);
        });
	}
   
	test_createApplication() {
        db.createApplication('1UdOEqiRQUOrCrd33urW', 'Accept my application plzzzz').then(() => {
            console.log('Successfully created application.');
        }).catch((error) => {
            console.log('Application creation failed: ', error.code + '; ' + error.message);
        });
	}

	test_deleteApplication() {
        db.deleteApplication('zf2zEevlPDoIRHQ2jKeF').then(() => {
            console.log('Successfully deleted application.');
        }).catch((error) => {
            console.log('Application deletion failed: ', error.code + '; ' + error.message);
        });
	}

	test_getMyApplications() {
		// Returns information about each application, and related events.
		// Returns list of objects, with the following fields:
		//  applicantUserId, eventId, message, response, state,
		//  eventOwnerUserId, eventName, datetime, description, location, type, level,
		//  applications (int: how many people have applied)
        db.getMyApplications().then((applications) => {
            console.log(applications);
        }).catch((error) => {
            console.log('Applications retrieval failed: ', error.code + '; ' + error.message);
        });
	}

	test_respondToApplication() {
		// Input applicationId, a response string (for applicant to read), 
		// and the state of the application after your response (accepted/rejected).
        db.respondToApplication('UUhD24ITx1zJDYgzaUpO', 'HECTIC STUFF DUDE! SEE YOU SOON!', 'accepted').then(() => {
            console.log('Succesfsully responded to application.');
        }).catch((error) => {
            console.log('Application responding failed: ', error.code + '; ' + error.message);
        });
	}

	test_getAccountDetails() {
		// Returns fields, as in comment at bottom of file, plus email and other metadata.
		db.getAccountDetails().then((details) => {
			console.log(details);
		}).catch((error) => {
			console.log(error.code + '; ' + error.message);
		});
	}

	test_updateAccountDetails() {
		const accountDetails = {
			firstName: 'Will',
			lastName: 'Smith',
			dateOfBirth: new Date(),
			gender: 'male',
			phone_number: '0123456789',
			photo_URL: 'https://www.dictionary.com/e/wp-content/uploads/2018/03/Upside-Down_Face_Emoji.png',
			typePreferences: ['Soccer', 'Hockey']
		};
		db.updateAccountDetails(accountDetails).then(() => {
			console.log('Updation successful.');
		}).catch((error) => {
			console.log(error.code + '; ' + error.message);
		});
	}

}

const ModelTest = new Test();
export default ModelTest;


// Explanation of backend design:
/*

- createEvent
	=> pass in properties and userID
	=> Events.push()
	=> add auto-generated key to Users.userID.myEvents.push()
- deleteEvent
	=> pass in eventID and userID
	=> Confirm user owns event -> Users.userID.myEvents.eventID not null
	=> .then();... remove key... then();... remove key-value pair from Events(.eventID)
- getMyEvents (should include application data)
	=> pass in userID
	=> get eventIDs from Users.userID.myEvents
	=> for each, get Events.eventID
 	- getApplicationsForEvent (?)
	- getApplication (?) 
- getEvents (all events, some events?)
	=> Events(collection); get all documents, or use queries.
- updateEvent
	=> pass in eventID and userID
	=> Confirm user owns event -> Users.userID.myEvents.eventID not null
	=> .then();... write over it.
- getAccountDetails (?)
	=> pass in userID
	=> get email from auth
	=> get all else from Users(collection).userID(document)
- updateAccountDetails
	=> pass in userID and properties
	=> email or password: TODO, with auth
	=> everything else, update Users(collection).userID(document)

- createApplication
	=> pass in userID and eventID
	=> confirm user doesn't already have an active application to event
	=> add a document to Applications (collection) (state='pending')
	=> add applicationID to Users.myApplications
	=> add applicationID to Events.eventID.applications
- deleteApplication
	=> pass in userID and applicationID
	=> Confirm user owns application -> Users.userID.myApplications.applicationID not null/undefined
	=> remove from Applications(.applicationID)
	=> remove from Users.userID.myApplications(.applicationID)
	=> remove from Events.eventID.applications(.applicationID)
- getMyApplications
	=> pass in userID
	=> get Users.userID.myApplications (applicationIDs)
	=> for each, get Applications.applicationID

- respondToApplication
	=> pass in userID, applicationID and response
	=> Confirm user owns event -> Users.userID.myEvents.eventID not null/undefined
	=> set state to 'accepted' or 'rejected' in Applications.applicationID
-------------------------------

// Just a side note:
// Events and Applications are added by the user that owns them.
// Reviews and LogEntries are added by other users. 
// Not a good idea to give access to user documents to anyone that 
// wants to write a review or make a log entry, hence the segregation.
// Instead of referencing/indexing the Reviews and Log Entries like with
// myEvents and myApplications, we'll just run a query.
// Ideally, we'd setup security rules on the backend and cloud functions 
// to update certain parts of the datastore (instead of doing so client side).
// Not a great implementation, but for this uni project, it'll do. 

-------------------------------

Notifications:
User should get notified when:
- someone applies to their event -> implemented (not fully tested)
- someone unapplies from their event -> implemented (not fully tested)
- their application has been responded to -> implemented (not fully tested)
-
- the event they've applied to has been updated -> implemented (not tested)
- the event they've applied to has been deleted/removed -> implemented (not tested)
-
- When time of event passes, send notification to event owner to review accepted applicants, and
- send notification to accepted applicant to review event/event owner. 

All above are added to a log list, with an attribute to determine if the entry is
a notification as well. The log list is essentially a history list. 
More things to log, that aren't notifications:
- when user creates, updates or deletes an event
- when user creates or deletes an application (apply/unapply)
- when user updates personal account info


API:

// Call this to add a listener to the notifications stream for the signed in user;
// pass in a callback to be called when notifications list in db changes.
onNotification(callback);
// The callback will be called with an array passed in as the first argumemt that contains
// a list of unread notification (log entry) objects. 
// The callback is expected to display the list of notifications in the dropdown in the header, and
// update the notifications icon to have the number of notifications (length of array in argument) 
// hover over/next to it. 

dismissNotification(notificationId)

addToLog(object); // For backend use


getMyReviews(); 
// This will return an object with two arrays: one is a list of 
// review objects that are reviews you've written, and one is a list of
// review objects that are reviews you've received. Object contains:
// 		reviewsByMe, reviewsForMe
// Reviews can be both for the applicant by the event owner, 
// or for the event owner by the applicant. 


TODO: 
getEventRecommendations();
-------------------------------

Users(collection)
	userID (document)
		firstName
		lastName
		dateOfBirth
		gender
		phone_number
		photo_URL
		typePreferences (array)
			0: soccer
			1: football
		myEvents (array)
			0: eventID1
			1: eventID2
		myApplications (array)
			0: applicationID1
			1: applicationID2
			2: applicationID3

Events (collection)
	eventID (document)
		eventOwnerUserID
		eventName
		datetime
		description
		location
		type
		level
		applications (array)
			0: applicationID
			
Applications
	applicationID
		applicantUserId
		eventID
		message
		response
		state (accepted | rejected | pending | EVENT_DELETED)

Reviews
	reviewID
		reviewerId
		revieweeId
		revieweeIsApplicant (boolean: if false, reviewee is event owner) 
		reviewerName
		revieweeName
		starRating (int)
		reviewMessage (string)
		eventId
		eventName
		... event details?

LogEntries
	logEntryID
		logEntryOwnerId
		isNotification (boolean: if false, it's just a log for the history list. If true, it's both.)
		isDismissed (only relevant if isNotification is true)
		logMessage
		... todo
*/
