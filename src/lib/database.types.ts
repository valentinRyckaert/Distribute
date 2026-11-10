
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "Asset": {
                  Row: {
                    "AS_id": number,"AS_name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "AS_id"?: number,"AS_name": string
                  }
                  Update: {
                    "AS_id"?: number,"AS_name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"AssetType": {
                  Row: {
                    "AT_id": number,"AT_libelle": string
                  }
                  ComputedFields: never
                  Insert: {
                    "AT_id"?: number,"AT_libelle": string
                  }
                  Update: {
                    "AT_id"?: number,"AT_libelle"?: string
                  }
                  Relationships: [
                    
                  ]
                },"Base": {
                  Row: {
                    "BAS_description": string,"BAS_icon": string,"BAS_id": number,"BAS_libelle": string
                  }
                  ComputedFields: never
                  Insert: {
                    "BAS_description"?: string,"BAS_icon"?: string,"BAS_id"?: number,"BAS_libelle": string
                  }
                  Update: {
                    "BAS_description"?: string,"BAS_icon"?: string,"BAS_id"?: number,"BAS_libelle"?: string
                  }
                  Relationships: [
                    
                  ]
                },"CallbackRequest": {
                  Row: {
                    "CB_created_at": string,"CB_done": boolean,"CB_id": number,"CB_message": string,"CB_phone": string,"REP_id": number | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "CB_created_at"?: string,"CB_done"?: boolean,"CB_id"?: number,"CB_message"?: string,"CB_phone": string,"REP_id"?: number | null,"user_id"?: string
                  }
                  Update: {
                    "CB_created_at"?: string,"CB_done"?: boolean,"CB_id"?: number,"CB_message"?: string,"CB_phone"?: string,"REP_id"?: number | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "CallbackRequest_REP_id_fkey"
      columns: ["REP_id"]
isOneToOne: false
      referencedRelation: "Report"
      referencedColumns: ["REP_id"]
    }
                  ]
                },"Comment": {
                  Row: {
                    "COM_content": string,"COM_created_at": string,"COM_id": number,"REP_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "COM_content": string,"COM_created_at"?: string,"COM_id"?: number,"REP_id": number,"user_id"?: string
                  }
                  Update: {
                    "COM_content"?: string,"COM_created_at"?: string,"COM_id"?: number,"REP_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "Comment_REP_id_fkey"
      columns: ["REP_id"]
isOneToOne: false
      referencedRelation: "Report"
      referencedColumns: ["REP_id"]
    }
                  ]
                },"Favorite": {
                  Row: {
                    "REP_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "REP_id": number,"user_id"?: string
                  }
                  Update: {
                    "REP_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "Favorite_REP_id_fkey"
      columns: ["REP_id"]
isOneToOne: false
      referencedRelation: "Report"
      referencedColumns: ["REP_id"]
    }
                  ]
                },"Notification": {
                  Row: {
                    "NOT_created_at": string,"NOT_id": number,"NOT_message": string,"NOT_read": boolean,"REP_id": number | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "NOT_created_at"?: string,"NOT_id"?: number,"NOT_message": string,"NOT_read"?: boolean,"REP_id"?: number | null,"user_id": string
                  }
                  Update: {
                    "NOT_created_at"?: string,"NOT_id"?: number,"NOT_message"?: string,"NOT_read"?: boolean,"REP_id"?: number | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "Notification_REP_id_fkey"
      columns: ["REP_id"]
isOneToOne: false
      referencedRelation: "Report"
      referencedColumns: ["REP_id"]
    }
                  ]
                },"Report": {
                  Row: {
                    "AS_id": number | null,"AT_id": number | null,"BAS_id": number | null,"REP_content": string,"REP_created_at": string,"REP_duplicate_of": number | null,"REP_helped_count": number,"REP_id": number,"REP_is_solution_validated": boolean,"REP_libelle": string,"REP_notify": boolean,"REP_photo_path": string | null,"REP_search": unknown,"REP_since": string | null,"REP_solution": string | null,"REP_solution_by": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "AS_id"?: number | null,"AT_id"?: number | null,"BAS_id"?: number | null,"REP_content": string,"REP_created_at"?: string,"REP_duplicate_of"?: number | null,"REP_helped_count"?: number,"REP_id"?: number,"REP_is_solution_validated"?: boolean,"REP_libelle": string,"REP_notify"?: boolean,"REP_photo_path"?: string | null,"REP_search"?: never,"REP_since"?: string | null,"REP_solution"?: string | null,"REP_solution_by"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "AS_id"?: number | null,"AT_id"?: number | null,"BAS_id"?: number | null,"REP_content"?: string,"REP_created_at"?: string,"REP_duplicate_of"?: number | null,"REP_helped_count"?: number,"REP_id"?: number,"REP_is_solution_validated"?: boolean,"REP_libelle"?: string,"REP_notify"?: boolean,"REP_photo_path"?: string | null,"REP_search"?: never,"REP_since"?: string | null,"REP_solution"?: string | null,"REP_solution_by"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "Report_AS_id_fkey"
      columns: ["AS_id"]
isOneToOne: false
      referencedRelation: "Asset"
      referencedColumns: ["AS_id"]
    },{
      foreignKeyName: "Report_AT_id_fkey"
      columns: ["AT_id"]
isOneToOne: false
      referencedRelation: "AssetType"
      referencedColumns: ["AT_id"]
    },{
      foreignKeyName: "Report_BAS_id_fkey"
      columns: ["BAS_id"]
isOneToOne: false
      referencedRelation: "Base"
      referencedColumns: ["BAS_id"]
    },{
      foreignKeyName: "Report_REP_duplicate_of_fkey"
      columns: ["REP_duplicate_of"]
isOneToOne: false
      referencedRelation: "Report"
      referencedColumns: ["REP_id"]
    }
                  ]
                },"ReportFeedback": {
                  Row: {
                    "FB_created_at": string,"FB_worked": boolean,"REP_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "FB_created_at"?: string,"FB_worked": boolean,"REP_id": number,"user_id"?: string
                  }
                  Update: {
                    "FB_created_at"?: string,"FB_worked"?: boolean,"REP_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "ReportFeedback_REP_id_fkey"
      columns: ["REP_id"]
isOneToOne: false
      referencedRelation: "Report"
      referencedColumns: ["REP_id"]
    }
                  ]
                },"ReportHasTag": {
                  Row: {
                    "REP_id": number,"TAG_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "REP_id": number,"TAG_id": number
                  }
                  Update: {
                    "REP_id"?: number,"TAG_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "ReportHasTag_REP_id_fkey"
      columns: ["REP_id"]
isOneToOne: false
      referencedRelation: "Report"
      referencedColumns: ["REP_id"]
    },{
      foreignKeyName: "ReportHasTag_TAG_id_fkey"
      columns: ["TAG_id"]
isOneToOne: false
      referencedRelation: "Tag"
      referencedColumns: ["TAG_id"]
    }
                  ]
                },"Tag": {
                  Row: {
                    "TAG_id": number,"TAG_libelle": string
                  }
                  ComputedFields: never
                  Insert: {
                    "TAG_id"?: number,"TAG_libelle": string
                  }
                  Update: {
                    "TAG_id"?: number,"TAG_libelle"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"propose_solution":
{ Args: { "report_id": number,"solution": string }; Returns: undefined
                           },
"search_reports":
{ Args: { "query": string }; Returns: {
              "AS_id": number | null,
"AT_id": number | null,
"BAS_id": number | null,
"REP_content": string,
"REP_created_at": string,
"REP_duplicate_of": number | null,
"REP_helped_count": number,
"REP_id": number,
"REP_is_solution_validated": boolean,
"REP_libelle": string,
"REP_notify": boolean,
"REP_photo_path": string | null,
"REP_search": unknown,
"REP_since": string | null,
"REP_solution": string | null,
"REP_solution_by": string | null,
"user_id": string | null
            }[]
                          SetofOptions: {
        from: "*"
        to: "Report"
        isOneToOne: false
        isSetofReturn: true
      } },
"unaccent_fr":
{ Args: { "value": string }; Returns: string
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
