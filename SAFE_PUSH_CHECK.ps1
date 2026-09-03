$ErrorActionPreference="Stop"
$root=Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "DeltaTracker SAFE-PUSH : contrôle avant Git" -ForegroundColor Cyan

$forbiddenExtensions=@(".json",".csv",".xlsx",".xls",".docx")
$forbiddenNameRegex='(?i)(BACKUP|ROSTER|ELEVE|APPRENTI|EXPORT_SAFE|V1_LATEX|FINAL_LATEX)'
$secretRegex='(?i)(api[_-]?key|client[_-]?secret|access[_-]?token|password|passwd)\s*[:=]\s*["'']?[A-Za-z0-9_\-]{8,}'
$piiRegex='(?i)\b(nom|pr[eé]nom|email|t[eé]l[eé]phone|adresse|date de naissance|INE)\b\s*[:=]'

$bad=@()
Get-ChildItem -Recurse -File | ForEach-Object {
  $rel=$_.FullName.Substring($root.Length).TrimStart('\')
  if($rel -match '\\.git\\'){ return }
  if($forbiddenExtensions -contains $_.Extension.ToLower() -and $_.Name -match $forbiddenNameRegex){
    $bad += "Fichier sensible potentiel : $rel"
    return
  }
  if($_.Length -lt 5MB -and $_.Extension -match '^\.(js|html|css|md|txt|ps1|cmd|json)$'){
    try{
      $c=Get-Content $_.FullName -Raw -ErrorAction Stop
      if($c -match $secretRegex){ $bad += "Secret potentiel : $rel" }
      if($rel -match '(?i)(data|roster|student|eleve|apprenti)' -and $c -match $piiRegex){ $bad += "PII potentielle : $rel" }
    }catch{}
  }
}

if($bad.Count -gt 0){
  Write-Host ""
  Write-Host "PUSH BLOQUE" -ForegroundColor Red
  $bad | Sort-Object -Unique | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 2
}

if(Get-Command git -ErrorAction SilentlyContinue){
  $status=git status --short
  if($LASTEXITCODE -ne 0){ Write-Host "Dossier non initialisé Git." -ForegroundColor Yellow; exit 0 }
  Write-Host ""
  Write-Host "Contrôle OK. Aperçu git status :" -ForegroundColor Green
  $status
}else{
  Write-Host "Contrôle fichiers OK. Git n'est pas disponible dans le PATH." -ForegroundColor Yellow
}
