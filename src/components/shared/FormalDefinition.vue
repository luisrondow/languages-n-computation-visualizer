<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutomatonType } from '../../types/automata'
import type {
  DfaDefinition,
  NfaDefinition,
  EnfaDefinition,
  PdaDefinition,
  TmDefinition,
} from '../../types/automata'
import { useAutomatonStore } from '../../stores/automaton'

const props = defineProps<{
  type: AutomatonType
}>()

const { t } = useI18n()
const store = useAutomatonStore()

const def = computed(() => store.definitions[props.type])

const stateLabels = computed(() => def.value.states.map(s => s.label))
const startLabel = computed(() => {
  const s = def.value.states.find(s => s.id === def.value.startState)
  return s?.label ?? ''
})
const acceptLabels = computed(() =>
  def.value.acceptStates
    .map(id => def.value.states.find(s => s.id === id)?.label)
    .filter(Boolean) as string[]
)

const alphabet = computed(() => {
  const d = def.value
  if (d.type === 'pda') return d.inputAlphabet
  if (d.type === 'turing') return d.inputAlphabet
  return d.alphabet
})

const isEmpty = computed(() => def.value.states.length === 0 && alphabet.value.length === 0)

function tt(key: string): string {
  return t(`formalDef.tooltips.${key}`)
}

function stateLabel(id: string): string {
  return def.value.states.find(s => s.id === id)?.label ?? id
}

function isInitial(label: string): boolean {
  return label === startLabel.value
}

function isAccepting(label: string): boolean {
  return acceptLabels.value.includes(label)
}

function statePrefix(label: string): string {
  const init = isInitial(label)
  const acc = isAccepting(label)
  if (init && acc) return '\u2192*'
  if (init) return '\u2192 '
  if (acc) return ' *'
  return '  '
}

// --- DFA transition table ---
const dfaTable = computed(() => {
  if (def.value.type !== 'dfa') return null
  const d = def.value as DfaDefinition
  const symbols = d.alphabet
  const rows = d.states.map(state => {
    const cells: Record<string, string> = {}
    for (const sym of symbols) {
      const tr = d.transitions.find(t => t.from === state.id && t.symbol === sym)
      cells[sym] = tr ? stateLabel(tr.to) : '\u2014'
    }
    return { label: state.label, cells }
  })
  return { symbols, rows }
})

// --- NFA transition table ---
const nfaTable = computed(() => {
  if (def.value.type !== 'nfa') return null
  const d = def.value as NfaDefinition
  const symbols = d.alphabet
  const rows = d.states.map(state => {
    const cells: Record<string, string> = {}
    for (const sym of symbols) {
      const matching = d.transitions.filter(t => t.from === state.id && t.symbol === sym)
      const targets = [...new Set(matching.flatMap(t => t.to))]
      cells[sym] = targets.length > 0
        ? `{${targets.map(id => stateLabel(id)).join(', ')}}`
        : '\u2205'
    }
    return { label: state.label, cells }
  })
  return { symbols, rows }
})

// --- e-NFA transition table ---
const enfaTable = computed(() => {
  if (def.value.type !== 'enfa') return null
  const d = def.value as EnfaDefinition
  const symbols = [...d.alphabet, null] as (string | null)[]
  const rows = d.states.map(state => {
    const cells: Record<string, string> = {}
    for (const sym of symbols) {
      const key = sym === null ? '\u03B5' : sym
      const matching = d.transitions.filter(t => t.from === state.id && t.symbol === sym)
      const targets = [...new Set(matching.flatMap(t => t.to))]
      cells[key] = targets.length > 0
        ? `{${targets.map(id => stateLabel(id)).join(', ')}}`
        : '\u2205'
    }
    return { label: state.label, cells }
  })
  const headers = [...d.alphabet, '\u03B5']
  return { symbols: headers, rows }
})

