import { defineCustomElement } from "./CustomElement/apiCustomElement";
import { addImmersiveMenuEntry, addMainMenuEntry } from "./api/MenuEntry";
import { goToPage } from "./api/Page";
import CustomPage from "./pages/CustomPage.vue";
import { customElementName } from "./utils";
import config from './plugin.config.ts'
import { useMusicKit } from '@ciderapp/pluginkit';

// Define plugin permissions
const requiredPermissions = [
  'musickit',
  'playlists:modify',
  'library:modify'
];

export const CustomElements = {
    'page-converter': defineCustomElement(CustomPage, {
        shadowRoot: false
    })
}

export default {
    name: 'Converter',
    identifier: config.identifier,
    version: config.version,
    description: config.description,
    permissions: requiredPermissions,
    
    async setup() {
        try {
            // Initialize MusicKit
            const musicKit = useMusicKit();
            if (!musicKit) {
                throw new Error('Failed to initialize MusicKit');
            }

            // Register custom elements
            for (const [key, value] of Object.entries(CustomElements)) {
                const _key = key as keyof typeof CustomElements;
                if (!customElements.get(customElementName(_key))) {
                    customElements.define(customElementName(_key), value);
                }
            }

            // Add menu entries
            addMainMenuEntry({
                label: "Spotify Converter",
                icon: "playlist_add", // Material icon name
                onClick() {
                    goToPage({
                        name: 'page-converter'
                    });
                },
            });

            addImmersiveMenuEntry({
                label: "Convert Playlist",
                icon: "playlist_add",
                onClick() {
                    goToPage({
                        name: 'page-converter'
                    });
                },
            });

        } catch (error) {
            console.error('Failed to setup Converter plugin:', error);
        }
    },

    // Add teardown method for cleanup
    teardown() {
        // Cleanup code here if needed
        console.log('Converter plugin teardown');
    }
}