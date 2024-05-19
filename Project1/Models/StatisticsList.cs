using System.Diagnostics.CodeAnalysis;
using MongoDB.Bson;

namespace FHelper.Models;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public class StatisticsList
{
    public ObjectId? _id { get; set; }
    public string? statisticsListId { get; set; }
    public List<Statistic>? statistics { get; set; }
}
