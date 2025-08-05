// features/healthNews/types/healthNews.types.ts
export interface HealthNew {
    id: number;
    title: string;
    category: string;
    content: string;
    date: string;
    author: string;
    image: string;
  }
  
  export type CategoriesMap = Record<string, HealthNew[]>;