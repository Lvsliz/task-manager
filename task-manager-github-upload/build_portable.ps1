param(
    [string]$Python = "python"
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$DistRoot = Join-Path $Root "dist"
$BuildRoot = Join-Path $Root "build"
$PyInstallerOutput = Join-Path $DistRoot "Worklog"
$PortableOutput = Join-Path $DistRoot "PersonalWorkLog"

Set-Location $Root

& $Python -m pip show pyinstaller *> $null
if ($LASTEXITCODE -ne 0) {
    & $Python -m pip install pyinstaller
}

if (Test-Path $PyInstallerOutput) {
    Remove-Item -LiteralPath $PyInstallerOutput -Recurse -Force
}
if (Test-Path $PortableOutput) {
    Remove-Item -LiteralPath $PortableOutput -Recurse -Force
}

& $Python -m PyInstaller `
    --noconfirm `
    --clean `
    --onedir `
    --name Worklog `
    --add-data "templates;templates" `
    --add-data "static;static" `
    desktop_app.py

Move-Item -LiteralPath $PyInstallerOutput -Destination $PortableOutput

$DataDir = Join-Path $PortableOutput "data"
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

Write-Host ""
Write-Host "Portable build created:"
Write-Host $PortableOutput
Write-Host ""
Write-Host "Run:"
Write-Host (Join-Path $PortableOutput "Worklog.exe")
