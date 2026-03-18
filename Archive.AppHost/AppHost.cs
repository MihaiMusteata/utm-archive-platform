using Aspire.Hosting;
using Aspire.Hosting.ApplicationModel;
using Aspire.Hosting.JavaScript;

var builder = DistributedApplication.CreateBuilder(args);

var postgresUser = builder.AddParameter("postgres-username", "postgres");
var postgresPassword = builder.AddParameter("postgres-password", "postgres", secret: true);

var postgres = builder.AddPostgres("archive-postgres", postgresUser, postgresPassword, 5432)
    .WithDataVolume("utm-archive-postgres-data");

var database = postgres.AddDatabase("Database", "utm_archive");

var api = builder.AddProject<Projects.Archive_API>("api")
    .WithReference(database)
    .WaitFor(database)
    .WithEnvironment("Storage__RootPath", "../.data/uploads");

builder.AddViteApp("client", "../Archive.Client/client")
    .WithReference(api)
    .WithEndpoint("http", endpoint =>
    {
        endpoint.Port = 5173;
        endpoint.TargetPort = 5173;
        endpoint.IsProxied = false;
    })
    .WithEnvironment("VITE_API_BASE_URL", ReferenceExpression.Create($"{api.GetEndpoint("http")}/api"))
    .WaitFor(api);

builder.Build().Run();
