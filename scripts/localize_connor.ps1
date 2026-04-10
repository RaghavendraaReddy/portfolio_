$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$siteRoot = 'https://www.connorlove.com'
$routes = @(
  '/',
  '/about',
  '/projects',
  '/projects/connorvault',
  '/projects/lovesans',
  '/projects/loveui',
  '/projects/lovechat',
  '/projects/lyceum'
)
$knownExtraAssets = @(
  '/_next/static/chunks/981.f19abf9ebd8ec429.js',
  '/_next/static/chunks/459.b41beb19fd6d580d.js',
  '/_next/static/chunks/241.cf928368ad8f8c9a.js',
  '/_next/static/chunks/pages/404-d97954c1ceb9e9f8.js',
  '/_next/static/chunks/pages/_error-7a92967bea80186d.js',
  '/_vercel/insights/script.js',
  '/android-chrome-512x512.png',
  '/model/Tag.glb',
  '/model/Bandmoderntelecom.png',
  '/model/Tagmoderntelecom.png'
)

function Ensure-ParentDirectory {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath
  )

  $parent = Split-Path -Parent $FilePath
  if (-not (Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
}

function Get-LocalFilePathFromSitePath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$SitePath
  )

  $cleanPath = $SitePath.Split('?')[0]
  return Join-Path $repoRoot ($cleanPath.TrimStart('/') -replace '/', '\')
}

function Get-LocalHtmlPathFromRoute {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Route
  )

  if ($Route -eq '/') {
    return Join-Path $repoRoot 'index.html'
  }

  return Join-Path $repoRoot (($Route.TrimStart('/') -replace '/', '\') + '\index.html')
}

function Save-RemoteAsset {
  param(
    [Parameter(Mandatory = $true)]
    [string]$AssetPath
  )

  if (-not $AssetPath.StartsWith('/')) {
    return
  }

  $localPath = Get-LocalFilePathFromSitePath -SitePath $AssetPath
  Ensure-ParentDirectory -FilePath $localPath

  if (Test-Path $localPath) {
    return
  }

  try {
    Invoke-WebRequest -Uri ($siteRoot + $AssetPath) -OutFile $localPath -UseBasicParsing
  }
  catch {
    Write-Warning "Skipping missing asset: $AssetPath"
  }
}

function Save-RemoteAssetsFromText {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Text,
    [string]$RelativePrefix = ''
  )

  $imageQueryRegex = [regex]'/_next/image\?url=[^"''\s]+'
  $imageMatches = $imageQueryRegex.Matches($Text) | ForEach-Object { $_.Value } | Sort-Object -Unique

  foreach ($queryUrl in $imageMatches) {
    $decodedQuery = [System.Net.WebUtility]::HtmlDecode($queryUrl)
    if ($decodedQuery -match 'url=([^&]+)') {
      $rawPath = [System.Uri]::UnescapeDataString($Matches[1])
      Save-RemoteAsset -AssetPath $rawPath
    }
  }

  $rootAssetRegex = [regex]'/(?:_next/static[^"''\s<>()]*|_vercel/insights/script\.js|fonts/[^"''\s<>()]+|other/[^"''\s<>()]+|logos/[^"''\s<>()]+|model/[^"''\s<>()]+\.(?:glb|gltf|bin|png|jpe?g|webp)|connor/[^"''\s<>()]+|connorvault/[^"''\s<>()]+|lovesans/[^"''\s<>()]+|loveui/[^"''\s<>()]+|lovechat/[^"''\s<>()]+|lyceum/[^"''\s<>()]+|favicon\.ico|favicon-16x16\.png|favicon-32x32\.png|apple-touch-icon\.png|android-chrome-512x512\.png|site\.webmanifest|safari-pinned-tab\.svg|og\.png)'
  $rootAssetMatches = $rootAssetRegex.Matches($Text) | ForEach-Object { $_.Value } | Sort-Object -Unique

  foreach ($assetPath in $rootAssetMatches) {
    Save-RemoteAsset -AssetPath $assetPath
  }

  if ($RelativePrefix) {
    $relativeAssetRegex = [regex]'(?<=["''])static/(?:chunks|css)/[^"'']+'
    $relativeAssetMatches = $relativeAssetRegex.Matches($Text) | ForEach-Object { $_.Value } | Sort-Object -Unique

    foreach ($assetPath in $relativeAssetMatches) {
      Save-RemoteAsset -AssetPath ($RelativePrefix + '/' + $assetPath.TrimStart('/'))
    }
  }
}

