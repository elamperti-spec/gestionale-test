using GestionaleApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

const string CorsPolicy = "FrontendCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        // Dev: il frontend può essere servito da localhost, dal tunnel VS Code
        // o dall'IP di rete del server (bind 0.0.0.0), quindi accettiamo qualsiasi origine.
        policy.AllowAnyOrigin()
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
        CodiceFiscale = "RSSMRA80A01H501U",
        PartitaIva = "01234567890",
        Pec = "mario.rossi@pec.it",
        CodiceSdi = "ABCDEFG",
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
        CodiceFiscale = "BNCLRA85M41F205X",
        PartitaIva = "09876543210",
        Pec = "laura.bianchi@pec.it",
        CodiceSdi = "0000000",
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
    if (string.IsNullOrWhiteSpace(cliente.CodiceFiscale))
    {
        return Results.BadRequest(new { message = "Il codice fiscale è obbligatorio." });
    }

    var cf = cliente.CodiceFiscale.Trim();

    if (clienti.Any(c => string.Equals(c.CodiceFiscale?.Trim(), cf, StringComparison.OrdinalIgnoreCase)))
    {
        return Results.Conflict(new { message = $"Esiste già un cliente con il codice fiscale {cf}." });
    }

    cliente.CodiceFiscale = cf;
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

    if (string.IsNullOrWhiteSpace(clienteAggiornato.CodiceFiscale))
    {
        return Results.BadRequest(new { message = "Il codice fiscale è obbligatorio." });
    }

    var cf = clienteAggiornato.CodiceFiscale.Trim();

    if (clienti.Any(c => c.Id != id && string.Equals(c.CodiceFiscale?.Trim(), cf, StringComparison.OrdinalIgnoreCase)))
    {
        return Results.Conflict(new { message = $"Esiste già un cliente con il codice fiscale {cf}." });
    }

    cliente.Nome = clienteAggiornato.Nome;
    cliente.Cognome = clienteAggiornato.Cognome;
    cliente.CodiceFiscale = cf;
    cliente.PartitaIva = clienteAggiornato.PartitaIva;
    cliente.Pec = clienteAggiornato.Pec;
    cliente.CodiceSdi = clienteAggiornato.CodiceSdi;
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
