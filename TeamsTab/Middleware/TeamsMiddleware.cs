using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TeamsTab.Middleware
{
    public class TeamsMiddleware
    {
        private readonly RequestDelegate next;

        public TeamsMiddleware(RequestDelegate next)
        {
            this.next = next;
        }
        public async Task Invoke(HttpContext context)
        {
            ParseTeamsJWTToken(context);
            await this.next.Invoke(context);
        }

        private void ParseTeamsJWTToken(HttpContext context)
        {
            string token = context.Request.Headers["Authorzation"];
            if(string.IsNullOrWhiteSpace(token))
            {
                return;
            }
            token = token.Split(" ")[1];
            string[] tokenParts = token.Split(".");
            string payloadStr = DecodeBase64Url(tokenParts[1]);
            dynamic payload = JsonConvert.DeserializeObject<dynamic>(payloadStr);
            context.Request.Headers["TenantId"] = (string)payload.tid;
            context.Request.Headers["Upn"] = (string)payload.upn;
            if (string.IsNullOrWhiteSpace(context.Request.Headers["Upn"]))
            {
                context.Request.Headers["Upn"] = (string)payload.preferred_username;
            }
        }

        private string DecodeBase64Url(string str)
        {
            if (str == null)
            {
                throw new ArgumentNullException("str");
            }

            str = str.Trim().Replace("-", "+").Replace("_", "/");

            var bytes = Convert.FromBase64String(Pad(str));
            return System.Text.Encoding.GetEncoding(65001).GetString(bytes);
        }

        private string Pad(string text)
        {
            var padding = 3 - ((text.Length + 3) % 4);
            if (padding == 0)
            {
                return text;
            }
            return text + new string('=', padding);
        }
    }

    public static class TeamsMiddlewareExtensions
    {
        public static IApplicationBuilder UseTeamsMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TeamsMiddleware>();
        }
    }
}
