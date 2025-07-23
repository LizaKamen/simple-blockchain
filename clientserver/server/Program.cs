using server;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
    {
        options.AddPolicy("CorsPolicy", builder =>
            builder.WithOrigins("http://127.0.0.1:5500")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());
    }
);
var app = builder.Build();

app.UseCors("CorsPolicy");

app.MapGet("/", () => "Hello World!");

app.MapHub<BlockchainHub>("/blockchainHub");

app.Run();
