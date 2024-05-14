using MongoDB.Bson;

namespace FHelper.Models;

public class Statistic
{
    public BsonObjectId FromConstructionId { get; set; }
    public BsonObjectId ToConstructionId { get; set; }
    public BsonString? BestUserNickName { get; set; }
    public BsonTimestamp? BestUserTime { get; set; }
}
