using DocumentFormat.OpenXml.InkML;

namespace FHelper.Models;

public class StatisticDto
{
    public string FromConstructionId { get; set; }
    public string ToConstructionId { get; set; }
    public string? BestUserNickName { get; set; }
    public long? BestUserTime { get; set; }
}
