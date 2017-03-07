class Config {
  constructor() {
    this.setEnvironment();

    this._server = this.getServerVars();
    this._client = this.getClientVars();
    this._localOverrides = this.getLocalOverrides();

    this._store = Object.assign({},
      this._client,
      this._server,
      this._localOverrides
    );
  }

  set(key, value) {
    if (key.match(/:/)) {
      const keys = key.split(':');
      let store_key = this._store;

      keys.forEach(function(k, i) {
        if (keys.length === (i + 1)) {
          store_key[k] = value;
        }

        if (store_key[k] === undefined) {
          store_key[k] = {};
        }

        store_key = store_key[k];
      });

    } else {
      this._store[key] = value;
    }
  }

  get(key) {
    // Is the key a nested object
    if (key.match(/:/)) {
      // Transform getter string into object
      const store_key = this.buildNestedKey(key);

      return store_key;
    }

    // Return regular key
    return this._store[key];
  }

  has(key) {
    return this.get(key) ? true : false;
  }

  setEnvironment() {
    if (process.browser) {
      this._env = 'client';
    } else {
      this._env = 'server';
    }
  }

  getServerVars() {
    let serverVars = {};

    if (this._env === 'server') {
      try {
        serverVars = require('../../../config/server');
      } catch(e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Didn't find a server config in \`./config\`.`);
        }
      }
    }

    return serverVars;
  }

  getClientVars() {
    let clientVars;

    try {
      clientVars = require('../../../config/client');
    } catch(e) {
      clientVars = {};

      if (process.env.NODE_ENV === 'development') {
        console.warn(`Didn't find a client config in \`./config\`.`);
      }
    }

    return clientVars;
  }

  getLocalOverrides() {
    let overrides;
    const warnTemplate = 'Using local overrides in `./config/%s.js`.';

    try {
      switch (process.env.NODE_ENV) {
        case 'production':
          overrides = require('../../../config/prod');
          console.warn(warnTemplate, 'prod');
          break;

        case 'development':
          overrides = require('../../../config/dev');
          console.warn(warnTemplate, 'dev');
          break;

        case 'test':
          overrides = require('../../../config/test');
          console.warn(warnTemplate, 'test');
          break;

        default:
          overrides = require('../../../config/dev');
          console.warn('Could not match the provided NODE_ENV. Defaulting to `dev`');
      }
    } catch(e) {
      overrides = {};
    }

    return overrides;
  }

  // Builds out a nested key to get nested values
  buildNestedKey(nested_key) {
    // Transform getter string into object
    const keys = nested_key.split(':');
    let store_key = this._store;

    keys.forEach(function(k) {
      try {
        store_key = store_key[k];
      } catch(e) {
        return undefined;
      }
    });

    return store_key;
  }
}

const config = new Config();

export default config;
