using FHelper.Models;

namespace FHelper.Hubs;

public partial class FlightHub
{
    public async Task<IEnumerable<Construction>> GetAllConstructions()
    {
        return await _constructionRepository.GetAllConstructions();
    }

    public async Task AddConstruction(Construction construction)
    {
        await _constructionRepository.AddConstruction(construction);
    }

    public async Task UpdateConstruction(Construction construction)
    {
        await _constructionRepository.UpdateConstruction(construction);
    }

    public async Task DeleteConstruction(string constructionId)
    {
        throw new NotImplementedException();
    }
}
