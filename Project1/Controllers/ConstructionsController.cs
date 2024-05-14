using System.Text.Json.Nodes;
using FHelper.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace FHelper.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OptionsController : ControllerBase
    {
        [HttpGet]
        public async Task<List<object>> GetAllConstructions()
        {
            var mongoClient = new MongoClient("mongodb+srv://admin:admin@sandbox.ioqzb.mongodb.net/");
            var database = mongoClient.GetDatabase("sample_weatherdata");

            var recordsCollection = database.GetCollection<BsonDocument>("options");
            var records = (await recordsCollection.FindAsync(_ => true)).ToList();

            var convertedRecords = records.ConvertAll(record =>
            {
                if (record.Contains("_id") && record["_id"].IsObjectId)
                {
                    // Convert the ObjectId to a string
                    record["_id"] = record["_id"].AsObjectId.ToString();
                }
                return record;
            });

            return convertedRecords.ConvertAll(BsonTypeMapper.MapToDotNetValue);
        }

        [HttpPost]
        public async Task<IActionResult> AddConstruction([FromBody] Construction recordJson)
        {
            try
            {
                var record = BsonDocument.Parse(recordJson.ToString());
                var mongoClient = new MongoClient("mongodb+srv://admin:admin@sandbox.ioqzb.mongodb.net/");
                var database = mongoClient.GetDatabase("sample_weatherdata");
                var replaceOptions = new ReplaceOptions { IsUpsert = true };
                var filter = Builders<BsonDocument>.Filter.Eq("_id", recordJson.Id);
                var recordsCollection = database.GetCollection<BsonDocument>("options");
                await recordsCollection.ReplaceOneAsync(filter, record, replaceOptions);

                return Ok("Record saved successfully");
            }
            catch (Exception ex)
            {
                return BadRequest("Invalid JSON data: " + ex.Message);
            }
        }

        [HttpPut]
        public async Task UpdateConstruction(string optionsId, [FromBody] JsonObject recordJson)
        {
            var record = BsonDocument.Parse(recordJson.ToString());
            var mongoClient = new MongoClient("mongodb+srv://admin:admin@sandbox.ioqzb.mongodb.net/");
            var database = mongoClient.GetDatabase("sample_weatherdata");
            var collection = database.GetCollection<BsonDocument>("options");

            var filter = Builders<BsonDocument>.Filter.Eq("_id", new ObjectId(optionsId));

            await collection.ReplaceOneAsync(filter, record);
        }

        [HttpDelete]
        public async Task DeleteConstruction(string optionsId)
        {
            var mongoClient = new MongoClient("mongodb+srv://admin:admin@sandbox.ioqzb.mongodb.net/");
            var database = mongoClient.GetDatabase("sample_weatherdata");

            var recordsCollection = database.GetCollection<BsonDocument>("options");
            var filter = Builders<BsonDocument>.Filter.Eq("_id", new ObjectId(optionsId));
            await recordsCollection.DeleteOneAsync(filter);
        }
    }
}
