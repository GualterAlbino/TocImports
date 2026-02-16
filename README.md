# TocImports 🚀

Organize seus imports de acordo com suas preferências mantendo seu projeto pradonizado com o agrupamento por contexto.

O **TocImports** é uma ferramenta de linha de comando (CLI) feita para desenvolvedores que prezam por um código limpo e organizado. Ele não apenas ordena seus imports, mas os agrupa logicamente com comentários, remove duplicatas e garante que o visual do seu cabeçalho de código seja sempre consistente.

## ✨ Por que usar o TocImports?

* **Agrupamento Inteligente:** Separa seus imports por categorias (Services, Domain, Infra, etc) com comentários automáticos.
* **Pirâmide Invertida:** Ordena os imports pelo comprimento dos caracteres (do maior para o menor ou vice-versa).
* **De-duplicação:** Remove automaticamente imports idênticos no mesmo arquivo.
* **Processamento via AST:** Diferente de ferramentas que usam Regex, o TocImports utiliza uma Árvore de Sintaxe Abstrata (AST) para manipular o código com segurança, sem quebrar sua lógica.

---

## 🚀 Como usar

### 1. Instalação

Você pode instalar o pacote globalmente em sua máquina:

```bash
npm install -g toc-imports
```

Ou utilizá-lo sem instalar via npx:
```bash
npx toc-imports "src/**/*.ts"
```

### 2. Configuração

Crie um arquivo chamado `TocImports.json` na raiz do seu projeto. Este arquivo define como a ferramenta deve se comportar:

```json
{
  "order": "DESC",
  "quote": "single",
  "tabWidth": 2,
  "groups": [
    { "pattern": "@components", "comment": "Componnets" },
    { "pattern": "@service", "comment": "Services" },
    { "pattern": "@domain", "comment": "Domain" },
    { "pattern": "@infra", "comment": "Infrastructure" },
    { "pattern": "", "comment": "Outros" }
  ]
}
```

- `order` : Define a ordem de tamanho (DESC para o maior primeiro, ASC para o menor primeiro).
- `groups`: Lista de padrões de busca (pattern) e o comentário (comment) que será exibido acima do grupo.


### 3. Execução
Rode o comando passando o caminho dos arquivos (aceita padrões Glob):

```bash
toc-imports "src/**/*.ts"
```

### Exemplo 

Antes do TocImports:

```javascript
import { User } from "@domain/user";
import axios from "axios";
import { AuthService } from "@service/auth";
import { Button } from "@components/Button";
import { StorageService } from "@service/storage";
```

Depois do TocImports (Configurado como DESC):

```javascript
// Components
import { Button } from "@components/Button";

// Services
import { StorageService } from "@service/storage";
import { AuthService } from "@service/auth";

// Domain
import { User } from "@domain/user";

// Outros
import axios from "axios";
```

### 🛠️ Tecnologias Utilizadas

- `Recast` - Para manipulação não-destrutiva de AST.
- `Zod` - Para validação rigorosa do esquema de configuração.
- `Commander.js` - Para uma interface de CLI robusta.

### Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.