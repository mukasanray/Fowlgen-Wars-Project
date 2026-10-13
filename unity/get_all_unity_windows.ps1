Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Runtime.InteropServices;

public class WinEnumAll {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder strText, int maxCount);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    public static void ListAllWindows() {
        EnumWindows((hWnd, lParam) => {
            StringBuilder sb = new StringBuilder(512);
            GetWindowText(hWnd, sb, 512);
            string title = sb.ToString();
            if (title.IndexOf("Unity", StringComparison.OrdinalIgnoreCase) >= 0 ||
                title.IndexOf("Fowlgen", StringComparison.OrdinalIgnoreCase) >= 0 ||
                title.IndexOf("Arena", StringComparison.OrdinalIgnoreCase) >= 0) {
                uint pid;
                GetWindowThreadProcessId(hWnd, out pid);
                Console.WriteLine("PID: " + pid + " HWND: " + hWnd + " Visible: " + IsWindowVisible(hWnd) + " Title: " + title);
            }
            return true;
        }, IntPtr.Zero);
    }
}
"@

[WinEnumAll]::ListAllWindows()
