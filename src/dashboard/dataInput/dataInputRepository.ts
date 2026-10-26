import { findResource, type DataInputRecord, type ResourceDefinition } from './dataInputRegistry.ts'

/**
 * Read-only local adapter over the approved fixture modules. A later backend version replaces
 * these three functions with an HTTP adapter; pages and registry stay unchanged.
 */
export function resourceByKey(key: string | undefined): ResourceDefinition | undefined {
  return findResource(key)
}

export function listRecords(resource: ResourceDefinition): readonly DataInputRecord[] {
  return resource.records
}

export function getRecord(resource: ResourceDefinition, recordId: string): DataInputRecord | null {
  const identifier = resource.identifierField
  return resource.records.find((record) => String(record[identifier]) === recordId) ?? null
}
