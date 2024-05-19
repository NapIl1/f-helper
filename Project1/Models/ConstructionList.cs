using System.Diagnostics.CodeAnalysis;
using MongoDB.Bson;

namespace FHelper.Models;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public class ConstructionList
{
    public ObjectId _id { get; set; }

    public IEnumerable<Construction> constructions { get; set; }
}
