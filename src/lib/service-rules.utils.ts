/**
 * Service combination rules — warns about incompatible or redundant service combos.
 * These are soft warnings (not hard blocks), shown to the client before confirming.
 */
import type { Service } from '../types'
import { SERVICE_WARNING_RULES } from './constants'

export interface ServiceCombinationWarning {
  message: string
}

/**
 * Returns all applicable warnings for the given service selection.
 * Returns an empty array if the combination is fine.
 */
export function getServiceCombinationWarnings(
  selected: Service[],
): ServiceCombinationWarning[] {
  const selectedNames = new Set(selected.map((s) => s.name))
  const warnings: ServiceCombinationWarning[] = []

  for (const rule of SERVICE_WARNING_RULES) {
    const allPresent = rule.services.every((name) => selectedNames.has(name))
    if (allPresent) {
      warnings.push({ message: rule.message })
    }
  }

  return warnings
}
