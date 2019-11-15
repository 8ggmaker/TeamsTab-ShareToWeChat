import ssoAuthService  from "./sso.auth.service";
import { supportsGoWithoutReloadUsingHash } from "history/DOMUtils";
import { UserContext } from "../model/userContext";

export class UserService{
    async getUserContext():Promise<UserContext>{
        var user = await ssoAuthService.getUser();
        var token = await ssoAuthService.getToken();

        return {
            user:user,
            userTeamsToken:token
        }
    }
}