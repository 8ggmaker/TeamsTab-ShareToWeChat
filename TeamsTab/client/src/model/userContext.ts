
export interface UserContext{
    user:User
    userTeamsToken:string;
}

export interface User{
    userName:string
    upn:string
    tenantId:string
}