using System.Net.Http;
using System.Threading.Tasks;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
namespace TeamsTab.Service
{
    public interface ITokenService
    {
        Task<string> GetTokenAsync(string teamAccessToken, string upn, string tenantId);
    }

    public class TokenService : ITokenService
    {
        internal struct Token
        {
            internal DateTimeOffset ExpireOn { get; set; }
            internal string TokenStr { get; set; }
        }
        private IHttpClientFactory httpClientFactory;
        private ConcurrentDictionary<string, Token> tokenCache;
        private string clientId;
        private string clientSecret;

        public TokenService(IHttpClientFactory httpClientFactory, string clientId, string clientSecret)
        {
            this.httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
            this.tokenCache = new ConcurrentDictionary<string, Token>(StringComparer.OrdinalIgnoreCase);
            if (string.IsNullOrWhiteSpace(clientId))
            {
                throw new ArgumentNullException(nameof(clientId));
            }
            if (string.IsNullOrWhiteSpace(clientSecret))
            {
                throw new ArgumentNullException(nameof(clientSecret));
            }
            this.clientId = clientId;
            this.clientSecret = clientSecret;

        }

        public async Task<string> GetTokenAsync(string teamAccessToken, string upn, string tenantId)
        {
            if (string.IsNullOrWhiteSpace(teamAccessToken))
            {
                throw new ArgumentNullException(nameof(teamAccessToken));
            }
            if (string.IsNullOrWhiteSpace(upn))
            {
                throw new ArgumentNullException(nameof(upn));
            }
            if (string.IsNullOrWhiteSpace(tenantId))
            {
                throw new ArgumentNullException(nameof(tenantId));
            }

            Token cachedToken = default(Token);
            if (this.tokenCache.TryGetValue(upn, out cachedToken))
            {
                if (cachedToken.ExpireOn >= DateTimeOffset.UtcNow)
                {
                    return cachedToken.TokenStr;
                }
            }

            HttpClient httpClient = this.httpClientFactory.CreateClient();
            HttpRequestMessage httpRequestMessage = new HttpRequestMessage(HttpMethod.Post, $"https://login.microsoftonline.com/{tenantId}/oauth2/token");
            var forms = new List<KeyValuePair<string, string>>();
            forms.Add(new KeyValuePair<string, string>("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"));
            forms.Add(new KeyValuePair<string, string>("assertion", teamAccessToken));
            forms.Add(new KeyValuePair<string, string>("client_id", clientId));
            forms.Add(new KeyValuePair<string, string>("client_secret", clientSecret));
            forms.Add(new KeyValuePair<string, string>("resource", "https://graph.microsoft.com/"));
            forms.Add(new KeyValuePair<string, string>("requested_token_use", "on_behalf_of"));
            forms.Add(new KeyValuePair<string, string>("scope", Constant.Scopes));
            FormUrlEncodedContent content = new FormUrlEncodedContent(forms);
            httpRequestMessage.Content = content;

            HttpResponseMessage responseMessage = await httpClient.SendAsync(httpRequestMessage);

            if (responseMessage.IsSuccessStatusCode)
            {
                dynamic tokenResponse = await responseMessage.Content.ReadAsAsync<dynamic>();
                double expires_in = (double)tokenResponse.expires_in;
                cachedToken = new Token
                {
                    TokenStr = (string)tokenResponse.access_token,
                    ExpireOn = DateTimeOffset.UtcNow.AddSeconds(expires_in - 120)
                };

                this.tokenCache.TryAdd(upn, cachedToken);
                return cachedToken.TokenStr;
            }
            else
            {
                var err = await responseMessage.Content.ReadAsStringAsync();
                throw new Exception(err);
            }
           
        }

    }
}