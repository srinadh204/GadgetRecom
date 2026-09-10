export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Gadget {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  brand: string;
  price: number;
  rating: number;
  review_count: number;
  image_url: string;
  tagline: string;
  description: string;
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
  best_for: string[];
  featured: boolean;
}

export interface Review {
  id: string;
  gadget_id: string;
  author_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export interface GadgetWithCategory extends Gadget {
  categories?: Category;
}
