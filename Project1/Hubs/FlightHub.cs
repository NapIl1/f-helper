using FHelper.DataAccess;
using Microsoft.AspNetCore.SignalR;

namespace FHelper.Hubs;

public partial class FlightHub : Hub
{
    private readonly IConstructionRepository _constructionRepository;
    private readonly IStatisticsRepository _statisticsRepository;
    private const string GroupName = "user";

    public FlightHub(
        IConstructionRepository constructionRepository,
        IStatisticsRepository statisticsRepository)
    {
        _constructionRepository = constructionRepository;
        _statisticsRepository = statisticsRepository;
    }

    public async override Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName);
        await base.OnConnectedAsync();
    }

    public async override Task OnDisconnectedAsync(Exception? exception)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName);
        await base.OnDisconnectedAsync(exception);
    }
}
