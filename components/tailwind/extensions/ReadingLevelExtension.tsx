import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export const ReadingLevelExtension = Extension.create({
  name: 'readingLevel',

  addOptions() {
    return {
      calculateReadingLevel: (text: string) => {
        const words = text.split(/\s+/).length;
        return Math.min(Math.floor(words / 5), 1000) // 0-12 scale
      },
    }
  },

  addStorage() {
    return {
      level: 0,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('readingLevel'),
        view: (view) => {
          return {
            update: (view) => {
              const text = view.state.doc.textContent
              const level = this.options.calculateReadingLevel(text) // Now correctly referencing an option
              this.storage.level = level
            },
          }
        },
      }),
    ]
  },
})
