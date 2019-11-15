import React from "react";
import { Config } from "../Config";
import AuthenticationContext from "adal-angular";
import * as microsoftTeams from "@microsoft/teams-js";

export class AuthEnd extends React.Component{
    componentDidMount(){
        microsoftTeams.initialize();

        // ADAL.js configuration
        const config:AuthenticationContext.Options = {
          clientId: Config.ClientId,
          redirectUri: window.location.origin + "/authend",
          cacheLocation: "localStorage",
          navigateToLoginRequestUrl: false,
        };
  
        const authContext = new AuthenticationContext(config);
        if (authContext.isCallback(window.location.hash)) {
          authContext.handleWindowCallback(window.location.hash);
  
          // Only call notifySuccess or notifyFailure if this page is in the authentication popup
          if (window.opener) {
            if (authContext.getCachedUser()) {
              microsoftTeams.authentication.notifySuccess();
            } else {
              microsoftTeams.authentication.notifyFailure(authContext.getLoginError());
            }
          }
        }
    }

    render(){
        return (<div>auth end</div>);
    }
}