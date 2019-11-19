using Microsoft.Graph;
using Newtonsoft.Json;
using System;
using System.IO;

namespace TeamsTab.Models
{
    public class File
    {
        [JsonProperty("driveId")]
        public string DriveId { get; set; }
        [JsonProperty("driveItemId")]
        public string DriveItemId { get; set; }
        [JsonProperty("lastModifiedBy")]
        public string LastModifiedBy { get; set; }
        [JsonProperty("lastModifiedDateTime")]
        public DateTimeOffset? LastModifiedDateTime { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("size")]
        public long? Size { get; set; }
        [JsonProperty("extension")]
        public string Extension { get; set; }
        [JsonProperty("fileType")]
        public string FileType { get; set; }

        public File(DriveItem item)
        {
            DriveId = null;
            LastModifiedDateTime = item.LastModifiedDateTime;
            LastModifiedBy = item.LastModifiedBy.User.DisplayName;
            Name = item.Name;
            Size = item.Size;

            if (item.Package != null)
            {
                FileType = item.Package.Type;
            }

            if (item.ParentReference != null)
            {
                DriveId = item.ParentReference.DriveId;
                DriveItemId = item.Id;
            }
            else
            {
                DriveItemId = item.Id;
            }


            if (item.RemoteItem != null)
            {
                DriveId = item.RemoteItem.ParentReference.DriveId;
                DriveItemId = item.RemoteItem.Id;
                if (item.RemoteItem.Package != null)
                {
                    FileType = item.RemoteItem.Package.Type;
                }
                if (item.RemoteItem.Size.HasValue)
                {
                    Size = item.RemoteItem.Size;
                }
            }

            Extension = Path.GetExtension(Name);
        }
    }
}