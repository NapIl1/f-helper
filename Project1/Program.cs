using FHelper;
using FHelper.DataAccess;
using FHelper.Hubs;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR().AddHubOptions<FlightHub>(options =>
{
    options.EnableDetailedErrors = true;
});

builder.Services.AddDbContext<MongoDbContext>(options =>
{
    options.UseMongoDB(builder.Configuration["ConnectionStrings:Server"]!,
        builder.Configuration["ConnectionStrings:DatabaseName"]!);
});

builder.Services.AddScoped<IConstructionRepository, ConstructionRepository>();
builder.Services.AddScoped<IStatisticsRepository, StatisticRepository>();

BsonSerializer.RegisterSerializer(new StringObjectIdConverter());

var app = builder.Build();

app.Use(async (context, next) =>
{
    await next();
    if (context.Response.StatusCode == 404)
    {
        context.Request.Path = "/index.html";
        await next();
    }
});

app.UseStaticFiles();

app.UseSwagger();
app.UseSwaggerUI();

app.MapHub<FlightHub>("/flightNotification");
app.UseCors(policy => policy.SetIsOriginAllowed(origin => true) // Allow any origin
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
//.WithExposedHeaders("Content-Disposition"));

app.UseRouting();

app.UseAuthorization();
app.MapControllers();

app.Run();
