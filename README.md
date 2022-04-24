# cordova-google-oauth2

## Installation
```bash
npm i cordova-google-oauth2
```

## Example

```javascript
import googleOAuth from 'cordova-google-oauth2';

const CLIENT_ID = 'xxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com';
const scriptId = 'yyyyyyy-yyyyyyyyyyyyyyyyyyyyyyyyy';
const sheetId = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets'
];

googleOAuth(CLIENT_ID, SCOPES, {redirect_uri: 'http://localhost/callback'})
.then((response) => {
  if (response.error) {
    console.error(response);
    return;
  }
  return gapi.client.request({
    'root': 'https://script.googleapis.com',
    'path': `v1/scripts/${scriptId}:run`,
    'method': 'POST',
    'body': {
      'function': 'load',
      'parameters': [sheetId]
    }
  });
})
.then((res) => {
  const resp = JSON.parse(res.body);
  console.log(resp.response);
})
.catch((error) => {
  console.error(error);
});
```
