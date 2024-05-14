using MongoDB.Bson.Serialization.Attributes;

namespace FHelper.Models;

public class ConstructionDtoList
{
    public string Id { get; set; }

    public IEnumerable<ConstructionDto> Constructions { get; set; }
}
