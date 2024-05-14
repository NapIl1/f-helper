using FHelper;
using FHelper.Hubs;
using MongoDB.Bson.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR().AddHubOptions<FlightHub>(options =>
{
    options.EnableDetailedErrors = true;
});

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
app.UseRouting();

app.UseSwagger();
app.UseSwaggerUI();

app.MapHub<FlightHub>("/flightNotification");
app.UseCors(policy => policy.AllowAnyOrigin()
    .AllowCredentials()
    .WithOrigins("http://localhost:44436")
    .AllowAnyHeader()
    .AllowAnyMethod()
    .SetIsOriginAllowed((host)=> true)
    .WithExposedHeaders("Content-Disposition"));
app.UseAuthorization();
app.MapControllers();

app.Run();
