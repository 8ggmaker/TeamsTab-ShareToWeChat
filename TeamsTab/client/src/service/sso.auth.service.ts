import { TeamsAuthService } from "./teams.auth.service";
import { User } from "../model/userContext";
import * as microsoftTeams from "@microsoft/teams-js";
class SsoAuthService{
    private authToken:string;
    private teamsAuthService:TeamsAuthService;

    constructor() {
        // Initialize the Teams SDK
        microsoftTeams.initialize();
    
        this.authToken = null;
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
        // parse JWT token to object
        var base64Url = token.split(".")[1];
        var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        var parsedToken = JSON.parse(window.atob(base64));
        var nameParts = parsedToken.name.split(" ");
        return {       
          upn: parsedToken.preferred_username,
          userName: parsedToken.name
        };
      }
    
      getUser():Promise<User> {
        return new Promise((resolve, reject) => {
          if (this.authToken) {
            resolve(this.parseTokenToUser(this.authToken));
          } else {
            this.getToken()
              .then(token => {
                resolve(this.parseTokenToUser(token));
              })
              .catch(reason => {
                reject(reason);
              });
          }
        });
      }
    
      getToken():Promise<string> {
        return new Promise((resolve, reject) => {
          if (this.authToken) {
            resolve(this.authToken);
          } else {
            microsoftTeams.authentication.getAuthToken({
              successCallback: result => {
                this.authToken = result;
                resolve(result);
              },
              failureCallback: reason => {
                reject(reason);
              },
              resources:null
            });
          }
        });
      }
}

export default new SsoAuthService();