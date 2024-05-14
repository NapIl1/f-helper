using MongoDB.Bson;

namespace FHelper.Models;

public class Construction
{
    public BsonString Id { get; set; }
    public BsonInt32 Number { get; set; }
    public BsonString Name { get; set; }
    public BsonString Description { get; set; }
    public BsonString Color { get; set; }
    public BsonString ConstructionType { get; set; }
    public BsonBoolean IsEnabled { get; set; }
}
