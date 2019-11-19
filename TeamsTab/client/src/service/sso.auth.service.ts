import { TeamsAuthService } from "./teams.auth.service";
import { User } from "../model/userContext";
import * as microsoftTeams from "@microsoft/teams-js";
class SsoAuthService{
    private teamsAuthService:TeamsAuthService;

    constructor() {
        // Initialize the Teams SDK
        microsoftTeams.initialize();
      }
    
      isCallback() {
        if (!this.teamsAuthService) {
          this.teamsAuthService = new TeamsAuthService();
        }
        return this.teamsAuthService.isCallback();
      }
    
      login() {
        if (!this.teamsAuthService) {
          this.teamsAuthService = new TeamsAuthService();
        }
        return this.teamsAuthService.login();
      }
    
      parseTokenToUser(token:string):User {
        console.log(token);
        // parse JWT token to object
        var base64Url = token.split(".")[1];
        var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        var parsedToken = JSON.parse(window.atob(base64));
        return {       
          upn: parsedToken.preferred_username || parsedToken.upn,
          userName: parsedToken.name,
          tenantId:parsedToken.tid
        };
      }
    
      async getUser():Promise<User> {

        return new Promise((resolve, reject) => {
            this.getToken()
              .then(token => {
                resolve(this.parseTokenToUser(token));
              })
              .catch(reason => {
                reject(reason);
              });
          
        });
      }
    
      getToken():Promise<string> {
        return new Promise((resolve, reject) => {

            microsoftTeams.authentication.getAuthToken({
              successCallback: result => {
                resolve(result);
              },
              failureCallback: reason => {
                reject(reason);
              },
              resources:null
            });
          
        });
      }
}

export default new SsoAuthService();