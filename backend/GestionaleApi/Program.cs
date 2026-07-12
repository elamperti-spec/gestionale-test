using GestionaleApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

const string CorsPolicy = "FrontendCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(CorsPolicy);

var clienti = new List<Cliente>
{
    new Cliente
    {
        Id = 1,
        Nome = "Mario",
        Cognome = "Rossi",
        Email = "mario.rossi@example.com",
        Telefono = "3331234567",
        Societa = "Rossi Srl",
        Note = "Cliente di esempio"
    },
    new Cliente
    {
        Id = 2,
        Nome = "Laura",
        Cognome = "Bianchi",
        Email = "laura.bianchi@example.com",
        Telefono = "3337654321",
        Societa = "Bianchi Consulting",
        Note = "Secondo cliente di esempio"
    }
};

app.MapGet("/", () => "Gestionale API attiva. Vai su /swagger oppure /api/clienti");

app.MapGet("/api/clienti", () => clienti);

app.MapGet("/api/clienti/{id}", (int id) =>
{
    var cliente = clienti.FirstOrDefault(c => c.Id == id);
    return cliente is not null ? Results.Ok(cliente) : Results.NotFound();
});

app.MapPost("/api/clienti", (Cliente cliente) =>
{
    cliente.Id = clienti.Count == 0 ? 1 : clienti.Max(c => c.Id) + 1;
    clienti.Add(cliente);
    return Results.Created($"/api/clienti/{cliente.Id}", cliente);
});

app.MapPut("/api/clienti/{id}", (int id, Cliente clienteAggiornato) =>
{
    var cliente = clienti.FirstOrDefault(c => c.Id == id);

    if (cliente is null)
    {
        return Results.NotFound();
    }

    cliente.Nome = clienteAggiornato.Nome;
    cliente.Cognome = clienteAggiornato.Cognome;
    cliente.Email = clienteAggiornato.Email;
    cliente.Telefono = clienteAggiornato.Telefono;
    cliente.Societa = clienteAggiornato.Societa;
    cliente.Note = clienteAggiornato.Note;

    return Results.Ok(cliente);
});

app.MapDelete("/api/clienti/{id}", (int id) =>
{
    var cliente = clienti.FirstOrDefault(c => c.Id == id);

    if (cliente is null)
    {
        return Results.NotFound();
    }

    clienti.Remove(cliente);
    return Results.NoContent();
});

app.Run();
