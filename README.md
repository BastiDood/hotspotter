# Development

The mobile application is a single-page [SvelteKit] application powered by the [Capacitor] runtime for cross-platform WebView-based applications. However, this project only targets the Android platform for now.

[SvelteKit]: https://kit.svelte.dev/
[Capacitor]: https://capacitorjs.com/

## Prerequisites

-   [Node.js]
-   [pnpm]
-   [Android Studio]
    -   `platform-tools`
    -   `platforms;android-34`
    -   `build-tools;34.0.0`
-   [OpenJDK 17]
-   Android 9 (API 28)

[Node.js]: https://nodejs.org/en/download/
[pnpm]: https://pnpm.io/
[Android Studio]: https://developer.android.com/studio
[OpenJDK 17]: https://openjdk.org/projects/jdk/17/

## Environment Variables

| **Name**                      | **Description**                                                         | **Required** |
| ----------------------------- | ----------------------------------------------------------------------- | :----------: |
| `MOBILE`                      | Determines whether to build the SvelteKit application as a static site. |   &#x2714;   |
| `POSTGRES_URL`                | Connection URL to the [PostgreSQL] instance.                            |   &#x2714;   |
| `PUBLIC_GOOGLE_WEB_CLIENT_ID` | The OAuth web client ID from the [Google Cloud console][credentials].   |   &#x2714;   |

[PostgreSQL]: https://www.postgresql.org/
[credentials]: https://console.cloud.google.com/apis/credentials

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
