
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
            "admin_audit_log": {
                  Row: {
                    "action": string,"admin_id": string | null,"created_at": string,"details": NonNullable<Json>,"id": number,"target_id": string | null,"target_table": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"admin_id"?: string | null,"created_at"?: string,"details"?: NonNullable<Json>,"id"?: never,"target_id"?: string | null,"target_table": string
                  }
                  Update: {
                    "action"?: string,"admin_id"?: string | null,"created_at"?: string,"details"?: NonNullable<Json>,"id"?: never,"target_id"?: string | null,"target_table"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "admin_audit_log_admin_id_fkey"
      columns: ["admin_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"animal_documents": {
                  Row: {
                    "animal_id": string,"created_at": string,"id": string,"label": string | null,"storage_path": string
                  }
                  ComputedFields: never
                  Insert: {
                    "animal_id": string,"created_at"?: string,"id"?: string,"label"?: string | null,"storage_path": string
                  }
                  Update: {
                    "animal_id"?: string,"created_at"?: string,"id"?: string,"label"?: string | null,"storage_path"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "animal_documents_animal_id_fkey"
      columns: ["animal_id"]
isOneToOne: false
      referencedRelation: "animals"
      referencedColumns: ["id"]
    }
                  ]
                },"animal_images": {
                  Row: {
                    "animal_id": string,"created_at": string,"id": string,"sort_order": number,"storage_path": string
                  }
                  ComputedFields: never
                  Insert: {
                    "animal_id": string,"created_at"?: string,"id"?: string,"sort_order"?: number,"storage_path": string
                  }
                  Update: {
                    "animal_id"?: string,"created_at"?: string,"id"?: string,"sort_order"?: number,"storage_path"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "animal_images_animal_id_fkey"
      columns: ["animal_id"]
isOneToOne: false
      referencedRelation: "animals"
      referencedColumns: ["id"]
    }
                  ]
                },"animals": {
                  Row: {
                    "age_months": number | null,"age_unit": Database["public"]['Enums']["age_unit"],"age_value": number,"breed_id": number | null,"category_id": number,"created_at": string,"description": string,"dewormed": Database["public"]['Enums']["tri_state"],"good_for_apartment": boolean | null,"has_vet_documents": boolean,"id": string,"medical_notes": string | null,"name": string | null,"owner_id": string,"personality_tags": (string)[],"sex": Database["public"]['Enums']["animal_sex"],"size": Database["public"]['Enums']["animal_size"],"sterilized": Database["public"]['Enums']["tri_state"],"updated_at": string,"vaccinated": Database["public"]['Enums']["tri_state"],"vaccination_complete": Database["public"]['Enums']["tri_state"]
                  }
                  ComputedFields: never
                  Insert: {
                    "age_months"?: never,"age_unit": Database["public"]['Enums']["age_unit"],"age_value": number,"breed_id"?: number | null,"category_id": number,"created_at"?: string,"description": string,"dewormed"?: Database["public"]['Enums']["tri_state"],"good_for_apartment"?: boolean | null,"has_vet_documents"?: boolean,"id"?: string,"medical_notes"?: string | null,"name"?: string | null,"owner_id"?: string,"personality_tags"?: (string)[],"sex"?: Database["public"]['Enums']["animal_sex"],"size": Database["public"]['Enums']["animal_size"],"sterilized"?: Database["public"]['Enums']["tri_state"],"updated_at"?: string,"vaccinated"?: Database["public"]['Enums']["tri_state"],"vaccination_complete"?: Database["public"]['Enums']["tri_state"]
                  }
                  Update: {
                    "age_months"?: never,"age_unit"?: Database["public"]['Enums']["age_unit"],"age_value"?: number,"breed_id"?: number | null,"category_id"?: number,"created_at"?: string,"description"?: string,"dewormed"?: Database["public"]['Enums']["tri_state"],"good_for_apartment"?: boolean | null,"has_vet_documents"?: boolean,"id"?: string,"medical_notes"?: string | null,"name"?: string | null,"owner_id"?: string,"personality_tags"?: (string)[],"sex"?: Database["public"]['Enums']["animal_sex"],"size"?: Database["public"]['Enums']["animal_size"],"sterilized"?: Database["public"]['Enums']["tri_state"],"updated_at"?: string,"vaccinated"?: Database["public"]['Enums']["tri_state"],"vaccination_complete"?: Database["public"]['Enums']["tri_state"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "animals_breed_id_fkey"
      columns: ["breed_id"]
isOneToOne: false
      referencedRelation: "breeds"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "animals_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "animals_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"breeds": {
                  Row: {
                    "active": boolean,"category_id": number,"id": number,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"category_id": number,"id"?: never,"name": string
                  }
                  Update: {
                    "active"?: boolean,"category_id"?: number,"id"?: never,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "breeds_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"categories": {
                  Row: {
                    "active": boolean,"created_at": string,"icon": string | null,"id": number,"name": string,"parent_id": number | null,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"icon"?: string | null,"id"?: never,"name": string,"parent_id"?: number | null,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"icon"?: string | null,"id"?: never,"name"?: string,"parent_id"?: number | null,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"conversation_participants": {
                  Row: {
                    "conversation_id": string,"joined_at": string,"last_read_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "conversation_id": string,"joined_at"?: string,"last_read_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "conversation_id"?: string,"joined_at"?: string,"last_read_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "conversation_participants_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "conversation_participants_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"conversations": {
                  Row: {
                    "created_at": string,"id": string,"last_message_at": string | null,"last_message_preview": string | null,"listing_id": string,"started_by": string,"status": Database["public"]['Enums']["conversation_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"last_message_at"?: string | null,"last_message_preview"?: string | null,"listing_id": string,"started_by": string,"status"?: Database["public"]['Enums']["conversation_status"]
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"last_message_at"?: string | null,"last_message_preview"?: string | null,"listing_id"?: string,"started_by"?: string,"status"?: Database["public"]['Enums']["conversation_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "conversations_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listing_cards"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "conversations_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "conversations_started_by_fkey"
      columns: ["started_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"favorites": {
                  Row: {
                    "created_at": string,"listing_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"listing_id": string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"listing_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "favorites_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listing_cards"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "favorites_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "favorites_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"follow_ups": {
                  Row: {
                    "answered_at": string | null,"due_at": string,"id": string,"kind": Database["public"]['Enums']["follow_up_kind"],"notes": string | null,"request_id": string,"response": Database["public"]['Enums']["follow_up_response"] | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answered_at"?: string | null,"due_at": string,"id"?: string,"kind": Database["public"]['Enums']["follow_up_kind"],"notes"?: string | null,"request_id": string,"response"?: Database["public"]['Enums']["follow_up_response"] | null,"user_id": string
                  }
                  Update: {
                    "answered_at"?: string | null,"due_at"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["follow_up_kind"],"notes"?: string | null,"request_id"?: string,"response"?: Database["public"]['Enums']["follow_up_response"] | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "follow_ups_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "follow_ups_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"listings": {
                  Row: {
                    "allows_delivery": boolean,"allows_pickup": boolean,"animal_id": string,"city": string,"conditions": string | null,"contract_terms": string | null,"created_at": string,"currency": Database["public"]['Enums']["currency_code"] | null,"delivery_window": string | null,"id": string,"listing_type": Database["public"]['Enums']["listing_type"],"moderation_reason": string | null,"moderation_status": Database["public"]['Enums']["moderation_status"],"owner_id": string,"price": number | null,"province_id": number,"published_at": string | null,"status": Database["public"]['Enums']["listing_status"],"transfer_fee": number | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "allows_delivery"?: boolean,"allows_pickup"?: boolean,"animal_id": string,"city": string,"conditions"?: string | null,"contract_terms"?: string | null,"created_at"?: string,"currency"?: Database["public"]['Enums']["currency_code"] | null,"delivery_window"?: string | null,"id"?: string,"listing_type": Database["public"]['Enums']["listing_type"],"moderation_reason"?: string | null,"moderation_status"?: Database["public"]['Enums']["moderation_status"],"owner_id"?: string,"price"?: number | null,"province_id": number,"published_at"?: string | null,"status"?: Database["public"]['Enums']["listing_status"],"transfer_fee"?: number | null,"updated_at"?: string
                  }
                  Update: {
                    "allows_delivery"?: boolean,"allows_pickup"?: boolean,"animal_id"?: string,"city"?: string,"conditions"?: string | null,"contract_terms"?: string | null,"created_at"?: string,"currency"?: Database["public"]['Enums']["currency_code"] | null,"delivery_window"?: string | null,"id"?: string,"listing_type"?: Database["public"]['Enums']["listing_type"],"moderation_reason"?: string | null,"moderation_status"?: Database["public"]['Enums']["moderation_status"],"owner_id"?: string,"price"?: number | null,"province_id"?: number,"published_at"?: string | null,"status"?: Database["public"]['Enums']["listing_status"],"transfer_fee"?: number | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "listings_animal_id_fkey"
      columns: ["animal_id"]
isOneToOne: false
      referencedRelation: "animals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_province_id_fkey"
      columns: ["province_id"]
isOneToOne: false
      referencedRelation: "provinces"
      referencedColumns: ["id"]
    }
                  ]
                },"messages": {
                  Row: {
                    "content": string,"conversation_id": string,"created_at": string,"id": string,"read_at": string | null,"sender_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content": string,"conversation_id": string,"created_at"?: string,"id"?: string,"read_at"?: string | null,"sender_id"?: string
                  }
                  Update: {
                    "content"?: string,"conversation_id"?: string,"created_at"?: string,"id"?: string,"read_at"?: string | null,"sender_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_sender_id_fkey"
      columns: ["sender_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "body": string,"created_at": string,"data": NonNullable<Json>,"id": string,"read_at": string | null,"title": string,"type": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"read_at"?: string | null,"title": string,"type": string,"user_id": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"read_at"?: string | null,"title"?: string,"type"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profile_private": {
                  Row: {
                    "address_line": string | null,"phone": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address_line"?: string | null,"phone"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "address_line"?: string | null,"phone"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profile_private_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_path": string | null,"bio": string | null,"city": string | null,"created_at": string,"full_name": string,"id": string,"onboarded_at": string | null,"partner_type": Database["public"]['Enums']["partner_type"],"province_id": number | null,"suspended_at": string | null,"suspension_reason": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_path"?: string | null,"bio"?: string | null,"city"?: string | null,"created_at"?: string,"full_name": string,"id": string,"onboarded_at"?: string | null,"partner_type"?: Database["public"]['Enums']["partner_type"],"province_id"?: number | null,"suspended_at"?: string | null,"suspension_reason"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "avatar_path"?: string | null,"bio"?: string | null,"city"?: string | null,"created_at"?: string,"full_name"?: string,"id"?: string,"onboarded_at"?: string | null,"partner_type"?: Database["public"]['Enums']["partner_type"],"province_id"?: number | null,"suspended_at"?: string | null,"suspension_reason"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_province_id_fkey"
      columns: ["province_id"]
isOneToOne: false
      referencedRelation: "provinces"
      referencedColumns: ["id"]
    }
                  ]
                },"provinces": {
                  Row: {
                    "country_code": string,"id": number,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "country_code"?: string,"id"?: never,"name": string
                  }
                  Update: {
                    "country_code"?: string,"id"?: never,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"push_tokens": {
                  Row: {
                    "platform": string,"token": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "platform": string,"token": string,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "platform"?: string,"token"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "push_tokens_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"reports": {
                  Row: {
                    "conversation_id": string | null,"created_at": string,"details": string | null,"id": string,"listing_id": string | null,"reason": Database["public"]['Enums']["report_reason"],"reported_user_id": string | null,"reporter_id": string,"resolution_note": string | null,"resolved_at": string | null,"resolved_by": string | null,"status": Database["public"]['Enums']["report_status"],"target_type": Database["public"]['Enums']["report_target"]
                  }
                  ComputedFields: never
                  Insert: {
                    "conversation_id"?: string | null,"created_at"?: string,"details"?: string | null,"id"?: string,"listing_id"?: string | null,"reason": Database["public"]['Enums']["report_reason"],"reported_user_id"?: string | null,"reporter_id"?: string,"resolution_note"?: string | null,"resolved_at"?: string | null,"resolved_by"?: string | null,"status"?: Database["public"]['Enums']["report_status"],"target_type": Database["public"]['Enums']["report_target"]
                  }
                  Update: {
                    "conversation_id"?: string | null,"created_at"?: string,"details"?: string | null,"id"?: string,"listing_id"?: string | null,"reason"?: Database["public"]['Enums']["report_reason"],"reported_user_id"?: string | null,"reporter_id"?: string,"resolution_note"?: string | null,"resolved_at"?: string | null,"resolved_by"?: string | null,"status"?: Database["public"]['Enums']["report_status"],"target_type"?: Database["public"]['Enums']["report_target"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "reports_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listing_cards"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_reported_user_id_fkey"
      columns: ["reported_user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_reporter_id_fkey"
      columns: ["reporter_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_resolved_by_fkey"
      columns: ["resolved_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"request_events": {
                  Row: {
                    "actor_id": string | null,"created_at": string,"id": number,"note": string | null,"request_id": string,"status": Database["public"]['Enums']["request_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_id"?: string | null,"created_at"?: string,"id"?: never,"note"?: string | null,"request_id": string,"status": Database["public"]['Enums']["request_status"]
                  }
                  Update: {
                    "actor_id"?: string | null,"created_at"?: string,"id"?: never,"note"?: string | null,"request_id"?: string,"status"?: Database["public"]['Enums']["request_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "request_events_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "request_events_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    }
                  ]
                },"requests": {
                  Row: {
                    "commitment": string,"contract_accepted_at": string,"contract_snapshot": string | null,"conversation_id": string | null,"created_at": string,"currency_snapshot": Database["public"]['Enums']["currency_code"] | null,"delivery_address": string | null,"delivery_method": Database["public"]['Enums']["delivery_method"],"experience": string,"has_yard": boolean,"household": string | null,"housing_type": Database["public"]['Enums']["housing_type"],"id": string,"listing_id": string,"other_pets": string | null,"owner_id": string,"owner_note": string | null,"preferred_date": string | null,"preferred_window": string | null,"price_snapshot": number | null,"requester_id": string,"status": Database["public"]['Enums']["request_status"],"transfer_fee": number | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "commitment": string,"contract_accepted_at": string,"contract_snapshot"?: string | null,"conversation_id"?: string | null,"created_at"?: string,"currency_snapshot"?: Database["public"]['Enums']["currency_code"] | null,"delivery_address"?: string | null,"delivery_method": Database["public"]['Enums']["delivery_method"],"experience": string,"has_yard"?: boolean,"household"?: string | null,"housing_type": Database["public"]['Enums']["housing_type"],"id"?: string,"listing_id": string,"other_pets"?: string | null,"owner_id": string,"owner_note"?: string | null,"preferred_date"?: string | null,"preferred_window"?: string | null,"price_snapshot"?: number | null,"requester_id": string,"status"?: Database["public"]['Enums']["request_status"],"transfer_fee"?: number | null,"updated_at"?: string
                  }
                  Update: {
                    "commitment"?: string,"contract_accepted_at"?: string,"contract_snapshot"?: string | null,"conversation_id"?: string | null,"created_at"?: string,"currency_snapshot"?: Database["public"]['Enums']["currency_code"] | null,"delivery_address"?: string | null,"delivery_method"?: Database["public"]['Enums']["delivery_method"],"experience"?: string,"has_yard"?: boolean,"household"?: string | null,"housing_type"?: Database["public"]['Enums']["housing_type"],"id"?: string,"listing_id"?: string,"other_pets"?: string | null,"owner_id"?: string,"owner_note"?: string | null,"preferred_date"?: string | null,"preferred_window"?: string | null,"price_snapshot"?: number | null,"requester_id"?: string,"status"?: Database["public"]['Enums']["request_status"],"transfer_fee"?: number | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "requests_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "requests_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listing_cards"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "requests_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "requests_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "requests_requester_id_fkey"
      columns: ["requester_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_blocks": {
                  Row: {
                    "blocked_id": string,"blocker_id": string,"created_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "blocked_id": string,"blocker_id"?: string,"created_at"?: string
                  }
                  Update: {
                    "blocked_id"?: string,"blocker_id"?: string,"created_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_blocks_blocked_id_fkey"
      columns: ["blocked_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_blocks_blocker_id_fkey"
      columns: ["blocker_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_roles": {
                  Row: {
                    "granted_at": string,"granted_by": string | null,"role": Database["public"]['Enums']["app_role"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "granted_at"?: string,"granted_by"?: string | null,"role": Database["public"]['Enums']["app_role"],"user_id": string
                  }
                  Update: {
                    "granted_at"?: string,"granted_by"?: string | null,"role"?: Database["public"]['Enums']["app_role"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_roles_granted_by_fkey"
      columns: ["granted_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_roles_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "listing_cards": {
                  Row: {
                    "age_months": number | null,"age_unit": Database["public"]['Enums']["age_unit"],"age_value": number,"animal_id": string,"animal_name": string | null,"breed_id": number | null,"breed_name": string | null,"category_id": number,"category_name": string,"category_slug": string,"city": string,"cover_path": string | null,"created_at": string,"currency": Database["public"]['Enums']["currency_code"] | null,"description": string,"dewormed": Database["public"]['Enums']["tri_state"],"good_for_apartment": boolean | null,"id": string,"listing_type": Database["public"]['Enums']["listing_type"],"moderation_status": Database["public"]['Enums']["moderation_status"],"owner_id": string,"owner_name": string,"owner_partner_type": Database["public"]['Enums']["partner_type"],"personality_tags": (string)[],"price": number | null,"province_id": number,"province_name": string,"published_at": string | null,"sex": Database["public"]['Enums']["animal_sex"],"size": Database["public"]['Enums']["animal_size"],"status": Database["public"]['Enums']["listing_status"],"transfer_fee": number | null,"vaccinated": Database["public"]['Enums']["tri_state"]
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "animals_breed_id_fkey"
      columns: ["breed_id"]
isOneToOne: false
      referencedRelation: "breeds"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "animals_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_animal_id_fkey"
      columns: ["animal_id"]
isOneToOne: false
      referencedRelation: "animals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_province_id_fkey"
      columns: ["province_id"]
isOneToOne: false
      referencedRelation: "provinces"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "admin_close_conversation":
{ Args: { "p_conversation_id": string,"p_reason": string }; Returns: undefined
                           },
"admin_list_users":
{ Args: { "p_search"?: string }; Returns: {
              "created_at": string,"full_name": string,"id": string,"listings_count": number,"partner_type": Database["public"]['Enums']["partner_type"],"reports_count": number,"suspended_at": string,"suspension_reason": string
            }[]
                           },
"admin_read_reported_conversation":
{ Args: { "p_report_id": string }; Returns: {
              "content": string,"created_at": string,"id": string,"sender_id": string,"sender_name": string
            }[]
                           },
"admin_resolve_report":
{ Args: { "p_note": string,"p_report_id": string,"p_status": Database["public"]['Enums']["report_status"] }; Returns: undefined
                           },
"admin_set_listing_moderation":
{ Args: { "p_listing_id": string,"p_reason": string,"p_status": Database["public"]['Enums']["moderation_status"] }; Returns: undefined
                           },
"admin_set_user_suspension":
{ Args: { "p_reason": string,"p_suspend": boolean,"p_user_id": string }; Returns: undefined
                           },
"answer_follow_up":
{ Args: { "p_follow_up_id": string,"p_notes"?: string,"p_response": Database["public"]['Enums']["follow_up_response"] }; Returns: undefined
                           },
"assert_admin":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"audit":
{ Args: { "p_action": string,"p_details": Json,"p_table": string,"p_target": string }; Returns: undefined
                           },
"create_request":
{ Args: { "p_commitment": string,"p_contract_accepted": boolean,"p_delivery_address": string,"p_delivery_method": Database["public"]['Enums']["delivery_method"],"p_experience": string,"p_has_yard": boolean,"p_household": string,"p_housing_type": Database["public"]['Enums']["housing_type"],"p_listing_id": string,"p_other_pets": string,"p_preferred_date": string,"p_preferred_window": string }; Returns: string
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_animal_public":
{ Args: { "p_animal": string }; Returns: boolean
                           },
"is_blocked_between":
{ Args: { "p_a": string,"p_b": string }; Returns: boolean
                           },
"is_contact_verified":
{ Args: { "p_user": string }; Returns: boolean
                           },
"is_conversation_participant":
{ Args: { "p_conversation": string }; Returns: boolean
                           },
"is_listing_public":
{ Args: { "p_listing": string }; Returns: boolean
                           },
"is_suspended":
{ Args: { "p_user"?: string }; Returns: boolean
                           },
"mark_conversation_read":
{ Args: { "p_conversation_id": string }; Returns: undefined
                           },
"my_conversations":
{ Args: Record<PropertyKey, never>; Returns: {
              "animal_name": string,"cover_path": string,"created_at": string,"id": string,"last_message_at": string,"last_message_preview": string,"listing_id": string,"listing_type": Database["public"]['Enums']["listing_type"],"other_user_avatar": string,"other_user_id": string,"other_user_name": string,"status": Database["public"]['Enums']["conversation_status"],"unread_count": number
            }[]
                           },
"notify":
{ Args: { "p_body": string,"p_data"?: Json,"p_title": string,"p_type": string,"p_user": string }; Returns: undefined
                           },
"owns_animal":
{ Args: { "p_animal": string }; Returns: boolean
                           },
"start_conversation":
{ Args: { "p_listing_id": string }; Returns: string
                           },
"storage_extension_ok":
{ Args: { "p_bucket": string,"p_name": string }; Returns: boolean
                           },
"update_request_status":
{ Args: { "p_note"?: string,"p_request_id": string,"p_status": Database["public"]['Enums']["request_status"] }; Returns: undefined
                           }
          }
          Enums: {
            "age_unit": "months"|"years","animal_sex": "male"|"female"|"unknown","animal_size": "small"|"medium"|"large"|"giant","app_role": "buyer"|"adopter"|"seller"|"adoption_publisher"|"admin","conversation_status": "open"|"closed","currency_code": "DOP"|"USD","delivery_method": "delivery"|"pickup","follow_up_kind": "day_7"|"day_30","follow_up_response": "great"|"adapting"|"issues","housing_type": "house"|"apartment"|"farm"|"other","listing_status": "draft"|"available"|"reserved"|"sold"|"adopted"|"paused"|"withdrawn","listing_type": "sale"|"adoption","moderation_status": "visible"|"hidden","partner_type": "individual"|"shelter"|"store"|"vet"|"breeder","report_reason": "fraud"|"abuse"|"illegal_species"|"animal_welfare"|"inappropriate"|"spam"|"other","report_status": "open"|"reviewing"|"resolved"|"dismissed","report_target": "listing"|"user"|"conversation","request_status": "submitted"|"in_review"|"videocall_requested"|"approved"|"preparing"|"in_transit"|"nearby"|"delivered"|"rejected"|"cancelled","tri_state": "yes"|"no"|"unknown"
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
            "age_unit": ["months", "years"],"animal_sex": ["male", "female", "unknown"],"animal_size": ["small", "medium", "large", "giant"],"app_role": ["buyer", "adopter", "seller", "adoption_publisher", "admin"],"conversation_status": ["open", "closed"],"currency_code": ["DOP", "USD"],"delivery_method": ["delivery", "pickup"],"follow_up_kind": ["day_7", "day_30"],"follow_up_response": ["great", "adapting", "issues"],"housing_type": ["house", "apartment", "farm", "other"],"listing_status": ["draft", "available", "reserved", "sold", "adopted", "paused", "withdrawn"],"listing_type": ["sale", "adoption"],"moderation_status": ["visible", "hidden"],"partner_type": ["individual", "shelter", "store", "vet", "breeder"],"report_reason": ["fraud", "abuse", "illegal_species", "animal_welfare", "inappropriate", "spam", "other"],"report_status": ["open", "reviewing", "resolved", "dismissed"],"report_target": ["listing", "user", "conversation"],"request_status": ["submitted", "in_review", "videocall_requested", "approved", "preparing", "in_transit", "nearby", "delivered", "rejected", "cancelled"],"tri_state": ["yes", "no", "unknown"]
          }
        }
} as const
