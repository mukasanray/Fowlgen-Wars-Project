$w = New-Object -ComObject Wscript.Shell
$w.AppActivate('Unity')
Start-Sleep -Seconds 3
Test-Path 'd:/Dev/Fowlgen-Wars-Project/test_compilation_output.txt'
