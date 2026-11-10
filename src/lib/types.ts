import type { Tables } from './database.types'

/** A problem report and its solution, as stored in the `Report` table. */
export type Report = Tables<'Report'>

/** A report category ("base"), e.g. network or software. */
export type Base = Tables<'Base'>

/** A piece of equipment the report is about. */
export type Asset = Tables<'Asset'>

/** A family of equipment, e.g. workstation or peripheral. */
export type AssetType = Tables<'AssetType'>

/** A free keyword attached to reports. */
export type Tag = Tables<'Tag'>

/** A report with its tags embedded. */
export interface ReportWithTags extends Report {
  Tag: Tag[]
}

/** A report with every related record embedded, for the detail screen. */
export interface ReportDetail extends ReportWithTags {
  Base: Base | null
  Asset: Asset | null
  AssetType: AssetType | null
}

/** The lists used to fill the category, asset, type and tag pickers. */
export interface ReferenceData {
  bases: Base[]
  assets: Asset[]
  assetTypes: AssetType[]
  tags: Tag[]
}

/** The editable fields of a report form. */
export interface ReportInput {
  REP_libelle: string
  REP_content: string
  REP_solution: string
  AS_id: number | null
  BAS_id: number | null
  AT_id: number | null
  tagIds: number[]
}

/** The filters available on the search screen. */
export interface SearchFilters {
  text: string
  baseId: number | null
  assetId: number | null
  assetTypeId: number | null
  tagIds: number[]
}
