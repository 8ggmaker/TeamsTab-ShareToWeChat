import React from "react";
import AuthenticationContext from "adal-angular";
import { Config } from "../Config";
import * as microsoftTeams from "@microsoft/teams-js";

export class AuthStart extends React.Component{
    componentDidMount(){
        microsoftTeams.initialize();

        microsoftTeams.getContext(context => {

            const config:AuthenticationContext.Options = {
              tenant: context.tid,
              clientId: Config.ClientId,
              redirectUri: window.location.origin + "/authend",
              cacheLocation: "localStorage",
              navigateToLoginRequestUrl: false,
              extraQueryParameter:null
            };

            console.log(config.redirectUri);
    
            const scopes = encodeURIComponent(
              Config.Scopes
            );
    
            // Setup extra query parameters for ADAL
            // - openid and profile scope adds profile information to the id_token
            // - login_hint provides the expected user name
            if (context.loginHint) {
              config.extraQueryParameter = `prompt=consent&scope=${scopes}&login_hint=${encodeURIComponent(context.loginHint)}`;
            } else {
              config.extraQueryParameter = `prompt=consent&scope=${scopes}`;
            }
    
            // Navigate to the AzureAD login page
            const authContext = new AuthenticationContext(config);
            authContext.login();
          });
    }

    render(){
      return (<div>auth start</div>);
  }
}