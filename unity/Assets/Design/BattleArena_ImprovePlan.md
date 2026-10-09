# BattleArena Improvement Plan

## Script Convention Findings
- FowlgenUnit: no waypoint name convention, uses transform.forward
- FishNetMinion: no waypoint convention, moves transform.forward
- FishNetMinionSpawner: uses `public Transform spawnPoint` field (manual assignment)

## Steps
1. Visual: Volume profile + Global Volume + camera post-proc
2. Visual: Camera BG color + fog
3. Visual: Shadow distance fix (50→90)
4. Visual: Water material brighter teal
5. Visual: Fire ParticleSystem on Braziers
6. Visual: Rock islets + stalactites
7. Visual: Team point lights Red/Blue
8. Gameplay: NavMeshSurface + bake
9. Gameplay: Lanes + MidBridge
10. Gameplay: MinionSpawns
11. Save scene
