using Api.Hubs;
using Microsoft.Azure.SignalR;

var builder = WebApplication.CreateBuilder(args);
var azureSignairIsEnabled = builder.Configuration.GetValue<bool>("AzureSignaIRIsEnabled");
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
if (azureSignairIsEnabled)
{
    builder.Services.AddSignalR().AddAzureSignalR(opt =>
    {
        opt.ApplicationName = "App01";
        opt.ConnectionString = builder.Configuration.GetConnectionString("AzureSignaIR");
    });
}
else
{
    builder.Services.AddSignalR();
}
builder.Services.AddCors(options =>
{
    options.AddPolicy("DEFAULT", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();
app.UseCors("DEFAULT");
app.UseSwagger();
app.UseSwaggerUI();
app.UseRouting();
app.UseAuthorization();
app.MapHub<NotificationHub>("/hub/notification");
app.Run();
