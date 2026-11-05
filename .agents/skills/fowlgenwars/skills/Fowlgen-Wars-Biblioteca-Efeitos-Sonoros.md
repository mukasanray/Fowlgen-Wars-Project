# FOWLGEN WARS - Bibliotecas de Efeitos Sonoros Gratuitos (SFX)

Guia de referência para captação, uso legal (direitos autorais/licenças), formatos ideais para game engines (Unity) e repositórios de efeitos sonoros (SFX) e áudio para o projeto.

---

## Ranking e Melhores Sites de Efeitos Sonoros

### 1º Lugar: Mixkit
* **URL:** [mixkit.co](https://mixkit.co/free-sound-effects/)
* **Direitos Autorais:** 100% gratuito para projetos pessoais e comerciais. Não exige atribuição (créditos).
* **Facilidade de Download:** Excelente. Não precisa criar conta nem fazer login; download direto com 1 clique.
* **Formatos:** Disponibiliza arquivos **WAV** diretamente no plano gratuito (diferencial essencial para game audio).

---

### 2º Lugar: Pixabay Sound Effects
* **URL:** [pixabay.com/sound-effects](https://pixabay.com/sound-effects/)
* **Direitos Autorais:** Licença própria permissiva que autoriza uso comercial e modificações sem necessidade de créditos.
* **Facilidade de Download:** Não exige cadastro para a maioria dos downloads.
* **Formatos:** Maioria em **MP3** de boa qualidade.

---

### 3º Lugar: Freesound.org
* **URL:** [freesound.org](https://freesound.org/)
* **Direitos Autorais:** Atenção necessária às licenças por arquivo:
  * **CC0 (Domínio Público):** Totalmente livre para uso comercial sem créditos.
  * **CC-BY:** Permite uso comercial, mas requer créditos (ex: nos *End Credits* do jogo).
  * **CC-NC:** **Evitar** (não permite uso comercial).
* **Facilidade de Download:** Exige cadastro gratuito. Recomenda-se filtrar por licença na busca.
* **Formatos:** Excelente acervo de áudios brutos em **WAV** e **FLAC**.

---

### 4º Lugar (Bônus para Games): OpenGameArt.org
* **URL:** [opengameart.org](https://opengameart.org/)
* **Direitos Autorais:** Totalmente voltado para desenvolvimento de jogos. Predominância de **CC0** e **CC-BY**.
* **Facilidade de Download:** Download direto dos arquivos individuais ou pacotes compactados (`.zip`).
* **Formatos:** **WAV**, **OGG** e **MP3**, prontos para importação em engines de jogos (como Unity).

---

### 5º Lugar: Zapsplat
* **URL:** [zapsplat.com](https://www.zapsplat.com)
* **Direitos Autorais:** Permite uso comercial, mas **exige obrigatoriamente atribuição/créditos** no plano gratuito.
* **Facilidade de Download:** Limitada no plano gratuito (exige conta, impõe delay/tempo de espera entre downloads e limita velocidade).
* **Formatos:** Plano grátis fornece apenas **MP3**. Formato WAV restrito a assinantes pagos.

---

### 6º Lugar: Sonniss (GDC Audio Packs)
* **URL:** [sonniss.com/gameaudiogdc](https://sonniss.com/gameaudiogdc)
* **Direitos Autorais:** 100% Royalty-Free para projetos comerciais e pessoais sem necessidade de créditos.
* **Facilidade de Download:** Pacotes massivos anuais via Torrent ou Google Drive (dezenas de GBs).
* **Formatos:** Arquivos **WAV de qualidade de estúdio** (24-bit / 96kHz). Ideal para arquivamento e biblioteca local de SFX.

---

### 7º Lugar: Uppbeat
* **URL:** [uppbeat.io](https://uppbeat.io/blog/sound-effects/free-sound-effects-websites)
* **Direitos Autorais:** Exige link/crédito de atribuição no plano gratuito.
* **Facilidade de Download:** Exige cadastro.
* **Limitação Chave:** Limite de apenas **10 downloads gratuitos por mês** (inviável para produção contínua de jogos).

---

### 8º Lugar: SoundBible
* **URL:** [soundbible.com](https://soundbible.com/)
* **Direitos Autorais:** Sons sob Domínio Público (CC0) e Creative Commons.
* **Facilidade de Download:** Downloads diretos sem cadastro.
* **Formatos:** Opções em **WAV** e **MP3**.

---

## Boas Práticas para Game Audio no Unity / FOWLGEN WARS

1. **Prioridade de Formatos na Unity:**
   * **Efeitos Curtos / UI / Impactos / Magias:** Preferir **WAV** (PCM sem compressão desnecessária antes da importação no Unity, deixando o motor comprimir conforme a plataforma de destino).
   * **Músicas de Fundo e Loops Longos:** **OGG Vorbis** ou **MP3** para economia de memória e streaming.
2. **Registro de Atribuição (Créditos):**
   * Manter controle de qualquer SFX com licença **CC-BY** ou similar para inclusão obrigatória na tela de créditos do jogo.