function Apply-OfflineReplacements {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Text,
    [Parameter(Mandatory = $true)]
    [string]$Extension
  )

  $updatedText = $Text

  if ($Extension -eq '.html') {
    $updatedText = $updatedText.Replace('href="https://www.connorlove.com"', 'href="/"')
    $updatedText = $updatedText.Replace('content="https://www.connorlove.com/og.png"', 'content="/og.png"')
    $updatedText = $updatedText.Replace('content="https://www.connorlove.com"', 'content="/"')
    $updatedText = $updatedText.Replace('"url":"https://www.connorlove.com"', '"url":"/"')
    $updatedText = $updatedText.Replace('"image":"https://www.connorlove.com/og.png"', '"image":"/og.png"')
    $updatedText = $updatedText.Replace('"sameAs":["https://www.linkedin.com/in/loveconnor/","https://github.com/loveconnor","https://twitter.com/cando145","https://www.instagram.com/connorlove__/"]', '"sameAs":[]')
    $updatedText = $updatedText -replace 'href="https://[^"]+"', 'href="#"'
    $updatedText = $updatedText -replace 'href="mailto:[^"]+"', 'href="#"'
  }

  if ($Extension -in @('.js', '.html')) {
    $updatedText = $updatedText.Replace('path:"/_next/image",loader:"default",dangerouslyAllowSVG:!1,unoptimized:!1', 'path:"/_next/image",loader:"default",dangerouslyAllowSVG:!1,unoptimized:!0')
    $updatedText = $updatedText.Replace('https://www.connorlove.com', '')
    $updatedText = $updatedText.Replace('https://www.linkedin.com/in/loveconnor/', '#')
    $updatedText = $updatedText.Replace('https://github.com/loveconnor/lovechat', '#')
    $updatedText = $updatedText.Replace('https://github.com/loveconnor/lyceum', '#')
    $updatedText = $updatedText.Replace('https://github.com/loveconnor/lovesans', '#')
    $updatedText = $updatedText.Replace('https://github.com/loveconnor/connorvault', '#')
    $updatedText = $updatedText.Replace('https://github.com/loveconnor', '#')
    $updatedText = $updatedText.Replace('https://twitter.com/cando145', '#')
    $updatedText = $updatedText.Replace('https://www.instagram.com/connorlove__/', '#')
    $updatedText = $updatedText.Replace('https://www.instagram.com/connorlove__', '#')
    $updatedText = $updatedText.Replace('https://loveui.dev', '#')
    $updatedText = $updatedText.Replace('liveLink:"#"', 'liveLink:void 0')
    $updatedText = $updatedText.Replace('githubLink:"#"', 'githubLink:void 0')
    $updatedText = $updatedText.Replace('"/_vercel/insights/script.js"', '"/_vercel/insights/disabled.js"')
    $updatedText = $updatedText.Replace("/_vercel/insights/script.js", "/_vercel/insights/disabled.js")
  }

  return $updatedText
}

function Save-RemoteRouteData {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Route,
    [Parameter(Mandatory = $true)]
    [string]$BuildId
  )

  if ($Route -eq '/') {
    return
  }

  $dataPath = "/_next/data/$BuildId$Route.json"
  $localPath = Get-LocalFilePathFromSitePath -SitePath $dataPath
  Ensure-ParentDirectory -FilePath $localPath

  if (Test-Path $localPath) {
    return
  }

  try {
    Invoke-WebRequest -Uri ($siteRoot + $dataPath) -OutFile $localPath -UseBasicParsing
  }
  catch {
    Write-Warning "Skipping missing route data: $dataPath"
  }
}

