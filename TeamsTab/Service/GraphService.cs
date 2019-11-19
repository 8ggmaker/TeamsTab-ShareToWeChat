using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using TeamsTab.Models;
namespace TeamsTab.Service
{
    public interface IGraphService
    {
        Task<PageCollection<Models.File>> GetTeamFilesAsync(string token,string groupId);
    }

    public class GraphService : IGraphService
    {
        private IHttpMessageHandlerFactory httpMessageHandlerFactory;

        public GraphService(IHttpMessageHandlerFactory httpMessageHandlerFactory)
        {
            this.httpMessageHandlerFactory = httpMessageHandlerFactory ?? throw new ArgumentNullException(nameof(httpMessageHandlerFactory));
        }
        public async Task<PageCollection<Models.File>> GetTeamFilesAsync(string token, string groupId)
        {
            GraphServiceClient client = new GraphServiceClient("https://graph.microsoft.com/v1.0", new DelegateAuthenticationProvider((request) => {
                request.Headers.Authorization = new AuthenticationHeaderValue("bearer", token);
                return Task.CompletedTask;
            }), new HttpProvider(httpMessageHandlerFactory.CreateHandler(), false, new Serializer()));

            var driveItems = await client.Groups[groupId].Drive.Root.ItemWithPath("/General").Children.Request().Top(100).GetAsync();

            if (driveItems == null || !driveItems.Any())
            {
                return new PageCollection<Models.File> { Data = new List<Models.File>() };
            }
            else
            {
                var files = new Models.File[driveItems.Count];
                for (int idx = 0; idx < driveItems.Count; idx++)
                {
                    if (driveItems[idx].Folder != null)
                    {
                        if (!driveItems[idx].Name.EndsWith(".one"))
                        {
                            continue;
                        }

                    }
                    files[idx] = new Models.File(driveItems[idx]);


                }

                return new PageCollection<Models.File> { Data = files };
            }
        }
    }
}