using System.Diagnostics.CodeAnalysis;

namespace FHelper.Models;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public class Statistic
{
    public string? statisticId { get; set; }
    public string? fromConstructionId { get; set; }
    public string? toConstructionId { get; set; }
    public string? bestUserNickName { get; set; }
    public ulong? bestUserTime { get; set; }
}
