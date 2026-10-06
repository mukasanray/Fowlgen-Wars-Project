using UnityEngine;

// ReSharper disable once CheckNamespace

namespace Solana.Unity.SDK
{
    //C# bridge to MwaChooserHelper for chooser launch + package capture
    internal static class MwaNativeChooser
    {
        private const string HelperClass = "com.solana.unity.mwa.MwaChooserHelper";

        public static void LaunchWithChooser(AndroidJavaObject activity, AndroidJavaObject intent, string title)
        {
            using var helper = new AndroidJavaClass(HelperClass);
            helper.CallStatic("launchWithChooser", activity, intent, title);
        }

        // last chosen package, null if unavailable
        public static string ConsumeChosenPackage()
        {
            if (Application.platform != RuntimePlatform.Android){
                return null;
            }
            try {
                using var helper = new AndroidJavaClass(HelperClass);
                return helper.CallStatic<string>("consumeChosenPackage");
            }
            catch (System.Exception e) {
                Debug.LogWarning($"[MWA][Chooser] consumeChosenPackage failed: {e.Message}");
                return null;
            }
        }
    }
}
