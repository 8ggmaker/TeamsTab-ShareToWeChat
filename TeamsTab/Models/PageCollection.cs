using Newtonsoft.Json;
using System.Collections.Generic;

namespace TeamsTab.Models
{
    public class PageCollection<T>
    {
        [JsonProperty("data")]
        public ICollection<T> Data { get; set; }
    }
}