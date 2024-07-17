import { defineCustomElement } from "./CustomElement/apiCustomElement";
import { addImmersiveMenuEntry, addMainMenuEntry,} from "./api/MenuEntry";
import { goToPage } from "./api/Page";
import CustomPage from "./pages/CustomPage.vue";
import { customElementName } from "./utils";
import config from './plugin.config.ts'

export const CustomElements = {
    'page-helloworld': defineCustomElement(CustomPage, {
        shadowRoot: false
    })
}

export default {
    name: 'Convertarr',
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
    }}