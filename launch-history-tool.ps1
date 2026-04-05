$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverScript = Join-Path $projectRoot 'local-server.mjs'
$distIndex = Join-Path $projectRoot 'dist\index.html'
$logOut = Join-Path $projectRoot '.history-tool-server.out.log'
$logErr = Join-Path $projectRoot '.history-tool-server.err.log'
$preferredPort = 4173
$installArgs = '/c npm.cmd install --registry=https://registry.npmmirror.com --no-audit --no-fund'
$buildArgs = '/c npm.cmd run build'

function Show-Dialog {
  param(
    [string]$Message,
    [string]$Title = 'History Tool',
    [System.Windows.Forms.MessageBoxIcon]$Icon = [System.Windows.Forms.MessageBoxIcon]::Information
  )

  [System.Windows.Forms.MessageBox]::Show(
    $Message,
    $Title,
    [System.Windows.Forms.MessageBoxButtons]::OK,
    $Icon
  ) | Out-Null
}

function Fail {
  param([string]$Message)

  Show-Dialog -Message $Message -Title 'History Tool' -Icon ([System.Windows.Forms.MessageBoxIcon]::Error)
  exit 1
}

function Invoke-Cmd {
  param([string]$Arguments)

  Push-Location $projectRoot
  try {
    & cmd.exe $Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed with exit code ${LASTEXITCODE}: cmd.exe $Arguments"
    }
  } finally {
    Pop-Location
  }
}

function Get-LatestSourceWriteTime {
  $patterns = @('*.html', '*.ts', '*.tsx', 'package.json')
  $latestFile = Get-ChildItem -Path $projectRoot -Recurse -File -Include $patterns |
    Where-Object {
      $_.FullName -notlike '*\dist\*' -and
      $_.FullName -notlike '*\node_modules\*'
    } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  return $latestFile
}

function Test-PortAvailable {
  param([int]$Port)

  return -not (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Wait-ForUrl {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 20
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  return $false
}

function Get-RunningServer {
  $processes = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq 'node.exe' -and
    $_.CommandLine -and
    $_.CommandLine -match [regex]::Escape($serverScript)
  }

  foreach ($process in $processes) {
    $port = $preferredPort
    if ($process.CommandLine -match '--port\s+(\d+)') {
      $port = [int]$Matches[1]
    }

    return [pscustomobject]@{
      ProcessId = $process.ProcessId
      Port = $port
    }
  }

  return $null
}

if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
  Fail 'Node.js is not installed or not available in PATH.'
}

if (-not (Test-Path (Join-Path $projectRoot 'node_modules'))) {
  Invoke-Cmd -Arguments $installArgs
}

$needsBuild = -not (Test-Path $distIndex)
if (-not $needsBuild) {
  $latestSource = Get-LatestSourceWriteTime
  $distWriteTime = (Get-Item $distIndex).LastWriteTime
  if ($latestSource -and $latestSource.LastWriteTime -gt $distWriteTime) {
    $needsBuild = $true
  }
}

if ($needsBuild) {
  Invoke-Cmd -Arguments $buildArgs
}

$existingServer = Get-RunningServer
if ($existingServer) {
  $existingUrl = "http://127.0.0.1:$($existingServer.Port)"
  if ((Wait-ForUrl -Url $existingUrl -TimeoutSeconds 3) -and $existingServer.Port -eq $preferredPort) {
    Start-Process $existingUrl
    exit 0
  }

  Stop-Process -Id $existingServer.ProcessId -Force -ErrorAction SilentlyContinue
}

if (-not (Test-PortAvailable -Port $preferredPort)) {
  Fail 'Port 4173 is already in use. Close the conflicting app and try again so local autosave stays on one fixed address.'
}

$nodePath = (Get-Command node.exe).Source
$nodeArguments = @($serverScript, '--port', "$preferredPort")
Start-Process -FilePath $nodePath -ArgumentList $nodeArguments -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput $logOut -RedirectStandardError $logErr | Out-Null

$url = "http://127.0.0.1:$preferredPort"
if (-not (Wait-ForUrl -Url $url -TimeoutSeconds 20)) {
  Fail "The local site did not start correctly. Check: $logErr"
}

Start-Process $url
