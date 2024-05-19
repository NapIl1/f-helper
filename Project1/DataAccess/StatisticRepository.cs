using FHelper.Models;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;

namespace FHelper.DataAccess;

public interface IStatisticsRepository
{
    Task<StatisticsList?> GetStatisticsAsync();
    Task UpdateStatistics(StatisticsList statisticsList);
}
public class StatisticRepository : IStatisticsRepository
{
    private readonly string _connectionString;
    private readonly string _databaseName;

    public StatisticRepository(IConfiguration configuration)
    {
        _connectionString = configuration["ConnectionStrings:Server"] ?? throw new KeyNotFoundException();
        _databaseName = configuration["ConnectionStrings:DatabaseName"] ?? throw new KeyNotFoundException();
    }

    public async Task<StatisticsList?> GetStatisticsAsync()
    {
        var client = new MongoClient(_connectionString);
        await using var db = MongoDbContext.Create(client.GetDatabase(_databaseName));
        var statistics = await db.Statistics.FirstOrDefaultAsync();

        return statistics;
    }

    public async Task UpdateStatistics(StatisticsList statisticsList)
    {
        var client = new MongoClient(_connectionString);
        await using var db = MongoDbContext.Create(client.GetDatabase(_databaseName));

        var statistics = await db.Statistics.FirstOrDefaultAsync();

        if (statistics is null)
        {
            statisticsList._id = ObjectId.GenerateNewId();
            await db.Statistics.AddAsync(statisticsList);
        }
        else
        {
            MapStatistics(statistics, statisticsList);
        }

        await db.SaveChangesAsync();
    }

    private static void MapStatistics(StatisticsList old, StatisticsList current)
    {
        if (current.statistics is null)
        {
            return;
        }

        foreach (var statistic in current.statistics)
        {
            old.statistics ??= new List<Statistic>();

            var oldStatistic = old.statistics.FirstOrDefault(x => x.statisticId == statistic.statisticId);
            if (oldStatistic is not null)
            {
                oldStatistic.bestUserTime = statistic.bestUserTime;
                oldStatistic.bestUserNickName = statistic.bestUserNickName;
            }
            else
            {
                old.statistics.Add(statistic);
            }
        }
    }
}
