# TocImports 

Organize seus imports de acordo com suas preferências mantendo seu projeto pradonizado com o agrupamento por contexto.

O **TocImports** é uma ferramenta de linha de comando (CLI) feita para desenvolvedores que prezam por um código limpo e organizado. Ele não apenas ordena seus imports, mas os agrupa logicamente com comentários, remove duplicatas e garante que o visual do seu cabeçalho de código seja sempre consistente.

##  Por que usar o TocImports?

* **Agrupamento Inteligente:** Separa seus imports por categorias (Services, Domain, Infra, etc) com comentários automáticos.
* **Pirâmide Invertida:** Ordena os imports pelo comprimento dos caracteres (do maior para o menor ou vice-versa).
* **De-duplicação:** Remove automaticamente imports idênticos no mesmo arquivo.
* **Processamento via AST:** Diferente de ferramentas que usam Regex, o TocImports utiliza uma Árvore de Sintaxe Abstrata (AST) para manipular o código com segurança, sem quebrar sua lógica.

---

## Como usar?

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

### 4. Registre o comando na sessão "scripts" de seu package.json
Rode o comando passando o caminho dos arquivos (aceita padrões Glob):

```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "format:imports": "toc-imports \"src/**/*.ts\""
  }
}
```
`Dica`: Se você tiver arquivos TypeScript fora da pasta src que também precisam ser organizados (como uma pasta test comum em projetos NestJS), você pode expandir o padrão do glob assim:

```json
"format:imports": "toc-imports \"{src,test}/**/*.ts\""
```

### Exemplo de Funcionamento

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

### 🧭 Dica Extra - Configuração mais moderna sugerida: Formatar apenas arquivos que foram modificados
Executar o formatador apenas nos arquivos que estão indo para o commit (staged) economiza tempo e evita que você altere acidentalmente arquivos antigos nos quais você não estava trabalhando Isso é excelente para manter a padronização em projetos maiores, garantindo que qualquer código novo já suba organizado, sem que a equipe precise sequer lembrar de rodar o comando manualmente.

Para fazer isso no ecossistema Node.js, usamos a dupla dinâmica: `Husky` e `lint-staged`.

- Instale Husky e Lint-Staged em seu projeto:
No terminal, na raiz do projeto onde você vai usar a ferramenta, instale as dependências:
```bash
npm install --save-dev husky lint-staged
```

- Configure o `lint-staged`
Abra o `pakcage.json` do seu projeto e adicione a configuração do `lint-staged`. Isso diz a ele: "Toda vez que um arquivo `.ts` for modificado, rode o `toc-imports` nele".
```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.ts": [
      "toc-imports"
    ]
  }
}
```

- Inicializar o Husky
Rode o comando abaixo para ativar o Husky no repositório Git local:
```bash
npx husky init
```
Isso criará uma pasta `.husky` na raiz do seu projeto. Dentro dela, haverá um arquivo chamado `pre-commit`.

- Configurar o Hook (Gatilho)
Abra o arquivo `.husky/pre-commit` recém-criado. Apague o que estiver lá (geralmente vem um `npm test` de exemplo) e coloque apenas isto:
```bash
npx lint-staged
```

- Feito! Como testar?
1. Bagunce os imports de algum arquivo .ts no seu projeto
2. Adicione o arquivo ao git: git add src/seu-arquivo-baguncado.ts
3. Tente fazer o commit: git commit -m "chore: testando organizador de imports"

Você verá o `lint-staged` interceptar o commit, rodar o `toc-imports` apenas nesse arquivo, reescrevê-lo já organizado e, em seguida, concluir o commit automaticamente.

### 🛠️ Tecnologias Utilizadas

- `Recast` - Para manipulação não-destrutiva de AST.
- `Zod` - Para validação rigorosa do esquema de configuração.
- `Commander.js` - Para uma interface de CLI robusta.

### Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.