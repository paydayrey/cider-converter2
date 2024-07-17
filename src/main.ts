import { defineCustomElement } from "./CustomElement/apiCustomElement";
import { addImmersiveMenuEntry, addMainMenuEntry, addMediaItemContextMenuEntry } from "./api/MenuEntry";
import { goToPage } from "./api/Page";
import { PluginAPI } from "./api/PluginAPI";
import CustomPage from "./pages/CustomPage.vue";
import { customElementName } from "./utils";
import config from './plugin.config.ts'
import { useCiderAudio } from "./api/CiderAudio.ts";

export const CustomElements = {
    'page-helloworld': defineCustomElement(CustomPage, {
        shadowRoot: false
    })
}

export default {
    name: 'My Plugin',
    identifier: config.identifier,
    version: config.version,
    description: config.description,
    
    setup() {
        // Temp workaround
        // @ts-ignore
        window.__VUE_OPTIONS_API__ = true
        for (const [key, value] of Object.entries(CustomElements)) {
            const _key = key as keyof typeof CustomElements;
            customElements.define(customElementName(_key), value)
        }

        // Here we add a new entry to the main menu
        addMainMenuEntry({
            label: "Convertarr",
            onClick() {
                goToPage({
                    name: 'page-helloworld'
                });
            },
        })

        addImmersiveMenuEntry({
            label: "Go to my page",
            onClick() {
                goToPage({
                    name: 'page-helloworld'
                });
            },
        })

        const audio1 = useCiderAudio();
        audio1.subscribe('ready', () => {
            console.log("CiderAudio is ready!", audio1.context)
        })


        addMediaItemContextMenuEntry({
            label: 'Send to plugin',
            onClick(item) {
                console.log('Got this item', item)
            },
        })
    },
} as PluginAPI;