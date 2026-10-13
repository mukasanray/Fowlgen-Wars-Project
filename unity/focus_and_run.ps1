Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  }
"@

$processes = Get-Process -Name "Unity" -ErrorAction SilentlyContinue
foreach ($p in $processes) {
    if ($p.MainWindowHandle -ne [IntPtr]::Zero) {
        Write-Host "Activating Unity PID:" $p.Id "Title:" $p.MainWindowTitle
        [Win32]::ShowWindow($p.MainWindowHandle, 9) # SW_RESTORE
        [Win32]::SetForegroundWindow($p.MainWindowHandle)
    }
}
Start-Sleep -Seconds 5
Write-Host "Minion Prefab Exists:" (Test-Path "d:/Dev/Fowlgen-Wars-Project/unity/Assets/Prefabs/Minion_Caipira_Player.prefab")
