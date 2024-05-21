using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using FHelper.Hubs;
using FHelper.Models;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;

namespace FHelper.DataAccess;

public interface IStatisticsRepository
{
    Task<StatisticsList?> GetStatisticsAsync();
    Task UpdateStatisticsAsync(FlightUserResult userResult);
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

    public async Task UpdateStatisticsAsync(FlightUserResult userResult)
    {
        var client = new MongoClient(_connectionString);
        await using var db = MongoDbContext.Create(client.GetDatabase(_databaseName));

        var statistics = await db.Statistics.FirstOrDefaultAsync();

        if (statistics is null)
        {
            var statList = new StatisticsList
            {
                _id = ObjectId.GenerateNewId(),
                statistics = new List<Statistic>()
            };
            
            foreach(var res in userResult.Results)
            {
                statList.statistics.Add(new Statistic
                {
                    bestUserNickName = userResult.UserName,
                    bestUserTime = res.time,
                    fromConstructionId = res.fromConstructionId,
                    toConstructionId = res.toConstructionId
                });
            }

            await db.Statistics.AddAsync(statList);
        }
        else
        {
            foreach (var res in userResult.Results)
            {
                var old = statistics.statistics.FirstOrDefault(x => x.fromConstructionId == res.fromConstructionId && x.toConstructionId == res.toConstructionId);

                if (old is not null)
                {
                    if (res.time < old.bestUserTime)
                    {
                        old.bestUserTime = res.time;
                        old.bestUserNickName = userResult.UserName;
                    }
                } 
                else
                {
                    statistics.statistics.Add(new Statistic
                    {
                        bestUserNickName = userResult.UserName,
                        bestUserTime = res.time,
                        fromConstructionId = res.fromConstructionId,
                        toConstructionId = res.toConstructionId
                    });
                }

            }
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
