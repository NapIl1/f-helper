using System.Text.Json.Nodes;
using FHelper.Models;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;
using MongoDB.Driver;
using FHelper;
using Newtonsoft.Json;

namespace FHelper.Hubs;

public class FlightHub : Hub
{
    private readonly string _connectionString;
    private readonly string _databaseName;
    public FlightHub(IConfiguration configuration)
    {
        _connectionString = configuration["ConnectionStrings:Server"];
        _databaseName = configuration["ConnectionStrings:DatabaseName"];
    }

    private const string GroupName = "user";

    public async Task<List<object>> GetAllConstructions()
    {
        try
        {
            var mongoClient = new MongoClient(_connectionString);
            var database = mongoClient.GetDatabase(_databaseName);

            var recordsCollection = database.GetCollection<BsonDocument>("constructions");
            var records = (await recordsCollection.FindAsync(_ => true)).ToList();

            var convertedRecords = records.ConvertAll(record =>
            {
                if (record.Contains("_id") && record["_id"].IsObjectId)
                {
                    record["_id"] = record["_id"].AsObjectId.ToString();
                }
                return record;
            });

            return convertedRecords.ConvertAll(BsonTypeMapper.MapToDotNetValue);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task UpdateConstruction(JsonObject recordJson)
    {
        try
        {
            var record = BsonDocument.Parse(recordJson.ToString());
            var mongoClient = new MongoClient(_connectionString);
            var database = mongoClient.GetDatabase(_databaseName);
            var replaceOptions = new ReplaceOptions { IsUpsert = true };
            var filter = Builders<BsonDocument>.Filter.Eq("_id", new ObjectId(recordJson["id"].ToString()));
            var recordsCollection = database.GetCollection<BsonDocument>("constructions");
            await recordsCollection.ReplaceOneAsync(filter, record);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
        }
    }

    public async Task GetNextStepNotification()
    {
        await Clients.All.SendAsync("GetNextStepNotification1", MapConstructions(GetConstructions()).First());
    }

    public async Task<List<StatisticDto>> GetStatistics()
    {
        var res = MapStatistic(GetStatistic());
        await Clients.Group(GroupName).SendAsync("GetStatistic", res);

        return res;
    }

    public override Task OnConnectedAsync()
    {
        Groups.AddToGroupAsync(Context.ConnectionId, GroupName);
        return base.OnConnectedAsync();
    }

    private static List<StatisticDto> MapStatistic(List<Statistic> statistics)
    {
        var res = new List<StatisticDto>();

        foreach (var statistic in statistics)
        {
            res.Add(new StatisticDto()
            {
                BestUserNickName = statistic.BestUserTime?.Value.ToString(),
                FromConstructionId = statistic.FromConstructionId?.Value.ToString(),
                ToConstructionId = statistic.ToConstructionId.Value.ToString(),
                BestUserTime = statistic.BestUserTime.Value,
            });
        }

        return res;
    }

    private static List<Statistic> GetStatistic()
    {
        var res = new List<Statistic>();

        for (var i = 0; i < 20; i++)
        {
            res.Add(new Statistic()
            {
                BestUserTime = BsonTimestamp.Create((long)DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1)).TotalSeconds), // Corrected timestamp generation
                FromConstructionId = ObjectId.GenerateNewId(), // Generate ObjectId directly
                ToConstructionId = ObjectId.GenerateNewId(),   // Generate ObjectId directly
                BestUserNickName = $"User{i}"  // No need for BsonString here
            });
        }

        return res;
    }

    private static List<ConstructionDto> MapConstructions(List<Construction> constructions)
    {
        var res = new List<ConstructionDto>();

        foreach (var construction in constructions)
        {
            res.Add(new ConstructionDto()
            {
                Id = construction.Id.Value.ToString(),
                Name = construction.Name.Value,
                Description = construction.Description.Value,
                Number = construction.Number.Value,
                ConstructionType = construction.ConstructionType.Value,
                IsEnabled = construction.IsEnabled.Value,
                Color = construction.Color.Value
            });
        }

        return res;
    }

    private static List<Construction> GetConstructions()
    {
        var res = new List<Construction>();

        for (int i = 0; i < 20; i++)
        {
            res.Add(new Construction()
            {
                Description = $"Test{i}",
                Id = ObjectId.GenerateNewId().ToString(),
                Name = $"Name{i}",
                Color = $"Color{i}",
                Number = i,
                ConstructionType = $"Type{i}",
                IsEnabled = true
            });
        }

        return res;
    }
}
