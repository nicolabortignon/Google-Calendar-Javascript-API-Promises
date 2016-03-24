
# Google Calendar Javascript API (Promises)

I'm not a fan of the original Google Calendar Javascript API, they are so 2012 :). 
I've decided to write my own wrap, exposing every method via promises.

## How to use this wrapper

Included the original Google Api and the file calendarAPI.js in your project and reference them as usaul by adding: 

```js
<script src="https://apis.google.com/js/client.js"></script>
<script src="calendarAPI.js"></script>
```

On page loaded you can initialize the wrapper in this way:

```js
var calendarAPI = new calendarAPI(your_google_app_client_id);
calendarAPI.startAuthentication()
	.then( calendarAPI.getCalendars )
	.then( calendarAPI.getEvents );
```

where `your_google_app_client_id` is the token generated in your cloud console.

## API Overview

considering the initialization done in this way:
```js
var calendarAPI = new calendarAPI(your_google_app_client_id);
```

Here the API currently supported.

### Authentication

#### isAuthenticated
returns the authentication object if the user is already authenticated,
fails the promise otherwise.

```js
calendarAPI.isAuthenticated()
```js

#### startAuthentication
opens the google oAuth2 autentication popup. Request read and write permission 
on the user.
Fullfill the promise when the autentication is confirmed, and returns the authentication object.
Fails otherwise.

```js
calendarAPI.startAuthentication()
```js

### Access personal calendar informations 

#### getMyCalendars
returns an array of all the calendars that belongs to the user. Not to be confused to the list 
of all the calendars that the user has been exposed to (which is available by using getCalendars).

```js
calendarAPI.getMyCalendars()
```js


#### getMyEvents
returns a list of all events that belongs to the users (that has been created by the user on one of his calendar).
Allows to filter by calendar and date.

```js
calendarAPI.getMyEvents()
```js

### Access calendar informations 

#### getCalendars
returns an array of all the calendars the user has been exposed to. It means, all the user calendars plus all the other calendars belonging 
to other users in which there is an event with an invitation to the current user. 

```js
calendarAPI.getCalendars()
```js


#### getEvents
returns a list of all events that involve the curent user. Includes events created by the user as well as events that the user has been invited.

```js
calendarAPI.getEvents()
```js


