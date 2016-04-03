const googleScript = document.createElement('script');
googleScript.src = 'https://apis.google.com/js/client.js';
googleScript.async = 'async';
googleScript.defer = 'defer';
googleScript.onload = () => {
  googleScript.onload = null;
};
document.body.appendChild(googleScript);

let maxTryCount = 50;
function getGapi() {

  return new Promise((resolve, reject) => {

    if (window.gapi && window.gapi.auth) {
      return resolve(window.gapi);
    }

    let timer = setInterval(() => {

      if (window.gapi && window.gapi.auth) {
        clearInterval(timer);
        timer = null;
        maxTryCount = null;
        return resolve(window.gapi);
      } else if (maxTryCount <= 0) {
        return reject('Limit gapi auth call');
      } else {
        maxTryCount--;
      }

    }, 200);

  });

}

/**
 * Client-side (Cordova или Web Browser) аворизация Google OAuth 2.0
 * @param CLIENT_ID {String}
 * @param SCOPES {Array}
 * @returns {Promise}
 */
function googleOAuth(CLIENT_ID, SCOPES) {

  return new Promise((resolve, reject) => {

    getGapi()
      .then(gapi => {

        if (!window.cordova) {

          gapi.auth.authorize({
            client_id: CLIENT_ID,
            scope: SCOPES,
            response_type: 'token',
            immediate: false
          }, (token) => {
            gapi.client.setApiKey('');
            gapi.auth.setToken(token);

            return resolve(token);
          });

        } else if (window.cordova && window.cordova.InAppBrowser) {

          const redirect_uri = 'http://localhost/callback';

          const browserRef = window.cordova.InAppBrowser.open(
            `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}` +
            `&redirect_uri=${redirect_uri}` +
            `&scope=${SCOPES.join(' ')}` +
            '&approval_prompt=force' +
            '&response_type=token id_token',
            '_blank',
            'location=no,clearsessioncache=yes,clearcache=yes'
          );

          browserRef.addEventListener('loadstart', (event) => {

            if ((event.url).indexOf(redirect_uri) === 0) {
              browserRef.removeEventListener('exit', () => {
              });
              browserRef.close();

              let callbackResponse = (event.url).split('#')[1];
              let responseParameters = (callbackResponse).split('&');
              let parameterMap = [];

              for (let i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split('=')[0]] = responseParameters[i].split('=')[1];
              }

              if (parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                const token = {
                  access_token: parameterMap.access_token,
                  expires_in: parameterMap.expires_in,
                  id_token: parameterMap.id_token,
                  token_type: parameterMap.token_type
                };

                gapi.client.setApiKey('');
                gapi.auth.setToken(token);

                return resolve(token);
              } else {
                return reject('Problem authenticating');
              }
            }

          });

          browserRef.addEventListener('exit', () => {
            return reject('The sign in flow was canceled');
          });

        } else {
          return reject('Cordova InAppBrowser not installed');
        }

      })
      .catch(error => {
        return reject(error);
      });

  });

}

export default googleOAuth;
