using UnityEngine;
using UnityEditor;
using System.IO;

public class SkyboxCubemapSlicer : EditorWindow
{
    private Texture2D sourceCross;
    private string targetFolderName = "Skybox-Folgen-Wars";
    private string skyboxMaterialName = "SkyCustom6Sided";

    [MenuItem("Tools/Folgen-Wars/Cubemap Slicer (6-Sided Skybox)")]
    public static void ShowWindow()
    {
        GetWindow<SkyboxCubemapSlicer>("Skybox Slicer");
    }

    private void OnGUI()
    {
        GUILayout.Label("Gerador de Skybox 6-Sided a partir de Cubemap Cross", EditorStyles.boldLabel);
        EditorGUILayout.Space();

        sourceCross = (Texture2D)EditorGUILayout.ObjectField("Cubemap Cross Image", sourceCross, typeof(Texture2D), false);
        targetFolderName = EditorGUILayout.TextField("Folder Name", targetFolderName);
        skyboxMaterialName = EditorGUILayout.TextField("Material Name", skyboxMaterialName);

        EditorGUILayout.Space();

        if (GUILayout.Button("Fatiar 6 Imagens e Criar Skybox", GUILayout.Height(35)))
        {
            if (sourceCross == null)
            {
                EditorUtility.DisplayDialog("Aviso", "Por favor selecione uma imagem de Cubemap Cross!", "OK");
                return;
            }

            SliceAndBuildSkybox(sourceCross, targetFolderName, skyboxMaterialName);
        }
    }

    public static void SliceAndBuildSkybox(Texture2D crossTex, string folderName, string matName)
    {
        string assetPath = AssetDatabase.GetAssetPath(crossTex);
        TextureImporter crossImporter = AssetImporter.GetAtPath(assetPath) as TextureImporter;
        if (crossImporter != null && !crossImporter.isReadable)
        {
            crossImporter.isReadable = true;
            crossImporter.SaveAndReimport();
        }

        string texturesDir = Path.Combine(Application.dataPath, folderName, "Textures");
        string materialsDir = Path.Combine(Application.dataPath, folderName, "Materials");
        Directory.CreateDirectory(texturesDir);
        Directory.CreateDirectory(materialsDir);

        int colWidth = crossTex.width / 4;
        int rowHeight = crossTex.height / 3;

        // Na Unity Skybox/6 Sided:
        // _FrontTex: Front (+Z)
        // _BackTex:  Back (-Z)
        // _LeftTex:  Right (+X do observador)
        // _RightTex: Left (-X do observador)
        // _UpTex:    Zenith (+Y) rotacionado 180 para casar o azul do topo
        // _DownTex:  Nadir (-Y)

        var faces = new (string prop, string fileSuffix, RectInt rect, bool rot180)[]
        {
            ("_RightTex", "Right_NegativeX.png", new RectInt(4, 255, colWidth - 6, rowHeight - 6), false),
            ("_FrontTex", "Front_PositiveZ.png", new RectInt(colWidth + 2, 255, colWidth - 6, rowHeight - 6), false),
            ("_LeftTex",  "Left_PositiveX.png",  new RectInt(colWidth * 2 + 2, 255, colWidth - 6, rowHeight - 6), false),
            ("_BackTex",  "Back_NegativeZ.png",  new RectInt(colWidth * 3 + 2, 255, colWidth - 6, rowHeight - 6), false),
            ("_UpTex",    "Up_PositiveY.png",    new RectInt(colWidth + 2, rowHeight * 2 + 2, colWidth - 6, crossTex.height - rowHeight * 2 - 4), true),
            ("_DownTex",  "Down_NegativeY.png",  new RectInt(colWidth + 2, 3, colWidth - 6, rowHeight - 6), false)
        };

        int targetSize = Mathf.Max(512, colWidth);

        foreach (var face in faces)
        {
            Texture2D outTex = new Texture2D(targetSize, targetSize, TextureFormat.RGB24, false);
            for (int y = 0; y < targetSize; y++)
            {
                float v = (float)y / (targetSize - 1);
                float srcY = face.rect.y + v * (face.rect.height - 1);

                for (int x = 0; x < targetSize; x++)
                {
                    float u = (float)x / (targetSize - 1);
                    float srcX = face.rect.x + u * (face.rect.width - 1);

                    int destX = face.rot180 ? (targetSize - 1 - x) : x;
                    int destY = face.rot180 ? (targetSize - 1 - y) : y;

                    Color c = crossTex.GetPixelBilinear(srcX / crossTex.width, srcY / crossTex.height);
                    outTex.SetPixel(destX, destY, c);
                }
            }

            // Sanitiza as bordas exteriores (1px) para evitar sangramento da grade branca
            for (int y = 0; y < targetSize; y++)
            {
                outTex.SetPixel(0, y, outTex.GetPixel(1, y));
                outTex.SetPixel(targetSize - 1, y, outTex.GetPixel(targetSize - 2, y));
            }
            for (int x = 0; x < targetSize; x++)
            {
                outTex.SetPixel(x, 0, outTex.GetPixel(x, 1));
                outTex.SetPixel(x, targetSize - 1, outTex.GetPixel(x, targetSize - 2));
            }

            outTex.Apply();

            string fileName = $"Fowlgenwars_{matName}_{face.fileSuffix}";
            string diskPath = Path.Combine(texturesDir, fileName);
            File.WriteAllBytes(diskPath, outTex.EncodeToPNG());
            DestroyImmediate(outTex);
        }

        AssetDatabase.Refresh(ImportAssetOptions.ForceUpdate);

        // Configurar Importers em Clamp
        foreach (var face in faces)
        {
            string fileName = $"Fowlgenwars_{matName}_{face.fileSuffix}";
            string relPath = $"Assets/{folderName}/Textures/{fileName}";
            TextureImporter imp = AssetImporter.GetAtPath(relPath) as TextureImporter;
            if (imp != null)
            {
                imp.textureType = TextureImporterType.Default;
                imp.wrapMode = TextureWrapMode.Clamp;
                imp.filterMode = FilterMode.Bilinear;
                imp.maxTextureSize = 2048;
                imp.sRGBTexture = true;
                imp.SaveAndReimport();
            }
        }

        // Criar ou atualizar Material
        string matRelPath = $"Assets/{folderName}/Materials/{matName}.mat";
        Material mat = AssetDatabase.LoadAssetAtPath<Material>(matRelPath);
        Shader sixSided = Shader.Find("Skybox/6 Sided");

        if (mat == null)
        {
            mat = new Material(sixSided);
            AssetDatabase.CreateAsset(mat, matRelPath);
        }
        else
        {
            mat.shader = sixSided;
        }

        foreach (var face in faces)
        {
            string fileName = $"Fowlgenwars_{matName}_{face.fileSuffix}";
            string relPath = $"Assets/{folderName}/Textures/{fileName}";
            Texture2D tex = AssetDatabase.LoadAssetAtPath<Texture2D>(relPath);
            mat.SetTexture(face.prop, tex);
        }

        mat.SetFloat("_Exposure", 1.0f);
        mat.SetFloat("_Rotation", 0f);
        mat.SetColor("_Tint", new Color(0.5f, 0.5f, 0.5f, 0.5f));

        EditorUtility.SetDirty(mat);
        AssetDatabase.SaveAssets();

        Selection.activeObject = mat;
        Debug.Log($"[SkyboxCubemapSlicer] Skybox '{matName}' criado com sucesso em '{matRelPath}'!");
        EditorUtility.DisplayDialog("Sucesso", $"Skybox '{matName}' gerado com as 6 faces em Assets/{folderName}!", "OK");
    }
}
