using System.Text.Json.Nodes;
using MongoDB.Bson.Serialization.Attributes;

namespace FHelper.Models;

public class ConstructionRequest
{
    [BsonId]
    public string Id { get; set; }
    public JsonObject Constructions { get; set; }
}
