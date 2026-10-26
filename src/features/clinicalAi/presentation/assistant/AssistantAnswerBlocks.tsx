import type { AnswerBlock, AssistantSource } from '../../domain/assistant.ts'
import type { CitationDetail } from '../SourceDialog.tsx'

function exhaustive(value: never): never {
  throw new Error(`Unknown answer block: ${String(value)}`)
}

export function AssistantAnswerBlocks({ blocks, sources, onSource }: {
  blocks: AnswerBlock[]
  sources: AssistantSource[]
  onSource: (detail: CitationDetail) => void
}) {
  return <div className="clinical-answer-blocks">{blocks.map((block, index) => {
    switch (block.type) {
      case 'text': return <p key={index}>{block.text}</p>
      case 'keyPoints': return <section key={index}><h3>{block.heading}</h3><dl className="clinical-facts">
        {block.items.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
      </dl></section>
      case 'soap': return <dl key={index} className="clinical-soap">{block.rows.map(row =>
        <div key={row.letter}><dt>{row.letter} · {row.label}</dt><dd>{row.value}</dd></div>)}</dl>
      case 'excerpts': return <ul key={index} className="clinical-excerpts">{block.rows.map((row, rowIndex) => {
        const source = sources.find(item => item.sourceId === row.sourceId)
        return <li key={`${row.sourceId}-${rowIndex}`}>
          <time>{row.dateLabel}</time><strong>{row.title}</strong><p>{row.value}</p>
          {source && <button type="button" onClick={() => onSource({
            title: source.title, subtitle: `${source.kind} · ${source.dateLabel}`,
            description: source.summary,
          })}>Source {source.marker}</button>}
        </li>
      })}</ul>
      default: return exhaustive(block)
    }
  })}</div>
}
