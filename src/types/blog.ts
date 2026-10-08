export interface BlogAuthor {
  name: string;
  avatarUrl: string;
  role: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  author: BlogAuthor;
  publishedAt: string;
  readTimeMinutes: number;
  linkedProductSlug?: string;
  status?: "published" | "draft" | "archived";
}

export interface BlogFormData {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  authorName: string;
  authorRole: string;
  authorAvatarUrl: string;
  readTimeMinutes: number;
  linkedProductSlug?: string;
  status: "published" | "draft";
}

export interface BlogsApiResponse {
  success: boolean;
  data?: BlogPost[];
  post?: BlogPost;
  error?: string;
}
