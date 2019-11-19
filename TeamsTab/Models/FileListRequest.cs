using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TeamsTab.Models
{
    public class FileListRequest
    {
        [JsonProperty("upn")]
        public string Upn { get; set; }
        [JsonProperty("tenantId")]
        public string TenantId { get; set; }
        [JsonProperty("teamsToken")]
        public string TeamsToken { get; set; }

    }
}
