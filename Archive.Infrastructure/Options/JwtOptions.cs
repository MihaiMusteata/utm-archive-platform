namespace Archive.Infrastructure.Options;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "utm-archive-platform";
    public string Audience { get; set; } = "utm-archive-platform";
    public string SigningKey { get; set; } = "DevelopmentOnlySigningKey-ChangeMe-1234567890";
    public int AccessTokenMinutes { get; set; } = 120;
    public int RefreshTokenDays { get; set; } = 7;
}
