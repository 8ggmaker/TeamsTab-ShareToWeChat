using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TeamsTab.Models;
using System;

namespace TeamsTab.Controllers
{
    public class TeamFilesController : Controller
    {
        [HttpGet]
        [Route("api/teams/{id}/files")]
        public async Task<PageCollection<File>> GetTeamFilesAsync(string skipToken,string userId,string authToken)
        {
            throw new NotImplementedException();
        }
    }
}