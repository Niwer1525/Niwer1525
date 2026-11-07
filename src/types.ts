export type LangDict = Record<string, string>;
export type LanguageColorMap = Record<string, string>;

export interface RenderContext {
    apiBaseUrl?: string;
}

export interface ModalTab {
    id: string;
    titleKey: string;
    content: string;
    isActive?: boolean;
}

export interface NavButton {
    id?: string;
    url: string;
    labelKey: string;
    accessType?: string;
    onClick?: string;
}

export interface JumpLink {
    id: string;
    label: string;
    count?: number;
}

export interface SeasonalData {
    background: string;
    glow: string;
    emoji: string;
}

export interface PackageData {
    id?: string;
    slug: string;
    name?: string;
    paymentLink?: string;
    payment_link?: string;
    payment_type?: string;
    price_id?: string;
    displayed_price?: number | string;
    price?: number | string;
    currency?: string;
    image?: string;
    images?: string[];
    [key: string]: unknown;
}

export interface FilterPackage extends PackageData {
    filterTags?: string[];
}

export interface CategoryData {
    id?: string;
    slug?: string;
    name?: string;
    packages?: PackageData[];
    subcategories?: CategoryData[];
}

export interface StripePrice {
    id?: string;
    amount: number;
    currency: string;
    isDefault?: boolean;
}

export interface StripePrices {
    byId: Record<string, StripePrice>;
    byProduct: Record<string, StripePrice[]>;
}

export interface StoreContext {
    lang: string;
    langDict: LangDict;
    defaultCurrency: string;
    catalogPaymentLink: string;
    stripePrices: StripePrices;
}

export interface ProjectData {
    name: string;
    video_id?: string;
    image?: string;
    tags?: string[];
    links?: Record<string, string>;
}

export interface GistFile {
    language?: string;
}

export interface GistData {
    description?: string;
    createdAt: string;
    htmlUrl: string;
    files?: Record<string, GistFile>;
}

export interface LanguageStat {
    name: string;
    percent: number;
}

export interface StatisticsData {
    gh_gists?: GistData[];
    [key: string]: unknown;
}

export interface BlogSource {
    date: string;
    url?: string;
    authors?: string[];
}

export interface BlogPost {
    slug: string;
    title: string;
    summary?: string;
    content_markdown?: string;
    published_at: string;
    reading_time_minutes?: number;
    sources?: BlogSource[];
}

export enum Languages {
    EN = 'en',
    FR = 'fr'
}