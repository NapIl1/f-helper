using FHelper.Models;
using Microsoft.AspNetCore.SignalR;

namespace FHelper.Hubs;

public class FlightStepResult
{
    public string? fromConstructionId { get; set; }
    public string? toConstructionId { get; set; }
    public int time { get; set; }
}

public class FlightUserResult
{
    public string? UserName { get; set; }

    public IEnumerable<FlightStepResult>? Results { get; set; }
}

public partial class FlightHub
{
    public async Task GetNextStepNotification()
    {
        var randomConstruction = await _constructionRepository.GetRandomConstruction();
        await Clients.All.SendAsync("GetNextStepNotification", randomConstruction);
    }

    public async Task FlightStartedNotification()
    {
        var randomConstruction1 = await _constructionRepository.GetRandomConstruction();
        var randomConstruction2 = await _constructionRepository.GetRandomConstruction();

        var constructions = new List<Construction>
        {
            randomConstruction1,
            randomConstruction2
        };

        await Clients.All.SendAsync("FlightStartedNotification", constructions);
    }

    public async Task FlightEndedNotification(FlightUserResult result)
    {
        // Send userResult to pilot and instructor
        await Clients.All.SendAsync("FlightEndedNotification", result);
    }
}
