# Development

The mobile application is a single-page [SvelteKit] application powered by the [Capacitor] runtime for cross-platform WebView-based applications. However, this project only targets the Android platform for now.

[SvelteKit]: https://kit.svelte.dev/
[Capacitor]: https://capacitorjs.com/

## Prerequisites

-   [Node.js]
-   [pnpm]
-   [Android Studio]
    -   `build-tools;30.0.3`
    -   `platform-tools`
    -   `platforms;android-33`
    -   `system-images;android-33;google_apis_playstore;x86_64` (Optional)
    -   `emulator` (Optional)
    -   `extras;google;Android_Emulator_Hypervisor_Driver` (Optional)
-   [OpenJDK 21]
-   Android 9 (API 28)

[Node.js]: https://nodejs.org/en/download/
[pnpm]: https://pnpm.io/
[Android Studio]: https://developer.android.com/studio
[OpenJDK 21]: https://openjdk.org/projects/jdk/21/

## Development

These are the commands that lets us compile and run our code.

```bash
# Install the dependencies.
pnpm install

# Compile the production build (i.e., with optimizations).
pnpm build

# Copy the `build` folder into the emulator and then run the application.
pnpm run:android

# Does the same as above, but uploads to a physical device rather than an emulator.
pnpm run:android --target $ID
```

## Code Quality

These are the commands that automate code quality assurance. All `main` code must pass the tests.

```bash
# Check Formatting
pnpm fmt # prettier

# Apply Formatting Auto-fix
pnpm fmt:fix # prettier --write

# Check Linting Rules
pnpm lint:html   # linthtml
pnpm lint:css    # stylelint
pnpm lint:js     # eslint
pnpm lint:svelte # svelte-check

# Check All Lints
pnpm lint
```
