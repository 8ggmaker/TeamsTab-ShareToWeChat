using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TeamsTab.Models;
using System;
using TeamsTab.Service;

namespace TeamsTab.Controllers
{
    public class TeamFilesController : Controller
    {
        private ITokenService tokenService;
        private IGraphService graphService;
        public TeamFilesController(ITokenService tokenService,IGraphService graphService)
        {
            this.tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
            this.graphService = graphService ?? throw new ArgumentNullException(nameof(graphService));
        }
        
        [HttpGet]
        [Route("api/teams/{id}/files")]
        public async Task<PageCollection<File>> GetTeamFilesAsync(string id)
        {
            string tenantId = Request.Headers["TenantId"];
            string upn = Request.Headers["Upn"];
            string token = Request.Headers["Authorzation"];
            token = token.Split(" ")[1];
            string graphToken = await this.tokenService.GetTokenAsync(token, upn, tenantId);
            return await this.graphService.GetTeamFilesAsync(graphToken, id);
        }
    }
}