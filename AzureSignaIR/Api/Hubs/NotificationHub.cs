using Microsoft.AspNetCore.SignalR;

namespace Api.Hubs
{
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Generating new Connection...");
            await base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Disconnecting...");
            return base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessageAsync(string data)
        {
            var payload = new { Date = DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss"), Data = data };
            await Clients.All.SendAsync("NewMessage", new { Payload = payload });
        }

    }
}
