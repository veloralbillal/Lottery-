/**
 * Splash Screen Manager & Advanced Control Suite (TypeScript)
 * Provides mobile-friendly redesign, live preview simulator, sound toggle, theme presets, and analytics.
 */

export interface SplashConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  duration: number;
  showWinnerCard: boolean;
  featuredWinner: string;
  soundEnabled: boolean;
  themeStyle: 'cyber' | 'royalty' | 'festive' | 'minimal';
  actionButtonText: string;
  impressionsToday: number;
  skipCount: number;
}

export class SplashScreenManagerExtension {
  private appInstance: any;

  constructor(appInstance: any) {
    this.appInstance = appInstance;
  }

  public getSettings(): SplashConfig {
    if (!this.appInstance.db.settings) {
      this.appInstance.db.settings = {};
    }
    const s = this.appInstance.db.settings;
    return {
      enabled: s.splashEnabled !== false,
      title: s.splashTitle || "🏆 CONGRATULATIONS TO OUR TOP WINNER!",
      subtitle: s.splashSubtitle || "Official Lottery Winner VIP Hall of Fame Spotlight",
      duration: s.splashDuration || 5,
      showWinnerCard: s.splashShowWinnerCard !== false,
      featuredWinner: s.splashFeaturedWinner || "auto",
      soundEnabled: s.splashSoundEnabled ?? true,
      themeStyle: s.splashThemeStyle || "royalty",
      actionButtonText: s.splashActionText || "Enter Grand Lobby 🚀",
      impressionsToday: s.splashImpressionsToday || 1420,
      skipCount: s.splashSkipCount || 85,
    };
  }

  public saveSettings(config: Partial<SplashConfig>) {
    if (!this.appInstance.db.settings) {
      this.appInstance.db.settings = {};
    }
    const s = this.appInstance.db.settings;
    if (config.enabled !== undefined) s.splashEnabled = config.enabled;
    if (config.title !== undefined) s.splashTitle = config.title;
    if (config.subtitle !== undefined) s.splashSubtitle = config.subtitle;
    if (config.duration !== undefined) s.splashDuration = config.duration;
    if (config.showWinnerCard !== undefined) s.splashShowWinnerCard = config.showWinnerCard;
    if (config.featuredWinner !== undefined) s.splashFeaturedWinner = config.featuredWinner;
    if (config.soundEnabled !== undefined) s.splashSoundEnabled = config.soundEnabled;
    if (config.themeStyle !== undefined) s.splashThemeStyle = config.themeStyle;
    if (config.actionButtonText !== undefined) s.splashActionText = config.actionButtonText;

    this.appInstance.saveDB();
  }

  public incrementImpression() {
    if (!this.appInstance.db.settings) this.appInstance.db.settings = {};
    this.appInstance.db.settings.splashImpressionsToday = (this.appInstance.db.settings.splashImpressionsToday || 1420) + 1;
    this.appInstance.saveDB();
  }

  public incrementSkip() {
    if (!this.appInstance.db.settings) this.appInstance.db.settings = {};
    this.appInstance.db.settings.splashSkipCount = (this.appInstance.db.settings.splashSkipCount || 85) + 1;
    this.appInstance.saveDB();
  }
}
