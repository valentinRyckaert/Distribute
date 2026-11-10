/** A problem report and its solution, as stored in the `Report` table. */
export interface Report {
  REP_id: number
  REP_created_at: string
  REP_libelle: string
  REP_content: string
  REP_solution: string | null
  REP_is_solution_validated: boolean
  AS_id: number | null
  BAS_id: number | null
  AT_id: number | null
  user_id: string | null
}

/** A report category ("base"), e.g. network or software. */
export interface Base {
  BAS_id: number
  BAS_libelle: string
}

/** A piece of equipment the report is about. */
export interface Asset {
  AS_id: number
  AS_name: string
}

/** A family of equipment, e.g. workstation or peripheral. */
export interface AssetType {
  AT_id: number
  AT_libelle: string
}

/** A free keyword attached to reports. */
export interface Tag {
  TAG_id: number
  TAG_libelle: string
}

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
