using UnityEngine;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Trava física ao redor do cenário: impede Milo, Axel e minions caírem da ilha.
    /// - Paredes invisíveis (BoxCollider) + piso de segurança abaixo da ilha.
    /// - Clamp de posição + respawn se atravessar.
    /// - Corre em código (sem mexer na cena serializada) para funcionar em builds já existentes.
    /// </summary>
    public class ArenaBoundaryEnforcer : MonoBehaviour
    {
        [Header("Limites (centro ilha ~ 0,0,0 | meio-fio ~ +-18)")]
        [SerializeField] private Vector2 arenaHalfExtents = new Vector2(26f, 28f);
        [SerializeField] private float wallHeight = 12f;
        [SerializeField] private float wallThickness = 2f;
        [SerializeField] private float killY = -15f;
        [SerializeField] private float safeRespawnY = 11.5f;

        [Header("Invisível colisão extra no vão da ilha (opcional)")]
        [SerializeField] private bool createPerimeterWalls = true;

        private Transform _milo;
        private Transform _axel;
        private GameObject _boundaryRoot;

        private void Awake()
        {
            ResolveHeroes();
            if (createPerimeterWalls) CreatePerimeterWalls();
        }

        private void Start()
        {
            ResolveHeroes();
            if (_boundaryRoot == null && createPerimeterWalls) CreatePerimeterWalls();
        }

        private void LateUpdate()
        {
            EnforceHero(_milo);
            EnforceHero(_axel);
            EnforceMinions();
        }

        private void ResolveHeroes()
        {
            if (_milo == null)
            {
                var go = GameObject.Find("Milo");
                if (go != null) _milo = go.transform;
            }
            if (_axel == null)
            {
                var go = GameObject.Find("Axel");
                if (go != null) _axel = go.transform;
            }
        }

        private void CreatePerimeterWalls()
        {
            if (_boundaryRoot != null) return;
            var existing = GameObject.Find("ArenaBoundary");
            if (existing != null) { _boundaryRoot = existing; return; }

            _boundaryRoot = new GameObject("ArenaBoundary");
            _boundaryRoot.isStatic = true;

            float hx = arenaHalfExtents.x;
            float hz = arenaHalfExtents.y;
            float hw = wallThickness * 0.5f;
            float hh = wallHeight * 0.5f;
            float cy = safeRespawnY - 1f;

            CreateWall("Wall_North", new Vector3(0, cy,  hz + hw), new Vector3(hx * 2 + wallThickness * 2, wallHeight, wallThickness));
            CreateWall("Wall_South", new Vector3(0, cy, -hz - hw), new Vector3(hx * 2 + wallThickness * 2, wallHeight, wallThickness));
            CreateWall("Wall_East",  new Vector3( hx + hw, cy, 0), new Vector3(wallThickness, wallHeight, hz * 2 + wallThickness * 2));
            CreateWall("Wall_West",  new Vector3(-hx - hw, cy, 0), new Vector3(wallThickness, wallHeight, hz * 2 + wallThickness * 2));

            // Piso de segurança abaixo da ilha (se passar do Terrain, colide aqui e não cai infinito)
            CreateWall("Floor_Safety", new Vector3(0, killY + 1f, 0), new Vector3(hx * 3f, 2f, hz * 3f));

            void CreateWall(string name, Vector3 center, Vector3 size)
            {
                var go = new GameObject(name);
                go.transform.SetParent(_boundaryRoot.transform, false);
                go.transform.position = center;
                go.isStatic = true;
                var col = go.AddComponent<BoxCollider>();
                col.center = Vector3.zero;
                col.size = size;
            }
        }

        private void EnforceHero(Transform t)
        {
            if (t == null) return;
            Vector3 p = t.position;

            // Queda: teleporte de volta ao centro seguro + reseta velocity
            if (p.y < killY)
            {
                var cc = t.GetComponent<CharacterController>();
                if (cc != null) cc.enabled = false;
                t.position = new Vector3(Mathf.Clamp(p.x, -arenaHalfExtents.x, arenaHalfExtents.x),
                                         safeRespawnY,
                                         Mathf.Clamp(p.z, -arenaHalfExtents.y, arenaHalfExtents.y));
                if (cc != null) cc.enabled = true;
                // reseta velocidade vertical do controller
                var mover = t.GetComponent<MobilePlayerController>();
                // verticalVelocity é privado; basta garantir que não está em queda livre no próximo frame pela gravidade
                return;
            }

            // Clamp horizontal dentro da arena (evita escorregar para fora pela borda sem colisor de terreno)
            float cx = Mathf.Clamp(p.x, -arenaHalfExtents.x, arenaHalfExtents.x);
            float cz = Mathf.Clamp(p.z, -arenaHalfExtents.y, arenaHalfExtents.y);
            if (cx != p.x || cz != p.z)
            {
                var cc = t.GetComponent<CharacterController>();
                Vector3 target = new Vector3(cx, p.y, cz);
                if (cc != null && cc.enabled)
                    cc.Move(target - p);
                else
                    t.position = target;
            }
        }

        private void EnforceMinions()
        {
            var minions = FindObjectsByType<MinionAgent>(FindObjectsSortMode.None);
            foreach (var m in minions)
            {
                if (m == null || !m.IsAlive) continue;
                Vector3 p = m.transform.position;
                if (p.y < killY)
                {
                    // Minion caiu: destrói (sem travar jogo)
                    Destroy(m.gameObject);
                    continue;
                }
                float cx = Mathf.Clamp(p.x, -arenaHalfExtents.x, arenaHalfExtents.x);
                float cz = Mathf.Clamp(p.z, -arenaHalfExtents.y, arenaHalfExtents.y);
                if (cx != p.x || cz != p.z)
                    m.transform.position = new Vector3(cx, p.y, cz);
            }
        }
    }
}
