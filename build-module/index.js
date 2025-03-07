import _extends from "@babel/runtime/helpers/extends";
import { createElement } from "@wordpress/element";

/**
 * WordPress dependencies
 */
import '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { StrictMode } from '@wordpress/element';
import { SlotFillProvider } from '@wordpress/components';
import { MediaUpload } from '@wordpress/media-utils';
import { registerCoreBlocks } from '@wordpress/block-library';
import { addFilter } from '@wordpress/hooks';
import { use } from '@wordpress/data';
import '@wordpress/format-library';
import { ShortcutProvider } from '@wordpress/keyboard-shortcuts';
/**
 * Internal dependencies
 */

import BlockEditorContainer from './components/block-editor-container';
import withRegistryProvider from './components/with-registry-provider';
import EditorSetup from './components/editor-setup';
import PatternMonitor from './components/pattern-monitor';
import ContentSaver from './components/content-saver';
import registerApiHandlers from './components/api-fetch';
import storeHotSwapPlugin from './store/plugins/store-hot-swap';
import DocumentSection from './components/document';
import ToolbarSlot from './components/block-editor-toolbar/slot';
import CollaborativeEditing from './components/collaborative-editing';
import FooterSlot from './components/footer-slot'; // Export library components

import EditorLoaded from './components/editor-loaded'; // A fake edit-post store is needed

import './store/edit-post';
import './style.scss';
/** @typedef {import('./components/block-editor-toolbar/more-menu').OnMore} OnMore */

/** @typedef {import('./store/editor/reducer').Pattern} Pattern */

/**
 * Toolbar settings
 * @typedef ToolbarSettings
 * @property {boolean} [inserter] - Enable or disable the toolbar block inserter
 * @property {boolean} [inspector] - Enable or disable the toolbar block inspector
 * @property {boolean} [navigation] - Enable or disable the toolbar navigation button
 * @property {boolean} [toc] - Enable or disable the toolbar table of contents button
 * @property {boolean} [undo] - Enable or disable the toolbar undo/redo buttons
 * @property {boolean} [selectorTool] - Enable or disable the selector tool
 * @property {boolean|string} [documentInspector] - Enable or disable the document inspector or enable with custom label
 */

/**
 * More menu settings
 * @typedef MoreMenuSettings
 * @property {boolean} [editor] - Enable or disable the editor sub menu (visual/code editing)
 * @property {boolean} [fullscreen] - Enable or disable the fullscreen option
 * @property {boolean} [preview] - Enable or disable the preview option
 * @property {boolean} [topToolbar] - Enable or disable the 'top toolbar' option
 */

/**
 * Sidebar settings
 * @typedef SidebarSettings
 * @property {boolean} [inspector=false] - Display the block inspector in a sidebar (true) or popover (false)
 * @property {boolean} [inserter=false] - Display the block inserter in a sidebar (true) or popover (false)
 */

/**
 * Isolated Editor Settings
 * @typedef IsoSettings
 * @property {string|null} [preferencesKey] - Preferences key. Set to null to disable
 * @property {string|null} [persistenceKey] - Persistence key. Set to null to disable
 * @property {{allowBlocks: string[], disallowBlocks: string[]}} [blocks] - Block restrictions
 * @property {string[]} [disallowEmbed] - List of embed names to remove
 * @property {object[]} [customStores] - Array of custom stores
 * @property {boolean} [footer] - Show footer component
 * @property {ToolbarSettings} [toolbar] - Toolbar settings
 * @property {MoreMenuSettings|false} [moreMenu] - More menu settings, or false to disable
 * @property {{title: string, url: string}[]} [linkMenu] - Link menu settings
 * @property {string|null} [currentPattern] - The pattern to start with
 * @property {Pattern[]} [patterns] - List of patterns
 * @property {object} [defaultPreferences] - Default preferences if nothing in localStorage
 * @property {boolean} [allowApi] - Allow API requests
 * @property {SidebarSettings} [sidebar] - Configure sidebar functionality
 */

/**
 * Block Editor Settings
 * @typedef BlockEditorSettings
 * @property {IsoSettings} [iso] - Isolated editor settings
 * @property {EditorSettings} [editor] - Gutenberg editor settings
 */

/**
 * Gutenberg Editor Settings - this isn't the complete object, but just enough for linting here
 * @typedef EditorSettings
 * @property {boolean} hasUploadPermissions
 * @property {object} allowedMimeTypes
 * @property {string[]} allowedBlockTypes
 * @property {boolean} hasFixedToolbar
 * @property {null|object} mediaUpload
 * @property {object[]|null} template
 * @property {null} templateLock
 * @property {object[]} reusableBlocks
 * @property {object[]} styles
 * @property {object[]} defaultEditorStyles
 */

/**
 * Initialize Gutenberg
 */

export function initializeEditor() {
  if (window.isoInitialised) {
    return;
  } // Register all core blocks


  registerCoreBlocks();
  window.isoInitialised = true;
}
export function initializeIsoEditor() {
  if (window.isoInitialisedBlocks) {
    return;
  }

  initializeEditor(); // This allows the editor to swap stores dynamically

  use(storeHotSwapPlugin, {}); // This is needed for the media uploader

  addFilter('editor.MediaUpload', 'isolated-block-editor/media-upload', () => MediaUpload);
  registerApiHandlers(); // Don't run this again

  window.isoInitialisedBlocks = true;
}
/**
 * Save blocks callback
 * @callback OnSaveBlocks
 * @param {object[]} blocks - Editor content to save
 * @param {string[]} ignoredContent - Possible content to ignore
 */

/**
 * Save HTML content callback
 * @callback OnSaveContent
 * @param {string} content - Serialized content
 */

/**
 * Parser callback
 * @callback OnParse
 * @param {string} content - HTML content
 * @returns {object[]}
 */

/**
 * Initial load blocks callback
 * @callback OnLoad
 * @param {OnParse} parse - Current block parser
 * @param {OnParse} rawHandler - Current raw handler
 * @returns {object[]|Promise}
 */

/**
 * Error callback
 * @callback OnError
 */

/**
 * Isolated block editor component.
 *
 * This wraps up the Gutenberg editor along with a customised store. The contents of the editor are unique, and multiple instances
 * can be created.
 *
 * @param {object} props - Component props
 * @param {OnSaveBlocks} [props.onSaveBlocks] - Save callback
 * @param {OnSaveContent} [props.onSaveContent] - Save callback
 * @param {OnError} props.onError - Error callback
 * @param {OnLoad} [props.onLoad] - Initial blocks
 * @param {BlockEditorSettings} props.settings - Settings
 * @param {object} [props.children] - Child content
 * @param {string} [props.className] - Additional class name
 * @param {OnMore} [props.renderMoreMenu] - Callback to render additional items in the more menu
 */

function IsolatedBlockEditor(props) {
  const {
    children,
    onSaveContent,
    onSaveBlocks,
    settings,
    ...params
  } = props;
  initializeIsoEditor();
  return createElement(StrictMode, null, createElement(ShortcutProvider, null, createElement(ContentSaver, {
    onSaveBlocks: onSaveBlocks,
    onSaveContent: onSaveContent
  }), createElement(EditorSetup, {
    settings: settings
  }), createElement(PatternMonitor, null), createElement(SlotFillProvider, null, createElement(BlockEditorContainer, _extends({}, params, {
    settings: settings
  }), children))));
}

export default withRegistryProvider(IsolatedBlockEditor);
export { EditorLoaded, DocumentSection, ToolbarSlot, CollaborativeEditing, FooterSlot };
//# sourceMappingURL=index.js.map