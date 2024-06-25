using System.Diagnostics.CodeAnalysis;
using MongoDB.Bson;

namespace FHelper.Models;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public class Construction
{
    public ObjectId? _id { get; set; }
    public string? constructionId { get; set; }
    public int? number { get; set; }
    public string? name { get; set; }
    public string? description { get; set; }
    public string? color { get; set; }
    public string? constructionType { get; set; }
    public string? x { get; set; }
    public string? y { get; set; }
    public bool? isEnabled { get; set; }
}
