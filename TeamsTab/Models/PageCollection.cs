using System.Collections.Generic;

namespace TeamsTab.Models
{
    public class PageCollection<T>
    {
        public ICollection<T> Data { get; set; }

        public string NextUrl { get; set; }
    }
}