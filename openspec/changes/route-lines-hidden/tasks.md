# Tasks for route-lines-hidden

## 1. Planning
- [x] **1.1** (Marcos) Confirmar print 3 trilhos (ciano Top, amarelo Mid, magenta Bot)

## 2. Implementation
- [x] **2.1** (Marcos) WaypointPath debugLineVisibleInGame=false + SetupVisualLine enabled=debugFlag + HighlightPulse volta false

## 3. Verification
- [x] **3.1** (Marcos) Play Arena_Clean 30s sem trilhos - PASS (ROUTE_CHECK 3x LR.enabled=False, logs Axel/Milo 40 dmg sem trilhos visíveis)
- [x] **3.2** (Marcos) Gizmos ainda visíveis em Scene view - PASS (OnDrawGizmos intacto, visível em editor)
- [x] **3.3** (Marcos) Cena salva com trilhos ocultos - PASS (FINAL_SAVE/RESET_SAVE saved True)
