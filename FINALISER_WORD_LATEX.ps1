param(
    [string]$SourcePath = "",
    [switch]$DeleteSource
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.IO.Compression.FileSystem

$WNS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
$MNS = "http://schemas.openxmlformats.org/officeDocument/2006/math"
$MarkerOpen = [char]0x27E6
$MarkerClose = [char]0x27E7
$UnicodeMarkerPattern = [regex]::Escape((([string]$MarkerOpen) + 'LATEX:')) + '(.*?)' + [regex]::Escape([string]$MarkerClose)
$AsciiMarkerPattern = '\[LATEX:(.*?)\]'
$MarkerPattern = '(?:' + $UnicodeMarkerPattern + ')|(?:' + $AsciiMarkerPattern + ')'

function Write-Title {
    Write-Host ""
    Write-Host "==============================================================" -ForegroundColor Cyan
    Write-Host " DELTATRACKER V4.7.8 - WORD FINAL ONE CLICK" -ForegroundColor Cyan
    Write-Host " MOTEUR V4.5 VALIDE + MATH BEAUTIFIER" -ForegroundColor Cyan
    Write-Host "==============================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Find-Pandoc {
    $cmd = Get-Command pandoc.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $candidates = @(
        (Join-Path $env:LOCALAPPDATA "Pandoc\pandoc.exe"),
        (Join-Path $env:ProgramFiles "Pandoc\pandoc.exe"),
        (Join-Path ${env:ProgramFiles(x86)} "Pandoc\pandoc.exe")
    ) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }
    if ($candidates.Count -gt 0) { return $candidates[0] }
    throw "Pandoc est introuvable. Installez Pandoc ou relancez l'installateur V4.5/V4.7."
}

function Beautify-Latex([string]$latex) {
    if ([string]::IsNullOrWhiteSpace($latex)) { return $latex }
    $s = $latex.Trim()
    # Ne touche qu'aux formules extraites des marqueurs LATEX, jamais au texte francais.
    $s = [regex]::Replace($s, '(?<![0-9A-Za-z_])1(?=\s*\()', '')
    $s = [regex]::Replace($s, '([A-Za-z])\s*-\s*\(\s*-\s*([0-9]+(?:\{,\}[0-9]+|[\.,][0-9]+)?)\s*\)', '$1+$2')
    $s = [regex]::Replace($s, '([A-Za-z])\s*\+\s*\(\s*-\s*([0-9]+(?:\{,\}[0-9]+|[\.,][0-9]+)?)\s*\)', '$1-$2')
    $s = [regex]::Replace($s, '([+\-])\s*\(\s*([0-9]+(?:\{,\}[0-9]+|[\.,][0-9]+)?)\s*\)', '$1$2')
    $s = [regex]::Replace($s, '\+\s*-', '-')
    $s = [regex]::Replace($s, '-\s*-', '+')
    $s = [regex]::Replace($s, '=\s*\+', '=')
    $s = [regex]::Replace($s, '\s+', ' ').Trim()
    return $s
}


function Copy-LockedFileSnapshot([string]$source, [string]$destination) {
    $lastError = $null
    for ($attempt = 1; $attempt -le 20; $attempt++) {
        $inputStream = $null
        $outputStream = $null
        try {
            # Word peut garder le DOCX ouvert. On demande explicitement un accès partagé
            # puis on travaille sur une copie temporaire, jamais sur le fichier ouvert.
            $share = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
            $inputStream = New-Object System.IO.FileStream(
                $source,
                [System.IO.FileMode]::Open,
                [System.IO.FileAccess]::Read,
                $share
            )
            $outputStream = New-Object System.IO.FileStream(
                $destination,
                [System.IO.FileMode]::Create,
                [System.IO.FileAccess]::Write,
                [System.IO.FileShare]::None
            )
            $inputStream.CopyTo($outputStream)
            $outputStream.Flush()
            return
        }
        catch {
            $lastError = $_
            Start-Sleep -Milliseconds 350
        }
        finally {
            if ($outputStream) { $outputStream.Dispose() }
            if ($inputStream) { $inputStream.Dispose() }
        }
    }
    throw ("Impossible de lire le Word V1, même en accès partagé. Fermez ce document Word puis réessayez. Détail : " + $lastError.Exception.Message)
}

function Save-XmlUtf8([System.Xml.XmlDocument]$xml, [string]$path) {
    $settings = New-Object System.Xml.XmlWriterSettings
    $settings.Encoding = New-Object System.Text.UTF8Encoding($false)
    $settings.Indent = $false
    $settings.OmitXmlDeclaration = $false
    $writer = [System.Xml.XmlWriter]::Create($path, $settings)
    try { $xml.Save($writer) } finally { $writer.Close() }
}

