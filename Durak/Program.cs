using Durak.Hubs;
using Microsoft.AspNetCore.Http.Connections;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSignalR().AddJsonProtocol(options => {
    options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.PayloadSerializerOptions.IncludeFields = true;
});
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (builder.Environment.IsDevelopment())
{
    app.UseCors(builder =>
    {
        builder
            .WithOrigins("http://localhost:4200", "https://7x14xqnb-4200.euw.devtunnels.ms")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<DurakHub>("/durakHub", options =>
{
    options.Transports = HttpTransportType.LongPolling;
});

app.Run();
