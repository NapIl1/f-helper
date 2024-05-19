using FHelper.Models;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using MongoDB.EntityFrameworkCore.Extensions;

namespace FHelper;

public class MongoDbContext : DbContext
{
    public DbSet<Construction> Constructions { get; init; }
    public DbSet<StatisticsList> Statistics { get; init; }
    public static MongoDbContext Create(IMongoDatabase database) =>
        new(new DbContextOptionsBuilder<MongoDbContext>()
            .UseMongoDB(database.Client, database.DatabaseNamespace.DatabaseName)
            .Options);
    public MongoDbContext(DbContextOptions options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Construction>().ToCollection("constructions");
        modelBuilder.Entity<StatisticsList>().ToCollection("statistics");
    }
}
