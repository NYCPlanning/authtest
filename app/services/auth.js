import Service from '@ember/service';
import { computed } from '@ember/object';

export default Service.extend({

  /**
   * Configure our auth0 instance
   */
  auth0: computed(function () {
    return new auth0.WebAuth({
      // setting up the config file will be covered below
      domain: 'dcpauthtest.auth0.com', // domain from auth0
      clientID: 'xEcYzOYUxqai8q1svijnvPZR1gL9Sw3k', // clientId from auth0
      redirectUri: 'http://localhost:4200/callback',
      audience: 'https://dcpauthtest.auth0.com/userinfo',
      responseType: 'token',
      scope: 'openid profile' // adding profile because we want username, given_name, etc
    });
  }),

  /**
   * Send a user over to the hosted auth0 login page
   */
  login() {
    this.get('auth0').authorize();
  },

  /**
   * When a user lands back on our application
   * Parse the hash and store user info
   */
  handleAuthentication() {
    console.log('handleAuth()');
    return new Promise((resolve) => {
      this.get('auth0').parseHash((err, authResult) => {
        if (err) return false;

        if (authResult && authResult.accessToken) {
          this.setUser(authResult.accessToken);
        }

        return resolve();
      });
    });
  },

  /**
   * Computed to tell if a user is logged in or not
   * @return boolean
   */
  isAuthenticated: computed(function() {
    return this.get('checkLogin');
  }),

  /**
   * Use the token to set our user
   */
  setUser(token) {
    // once we have a token, we are able to go get the users information
    this.get('auth0')
      .client
      .userInfo(token, (err, profile) => this.set('user', profile))
  },

  /**
   * Check if we are authenticated using the auth0 library's checkSession
   */
  checkLogin() {
    // check to see if a user is authenticated, we'll get a token back
    this.get('auth0')
      .checkSession({}, (err, authResult) => {
        // if we are wrong, stop everything now
        if (err) return err;
        this.setUser(authResult.accessToken);
      });
  },

  /**
   * Get rid of everything in sessionStorage that identifies this user
   */
  logout() {
    this.get('auth0').logout({
      clientID: 'xEcYzOYUxqai8q1svijnvPZR1gL9Sw3k',
      returnTo: 'http://localhost:4200/'
    });
  }
});
