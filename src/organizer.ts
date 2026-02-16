// Libs
import { z } from 'zod'
import * as recast from 'recast'
import * as tsParser from 'recast/parsers/typescript.js'

const n = recast.types.namedTypes
const b = recast.types.builders

export const ConfiguracaoSchema = z.object({
  order: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  groups: z.array(
    z.object({
      pattern: z.string(),
      comment: z.string(),
    })
  ),
  tabWidth: z.number().optional().default(2),
  quote: z.enum(['auto', 'double', 'single']).optional().default('single'),
})

export type TConfig = z.infer<typeof ConfiguracaoSchema>

export function organizar(pCodigoFonte: string, pConfiguracao: TConfig) {
  const lAst = recast.parse(pCodigoFonte, { parser: tsParser })
  const lTodosImports: any[] = []
  const lCaminhosVistos = new Set<string>()

  // 1. Extração e De-duplicação
  lAst.program.body = lAst.program.body.filter((lNo: any) => {
    if (n.ImportDeclaration.check(lNo)) {
      const lCaminhoUnico = recast.print(lNo).code.trim()
      if (lCaminhosVistos.has(lCaminhoUnico)) return false
      lCaminhosVistos.add(lCaminhoUnico)
      lNo.comments = null
      lTodosImports.push(lNo)
      return false
    }
    return true
  })

  if (lTodosImports.length === 0) return pCodigoFonte

  // 2. Agrupamento
  const lGrupos: { [key: string]: any[] } = {}
  pConfiguracao.groups.forEach((lItem) => {
    lGrupos[lItem.comment] = []
  })
  const lOutros: any[] = []

  lTodosImports.forEach((lImport) => {
    const lCaminho = lImport.source.value as string
    const lGrupoEncontrado = pConfiguracao.groups.find((lConf) =>
      lCaminho.startsWith(lConf.pattern)
    )
    if (lGrupoEncontrado) lGrupos[lGrupoEncontrado.comment].push(lImport)
    else lOutros.push(lImport)
  })

  // 3. Ordenação
  const lOrdenarPorTamanho = (lA: any, lB: any) => {
    const lCaminhoA = lA.source.value as string
    const lCaminhoB = lB.source.value as string
    const lSentido = pConfiguracao.order === 'ASC' ? 1 : -1
    if (lCaminhoA.length !== lCaminhoB.length)
      return (lCaminhoB.length - lCaminhoA.length) * lSentido
    return lCaminhoA.localeCompare(lCaminhoB)
  }

  // 4. Reconstrução (Sem marcadores internos desta vez)
  const lNovoCabecalho: any[] = []
  pConfiguracao.groups.forEach((lConf) => {
    const lItensDoGrupo = lGrupos[lConf.comment].sort(lOrdenarPorTamanho)
    if (lItensDoGrupo.length > 0) {
      // Adicionamos um comentário único com um prefixo especial para o nosso Replace
      const lComentarioNo = b.commentLine(
        `GROUP_LABEL: ${lConf.comment}`,
        true,
        false
      )
      lItensDoGrupo[0].comments = [lComentarioNo]
      lNovoCabecalho.push(...lItensDoGrupo)
    }
  })

  if (lOutros.length > 0) {
    lOutros.sort(lOrdenarPorTamanho)
    lNovoCabecalho.push(...lOutros)
  }

  lAst.program.body.unshift(...lNovoCabecalho)

  // 5. Geração de Código
  const lResultado = recast.print(lAst, {
    tabWidth: pConfiguracao.tabWidth,
    quote: pConfiguracao.quote,
  }).code

  // 6. Refinamento de Espaçamento via Regex
  // Esse Regex encontra o nosso marcador e garante que:
  // 1. Haja uma linha em branco ANTES do comentário (se não for o topo do arquivo)
  // 2. O texto "GROUP_LABEL: " seja removido, restando apenas o comentário limpo
  return lResultado
    .replace(/\n\/\/GROUP_LABEL: /g, '\n\n// ') // Adiciona respiro entre blocos
    .replace(/^\/\/GROUP_LABEL: /g, '// ') // Trata o primeiro bloco no topo do arquivo
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Colapsa espaços triplos em duplos
    .trimStart()
}
