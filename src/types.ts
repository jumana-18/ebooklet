export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  discountPrice?: number;
  discountPercent?: string;
  rating: number;
  coverImage: string;
  category: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  progress?: number;
  bookType: 'ebook' | 'physical';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
}
