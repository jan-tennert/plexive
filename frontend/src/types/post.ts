export interface VoiceItem {
  quote: string
  attribution: string
}

export interface AtAGlanceBooksContent {
  genre: string
  year: number
  country: string
  pages: number
  reading_ease: 1 | 2 | 3
  post_reading_time_min: number
  post_difficulty: 1 | 2 | 3
  best_for: string
}

export interface CoreIdeaItem {
  title: string
  body: string
  in_practice?: string
  visual_svg?: string
  image_url?: string
  quote?: string
}

export interface TakeawayContent {
  framing: "framework" | "question"
  body: string
  visual_svg?: string
}

export interface QuizItem {
  question: string
  options: [string, string, string, string]
  answer_index: 0 | 1 | 2 | 3
  explanation: string
}

export interface RelatedPostItem {
  post_id: string
  title: string
  format: string
  mini_teaser: string
}

export interface SourceItem {
  label: string
  url: string
  type: "wikipedia" | "paper" | "book" | "article" | "database"
}

export interface AuthorContextContent {
  body: string
  image_url?: string
  image_attribution?: string
  wikipedia_url?: string
}

export type SectionType =
  | "essence"
  | "quiz_badge"
  | "voices"
  | "at_a_glance"
  | "why_endures"
  | "heart"
  | "structure"
  | "core_ideas"
  | "takeaway"
  | "quiz"
  | "related_posts"
  | "world_context"
  | "author_context"
  | "critique"
  | "sources"

export interface Section {
  type: SectionType | string
  order: number
  content: unknown
}

export interface BooksFeedCard {
  cover_url: string | null
  title: string
  author: string
  essence: string
  teasers: [string, string, string]
  post_reading_time_min: number
  post_difficulty: 1 | 2 | 3
  year: number
  genre: string
}

export interface Post {
  id: number
  format: string
  title: string
  feed_card: BooksFeedCard
  sections: Section[]
  author_id: number | null
  author_username: string | null
  author_is_verified: boolean | null
  status: string
  created_at: string
  is_user_content: boolean
  like_count: number
  comment_count: number
  interests: string[]
}
