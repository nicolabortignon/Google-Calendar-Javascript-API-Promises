
# Google Calendar Javascript API (Promises)

I'm not a fun of the original Google Calendar Javascript API, so I've decided to write my own wrap, exposing every method via promises.

## How to use this wrapper

Included the original Google Api and the file calendarAPI.js in your project and reference them as usaul by adding: 

```js
<script src="https://apis.google.com/js/client.js"></script>
<script src="calendarAPI.js"></script>
```

On page loaded you can initialize the wrapper in this way:

```js
var calendarAPI = new calendarAPI(your_google_app_client_id);
calendarAPI.startAuthentication().
	then(calendarAPI.getCalendars());
```

where `your_google_app_client_id` is the token generated in your cloud console.