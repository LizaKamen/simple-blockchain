using server;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
    {
    options.AddPolicy("CorsPolicy", builder =>
        builder.WithOrigins("http://localhost:5173","http://localhost:3000")
                .AllowAnyMethod()
                .AllowAnyHeader().AllowCredentials());
    }
);
var app = builder.Build();

app.UseCors("CorsPolicy");

app.MapHub<BlockchainHub>("/blockchainHub");

app.Run();
