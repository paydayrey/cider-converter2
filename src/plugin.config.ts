import { createId } from "@paralleldrive/cuid2"

export default {
    ce_prefix: createId(),
    identifier: 'sh.cider.plugin-template-wip',
    name: 'Convertarr',
    description: 'A plugin to convert Spotify playlists to Apple Music',
    version: '0.0.1',
    author: 'DeadFrost',
    repo: 'https://github.com/DeadFrostt/cider-convertarr',
    entry: {
        'plugin.js': {
            type: 'main',
        }
    }
}