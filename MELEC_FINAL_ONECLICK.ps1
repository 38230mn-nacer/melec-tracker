param([string]$Url = "")
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms

function Get-DownloadsPath {
    try {
        $key = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders'
        $v = (Get-ItemProperty -Path $key -Name '{374DE290-123F-4565-9164-39C4925E467B}' -ErrorAction Stop).'{374DE290-123F-4565-9164-39C4925E467B}'
        if ($v) { return [Environment]::ExpandEnvironmentVariables($v) }
    } catch {}
    return (Join-Path $env:USERPROFILE 'Downloads')
}

try {
    $token = ''
    if ($Url -match '[?&]token=([^&]+)') { $token = [uri]::UnescapeDataString($matches[1]) }
    if ([string]::IsNullOrWhiteSpace($token)) { throw "Jeton V4.7.8 absent." }

    $downloads = Get-DownloadsPath
    $pattern = "*V478_${token}.docx"
    $src = $null

    # Up to 45 seconds: wait until Chrome has finished writing the download.
    for ($i=0; $i -lt 150; $i++) {
        $src = Get-ChildItem -LiteralPath $downloads -Filter $pattern -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Length -gt 10000 } |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($src) {
            $s1 = $src.Length
            Start-Sleep -Milliseconds 450
            $src.Refresh()
            if ($src.Length -eq $s1) { break }
            $src = $null
        }
        Start-Sleep -Milliseconds 300
    }
    if (-not $src) { throw "Le Word V1 n'a pas été trouvé dans Téléchargements. Motif : $pattern" }

    $finalizer = Join-Path $PSScriptRoot 'FINALISER_WORD_LATEX.ps1'
    if (-not (Test-Path -LiteralPath $finalizer)) { throw "FINALISER_WORD_LATEX.ps1 introuvable." }

    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $finalizer -SourcePath $src.FullName -DeleteSource
    if ($LASTEXITCODE -ne 0) { throw "La finalisation Word a échoué." }
}
catch {
    [System.Windows.Forms.MessageBox]::Show(
        $_.Exception.Message,
        "DeltaTracker — Word FINAL",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
    exit 1
}
