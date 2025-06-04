export interface Report {
  REP_created_at: string;
  REP_id: number;
  REP_libelle: string;
  REP_content: string;
  REP_solution: string;
  REP_is_solution_validated: boolean;
  AS_id: number | null;
  BAS_id: number | null;
  AT_id: number | null;
  user_id: string;
}

export interface Category {
  BAS_id: number;
  BAS_libelle: string;
}

export interface Base {
  BAS_id: number;
  BAS_libelle: string;
}

export interface Asset {
  AS_id: number;
  AS_name: string;
}

export interface AssetType {
  AT_id: number;
  AT_libelle: string;
}

export interface Tag {
  TAG_id: number;
  TAG_libelle: string;
}