Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Diagnostics;
using System.Runtime.InteropServices;

public class WinEnumAllUnity {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder strText, int maxCount);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

    public static void ListAll() {
        Process[] procs = Process.GetProcesses();
        foreach (var p in procs) {
            if (p.ProcessName.IndexOf("unity", StringComparison.OrdinalIgnoreCase) >= 0) {
                EnumWindows((hWnd, lParam) => {
                    uint pid;
                    GetWindowThreadProcessId(hWnd, out pid);
                    if (pid == (uint)p.Id) {
                        StringBuilder sb = new StringBuilder(256);
                        GetWindowText(hWnd, sb, 256);
                        StringBuilder cb = new StringBuilder(256);
                        GetClassName(hWnd, cb, 256);
                        Console.WriteLine("PID: " + p.Id + " (" + p.ProcessName + ") HWND: " + hWnd + " Vis: " + IsWindowVisible(hWnd) + " Class: " + cb.ToString() + " Title: '" + sb.ToString() + "'");
                    }
                    return true;
                }, IntPtr.Zero);
            }
        }
    }
}
"@

[WinEnumAllUnity]::ListAll()