// --- PDA transition rules ---
const pdaRules = computed(() => {
  if (def.value.type !== 'pda') return null
  const d = def.value as PdaDefinition
  const grouped = new Map<string, { to: string; push: string[] }[]>()
  for (const tr of d.transitions) {
    const sym = tr.symbol === null ? '\u03B5' : tr.symbol
    const key = `${stateLabel(tr.from)},${sym},${tr.stackTop}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push({
      to: stateLabel(tr.to),
      push: tr.stackPush,
    })
  }
  return Array.from(grouped.entries()).map(([key, targets]) => {
    const [from, sym, stackTop] = key.split(',')
    const inner = targets
      .map(t => `(${t.to}, ${t.push.length > 0 ? t.push.join('') : '\u03B5'})`)
      .join(', ')
    return { from, sym, stackTop, targetStr: `\u007B${inner}\u007D` }
  })
})

// --- TM transition rules ---
const tmRules = computed(() => {
  if (def.value.type !== 'turing') return null
  const d = def.value as TmDefinition
  return d.transitions.map(tr => ({
    from: stateLabel(tr.from),
    read: tr.read,
    to: stateLabel(tr.to),
    write: tr.write,
    move: tr.move,
  }))
})

const rejectLabels = computed(() => {
  if (def.value.type !== 'turing') return []
  const d = def.value as TmDefinition
  return d.rejectStates
    .map(id => d.states.find(s => s.id === id)?.label)
    .filter(Boolean) as string[]
})

const stackAlphabet = computed(() => {
  if (def.value.type !== 'pda') return []
  return def.value.stackAlphabet
})

const initialStackSymbol = computed(() => {
  if (def.value.type !== 'pda') return ''
  return def.value.initialStackSymbol
})

const tapeAlphabet = computed(() => {
  if (def.value.type !== 'turing') return []
  return def.value.tapeAlphabet
})

// Tooltip state
const tooltip = reactive({ text: '', x: 0, y: 0, visible: false })

function onSymOver(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest?.('.sym-tip') as HTMLElement | null
  if (!el) {
    tooltip.visible = false
    return
  }
  const text = el.dataset.tooltip
  if (!text) return
  const rect = el.getBoundingClientRect()
  tooltip.text = text
  tooltip.x = rect.left + rect.width / 2
  tooltip.y = rect.top - 6
  tooltip.visible = true
}

function onSymOut(e: MouseEvent) {
  const related = e.relatedTarget as HTMLElement | null
  if (related?.closest?.('.sym-tip')) return
  tooltip.visible = false
}
</script>

<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-300 mb-2">{{ t('formalDef.title') }}</h3>
    <div
      class="formal-def rounded-lg bg-surface-deep border border-border-default p-3 font-mono text-sm space-y-3 max-h-48 overflow-y-auto"
      @mouseover="onSymOver"
      @mouseout="onSymOut"
    >
      <!-- Empty state -->
      <p v-if="isEmpty" class="text-gray-500 italic">
        {{ t('formalDef.empty') }}
      </p>

      <template v-else>
        <!-- === DFA === -->
        <template v-if="type === 'dfa'">
          <div class="leading-relaxed">
            <span class="text-accent-cyan sym-tip" :data-tooltip="tt('mapsTo')">M</span>
            <span class="text-gray-400"> = (</span>
            <span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span><span class="text-gray-400">, </span>
            <span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span><span class="text-gray-400">, </span>
            <span class="text-accent-purple sym-tip" :data-tooltip="tt('delta')">&delta;</span><span class="text-gray-400">, </span>
            <span class="text-accent-green sym-tip" :data-tooltip="tt('q0')">q&#x2080;</span><span class="text-gray-400">, </span>
            <span class="text-accent-green sym-tip" :data-tooltip="tt('F')">F</span>
            <span class="text-gray-400">)</span>
          </div>
          <div class="text-gray-300 leading-relaxed space-y-0.5">
            <div><span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span><span class="text-gray-400"> = </span>{<span v-for="(s, i) in stateLabels" :key="s">{{ i > 0 ? ', ' : '' }}{{ s }}</span>}</div>
            <div><span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span><span class="text-gray-400"> = </span>{<span v-for="(a, i) in alphabet" :key="a">{{ i > 0 ? ', ' : '' }}{{ a }}</span>}</div>
            <div><span class="text-accent-green sym-tip" :data-tooltip="tt('q0')">q&#x2080;</span><span class="text-gray-400"> = </span>{{ startLabel || '\u2014' }}</div>
            <div><span class="text-accent-green sym-tip" :data-tooltip="tt('F')">F</span><span class="text-gray-400"> = </span>{<span v-for="(a, i) in acceptLabels" :key="a">{{ i > 0 ? ', ' : '' }}{{ a }}</span>}</div>
          </div>
          <div>
            <div class="text-gray-400 mb-1">
              <span class="text-accent-purple sym-tip" :data-tooltip="tt('delta')">&delta;</span>: <span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span> <span class="sym-tip" :data-tooltip="tt('cartesian')">&times;</span> <span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span> <span class="sym-tip" :data-tooltip="tt('mapsTo')">&rarr;</span> <span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span>
            </div>
            <table v-if="dfaTable && dfaTable.rows.length > 0" class="w-full text-xs border-collapse">
              <thead>
                <tr class="text-yellow-400">
                  <th class="text-left pr-2 py-0.5 text-gray-500 border-b border-border-default"></th>
                  <th v-for="sym in dfaTable.symbols" :key="sym" class="text-center px-2 py-0.5 border-b border-border-default">{{ sym }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in dfaTable.rows" :key="row.label" class="text-gray-300">
                  <td class="text-left pr-2 py-0.5 whitespace-nowrap">
                    <span class="text-accent-green text-[10px]">{{ statePrefix(row.label) }}</span>
                    <span class="text-accent-blue">{{ row.label }}</span>
                  </td>
                  <td v-for="sym in dfaTable.symbols" :key="sym" class="text-center px-2 py-0.5">{{ row.cells[sym] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- === NFA === -->
        <template v-if="type === 'nfa'">
          <div class="leading-relaxed">
            <span class="text-accent-cyan sym-tip" :data-tooltip="tt('mapsTo')">M</span>
            <span class="text-gray-400"> = (</span>
            <span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span><span class="text-gray-400">, </span>
            <span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span><span class="text-gray-400">, </span>
            <span class="text-accent-purple sym-tip" :data-tooltip="tt('delta')">&delta;</span><span class="text-gray-400">, </span>
            <span class="text-accent-green sym-tip" :data-tooltip="tt('q0')">q&#x2080;</span><span class="text-gray-400">, </span>
            <span class="text-accent-green sym-tip" :data-tooltip="tt('F')">F</span>
            <span class="text-gray-400">)</span>
          </div>
          <div class="text-gray-300 leading-relaxed space-y-0.5">
            <div><span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span><span class="text-gray-400"> = </span>{<span v-for="(s, i) in stateLabels" :key="s">{{ i > 0 ? ', ' : '' }}{{ s }}</span>}</div>
            <div><span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span><span class="text-gray-400"> = </span>{<span v-for="(a, i) in alphabet" :key="a">{{ i > 0 ? ', ' : '' }}{{ a }}</span>}</div>
            <div><span class="text-accent-green sym-tip" :data-tooltip="tt('q0')">q&#x2080;</span><span class="text-gray-400"> = </span>{{ startLabel || '\u2014' }}</div>
            <div><span class="text-accent-green sym-tip" :data-tooltip="tt('F')">F</span><span class="text-gray-400"> = </span>{<span v-for="(a, i) in acceptLabels" :key="a">{{ i > 0 ? ', ' : '' }}{{ a }}</span>}</div>
          </div>
          <div>
            <div class="text-gray-400 mb-1">
              <span class="text-accent-purple sym-tip" :data-tooltip="tt('delta')">&delta;</span>: <span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span> <span class="sym-tip" :data-tooltip="tt('cartesian')">&times;</span> <span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span> <span class="sym-tip" :data-tooltip="tt('mapsTo')">&rarr;</span> <span class="sym-tip" :data-tooltip="tt('powerSet')">&weierp;(<span class="text-accent-blue">Q</span>)</span>
            </div>
            <table v-if="nfaTable && nfaTable.rows.length > 0" class="w-full text-xs border-collapse">
              <thead>
                <tr class="text-yellow-400">
                  <th class="text-left pr-2 py-0.5 text-gray-500 border-b border-border-default"></th>
                  <th v-for="sym in nfaTable.symbols" :key="sym" class="text-center px-2 py-0.5 border-b border-border-default">{{ sym }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in nfaTable.rows" :key="row.label" class="text-gray-300">
                  <td class="text-left pr-2 py-0.5 whitespace-nowrap">
                    <span class="text-accent-green text-[10px]">{{ statePrefix(row.label) }}</span>
                    <span class="text-accent-blue">{{ row.label }}</span>
                  </td>
                  <td v-for="sym in nfaTable.symbols" :key="sym" class="text-center px-2 py-0.5">{{ row.cells[sym] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- === e-NFA === -->
        <template v-if="type === 'enfa'">
          <div class="leading-relaxed">
            <span class="text-accent-cyan sym-tip" :data-tooltip="tt('mapsTo')">M</span>
            <span class="text-gray-400"> = (</span>
            <span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span><span class="text-gray-400">, </span>
            <span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span><span class="text-gray-400">, </span>
            <span class="text-accent-purple sym-tip" :data-tooltip="tt('delta')">&delta;</span><span class="text-gray-400">, </span>
            <span class="text-accent-green sym-tip" :data-tooltip="tt('q0')">q&#x2080;</span><span class="text-gray-400">, </span>
            <span class="text-accent-green sym-tip" :data-tooltip="tt('F')">F</span>
            <span class="text-gray-400">)</span>
          </div>
          <div class="text-gray-300 leading-relaxed space-y-0.5">
            <div><span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span><span class="text-gray-400"> = </span>{<span v-for="(s, i) in stateLabels" :key="s">{{ i > 0 ? ', ' : '' }}{{ s }}</span>}</div>
            <div><span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span><span class="text-gray-400"> = </span>{<span v-for="(a, i) in alphabet" :key="a">{{ i > 0 ? ', ' : '' }}{{ a }}</span>}</div>
            <div><span class="text-accent-green sym-tip" :data-tooltip="tt('q0')">q&#x2080;</span><span class="text-gray-400"> = </span>{{ startLabel || '\u2014' }}</div>
            <div><span class="text-accent-green sym-tip" :data-tooltip="tt('F')">F</span><span class="text-gray-400"> = </span>{<span v-for="(a, i) in acceptLabels" :key="a">{{ i > 0 ? ', ' : '' }}{{ a }}</span>}</div>
          </div>
          <div>
            <div class="text-gray-400 mb-1">
              <span class="text-accent-purple sym-tip" :data-tooltip="tt('delta')">&delta;</span>: <span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span> <span class="sym-tip" :data-tooltip="tt('cartesian')">&times;</span> (<span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span> <span class="sym-tip" :data-tooltip="tt('union')">&cup;</span> {<span class="sym-tip" :data-tooltip="tt('epsilon')">&epsilon;</span>}) <span class="sym-tip" :data-tooltip="tt('mapsTo')">&rarr;</span> <span class="sym-tip" :data-tooltip="tt('powerSet')">&weierp;(<span class="text-accent-blue">Q</span>)</span>
            </div>
            <table v-if="enfaTable && enfaTable.rows.length > 0" class="w-full text-xs border-collapse">
              <thead>
                <tr class="text-yellow-400">
                  <th class="text-left pr-2 py-0.5 text-gray-500 border-b border-border-default"></th>
                  <th v-for="sym in enfaTable.symbols" :key="sym" class="text-center px-2 py-0.5 border-b border-border-default">
                    <span v-if="sym === '\u03B5'" class="sym-tip" :data-tooltip="tt('epsilon')">{{ sym }}</span>
                    <span v-else>{{ sym }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in enfaTable.rows" :key="row.label" class="text-gray-300">
                  <td class="text-left pr-2 py-0.5 whitespace-nowrap">
                    <span class="text-accent-green text-[10px]">{{ statePrefix(row.label) }}</span>
                    <span class="text-accent-blue">{{ row.label }}</span>
                  </td>
                  <td v-for="sym in enfaTable.symbols" :key="sym" class="text-center px-2 py-0.5">{{ row.cells[sym] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- === PDA === -->
        <template v-if="type === 'pda'">
          <div class="leading-relaxed">
            <span class="text-accent-cyan sym-tip" :data-tooltip="tt('mapsTo')">M</span>
            <span class="text-gray-400"> = (</span>
            <span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span><span class="text-gray-400">, </span>
            <span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span><span class="text-gray-400">, </span>
            <span class="text-accent-purple sym-tip" :data-tooltip="tt('gamma')">&Gamma;</span><span class="text-gray-400">, </span>
            <span class="text-accent-purple sym-tip" :data-tooltip="tt('delta')">&delta;</span><span class="text-gray-400">, </span>
            <span class="text-accent-green sym-tip" :data-tooltip="tt('q0')">q&#x2080;</span><span class="text-gray-400">, </span>
            <span class="text-accent-purple sym-tip" :data-tooltip="tt('Z0')">Z&#x2080;</span><span class="text-gray-400">, </span>
            <span class="text-accent-green sym-tip" :data-tooltip="tt('F')">F</span>
            <span class="text-gray-400">)</span>
          </div>
          <div class="text-gray-300 leading-relaxed space-y-0.5">
            <div><span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span><span class="text-gray-400"> = </span>{<span v-for="(s, i) in stateLabels" :key="s">{{ i > 0 ? ', ' : '' }}{{ s }}</span>}</div>
            <div><span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span><span class="text-gray-400"> = </span>{<span v-for="(a, i) in alphabet" :key="a">{{ i > 0 ? ', ' : '' }}{{ a }}</span>}</div>
            <div><span class="text-accent-purple sym-tip" :data-tooltip="tt('gamma')">&Gamma;</span><span class="text-gray-400"> = </span>{<span v-for="(s, i) in stackAlphabet" :key="s">{{ i > 0 ? ', ' : '' }}{{ s }}</span>}</div>
            <div><span class="text-accent-green sym-tip" :data-tooltip="tt('q0')">q&#x2080;</span><span class="text-gray-400"> = </span>{{ startLabel || '\u2014' }}</div>
            <div><span class="text-accent-purple sym-tip" :data-tooltip="tt('Z0')">Z&#x2080;</span><span class="text-gray-400"> = </span>{{ initialStackSymbol || '\u2014' }}</div>
            <div><span class="text-accent-green sym-tip" :data-tooltip="tt('F')">F</span><span class="text-gray-400"> = </span>{<span v-for="(a, i) in acceptLabels" :key="a">{{ i > 0 ? ', ' : '' }}{{ a }}</span>}</div>
          </div>
          <div>
            <div class="text-gray-400 mb-1">{{ t('formalDef.transitionFunction') }}:</div>
            <div v-if="pdaRules && pdaRules.length > 0" class="space-y-0.5">
              <div v-for="(rule, i) in pdaRules" :key="i" class="text-gray-300">
                <span class="text-accent-purple">&delta;</span>(<span class="text-accent-blue">{{ rule.from }}</span>, <span class="text-yellow-400">{{ rule.sym }}</span>, <span class="text-accent-purple">{{ rule.stackTop }}</span>) = {{ rule.targetStr }}
              </div>
            </div>
            <div v-else class="text-gray-500 italic text-xs">{{ t('editor.noTransitions') }}</div>
          </div>
        </template>

        <!-- === Turing Machine === -->
        <template v-if="type === 'turing'">
          <div class="leading-relaxed">
            <span class="text-accent-cyan sym-tip" :data-tooltip="tt('mapsTo')">M</span>
            <span class="text-gray-400"> = (</span>
            <span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span><span class="text-gray-400">, </span>
            <span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span><span class="text-gray-400">, </span>
            <span class="text-accent-purple sym-tip" :data-tooltip="tt('gammaT')">&Gamma;</span><span class="text-gray-400">, </span>
            <span class="text-accent-purple sym-tip" :data-tooltip="tt('delta')">&delta;</span><span class="text-gray-400">, </span>
            <span class="text-accent-green sym-tip" :data-tooltip="tt('q0')">q&#x2080;</span><span class="text-gray-400">, </span>
            <span class="text-accent-green sym-tip" :data-tooltip="tt('qAccept')">q<sub>accept</sub></span><span class="text-gray-400">, </span>
            <span class="text-accent-red sym-tip" :data-tooltip="tt('qReject')">q<sub>reject</sub></span>
            <span class="text-gray-400">)</span>
          </div>
          <div class="text-gray-300 leading-relaxed space-y-0.5">
            <div><span class="text-accent-blue sym-tip" :data-tooltip="tt('Q')">Q</span><span class="text-gray-400"> = </span>{<span v-for="(s, i) in stateLabels" :key="s">{{ i > 0 ? ', ' : '' }}{{ s }}</span>}</div>
            <div><span class="text-yellow-400 sym-tip" :data-tooltip="tt('sigma')">&Sigma;</span><span class="text-gray-400"> = </span>{<span v-for="(a, i) in alphabet" :key="a">{{ i > 0 ? ', ' : '' }}{{ a }}</span>}</div>
            <div><span class="text-accent-purple sym-tip" :data-tooltip="tt('gammaT')">&Gamma;</span><span class="text-gray-400"> = </span>{<span v-for="(s, i) in tapeAlphabet" :key="s">{{ i > 0 ? ', ' : '' }}{{ s }}</span>}</div>
            <div><span class="text-accent-green sym-tip" :data-tooltip="tt('q0')">q&#x2080;</span><span class="text-gray-400"> = </span>{{ startLabel || '\u2014' }}</div>
            <div><span class="text-accent-green sym-tip" :data-tooltip="tt('qAccept')">q<sub>accept</sub></span><span class="text-gray-400"> = </span>{<span v-for="(a, i) in acceptLabels" :key="a">{{ i > 0 ? ', ' : '' }}{{ a }}</span>}</div>
            <div><span class="text-accent-red sym-tip" :data-tooltip="tt('qReject')">q<sub>reject</sub></span><span class="text-gray-400"> = </span>{<span v-for="(r, i) in rejectLabels" :key="r">{{ i > 0 ? ', ' : '' }}{{ r }}</span>}</div>
          </div>
          <div>
            <div class="text-gray-400 mb-1">{{ t('formalDef.transitionFunction') }}:</div>
            <div v-if="tmRules && tmRules.length > 0" class="space-y-0.5">
              <div v-for="(rule, i) in tmRules" :key="i" class="text-gray-300">
                <span class="text-accent-purple">&delta;</span>(<span class="text-accent-blue">{{ rule.from }}</span>, <span class="text-yellow-400">{{ rule.read }}</span>) = (<span class="text-accent-blue">{{ rule.to }}</span>, <span class="text-yellow-400">{{ rule.write }}</span>, {{ rule.move }})
              </div>
            </div>
            <div v-else class="text-gray-500 italic text-xs">{{ t('editor.noTransitions') }}</div>
          </div>
        </template>
      </template>
    </div>

    <Teleport to="body">
      <div
        v-show="tooltip.visible"
        class="formal-tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        {{ tooltip.text }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.formal-def .sym-tip {
  cursor: help;
  border-bottom: 1px dotted currentColor;
}
</style>

<style>
.formal-tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  padding: 4px 10px;
  border-radius: 6px;
  background: #1f1f1f;
  border: 1px solid #333333;
  color: #d1d5db;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;
}
</style>
