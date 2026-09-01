export type HeroStory = {
  id: string;
  href: string;
  category: string;
  title: string;
  dek: string;
  imageUrl: string;
  imageAlt: string;
  publishedLabel: string;
  viewCount: number;
};

/** Temporary demo slides until CMS featured stories are wired. */
export const DEMO_HERO_STORIES: HeroStory[] = [
  {
    id: "1",
    href: "/security/niger-can-demands-security-at-worship-centres",
    category: "Security",
    title:
      "Niger CAN demands tighter security at worship centres after mass abduction",
    dek: "Church leaders urge coordinated patrols across the state as communities wait for safe return of abductees.",
    imageUrl:
      "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "People gathered outdoors at a community meeting",
    publishedLabel: "3 hours ago",
    viewCount: 1284,
  },
  {
    id: "2",
    href: "/agriculture/women-graduates-zinariya-minna-empowerment",
    category: "Agriculture",
    title: "Five hundred women graduate under Zinariya Minna skills programme",
    dek: "Catering and cosmetology trainees in Shiroro mark a third cohort as organisers call for startup kits.",
    imageUrl:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c309?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Rows of green crops under open sky",
    publishedLabel: "Yesterday",
    viewCount: 892,
  },
  {
    id: "3",
    href: "/politics/apc-niger-call-for-unity-and-reconciliation",
    category: "Politics",
    title: "Stakeholders urge APC leadership in Niger to choose unity over division",
    dek: "An open appeal for a broad stakeholders’ meeting ahead of 2027, framed as reconciliation not attack.",
    imageUrl:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Assembly hall with seated audience",
    publishedLabel: "2 days ago",
    viewCount: 2103,
  },
];
