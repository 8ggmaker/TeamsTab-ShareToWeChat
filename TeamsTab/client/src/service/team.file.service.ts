import { PageCollection } from "../model/pageCollection";
import{File} from '../model/file'
import authService from '../service/sso.auth.service';
class TeamFileSerive{
    async getTeamsFiles(groupId:string):Promise<PageCollection<File>>{
        const url = `${window.location.origin}/api/teams/${groupId}/files`;
        let options:RequestInit = {};
        const token = await authService.getToken();
        options.headers = 
        {
            Authorzation: `Bearer ${token}`
        }
        const response = await fetch(url,options);
        if(response.ok){
            const json = await response.json();
            console.log(json)
            return json as PageCollection<File>;
        }

        throw new Error(response.statusText);
    }
}

export default new TeamFileSerive();