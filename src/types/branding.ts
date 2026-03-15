export type BrandingAssetKind = 'logoMark' | 'loginHero'

export interface BrandingTheme {
  primary: string
  primaryDark: string
  shellStart: string
  shellEnd: string
  heroStart: string
  heroEnd: string
}

export interface BrandingSettings {
  appTitle: string
  consoleName: string
  productTagline: string
  logoMarkUrl: string
  loginHeroUrl: string
  theme: BrandingTheme
}

export interface BrandingAssetPayload {
  url: string
}
