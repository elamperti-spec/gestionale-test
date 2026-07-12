namespace GestionaleApi.Models;

public class Cliente
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Cognome { get; set; } = string.Empty;
    public string CodiceFiscale { get; set; } = string.Empty;
    public string? PartitaIva { get; set; }
    public string? Pec { get; set; }
    public string? CodiceSdi { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Societa { get; set; }
    public string? Note { get; set; }
}