function New-TextRun([System.Xml.XmlDocument]$doc, [System.Xml.XmlElement]$sourceRun, [string]$text) {
    $r = $doc.CreateElement("w", "r", $WNS)
    $rPr = $sourceRun.SelectSingleNode("w:rPr", $script:TargetNs)
    if ($rPr) { [void]$r.AppendChild($doc.ImportNode($rPr, $true)) }
    $t = $doc.CreateElement("w", "t", $WNS)
    $space = $doc.CreateAttribute("xml", "space", "http://www.w3.org/XML/1998/namespace")
    $space.Value = "preserve"
    [void]$t.Attributes.Append($space)
    $t.InnerText = $text
    [void]$r.AppendChild($t)
    return $r
}

Write-Title
$pandoc = Find-Pandoc
Write-Host ("Pandoc : " + $pandoc) -ForegroundColor Green

if (-not [string]::IsNullOrWhiteSpace($SourcePath)) {
    $src = [System.IO.Path]::GetFullPath($SourcePath)
    if (-not (Test-Path -LiteralPath $src)) { throw "Fichier source introuvable : $src" }
} else {
    $dlg = New-Object System.Windows.Forms.OpenFileDialog
    $dlg.Title = "Choisir le Word V1 LaTeX genere par DeltaTracker"
    $dlg.Filter = "Word V1 LaTeX (*V1_LATEX*.docx)|*V1_LATEX*.docx|Documents Word (*.docx)|*.docx"
    $dlg.Multiselect = $false
    if ($dlg.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
        Write-Host "Aucun fichier choisi." -ForegroundColor Yellow
        exit 0
    }
    $src = $dlg.FileName
}

$srcDir = Split-Path -Parent $src
$stem = [System.IO.Path]::GetFileNameWithoutExtension($src)
if ($stem -match '_V1_LATEX_') { $finalStem = $stem -replace '_V1_LATEX_', '_FINAL_LATEX_' }
elseif ($stem -match '_V1_LATEX$') { $finalStem = $stem -replace '_V1_LATEX$', '_FINAL_LATEX' }
else { $finalStem = $stem + '_FINAL_LATEX' }
$out = Join-Path $srcDir ($finalStem + '.docx')

