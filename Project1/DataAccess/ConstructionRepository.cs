using FHelper.Models;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;

namespace FHelper.DataAccess;

public interface IConstructionRepository
{
    Task<Construction> GetRandomConstruction();
    Task<IEnumerable<Construction>> GetAllConstructions();
    Task AddConstruction(Construction construction);
    Task UpdateConstruction(Construction construction);
    Task DeleteConstruction(string constructionId);
}

public class ConstructionRepository : IConstructionRepository
{
    private readonly MongoDbContext _mongoDbContext;
    private readonly string _connectionString;
    private readonly string _databaseName;
    private Random _random;

    public ConstructionRepository(MongoDbContext mongoDbContext)
    {
        _mongoDbContext = mongoDbContext;
        _random = new Random();
        // _connectionString = configuration["ConnectionStrings:Server"] ?? throw new KeyNotFoundException();
        // _databaseName = configuration["ConnectionStrings:DatabaseName"] ?? throw new KeyNotFoundException();
    }

    public async Task<IEnumerable<Construction>> GetAllConstructions()
    {
        // var client = new MongoClient(_connectionString);
        // await using var db = MongoDbContext.Create(client.GetDatabase(_databaseName));
        var constructions = await _mongoDbContext.Constructions.ToListAsync();

        return constructions;
    }

    public async Task<Construction> GetRandomConstruction()
    {
        // var client = new MongoClient(_connectionString);
        // await using var db = MongoDbContext.Create(client.GetDatabase(_databaseName));
        var totalDocuments = await _mongoDbContext.Constructions.CountAsync();
        var randomIndex = _random.Next(totalDocuments);
        var randomDocument = await _mongoDbContext.Constructions.Skip(randomIndex).FirstAsync();

        return randomDocument;
    }

    public async Task AddConstruction(Construction construction)
    {
        // var client = new MongoClient(_connectionString);
        // await using var db = MongoDbContext.Create(client.GetDatabase(_databaseName));
        construction._id = ObjectId.GenerateNewId();
        await _mongoDbContext.Constructions.AddAsync(construction);

        var sameIdPoints = await _mongoDbContext.Constructions.Where(x => x.name == construction.name && x.constructionId != construction.constructionId).ToListAsync();

        foreach (var point in sameIdPoints)
        {
            point.x = construction.x;
            point.y = construction.y;
        }

        await _mongoDbContext.SaveChangesAsync();
    }

    public async Task UpdateConstruction(Construction construction)
    {
        // var client = new MongoClient(_connectionString);
        // await using var db = MongoDbContext.Create(client.GetDatabase(_databaseName));
        var prevVersion = await _mongoDbContext.Constructions.FirstOrDefaultAsync(x => x.constructionId == construction.constructionId);

        if (prevVersion is null)
        {
            return;
        }

        MapConstruction(prevVersion, construction);
        
        var sameIdPoints = await _mongoDbContext.Constructions.Where(x => x.name == construction.name && x.constructionId != construction.constructionId).ToListAsync();

        foreach (var point in sameIdPoints)
        {
            point.x = construction.x;
            point.y = construction.y;
        }

        await _mongoDbContext.SaveChangesAsync();
    }

    public async Task DeleteConstruction(string constructionId)
    {
        // var client = new MongoClient(_connectionString);
        // await using var db = MongoDbContext.Create(client.GetDatabase(_databaseName));

        var construction = await _mongoDbContext.Constructions.FirstOrDefaultAsync(x => x.constructionId == constructionId);

        if (construction is null)
        {
            return;
        }

        _mongoDbContext.Constructions.Remove(construction);
        await _mongoDbContext.SaveChangesAsync();
    }

    private static void MapConstruction(Construction oldVersion, Construction newVersion)
    {
        oldVersion.color = newVersion.color;
        oldVersion.description = newVersion.description;
        oldVersion.name = newVersion.name;
        oldVersion.number = newVersion.number;
        oldVersion.constructionType = newVersion.constructionType;
        oldVersion.x = newVersion.x;
        oldVersion.y = newVersion.y;
        oldVersion.isEnabled = newVersion.isEnabled;
    }
}
