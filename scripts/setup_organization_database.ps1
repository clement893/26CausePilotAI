# Script pour configurer la base de données d'une organisation
# Usage: .\scripts\setup_organization_database.ps1 -OrganizationId "uuid" -ConnectionString "postgresql://..."

param(
    [Parameter(Mandatory=$true)]
    [string]$OrganizationId,
    
    [Parameter(Mandatory=$true)]
    [string]$ConnectionString,
    
    [string]$ApiBaseUrl = "http://localhost:8000",
    
    [string]$BearerToken = ""
)

# Convertir en format asyncpg si nécessaire
if ($ConnectionString -notmatch "postgresql\+asyncpg://") {
    $ConnectionString = $ConnectionString -replace "postgresql://", "postgresql+asyncpg://"
}

Write-Host "Configuration de la base de données pour l'organisation: $OrganizationId" -ForegroundColor Cyan
Write-Host "Chaîne de connexion: $($ConnectionString -replace ':[^:@]+@', ':****@')" -ForegroundColor Gray

# Si pas de token, demander à l'utilisateur
if ([string]::IsNullOrEmpty($BearerToken)) {
    $BearerToken = Read-Host "Entrez votre token JWT (Bearer token)"
}

$headers = @{
    "Authorization" = "Bearer $BearerToken"
    "Content-Type" = "application/json"
}

# Test de connexion
Write-Host "`nTest de la connexion..." -ForegroundColor Yellow
$testBody = @{
    db_connection_string = $ConnectionString
} | ConvertTo-Json

try {
    $testResponse = Invoke-RestMethod -Uri "$ApiBaseUrl/api/v1/organizations/$OrganizationId/database/test" `
        -Method POST `
        -Headers $headers `
        -Body $testBody `
        -ErrorAction Stop
    
    if ($testResponse.success) {
        Write-Host "✓ Connexion réussie!" -ForegroundColor Green
        Write-Host "  Base de données: $($testResponse.database_name)" -ForegroundColor Gray
        Write-Host "  Message: $($testResponse.message)" -ForegroundColor Gray
        
        # Demander confirmation avant de sauvegarder
        $confirm = Read-Host "`nVoulez-vous sauvegarder cette connexion? (O/N)"
        if ($confirm -eq "O" -or $confirm -eq "o" -or $confirm -eq "Y" -or $confirm -eq "y") {
            # Mise à jour de la connexion
            Write-Host "`nSauvegarde de la connexion..." -ForegroundColor Yellow
            $updateBody = @{
                db_connection_string = $ConnectionString
                test_connection = $true
            } | ConvertTo-Json
            
            $updateResponse = Invoke-RestMethod -Uri "$ApiBaseUrl/api/v1/organizations/$OrganizationId/database" `
                -Method PATCH `
                -Headers $headers `
                -Body $updateBody `
                -ErrorAction Stop
            
            Write-Host "✓ Connexion sauvegardée avec succès!" -ForegroundColor Green
            Write-Host "  Organisation: $($updateResponse.name)" -ForegroundColor Gray
            Write-Host "  Slug: $($updateResponse.slug)" -ForegroundColor Gray
        } else {
            Write-Host "Opération annulée." -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ Échec du test de connexion" -ForegroundColor Red
        Write-Host "  Message: $($testResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Erreur lors de la configuration" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}