$tmp = Join-Path $env:TEMP ("MELEC_LATEX_STABLE_" + [guid]::NewGuid().ToString("N"))
$targetDir = Join-Path $tmp "target"
$eqDir = Join-Path $tmp "equations"
New-Item -ItemType Directory -Path $targetDir,$eqDir -Force | Out-Null
try {
    $snapshot = Join-Path $tmp "source_snapshot.docx"
    Copy-LockedFileSnapshot $src $snapshot
    [System.IO.Compression.ZipFile]::ExtractToDirectory($snapshot, $targetDir)
    $docPath = Join-Path $targetDir "word\document.xml"
    if (-not (Test-Path -LiteralPath $docPath)) { throw "word/document.xml introuvable dans le DOCX." }

    $target = New-Object System.Xml.XmlDocument
    $target.PreserveWhitespace = $true
    $target.Load($docPath)
    $script:TargetNs = New-Object System.Xml.XmlNamespaceManager($target.NameTable)
    $script:TargetNs.AddNamespace("w", $WNS)
    $script:TargetNs.AddNamespace("m", $MNS)

    $textNodes = @($target.SelectNodes("//w:t[contains(.,'LATEX:')]", $script:TargetNs))
    if ($textNodes.Count -eq 0) { throw "Aucune balise LaTeX trouvee dans ce Word V1." }

    $regex = New-Object System.Text.RegularExpressions.Regex($MarkerPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $formulas = New-Object System.Collections.Generic.List[string]
    foreach ($tn in $textNodes) {
        foreach ($m in $regex.Matches($tn.InnerText)) {
            $raw = ""
            if ($m.Groups[1].Success) { $raw = $m.Groups[1].Value }
            elseif ($m.Groups[2].Success) { $raw = $m.Groups[2].Value }
            if (-not [string]::IsNullOrWhiteSpace($raw)) {
                $formulas.Add((Beautify-Latex $raw))
            }
        }
    }
    if ($formulas.Count -eq 0) { throw "Aucune formule LaTeX exploitable trouvee." }
    Write-Host ("Formules LaTeX detectees : " + $formulas.Count) -ForegroundColor Cyan

    $md = Join-Path $tmp "equations.md"
    $mdText = ($formulas | ForEach-Object { '$' + $_ + '$' }) -join "`r`n`r`n"
    [System.IO.File]::WriteAllText($md, $mdText, (New-Object System.Text.UTF8Encoding($false)))
    $eqDocx = Join-Path $tmp "equations.docx"
    & $pandoc $md -o $eqDocx
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $eqDocx)) { throw "Pandoc n'a pas pu convertir les formules." }

    [System.IO.Compression.ZipFile]::ExtractToDirectory($eqDocx, $eqDir)
    $eqXmlPath = Join-Path $eqDir "word\document.xml"
    $eq = New-Object System.Xml.XmlDocument
    $eq.PreserveWhitespace = $true
    $eq.Load($eqXmlPath)
    $eqNs = New-Object System.Xml.XmlNamespaceManager($eq.NameTable)
    $eqNs.AddNamespace("m", $MNS)
    $mathNodes = @($eq.SelectNodes("//m:oMath", $eqNs))
    if ($mathNodes.Count -ne $formulas.Count) {
        throw ("Conversion incomplete : " + $formulas.Count + " formules attendues, " + $mathNodes.Count + " obtenues.")
    }

    $mathIndex = 0
    foreach ($tn in $textNodes) {
        $txt = $tn.InnerText
        $matches = @($regex.Matches($txt))
        if ($matches.Count -eq 0) { continue }
        $run = $tn.ParentNode
        if ($run.LocalName -ne 'r') { continue }
        $parent = $run.ParentNode
        $cursor = 0
        foreach ($m in $matches) {
            if ($m.Index -gt $cursor) {
                $before = $txt.Substring($cursor, $m.Index - $cursor)
                [void]$parent.InsertBefore((New-TextRun $target $run $before), $run)
            }
            $imported = $target.ImportNode($mathNodes[$mathIndex], $true)
            [void]$parent.InsertBefore($imported, $run)
            $mathIndex++
            $cursor = $m.Index + $m.Length
        }
        if ($cursor -lt $txt.Length) {
            $after = $txt.Substring($cursor)
            [void]$parent.InsertBefore((New-TextRun $target $run $after), $run)
        }
        [void]$parent.RemoveChild($run)
    }

    if ($mathIndex -ne $formulas.Count) {
        throw ("Remplacement incomplet : " + $formulas.Count + " formules attendues, " + $mathIndex + " inserees.")
    }

    Save-XmlUtf8 $target $docPath
    if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -Force }
    [System.IO.Compression.ZipFile]::CreateFromDirectory($targetDir, $out, [System.IO.Compression.CompressionLevel]::Optimal, $false)

    # Verification minimale du paquet produit avant suppression du V1.
    $verify = Join-Path $tmp "verify"
    New-Item -ItemType Directory -Path $verify -Force | Out-Null
    [System.IO.Compression.ZipFile]::ExtractToDirectory($out, $verify)
    $verifyXml = Join-Path $verify "word\document.xml"
    if (-not (Test-Path -LiteralPath $verifyXml)) { throw "Verification finale impossible : document.xml absent." }
    $vx = New-Object System.Xml.XmlDocument
    $vx.PreserveWhitespace = $true
    $vx.Load($verifyXml)
    $vns = New-Object System.Xml.XmlNamespaceManager($vx.NameTable)
    $vns.AddNamespace("m", $MNS)
    $countFinal = @($vx.SelectNodes("//m:oMath", $vns)).Count
    if ($countFinal -lt $mathIndex) { throw "Le Word final ne contient pas toutes les equations attendues." }

    $leftoverNodes = @($vx.SelectNodes("//w:t[contains(.,'LATEX:')]", $script:TargetNs))
    if ($leftoverNodes.Count -gt 0) {
        throw ("Finalisation incomplete : " + $leftoverNodes.Count + " balise(s) LATEX restent dans le document.")
    }

    Write-Host ""
    Write-Host "FINALISATION V4.7.8 TERMINEE" -ForegroundColor Green
    Write-Host ("Equations Word natives creees : " + $mathIndex) -ForegroundColor Green
    Write-Host ("Fichier : " + $out) -ForegroundColor Cyan
    Write-Host ""

    if ($DeleteSource -and (Test-Path -LiteralPath $src)) {
        Remove-Item -LiteralPath $src -Force -ErrorAction SilentlyContinue
        if (Test-Path -LiteralPath $src) {
            Write-Host "Word V1 technique conserve car il est encore ouvert dans Word." -ForegroundColor DarkGray
        } else {
            Write-Host "Word V1 technique supprime apres verification." -ForegroundColor DarkGray
        }
    }
    Start-Process -FilePath $out
}
finally {
    if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue }
}
