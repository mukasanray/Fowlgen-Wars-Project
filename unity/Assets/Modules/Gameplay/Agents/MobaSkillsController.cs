using System;
using UnityEngine;
using UnityEngine.UI;
using FowlgenWars.Gameplay.Audio;
using FowlgenWars.Gameplay.Feedback;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Gerenciador de Habilidades MOBA estilo League of Legends / Wild Rift.
    /// Gerencia Ataque Básico e Habilidades (T, G, Y, H / Ultimate) com cooldowns,
    /// suporte a toque em botões do HUD e atalhos de teclado (T, G, Y, H, Espaço).
    /// </summary>
    public class MobaSkillsController : MonoBehaviour
    {
        [Header("Referências")]
        [SerializeField] private HeroAgent heroAgent;
        [SerializeField] private CharacterController characterController;

        [Header("Configuração de Habilidades (LoL Style)")]
        // Habilidade Q: Investida (Dash)
        [SerializeField] private float skillQCooldown = 4.0f;
        [SerializeField] private int skillQDamage = 95;
        [SerializeField] private float skillQDashSpeed = 16f;
        [SerializeField] private float skillQDashDuration = 0.25f;

        // Habilidade W: Escudo & Velocidade
        [SerializeField] private float skillWCooldown = 7.0f;
        [SerializeField] private int skillWHealAmount = 80;
        [SerializeField] private float skillWSpeedBoost = 1.4f;
        [SerializeField] private float skillWDuration = 3.0f;

        // Habilidade E: Skillshot Projétil
        [SerializeField] private float skillECooldown = 5.0f;
        [SerializeField] private int skillEDamage = 130;
        [SerializeField] private float skillERange = 12f;

        // Habilidade R: Ultimate em Área (AoE)
        [SerializeField] private float skillRCooldown = 12.0f;
        [SerializeField] private int skillRDamage = 260;
        [SerializeField] private float skillRRadius = 6.5f;

        // Cooldown Timers
        private float qTimer = 0f;
        private float wTimer = 0f;
        private float eTimer = 0f;
        private float rTimer = 0f;
        private float attackTimer = 0f;

        // Auto-attack toggle (Toggle UI nativo, vertical ao lado do ATAQUE)
        [Header("Auto-Ataque (Toggle vertical ao lado do ATAQUE)")]
        [SerializeField] private bool autoAttackEnabled;
        [SerializeField] private Toggle autoAttackToggle;
        [SerializeField] private Image autoAttackToggleBg;
        [SerializeField] private Text autoAttackToggleLabel;
        [SerializeField] private RectTransform autoAttackHandleRect;
        private float autoAttackCheckTimer;

        // Estado do Dash
        private bool isDashing = false;
        private Vector3 dashDirection;
        private float dashEndTime;

        // UI Bindings
        [Header("UI Bindings (Auto-conectado ou manual via Inspetor/Script)")]
        [SerializeField] private Button attackButton;
        [SerializeField] private Button skillQButton;
        [SerializeField] private Button skillWButton;
        [SerializeField] private Button skillEButton;
        [SerializeField] private Button skillRButton;

        [SerializeField] private Image qCooldownFill;
        [SerializeField] private Image wCooldownFill;
        [SerializeField] private Image eCooldownFill;
        [SerializeField] private Image rCooldownFill;

        [SerializeField] private Text qCooldownText;
        [SerializeField] private Text wCooldownText;
        [SerializeField] private Text eCooldownText;
        [SerializeField] private Text rCooldownText;

        private bool listenersRegistered = false;

        private void Awake()
        {
            if (heroAgent == null) heroAgent = GetComponent<HeroAgent>();
            if (characterController == null) characterController = GetComponent<CharacterController>();
        }

        private void Start()
        {
            RegisterListeners();
        }

        public void BindUI(
            Button btnAttack,
            Button btnQ, Image fillQ, Text txtQ,
            Button btnW, Image fillW, Text txtW,
            Button btnE, Image fillE, Text txtE,
            Button btnR, Image fillR, Text txtR)
        {
            attackButton = btnAttack;
            skillQButton = btnQ;
            qCooldownFill = fillQ;
            qCooldownText = txtQ;

            skillWButton = btnW;
            wCooldownFill = fillW;
            wCooldownText = txtW;

            skillEButton = btnE;
            eCooldownFill = fillE;
            eCooldownText = txtE;

            skillRButton = btnR;
            rCooldownFill = fillR;
            rCooldownText = txtR;

            RegisterListeners();
            EnsureAttackButtonRaycastFix();
            RefreshAutoToggleVisual();
        }

        public void BindAutoToggle(Toggle toggle, Image bg, Text label, RectTransform handleRect)
        {
            autoAttackToggle = toggle;
            autoAttackToggleBg = bg;
            autoAttackToggleLabel = label;
            autoAttackHandleRect = handleRect;
            if (autoAttackToggle != null)
            {
                autoAttackToggle.onValueChanged.RemoveListener(OnAutoToggleValueChanged);
                autoAttackToggle.onValueChanged.AddListener(OnAutoToggleValueChanged);
                autoAttackToggle.isOn = autoAttackEnabled;
            }
            RefreshAutoToggleVisual();
        }
        // Compat: Button antigo chama Toggle
        public void BindAutoToggle(Button toggleBtn, Text label, Image bg)
        {
            if (toggleBtn != null)
            {
                toggleBtn.onClick.RemoveListener(ToggleAutoAttack);
                toggleBtn.onClick.AddListener(ToggleAutoAttack);
            }
            autoAttackToggleLabel = label;
            autoAttackToggleBg = bg;
            RefreshAutoToggleVisual();
        }

        private void EnsureAttackButtonRaycastFix()
        {
            if (attackButton == null) return;
            // Label e Ring filhos devem ignorar raycast para não bloquear clique do botão (bug do print)
            foreach (var img in attackButton.GetComponentsInChildren<Image>(true))
                if (img.gameObject != attackButton.gameObject) img.raycastTarget = false;
            foreach (var txt in attackButton.GetComponentsInChildren<Text>(true))
                txt.raycastTarget = false;
            // Reativa apenas a imagem do botão base
            var baseImg = attackButton.GetComponent<Image>();
            if (baseImg != null) baseImg.raycastTarget = true;
            attackButton.interactable = true;
        }

        private void RegisterListeners()
        {
            if (listenersRegistered) return;

            if (attackButton != null) attackButton.onClick.AddListener(OnAttackClicked);
            if (skillQButton != null) skillQButton.onClick.AddListener(CastSkillT);
            if (skillWButton != null) skillWButton.onClick.AddListener(CastSkillG);
            if (skillEButton != null) skillEButton.onClick.AddListener(CastSkillY);
            if (skillRButton != null) skillRButton.onClick.AddListener(CastSkillH);
            if (autoAttackToggle != null) autoAttackToggle.onValueChanged.AddListener(OnAutoToggleValueChanged);

            listenersRegistered = true;
        }

        public bool AutoAttackEnabled => autoAttackEnabled;
        public void SetAutoAttack(bool enabled)
        {
            autoAttackEnabled = enabled;
            if (autoAttackToggle != null && autoAttackToggle.isOn != enabled)
                autoAttackToggle.SetIsOnWithoutNotify(enabled);
            RefreshAutoToggleVisual();
        }
        public void ToggleAutoAttack()
        {
            autoAttackEnabled = !autoAttackEnabled;
            if (autoAttackToggle != null) autoAttackToggle.SetIsOnWithoutNotify(autoAttackEnabled);
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.UIClick);
            RefreshAutoToggleVisual();
        }
        private void OnAutoToggleValueChanged(bool isOn)
        {
            autoAttackEnabled = isOn;
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.UIClick);
            RefreshAutoToggleVisual();
        }
        private void RefreshAutoToggleVisual()
        {
            if (autoAttackToggleLabel != null)
                autoAttackToggleLabel.text = autoAttackEnabled ? "AUTO" : "AUTO";
            if (autoAttackToggleBg != null)
                autoAttackToggleBg.color = autoAttackEnabled ? new Color(0.18f, 0.65f, 0.30f, 0.98f) : new Color(0.26f, 0.26f, 0.30f, 0.95f);
            if (autoAttackHandleRect != null)
            {
                // Toggle vertical: handle desliza vertical conforme estado
                float y = autoAttackEnabled ? 14f : -14f;
                autoAttackHandleRect.anchoredPosition = new Vector2(0f, y);
            }
            if (autoAttackToggleLabel != null)
                autoAttackToggleLabel.color = autoAttackEnabled ? Color.white : new Color(0.75f, 0.78f, 0.82f, 1f);
        }

        private void Update()
        {
            UpdateTimers();
            HandleDash();
            HandleKeyboardInput();
            HandleAutoAttack();
            UpdateUI();
        }

        private void HandleAutoAttack()
        {
            if (!autoAttackEnabled || heroAgent == null || !heroAgent.IsAlive) return;
            if (Time.time < heroAgent.NextAttackTime) return;
            // throttle checagem levemente para não spammar OverlapSphere todo frame se sem alvo
            autoAttackCheckTimer -= Time.deltaTime;
            if (autoAttackCheckTimer > 0) return;
            autoAttackCheckTimer = 0.12f;
            heroAgent.ExecuteBasicAttack();
        }

        private void UpdateTimers()
        {
            if (qTimer > 0) qTimer -= Time.deltaTime;
            if (wTimer > 0) wTimer -= Time.deltaTime;
            if (eTimer > 0) eTimer -= Time.deltaTime;
            if (rTimer > 0) rTimer -= Time.deltaTime;
            if (attackTimer > 0) attackTimer -= Time.deltaTime;
        }

        private void HandleDash()
        {
            if (!isDashing) return;

            if (Time.time < dashEndTime)
            {
                if (characterController != null && characterController.enabled && characterController.gameObject.activeInHierarchy)
                {
                    characterController.Move(dashDirection * (skillQDashSpeed * Time.deltaTime));
                }
                else
                {
                    transform.position += dashDirection * (skillQDashSpeed * Time.deltaTime);
                }
            }
            else
            {
                isDashing = false;
            }
        }

        private void HandleKeyboardInput()
        {
#if ENABLE_INPUT_SYSTEM
            var kb = UnityEngine.InputSystem.Keyboard.current;
            if (kb != null)
            {
                if (kb.spaceKey.wasPressedThisFrame) OnAttackClicked();
                if (kb.tKey.wasPressedThisFrame) CastSkillT();
                if (kb.gKey.wasPressedThisFrame) CastSkillG();
                if (kb.yKey.wasPressedThisFrame) CastSkillY();
                if (kb.hKey.wasPressedThisFrame) CastSkillH();
            }
#elif ENABLE_LEGACY_INPUT_MANAGER
            if (Input.GetKeyDown(KeyCode.Space)) OnAttackClicked();
            if (Input.GetKeyDown(KeyCode.T)) CastSkillT();
            if (Input.GetKeyDown(KeyCode.G)) CastSkillG();
            if (Input.GetKeyDown(KeyCode.Y)) CastSkillY();
            if (Input.GetKeyDown(KeyCode.H)) CastSkillH();
#endif
        }

        public void OnAttackClicked()
        {
            if (heroAgent == null || !heroAgent.IsAlive) return;
            if (heroAgent.ExecuteBasicAttack())
            {
                attackTimer = 0.8f;
            }
        }

        public void CastSkillT()
        {
            if (qTimer > 0 || heroAgent == null || !heroAgent.IsAlive) return;
            qTimer = skillQCooldown;

            // Dash para a frente
            dashDirection = transform.forward;
            dashDirection.y = 0;
            dashDirection.Normalize();
            isDashing = true;
            dashEndTime = Time.time + skillQDashDuration;

            CombatVFXManager.Instance?.SpawnDashTrail(transform.position, dashDirection);
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.Whoosh);

            // Dano nos inimigos a frente
            Collider[] hits = Physics.OverlapSphere(transform.position + dashDirection * 3f, 2.5f);
            foreach (var hit in hits)
            {
                if (hit.gameObject == gameObject) continue;
                var target = hit.GetComponentInParent<IDamageable>();
                if (target != null && target.IsAlive && target.UnitTeam != heroAgent.UnitTeam)
                {
                    target.TakeDamage(skillQDamage);
                    CombatVFXManager.Instance?.SpawnHitImpact(hit.transform.position);
                    Debug.Log($"[Skill T - Investida] Acertou {hit.name} causando {skillQDamage} de dano!");
                }
            }
        }

        public void CastSkillG()
        {
            if (wTimer > 0 || heroAgent == null || !heroAgent.IsAlive) return;
            wTimer = skillWCooldown;

            // Escudo / Cura
            heroAgent.Heal(skillWHealAmount);
            CombatVFXManager.Instance?.SpawnHealAura(transform.position);
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.Heal);
            StartCoroutine(ApplySpeedBuff());
            Debug.Log($"[Skill G - Baluarte] Ativado! Milo reforçou a defesa e recuperou {skillWHealAmount} de vida!");
        }

        private System.Collections.IEnumerator ApplySpeedBuff()
        {
            var mover = GetComponent<MobilePlayerController>();
            if (mover != null)
            {
                float orig = mover.MoveSpeed;
                mover.MoveSpeed = orig * skillWSpeedBoost;
                yield return new WaitForSeconds(skillWDuration);
                mover.MoveSpeed = orig;
            }
        }

        public void CastSkillY()
        {
            if (eTimer > 0 || heroAgent == null || !heroAgent.IsAlive) return;
            eTimer = skillECooldown;

            // Disparo de Skillshot (Raio frontal até 12m)
            Vector3 origin = transform.position + Vector3.up * 1f;
            Vector3 dir = transform.forward;
            dir.y = 0;
            dir.Normalize();

            CombatVFXManager.Instance?.SpawnFeatherBurst(origin + dir * 2f, 16, new Color(1f, 0.85f, 0.2f));
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.RoosterCrow);

            if (Physics.Raycast(origin, dir, out RaycastHit hit, skillERange))
            {
                var target = hit.collider.GetComponentInParent<IDamageable>();
                if (target != null && target.IsAlive && target.UnitTeam != heroAgent.UnitTeam)
                {
                    target.TakeDamage(skillEDamage);
                    CombatVFXManager.Instance?.SpawnHitImpact(hit.point);
                    Debug.Log($"[Skill Y - Disparo Sagrado] Acertou {hit.collider.name} causando {skillEDamage} de dano!");
                }
            }
            Debug.Log("[Skill Y - Disparo Sagrado] Penas douradas disparadas!");
        }

        public void CastSkillH()
        {
            if (rTimer > 0 || heroAgent == null || !heroAgent.IsAlive) return;
            rTimer = skillRCooldown;

            // Ultimate AoE (Explosão em área ao redor de Milo)
            CombatVFXManager.Instance?.SpawnUltimateShockwave(transform.position);
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.Ultimate);

            Collider[] hits = Physics.OverlapSphere(transform.position, skillRRadius);
            int targetsHit = 0;
            foreach (var hit in hits)
            {
                if (hit.gameObject == gameObject) continue;
                var target = hit.GetComponentInParent<IDamageable>();
                if (target != null && target.IsAlive && target.UnitTeam != heroAgent.UnitTeam)
                {
                    target.TakeDamage(skillRDamage);
                    CombatVFXManager.Instance?.SpawnHitImpact(hit.transform.position);
                    targetsHit++;
                }
            }
            MobaCameraController.Instance?.Shake(0.40f, 0.50f);
            Debug.Log($"[Skill H - ULTIMATE] Fúria Aviária detonada! {targetsHit} inimigos atingidos com {skillRDamage} de dano!");
        }

        private void UpdateUI()
        {
            UpdateCooldownUI(qTimer, skillQCooldown, qCooldownFill, qCooldownText, skillQButton);
            UpdateCooldownUI(wTimer, skillWCooldown, wCooldownFill, wCooldownText, skillWButton);
            UpdateCooldownUI(eTimer, skillECooldown, eCooldownFill, eCooldownText, skillEButton);
            UpdateCooldownUI(rTimer, skillRCooldown, rCooldownFill, rCooldownText, skillRButton);
        }

        private void UpdateCooldownUI(float timer, float maxTime, Image fill, Text txt, Button btn)
        {
            if (fill == null) return;

            if (timer > 0)
            {
                fill.gameObject.SetActive(true);
                fill.fillAmount = timer / maxTime;
                if (txt != null)
                {
                    txt.gameObject.SetActive(true);
                    txt.text = timer > 1f ? Mathf.CeilToInt(timer).ToString() : timer.ToString("F1");
                }
                if (btn != null) btn.interactable = false;
            }
            else
            {
                fill.gameObject.SetActive(false);
                if (txt != null) txt.gameObject.SetActive(false);
                if (btn != null) btn.interactable = true;
            }
        }
    }
}