function Localize-Html {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Html
  )

  $localizedHtml = $Html -replace '<base href="https://www\.connorlove\.com/">', ''
  $localizedHtml = $localizedHtml -replace '<link href="/fonts/NeueHaasDisplay[^"]+" as="font" type="font/woff2"/>', ''
  Save-RemoteAssetsFromText -Text $localizedHtml

  $localizedHtml = $localizedHtml.Replace('href="/"', 'href="/"')
  $localizedHtml = $localizedHtml.Replace('href="/about"', 'href="/about/"')
  $localizedHtml = $localizedHtml.Replace('href="/projects"', 'href="/projects/"')
  $localizedHtml = $localizedHtml.Replace('href="/projects/connorvault"', 'href="/projects/connorvault/"')
  $localizedHtml = $localizedHtml.Replace('href="/projects/lovesans"', 'href="/projects/lovesans/"')
  $localizedHtml = $localizedHtml.Replace('href="/projects/loveui"', 'href="/projects/loveui/"')
  $localizedHtml = $localizedHtml.Replace('href="/projects/lovechat"', 'href="/projects/lovechat/"')
  $localizedHtml = $localizedHtml.Replace('href="/projects/lyceum"', 'href="/projects/lyceum/"')

  $imageQueryRegex = [regex]'/_next/image\?url=[^"''\s]+'
  $imageMatches = $imageQueryRegex.Matches($localizedHtml) | ForEach-Object { $_.Value } | Sort-Object -Unique

  foreach ($queryUrl in $imageMatches) {
    $decodedQuery = [System.Net.WebUtility]::HtmlDecode($queryUrl)
    if ($decodedQuery -match 'url=([^&]+)') {
      $rawPath = [System.Uri]::UnescapeDataString($Matches[1])
      $localizedHtml = $localizedHtml.Replace($queryUrl, $rawPath)
    }
  }

  # The referenced LoveUI video is missing on the live site too, so remove the dead source for the local mirror.
  $localizedHtml = $localizedHtml -replace '<div class="projectImages_videoContainer__e5hzh"><video loop="" muted="" autoplay=""><source src="/loveui/video\.mp4" type="video/mp4"/></video></div>', ''

  return $localizedHtml
}

foreach ($route in $routes) {
  Write-Output "Mirroring route: $route"
  $html = Invoke-WebRequest -Uri ($siteRoot + $route) -UseBasicParsing | Select-Object -ExpandProperty Content
  $localizedHtml = Localize-Html -Html $html

  if ($localizedHtml -match '<script id="__NEXT_DATA__" type="application/json">(?<json>.*?)</script>') {
    $nextData = ConvertFrom-Json $Matches['json']
    if ($nextData.props.__N_SSG -eq $true -and $nextData.buildId) {
      Save-RemoteRouteData -Route $route -BuildId $nextData.buildId
    }
  }

  $localHtmlPath = Get-LocalHtmlPathFromRoute -Route $route
  Ensure-ParentDirectory -FilePath $localHtmlPath
  [System.IO.File]::WriteAllText($localHtmlPath, $localizedHtml, [System.Text.Encoding]::UTF8)
}

foreach ($assetPath in $knownExtraAssets) {
  Save-RemoteAsset -AssetPath $assetPath
}

$tagTexturePath = Join-Path $repoRoot 'model\Tagmoderntelecom.png'
$bandTexturePath = Join-Path $repoRoot 'model\Bandmoderntelecom.png'
if (-not (Test-Path $tagTexturePath) -and (Test-Path $bandTexturePath)) {
  Ensure-ParentDirectory -FilePath $tagTexturePath
  Copy-Item -LiteralPath $bandTexturePath -Destination $tagTexturePath -Force
}

$textFiles = Get-ChildItem -Path $repoRoot -Recurse -File | Where-Object {
  $_.Extension -in @('.html', '.js', '.css', '.json', '.svg', '.webmanifest')
}

foreach ($textFile in $textFiles) {
  $text = Get-Content $textFile.FullName -Raw
  $relativePrefix = ''

  if ($textFile.Name -eq '_buildManifest.js') {
    $relativePrefix = '/_next'
  }

  Save-RemoteAssetsFromText -Text $text -RelativePrefix $relativePrefix
  $updatedText = Apply-OfflineReplacements -Text $text -Extension $textFile.Extension

  if ($textFile.Extension -ne '.css') {
    if ($updatedText -ne $text) {
      [System.IO.File]::WriteAllText($textFile.FullName, $updatedText, [System.Text.Encoding]::UTF8)
    }
    continue
  }

  $cssUrlRegex = [regex]'url\(([''"]?)(?<path>[^)''"]+)\1\)'
  $cssMatches = $cssUrlRegex.Matches($updatedText)

  foreach ($cssMatch in $cssMatches) {
    $cssPath = $cssMatch.Groups['path'].Value
    if ($cssPath.StartsWith('data:') -or $cssPath.StartsWith('http')) {
      continue
    }

    if ($cssPath.StartsWith('/')) {
      Save-RemoteAsset -AssetPath $cssPath
    }
  }

  if ($updatedText -ne $text) {
    [System.IO.File]::WriteAllText($textFile.FullName, $updatedText, [System.Text.Encoding]::UTF8)
  }
}
