using FHelper.Models;

namespace FHelper.Hubs;

public partial class FlightHub
{
    public async Task<StatisticsList?> GetStatistics()
    {
        return await _statisticsRepository.GetStatisticsAsync();
    }

    public async Task UpdateStatistic(StatisticsList statisticsList)
    {
        await _statisticsRepository.UpdateStatistics(statisticsList);
    }
}
