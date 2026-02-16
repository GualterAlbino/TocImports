#!/usr/bin/env node

// Nativo
import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import { Command } from 'commander'

// Services
import { organizar, TConfig, ConfiguracaoSchema } from './organizer'

// Libs
import { z } from 'zod'

const program = new Command()

/**
 * Carrega as configurações do arquivo JSON ou retorna o padrão.
 */
function carregarConfiguracao(): TConfig {
  const lCaminhoConfig = path.join(process.cwd(), 'TocImports.json')

  const lConfigPadrao: TConfig = {
    order: 'DESC',
    quote: 'single',
    tabWidth: 2,
    groups: [
      { pattern: '@components', comment: 'Componnets' },
      { pattern: '@service', comment: 'Services' },
      { pattern: '@domain', comment: 'Domain' },
      { pattern: '@infra', comment: 'Infrastructure' },
      { pattern: '', comment: 'Outros' },
    ],
  }

  if (!fs.existsSync(lCaminhoConfig)) return lConfigPadrao

  try {
    const lConteudo = fs.readFileSync(lCaminhoConfig, 'utf-8')
    const lJson = JSON.parse(lConteudo)

    // Validação automática com Zod
    return ConfiguracaoSchema.parse(lJson)
  } catch (lErro) {
    if (lErro instanceof z.ZodError) {
      console.error('❌ Erro de validação no TocImports.json:')
      lErro.issues.forEach((lIssue) => {
        const lCaminho = lIssue.path.join('.')
        console.error(`   - Campo [${lCaminho}]: ${lIssue.message}`)
      })
      console.error('❌ Será utilizada a configuração default da biblioteca.')
    } else {
      console.error('❌ Erro inesperado ao ler arquivo de configuração.')
    }
    return lConfigPadrao
  }
}

program
  .name('toc-imports')
  .argument('<path>', 'Caminho dos arquivos (ex: "src/**/*.ts")')
  .action(async (pPadraoArquivo) => {
    const lConfiguracao = carregarConfiguracao()

    try {
      const lArquivos = await glob(pPadraoArquivo)

      if (lArquivos.length === 0) {
        console.warn('⚠️ Nenhum arquivo encontrado para o padrão informado.')
        return
      }

      lArquivos.forEach((lArquivo) => {
        const lCaminhoAbsoluto = path.resolve(lArquivo)
        const lConteudoOriginal = fs.readFileSync(lCaminhoAbsoluto, 'utf-8')
        const lConteudoOrganizado = organizar(lConteudoOriginal, lConfiguracao)

        fs.writeFileSync(lCaminhoAbsoluto, lConteudoOrganizado, 'utf-8')
        console.log(`✨ Arquivo organizado: "${lArquivo}"`)
      })
    } catch (lErro) {
      console.error('❌ Erro ao processar arquivos:', lErro)
    }
  })

program.parse()
