import * as microsoftTeams from '@microsoft/teams-js'
import AuthenticationContext from "adal-angular";
import { AudioHTMLAttributes } from 'react';
import { Config } from '../Config';

export class TeamsAuthService{
    private authContext:AuthenticationContext;
    private applicationConfig:AuthenticationContext.Options;
    private loginPromise:Promise<any>;

    constructor() {
        // Initialize the Teams SDK
        microsoftTeams.initialize();
    
        // Check for any context information supplied via our QSPs
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const tenantId = params.get("tenantId") || "common";
    
        this.applicationConfig = {
          tenant: tenantId,
          clientId: Config.ClientId,
          endpoints: {
            api: Config.ClientId
          },
          redirectUri: `${window.location.origin}/authend`,
          cacheLocation: "localStorage",
          navigateToLoginRequestUrl: false
        };
    
        this.loginPromise = null;
        this.authContext = new AuthenticationContext(this.applicationConfig);
      }
    
      isCallback() {
        return this.authContext.isCallback(window.location.hash);
      }
    
      login() {
        if (!this.loginPromise) {
          this.loginPromise = new Promise((resolve, reject) => {
            this.ensureLoginHint().then(() => {
              // Start the login flow
              microsoftTeams.authentication.authenticate({
                url: `${window.location.origin}/authstart`,
                width: 600,
                height: 535,
                successCallback: result => {
                  resolve(this.getUser());
                },
                failureCallback: reason => {
                  reject(reason);
                }
              });
            });
          });
        }
        return this.loginPromise;
      }
    
      logout() {
        this.authContext.logOut();
      }
    
      getUser() {
        return new Promise((resolve, reject) => {
          this.authContext.getUser((error, user) => {
            if (!error) {
              resolve(user.profile);
            } else {
              reject(error);
            }
          });
        });
      }
    
      getToken() {
        return new Promise((resolve, reject) => {
          this.ensureLoginHint().then(() => {
            this.authContext.acquireToken(
              this.applicationConfig.endpoints.api,
              (reason, token, error) => {
                if (!error) {
                  resolve(token);
                } else {
                  reject({ error, reason });
                }
              }
            );
          });
        });
      }
    
      ensureLoginHint() {
        return new Promise((resolve, reject) => {
          microsoftTeams.getContext(context => {
            const scopes = encodeURIComponent(
              Config.Scopes
              );
    
            // Setup extra query parameters for ADAL
            // - openid and profile scope adds profile information to the id_token
            // - login_hint provides the expected user name
            if (context.loginHint) {
              this.authContext.config.extraQueryParameter = `prompt=consent&scope=${scopes}&login_hint=${encodeURIComponent(
                context.loginHint
              )}`;
            } else {
              this.authContext.config.extraQueryParameter = `prompt=consent&scope=${scopes}`;
            }
            resolve();
          });
        });
      }
}