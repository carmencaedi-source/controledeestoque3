# SENAI SP — SGEM (Sistema de Gestão de Estoque de Materiais)

Aplicativo web profissional para controle e gestão de estoques industriais e laboratoriais desenvolvido segundo os padrões de excelência operacional do **SENAI São Paulo**.

---

## 1. Instruções de Execução e Publicação

- **Ambiente de Desenvolvimento:** `npm run dev` (executando Vite na porta 3000)
- **Compilação e Verificação:** `npm run build`
- **Link do Aplicativo Publicado / Homologação:**
  - **URL da Aplicação:** `https://ais-dev-adfaava6rglku4fqd2cym5-443577489690.us-east5.run.app`
  - **URL Compartilhada:** `https://ais-pre-adfaava6rglku4fqd2cym5-443577489690.us-east5.run.app`

---

## 2. Justificativa Arquitetural de Persistência (Item 4)

O sistema implementa uma estratégia híbrida de persistência entre sessões projetada para a realidade de oficinas e almoxarifados do SENAI SP:

1. **Persistência Local Contínua (LocalStorage + IndexedDB Cache):**
   - Garante latência zero e operação ininterrupta nas bancadas de oficina mesmo com oscilações de rede Wi-Fi.
   - Preserva 100% dos registros cadastrais e movimentações entre fechamentos de abas e reinicializações do navegador.
2. **GitHub Gist / Repository API (Versionamento e Imutabilidade):**
   - **Por que foi priorizado para governança?** O GitHub fornece **trilha de auditoria criptográfica imutável** (commits com SHA), garantindo rastreabilidade histórica e conformidade com auditorias de inventário (ISO 9001 e normas técnicas industriais).
3. **Google Drive (Backup Corporativo em Nuvem):**
   - Disponibiliza exportação e importação descomplicada em formato JSON estruturado (`senai_sp_estoque_backup.json`), permitindo arquivamento em drives compartilhados institucionais.

---

## 3. Estrutura Hierárquica Cadastral

O sistema gera códigos únicos sequenciais automaticamente em cada nível:
- **Nível 1 • Tipo:** `01`, `02`, `03`... (Grandes áreas técnicas)
- **Nível 2 • Grupo:** `01.01`, `01.02`... (Famílias funcionais)
- **Nível 3 • Subgrupo:** `01.01.01`, `01.01.02`... (Classes de materiais)
- **Nível 4 • Artigo:** `01.01.01.0001` (Identificador único universal com localização física vinculada)

---

## 4. Cadastro Oficial dos 10 Materiais Técnicos (SENAI SP)

| Código | Nome do Material | Hierarquia | Localização | Saldo | Unid. | Responsável Técnico |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `01.01.01.0001` | Pastilha Metal Duro WNMG 080408-PM GC4325 | Usinagem &gt; Torneamento &gt; Pastilhas | Almoxarifado Central - Prateleira 02 - Gaveta 14 | 65 | PC | Carmen |
| `01.01.02.0001` | Fresa Topo 4 Cortes D10mm Metal Duro AlTiN | Usinagem &gt; Torneamento &gt; Fresas Inteiriças | Almoxarifado Central - Prateleira 02 - Gaveta 18 | 14 | UN | Carmen |
| `01.02.01.0001` | Paquímetro Universal Analógico 150mm / 6 pol | Usinagem &gt; Metrologia &gt; Paquímetros | Lab. Metrologia - Armário M1 - Gaveta 03 | 18 | UN | Carmen |
| `01.02.02.0001` | Micrômetro Externo Centesimal 0 a 25mm 0,01mm | Usinagem &gt; Metrologia &gt; Micrômetros | Lab. Metrologia - Armário M1 - Gaveta 05 | 12 | UN | Carmen |
| `02.01.01.0001` | Contator Tripolar 32A 220Vca 50/60Hz CWM32 | Elétrica &gt; Manobra &gt; Contatores AC-3 | Oficina Eletroeletrônica - Prateleira E-04 | 22 | UN | Carmen |
| `02.01.02.0001` | Disjuntor-Motor Termomagnético 6,3A a 10A MPW | Elétrica &gt; Manobra &gt; Disjuntores-Motores | Oficina Eletroeletrônica - Prateleira E-05 | 15 | UN | Carmen |
| `02.02.01.0001` | Sensor Indutivo Cilíndrico M18 Faceado PNP NA | Elétrica &gt; Sensores &gt; Indutivos | Lab. Automação e Mecatrônica - Armário A2 | 26 | UN | Carmen |
| `03.01.01.0001` | Eletrodo Revestido AWS E7018 D3,25mm Caixa 5kg | Soldagem &gt; Consumíveis &gt; Eletrodos | Oficina Soldagem - Galpão 03 - Box 11 | 48 | CX | Carmen |
| `03.01.02.0001` | Arame Cobreado MIG/MAG AWS ER70S-6 D1,0mm 15kg | Soldagem &gt; Consumíveis &gt; Arames MIG | Oficina Soldagem - Galpão 03 - Box 15 | 25 | RL | Carmen |
| `04.01.01.0001` | Óculos de Segurança Policarbonato Incolor CA 18828 | EPI &gt; Visual &gt; Óculos Industriais | Almoxarifado Central - Prateleira 01 - Gaveta 02 | 110 | UN | Carmen |

---

## 5. Responsável Técnico

- **Nome:** Carmen
- **Área:** Engenharia de Software e Gestão de Almoxarifado Técnico
