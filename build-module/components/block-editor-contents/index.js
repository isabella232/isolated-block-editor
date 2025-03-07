import { createElement } from "@wordpress/element";

/**
 * External dependencies
 */
import isPromise from 'is-promise';
/**
 * WordPress dependencies
 */

import { Popover } from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import { parse, rawHandler } from '@wordpress/blocks';
/**
 * Internal dependencies
 */

import { BlockEditorProvider } from '@wordpress/block-editor';
import BlockEditor from '../block-editor';
import getInitialEditorContent from './editor-content';
/** @typedef {import('../../store/editor/reducer').EditorMode} EditorMode */

/** @typedef {import('../../index').BlockEditorSettings} BlockEditorSettings */

/** @typedef {import('../../index').OnLoad} OnLoad */

/** @typedef {import('../../index').OnMore} OnMore */

/**
 * Get editor selection
 * @callback OnSelection
 */

/**
 * Update callback
 * @callback OnUpdate
 * @param {object[]} blocks - Editor content to save
 * @param {object} [options]
 */

async function getInitialContent(settings, loader) {
  const contentLoader = isPromise(loader) ? loader : new Promise(resolve => {
    resolve(loader ? loader(parse, rawHandler) : []);
  });
  return contentLoader.then(content => {
    return getInitialEditorContent(settings.iso.patterns, settings.iso.currentPattern, settings.editor.template, content);
  });
}
/**
 * The editor itself, including toolbar
 *
 * @param {object} props - Component props
 * @param {object[]} props.blocks
 * @param {OnUpdate} props.updateBlocksWithoutUndo - Callback to update blocks
 * @param {OnUpdate} props.updateBlocksWithUndo - Callback to update blocks
 * @param {boolean} props.isEditing - Are we editing in this editor?
 * @param {EditorMode} props.editorMode - Visual or code?
 * @param {object} props.children - Child components
 * @param {BlockEditorSettings} props.settings - Settings
 * @param {OnMore} props.renderMoreMenu - Callback to render additional items in the more menu
 * @param {OnSelection} props.selection
 * @param {OnLoad} props.onLoad - Load initial blocks
 */


function BlockEditorContents(props) {
  const {
    blocks,
    updateBlocksWithoutUndo,
    updateBlocksWithUndo,
    selection,
    isEditing,
    editorMode
  } = props;
  const {
    children,
    settings,
    renderMoreMenu,
    onLoad
  } = props; // Set initial content, if we have any, but only if there is no existing data in the editor (from elsewhere)

  useEffect(() => {
    const loadData = async () => {
      const initialContent = await getInitialContent(settings, onLoad);

      if (initialContent.length > 0 && (!blocks || blocks.length === 0)) {
        updateBlocksWithoutUndo(initialContent, {
          isInitialContent: true
        });
      }
    };

    loadData();
  }, []);
  return createElement(BlockEditorProvider, {
    value: blocks || [],
    onInput: updateBlocksWithoutUndo,
    onChange: updateBlocksWithUndo,
    useSubRegistry: false,
    selection: selection,
    settings: settings.editor
  }, createElement(BlockEditor, {
    isEditing: isEditing,
    editorMode: editorMode,
    settings: settings,
    renderMoreMenu: renderMoreMenu
  }, children), createElement(Popover.Slot, null));
}

export default compose([withSelect(select => {
  const {
    getBlocks,
    getEditorSelection,
    getEditorMode,
    isEditing
  } = select('isolated/editor');
  return {
    blocks: getBlocks(),
    selection: getEditorSelection(),
    isEditing: isEditing(),
    editorMode: getEditorMode()
  };
}), withDispatch(dispatch => {
  const {
    updateBlocksWithUndo,
    updateBlocksWithoutUndo
  } = dispatch('isolated/editor');
  return {
    updateBlocksWithUndo,
    updateBlocksWithoutUndo
  };
})])(BlockEditorContents);
//# sourceMappingURL=index.js.map