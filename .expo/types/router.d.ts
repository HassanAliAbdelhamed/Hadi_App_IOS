/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/..\my-app\app\(tabs)\` | `/..\my-app\app\(tabs)\_layout` | `/..\my-app\app\_layout` | `/..\my-app\components\ExternalLink` | `/..\my-app\components\HapticTab` | `/..\my-app\components\ParallaxScrollView` | `/..\my-app\components\ThemedText` | `/..\my-app\components\ThemedView` | `/..\my-app\components\ui\IconSymbol.ios` | `/..\my-app\components\ui\TabBarBackground` | `/..\my-app\components\ui\TabBarBackground.ios` | `/..\my-app\hooks\useColorScheme.web` | `/..\my-app\hooks\useThemeColor` | `/_sitemap`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
