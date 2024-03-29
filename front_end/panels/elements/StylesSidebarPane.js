// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { FontEditorSectionManager } from './ColorSwatchPopoverIcon.js';
import * as ElementsComponents from './components/components.js';
import { ComputedStyleModel } from './ComputedStyleModel.js';
import { linkifyDeferredNodeReference } from './DOMLinkifier.js';
import { ElementsPanel } from './ElementsPanel.js';
import { ElementsSidebarPane } from './ElementsSidebarPane.js';
import { ImagePreviewPopover } from './ImagePreviewPopover.js';
import { StyleEditorWidget } from './StyleEditorWidget.js';
import { StylePropertyHighlighter } from './StylePropertyHighlighter.js';
import stylesSectionTreeStyles from './stylesSectionTree.css.js';
import stylesSidebarPaneStyles from './stylesSidebarPane.css.js';
import { StylePropertyTreeElement } from './StylePropertyTreeElement.js';
const UIStrings = {
    /**
    *@description No matches element text content in Styles Sidebar Pane of the Elements panel
    */
    noMatchingSelectorOrStyle: 'No matching selector or style',
    /**
    *@description Text in Styles Sidebar Pane of the Elements panel
    */
    invalidPropertyValue: 'Invalid property value',
    /**
    *@description Text in Styles Sidebar Pane of the Elements panel
    */
    unknownPropertyName: 'Unknown property name',
    /**
    *@description Text to filter result items
    */
    filter: 'Filter',
    /**
    *@description ARIA accessible name in Styles Sidebar Pane of the Elements panel
    */
    filterStyles: 'Filter Styles',
    /**
    *@description Separator element text content in Styles Sidebar Pane of the Elements panel
    *@example {scrollbar-corner} PH1
    */
    pseudoSElement: 'Pseudo ::{PH1} element',
    /**
    *@description Text of a DOM element in Styles Sidebar Pane of the Elements panel
    */
    inheritedFroms: 'Inherited from ',
    /**
    *@description Tooltip text that appears when hovering over the largeicon add button in the Styles Sidebar Pane of the Elements panel
    */
    insertStyleRuleBelow: 'Insert Style Rule Below',
    /**
    *@description Text in Styles Sidebar Pane of the Elements panel
    */
    constructedStylesheet: 'constructed stylesheet',
    /**
    *@description Text in Styles Sidebar Pane of the Elements panel
    */
    userAgentStylesheet: 'user agent stylesheet',
    /**
    *@description Text in Styles Sidebar Pane of the Elements panel
    */
    injectedStylesheet: 'injected stylesheet',
    /**
    *@description Text in Styles Sidebar Pane of the Elements panel
    */
    viaInspector: 'via inspector',
    /**
    *@description Text in Styles Sidebar Pane of the Elements panel
    */
    styleAttribute: '`style` attribute',
    /**
    *@description Text in Styles Sidebar Pane of the Elements panel
    *@example {html} PH1
    */
    sattributesStyle: '{PH1}[Attributes Style]',
    /**
    *@description Show all button text content in Styles Sidebar Pane of the Elements panel
    *@example {3} PH1
    */
    showAllPropertiesSMore: 'Show All Properties ({PH1} more)',
    /**
    *@description Text in Elements Tree Element of the Elements panel, copy should be used as a verb
    */
    copySelector: 'Copy `selector`',
    /**
    *@description A context menu item in Styles panel to copy CSS rule
    */
    copyRule: 'Copy rule',
    /**
    *@description A context menu item in Styles panel to copy all CSS declarations
    */
    copyAllDeclarations: 'Copy all declarations',
    /**
    *@description Title of  in styles sidebar pane of the elements panel
    *@example {Ctrl} PH1
    */
    incrementdecrementWithMousewheelOne: 'Increment/decrement with mousewheel or up/down keys. {PH1}: R ±1, Shift: G ±1, Alt: B ±1',
    /**
    *@description Title of  in styles sidebar pane of the elements panel
    *@example {Ctrl} PH1
    */
    incrementdecrementWithMousewheelHundred: 'Increment/decrement with mousewheel or up/down keys. {PH1}: ±100, Shift: ±10, Alt: ±0.1',
    /**
    *@description Announcement string for invalid properties.
    *@example {Invalid property value} PH1
    *@example {font-size} PH2
    *@example {invalidValue} PH3
    */
    invalidString: '{PH1}, property name: {PH2}, property value: {PH3}',
    /**
    *@description Tooltip text that appears when hovering over the largeicon add button in the Styles Sidebar Pane of the Elements panel
    */
    newStyleRule: 'New Style Rule',
    /**
    *@description Text that is announced by the screen reader when the user focuses on an input field for entering the name of a CSS property in the Styles panel
    */
    cssPropertyName: '`CSS` property name',
    /**
    *@description Text that is announced by the screen reader when the user focuses on an input field for entering the value of a CSS property in the Styles panel
    */
    cssPropertyValue: '`CSS` property value',
    /**
    *@description Text that is announced by the screen reader when the user focuses on an input field for editing the name of a CSS selector in the Styles panel
    */
    cssSelector: '`CSS` selector',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/StylesSidebarPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// Highlightable properties are those that can be hovered in the sidebar to trigger a specific
// highlighting mode on the current element.
const HIGHLIGHTABLE_PROPERTIES = [
    { mode: 'padding', properties: ['padding'] },
    { mode: 'border', properties: ['border'] },
    { mode: 'margin', properties: ['margin'] },
    { mode: 'gap', properties: ['gap', 'grid-gap'] },
    { mode: 'column-gap', properties: ['column-gap', 'grid-column-gap'] },
    { mode: 'row-gap', properties: ['row-gap', 'grid-row-gap'] },
    { mode: 'grid-template-columns', properties: ['grid-template-columns'] },
    { mode: 'grid-template-rows', properties: ['grid-template-rows'] },
    { mode: 'grid-template-areas', properties: ['grid-areas'] },
    { mode: 'justify-content', properties: ['justify-content'] },
    { mode: 'align-content', properties: ['align-content'] },
    { mode: 'align-items', properties: ['align-items'] },
    { mode: 'flexibility', properties: ['flex', 'flex-basis', 'flex-grow', 'flex-shrink'] },
];
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _stylesSidebarPaneInstance;
// TODO(crbug.com/1172300) This workaround is needed to keep the linter happy.
// Otherwise it complains about: Unknown word CssSyntaxError
const STYLE_TAG = '<' +
    'style>';
export class StylesSidebarPane extends Common.ObjectWrapper.eventMixin(ElementsSidebarPane) {
    currentToolbarPane;
    animatedToolbarPane;
    pendingWidget;
    pendingWidgetToggle;
    toolbar;
    toolbarPaneElement;
    noMatchesElement;
    sectionsContainer;
    sectionByElement;
    swatchPopoverHelperInternal;
    linkifier;
    decorator;
    lastRevealedProperty;
    userOperation;
    isEditingStyle;
    filterRegexInternal;
    isActivePropertyHighlighted;
    initialUpdateCompleted;
    hasMatchedStyles;
    sectionBlocks;
    idleCallbackManager;
    needsForceUpdate;
    resizeThrottler;
    imagePreviewPopover;
    activeCSSAngle;
    static instance() {
        if (!_stylesSidebarPaneInstance) {
            _stylesSidebarPaneInstance = new StylesSidebarPane();
        }
        return _stylesSidebarPaneInstance;
    }
    constructor() {
        super(true /* delegatesFocus */);
        this.setMinimumSize(96, 26);
        this.registerCSSFiles([stylesSidebarPaneStyles]);
        Common.Settings.Settings.instance().moduleSetting('colorFormat').addChangeListener(this.update.bind(this));
        Common.Settings.Settings.instance().moduleSetting('textEditorIndent').addChangeListener(this.update.bind(this));
        this.currentToolbarPane = null;
        this.animatedToolbarPane = null;
        this.pendingWidget = null;
        this.pendingWidgetToggle = null;
        this.toolbar = null;
        this.toolbarPaneElement = this.createStylesSidebarToolbar();
        this.computedStyleModelInternal = new ComputedStyleModel();
        this.noMatchesElement = this.contentElement.createChild('div', 'gray-info-message hidden');
        this.noMatchesElement.textContent = i18nString(UIStrings.noMatchingSelectorOrStyle);
        this.sectionsContainer = this.contentElement.createChild('div');
        UI.ARIAUtils.markAsList(this.sectionsContainer);
        this.sectionsContainer.addEventListener('keydown', this.sectionsContainerKeyDown.bind(this), false);
        this.sectionsContainer.addEventListener('focusin', this.sectionsContainerFocusChanged.bind(this), false);
        this.sectionsContainer.addEventListener('focusout', this.sectionsContainerFocusChanged.bind(this), false);
        this.sectionByElement = new WeakMap();
        this.swatchPopoverHelperInternal = new InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper();
        this.swatchPopoverHelperInternal.addEventListener(InlineEditor.SwatchPopoverHelper.Events.WillShowPopover, this.hideAllPopovers, this);
        this.linkifier = new Components.Linkifier.Linkifier(_maxLinkLength, /* useLinkDecorator */ true);
        this.decorator = new StylePropertyHighlighter(this);
        this.lastRevealedProperty = null;
        this.userOperation = false;
        this.isEditingStyle = false;
        this.filterRegexInternal = null;
        this.isActivePropertyHighlighted = false;
        this.initialUpdateCompleted = false;
        this.hasMatchedStyles = false;
        this.contentElement.classList.add('styles-pane');
        this.sectionBlocks = [];
        this.idleCallbackManager = null;
        this.needsForceUpdate = false;
        _stylesSidebarPaneInstance = this;
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DOMModel.DOMNode, this.forceUpdate, this);
        this.contentElement.addEventListener('copy', this.clipboardCopy.bind(this));
        this.resizeThrottler = new Common.Throttler.Throttler(100);
        this.imagePreviewPopover = new ImagePreviewPopover(this.contentElement, event => {
            const link = event.composedPath()[0];
            if (link instanceof Element) {
                return link;
            }
            return null;
        }, () => this.node());
        this.activeCSSAngle = null;
    }
    swatchPopoverHelper() {
        return this.swatchPopoverHelperInternal;
    }
    setUserOperation(userOperation) {
        this.userOperation = userOperation;
    }
    static createExclamationMark(property, title) {
        const exclamationElement = document.createElement('span', { is: 'dt-icon-label' });
        exclamationElement.className = 'exclamation-mark';
        if (!StylesSidebarPane.ignoreErrorsForProperty(property)) {
            exclamationElement.type = 'smallicon-warning';
        }
        let invalidMessage;
        if (title) {
            UI.Tooltip.Tooltip.install(exclamationElement, title);
            invalidMessage = title;
        }
        else {
            invalidMessage = SDK.CSSMetadata.cssMetadata().isCSSPropertyName(property.name) ?
                i18nString(UIStrings.invalidPropertyValue) :
                i18nString(UIStrings.unknownPropertyName);
            UI.Tooltip.Tooltip.install(exclamationElement, invalidMessage);
        }
        const invalidString = i18nString(UIStrings.invalidString, { PH1: invalidMessage, PH2: property.name, PH3: property.value });
        // Storing the invalidString for future screen reader support when editing the property
        property.setDisplayedStringForInvalidProperty(invalidString);
        return exclamationElement;
    }
    static ignoreErrorsForProperty(property) {
        function hasUnknownVendorPrefix(string) {
            return !string.startsWith('-webkit-') && /^[-_][\w\d]+-\w/.test(string);
        }
        const name = property.name.toLowerCase();
        // IE hack.
        if (name.charAt(0) === '_') {
            return true;
        }
        // IE has a different format for this.
        if (name === 'filter') {
            return true;
        }
        // Common IE-specific property prefix.
        if (name.startsWith('scrollbar-')) {
            return true;
        }
        if (hasUnknownVendorPrefix(name)) {
            return true;
        }
        const value = property.value.toLowerCase();
        // IE hack.
        if (value.endsWith('\\9')) {
            return true;
        }
        if (hasUnknownVendorPrefix(value)) {
            return true;
        }
        return false;
    }
    static createPropertyFilterElement(placeholder, container, filterCallback) {
        const input = document.createElement('input');
        input.type = 'search';
        input.classList.add('custom-search-input');
        input.placeholder = placeholder;
        function searchHandler() {
            const regex = input.value ? new RegExp(Platform.StringUtilities.escapeForRegExp(input.value), 'i') : null;
            filterCallback(regex);
        }
        input.addEventListener('input', searchHandler, false);
        function keydownHandler(event) {
            const keyboardEvent = event;
            if (keyboardEvent.key !== Platform.KeyboardUtilities.ESCAPE_KEY || !input.value) {
                return;
            }
            keyboardEvent.consume(true);
            input.value = '';
            searchHandler();
        }
        input.addEventListener('keydown', keydownHandler, false);
        return input;
    }
    static formatLeadingProperties(section) {
        const selectorText = section.headerText();
        const indent = Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
        const style = section.style();
        const lines = [];
        // Invalid property should also be copied.
        // For example: *display: inline.
        for (const property of style.leadingProperties()) {
            if (property.disabled) {
                lines.push(`${indent}/* ${property.name}: ${property.value}; */`);
            }
            else {
                lines.push(`${indent}${property.name}: ${property.value};`);
            }
        }
        const allDeclarationText = lines.join('\n');
        const ruleText = `${selectorText} {\n${allDeclarationText}\n}`;
        return {
            allDeclarationText,
            ruleText,
        };
    }
    revealProperty(cssProperty) {
        this.decorator.highlightProperty(cssProperty);
        this.lastRevealedProperty = cssProperty;
        this.update();
    }
    jumpToProperty(propertyName) {
        this.decorator.findAndHighlightPropertyName(propertyName);
    }
    forceUpdate() {
        this.needsForceUpdate = true;
        this.swatchPopoverHelperInternal.hide();
        this.resetCache();
        this.update();
    }
    sectionsContainerKeyDown(event) {
        const activeElement = this.sectionsContainer.ownerDocument.deepActiveElement();
        if (!activeElement) {
            return;
        }
        const section = this.sectionByElement.get(activeElement);
        if (!section) {
            return;
        }
        let sectionToFocus = null;
        let willIterateForward = false;
        switch ( /** @type {!KeyboardEvent} */event.key) {
            case 'ArrowUp':
            case 'ArrowLeft': {
                sectionToFocus = section.previousSibling() || section.lastSibling();
                willIterateForward = false;
                break;
            }
            case 'ArrowDown':
            case 'ArrowRight': {
                sectionToFocus = section.nextSibling() || section.firstSibling();
                willIterateForward = true;
                break;
            }
            case 'Home': {
                sectionToFocus = section.firstSibling();
                willIterateForward = true;
                break;
            }
            case 'End': {
                sectionToFocus = section.lastSibling();
                willIterateForward = false;
                break;
            }
        }
        if (sectionToFocus && this.filterRegexInternal) {
            sectionToFocus = sectionToFocus.findCurrentOrNextVisible(/* willIterateForward= */ willIterateForward);
        }
        if (sectionToFocus) {
            sectionToFocus.element.focus();
            event.consume(true);
        }
    }
    sectionsContainerFocusChanged() {
        this.resetFocus();
    }
    resetFocus() {
        // When a styles section is focused, shift+tab should leave the section.
        // Leaving tabIndex = 0 on the first element would cause it to be focused instead.
        if (!this.noMatchesElement.classList.contains('hidden')) {
            return;
        }
        if (this.sectionBlocks[0] && this.sectionBlocks[0].sections[0]) {
            const firstVisibleSection = this.sectionBlocks[0].sections[0].findCurrentOrNextVisible(/* willIterateForward= */ true);
            if (firstVisibleSection) {
                firstVisibleSection.element.tabIndex = this.sectionsContainer.hasFocus() ? -1 : 0;
            }
        }
    }
    onAddButtonLongClick(event) {
        const cssModel = this.cssModel();
        if (!cssModel) {
            return;
        }
        const headers = cssModel.styleSheetHeaders().filter(styleSheetResourceHeader);
        const contextMenuDescriptors = [];
        for (let i = 0; i < headers.length; ++i) {
            const header = headers[i];
            const handler = this.createNewRuleInStyleSheet.bind(this, header);
            contextMenuDescriptors.push({ text: Bindings.ResourceUtils.displayNameForURL(header.resourceURL()), handler });
        }
        contextMenuDescriptors.sort(compareDescriptors);
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        for (let i = 0; i < contextMenuDescriptors.length; ++i) {
            const descriptor = contextMenuDescriptors[i];
            contextMenu.defaultSection().appendItem(descriptor.text, descriptor.handler);
        }
        contextMenu.footerSection().appendItem('inspector-stylesheet', this.createNewRuleInViaInspectorStyleSheet.bind(this));
        contextMenu.show();
        function compareDescriptors(descriptor1, descriptor2) {
            return Platform.StringUtilities.naturalOrderComparator(descriptor1.text, descriptor2.text);
        }
        function styleSheetResourceHeader(header) {
            return !header.isViaInspector() && !header.isInline && Boolean(header.resourceURL());
        }
    }
    onFilterChanged(regex) {
        this.filterRegexInternal = regex;
        this.updateFilter();
        this.resetFocus();
    }
    refreshUpdate(editedSection, editedTreeElement) {
        if (editedTreeElement) {
            for (const section of this.allSections()) {
                if (section instanceof BlankStylePropertiesSection && section.isBlank) {
                    continue;
                }
                section.updateVarFunctions(editedTreeElement);
            }
        }
        if (this.isEditingStyle) {
            return;
        }
        const node = this.node();
        if (!node) {
            return;
        }
        for (const section of this.allSections()) {
            if (section instanceof BlankStylePropertiesSection && section.isBlank) {
                continue;
            }
            section.update(section === editedSection);
        }
        if (this.filterRegexInternal) {
            this.updateFilter();
        }
        this.swatchPopoverHelper().reposition();
        this.nodeStylesUpdatedForTest(node, false);
    }
    async doUpdate() {
        if (!this.initialUpdateCompleted) {
            setTimeout(() => {
                if (!this.initialUpdateCompleted) {
                    // the spinner will get automatically removed when innerRebuildUpdate is called
                    this.sectionsContainer.createChild('span', 'spinner');
                }
            }, 200 /* only spin for loading time > 200ms to avoid unpleasant render flashes */);
        }
        const matchedStyles = await this.fetchMatchedCascade();
        await this.innerRebuildUpdate(matchedStyles);
        if (!this.initialUpdateCompleted) {
            this.initialUpdateCompleted = true;
            this.dispatchEventToListeners("InitialUpdateCompleted" /* InitialUpdateCompleted */);
        }
        this.dispatchEventToListeners("StylesUpdateCompleted" /* StylesUpdateCompleted */, { hasMatchedStyles: this.hasMatchedStyles });
    }
    onResize() {
        this.resizeThrottler.schedule(this.innerResize.bind(this));
    }
    innerResize() {
        const width = this.contentElement.getBoundingClientRect().width + 'px';
        this.allSections().forEach(section => {
            section.propertiesTreeOutline.element.style.width = width;
        });
        return Promise.resolve();
    }
    resetCache() {
        const cssModel = this.cssModel();
        if (cssModel) {
            cssModel.discardCachedMatchedCascade();
        }
    }
    fetchMatchedCascade() {
        const node = this.node();
        if (!node || !this.cssModel()) {
            return Promise.resolve(null);
        }
        const cssModel = this.cssModel();
        if (!cssModel) {
            return Promise.resolve(null);
        }
        return cssModel.cachedMatchedCascadeForNode(node).then(validateStyles.bind(this));
        function validateStyles(matchedStyles) {
            return matchedStyles && matchedStyles.node() === this.node() ? matchedStyles : null;
        }
    }
    setEditingStyle(editing, _treeElement) {
        if (this.isEditingStyle === editing) {
            return;
        }
        this.contentElement.classList.toggle('is-editing-style', editing);
        this.isEditingStyle = editing;
        this.setActiveProperty(null);
    }
    setActiveProperty(treeElement) {
        if (this.isActivePropertyHighlighted) {
            SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        }
        this.isActivePropertyHighlighted = false;
        if (!this.node()) {
            return;
        }
        if (!treeElement || treeElement.overloaded() || treeElement.inherited()) {
            return;
        }
        const rule = treeElement.property.ownerStyle.parentRule;
        const selectorList = (rule instanceof SDK.CSSRule.CSSStyleRule) ? rule.selectorText() : undefined;
        for (const { properties, mode } of HIGHLIGHTABLE_PROPERTIES) {
            if (!properties.includes(treeElement.name)) {
                continue;
            }
            const node = this.node();
            if (!node) {
                continue;
            }
            node.domModel().overlayModel().highlightInOverlay({ node: this.node(), selectorList }, mode);
            this.isActivePropertyHighlighted = true;
            break;
        }
    }
    onCSSModelChanged(event) {
        const edit = event?.data && 'edit' in event.data ? event.data.edit : null;
        if (edit) {
            for (const section of this.allSections()) {
                section.styleSheetEdited(edit);
            }
            return;
        }
        if (this.userOperation || this.isEditingStyle) {
            return;
        }
        this.resetCache();
        this.update();
    }
    focusedSectionIndex() {
        let index = 0;
        for (const block of this.sectionBlocks) {
            for (const section of block.sections) {
                if (section.element.hasFocus()) {
                    return index;
                }
                index++;
            }
        }
        return -1;
    }
    continueEditingElement(sectionIndex, propertyIndex) {
        const section = this.allSections()[sectionIndex];
        if (section) {
            const element = section.closestPropertyForEditing(propertyIndex);
            if (!element) {
                section.element.focus();
                return;
            }
            element.startEditing();
        }
    }
    async innerRebuildUpdate(matchedStyles) {
        // ElementsSidebarPane's throttler schedules this method. Usually,
        // rebuild is suppressed while editing (see onCSSModelChanged()), but we need a
        // 'force' flag since the currently running throttler process cannot be canceled.
        if (this.needsForceUpdate) {
            this.needsForceUpdate = false;
        }
        else if (this.isEditingStyle || this.userOperation) {
            return;
        }
        const focusedIndex = this.focusedSectionIndex();
        this.linkifier.reset();
        const prevSections = this.sectionBlocks.map(block => block.sections).flat();
        this.sectionBlocks = [];
        const node = this.node();
        this.hasMatchedStyles = matchedStyles !== null && node !== null;
        if (!this.hasMatchedStyles) {
            this.sectionsContainer.removeChildren();
            this.noMatchesElement.classList.remove('hidden');
            return;
        }
        this.sectionBlocks =
            await this.rebuildSectionsForMatchedStyleRules(matchedStyles);
        // Style sections maybe re-created when flexbox editor is activated.
        // With the following code we re-bind the flexbox editor to the new
        // section with the same index as the previous section had.
        const newSections = this.sectionBlocks.map(block => block.sections).flat();
        const styleEditorWidget = StyleEditorWidget.instance();
        const boundSection = styleEditorWidget.getSection();
        if (boundSection) {
            styleEditorWidget.unbindContext();
            for (const [index, prevSection] of prevSections.entries()) {
                if (boundSection === prevSection && index < newSections.length) {
                    styleEditorWidget.bindContext(this, newSections[index]);
                }
            }
        }
        this.sectionsContainer.removeChildren();
        const fragment = document.createDocumentFragment();
        let index = 0;
        let elementToFocus = null;
        for (const block of this.sectionBlocks) {
            const titleElement = block.titleElement();
            if (titleElement) {
                fragment.appendChild(titleElement);
            }
            for (const section of block.sections) {
                fragment.appendChild(section.element);
                if (index === focusedIndex) {
                    elementToFocus = section.element;
                }
                index++;
            }
        }
        this.sectionsContainer.appendChild(fragment);
        if (elementToFocus) {
            elementToFocus.focus();
        }
        if (focusedIndex >= index) {
            this.sectionBlocks[0].sections[0].element.focus();
        }
        this.sectionsContainerFocusChanged();
        if (this.filterRegexInternal) {
            this.updateFilter();
        }
        else {
            this.noMatchesElement.classList.toggle('hidden', this.sectionBlocks.length > 0);
        }
        this.nodeStylesUpdatedForTest(node, true);
        if (this.lastRevealedProperty) {
            this.decorator.highlightProperty(this.lastRevealedProperty);
            this.lastRevealedProperty = null;
        }
        this.swatchPopoverHelper().reposition();
        // Record the elements tool load time after the sidepane has loaded.
        Host.userMetrics.panelLoaded('elements', 'DevTools.Launch.Elements');
        this.dispatchEventToListeners("StylesUpdateCompleted" /* StylesUpdateCompleted */, { hasMatchedStyles: false });
    }
    nodeStylesUpdatedForTest(_node, _rebuild) {
        // For sniffing in tests.
    }
    async rebuildSectionsForMatchedStyleRules(matchedStyles) {
        if (this.idleCallbackManager) {
            this.idleCallbackManager.discard();
        }
        this.idleCallbackManager = new IdleCallbackManager();
        const blocks = [new SectionBlock(null)];
        let sectionIdx = 0;
        let lastParentNode = null;
        for (const style of matchedStyles.nodeStyles()) {
            const parentNode = matchedStyles.isInherited(style) ? matchedStyles.nodeForStyle(style) : null;
            if (parentNode && parentNode !== lastParentNode) {
                lastParentNode = parentNode;
                const block = await SectionBlock.createInheritedNodeBlock(lastParentNode);
                blocks.push(block);
            }
            const lastBlock = blocks[blocks.length - 1];
            if (lastBlock) {
                this.idleCallbackManager.schedule(() => {
                    const section = new StylePropertiesSection(this, matchedStyles, style, sectionIdx);
                    sectionIdx++;
                    lastBlock.sections.push(section);
                });
            }
        }
        let pseudoTypes = [];
        const keys = matchedStyles.pseudoTypes();
        if (keys.delete("before" /* Before */)) {
            pseudoTypes.push("before" /* Before */);
        }
        pseudoTypes = pseudoTypes.concat([...keys].sort());
        for (const pseudoType of pseudoTypes) {
            const block = SectionBlock.createPseudoTypeBlock(pseudoType);
            for (const style of matchedStyles.pseudoStyles(pseudoType)) {
                this.idleCallbackManager.schedule(() => {
                    const section = new StylePropertiesSection(this, matchedStyles, style, sectionIdx);
                    sectionIdx++;
                    block.sections.push(section);
                });
            }
            blocks.push(block);
        }
        for (const keyframesRule of matchedStyles.keyframes()) {
            const block = SectionBlock.createKeyframesBlock(keyframesRule.name().text);
            for (const keyframe of keyframesRule.keyframes()) {
                this.idleCallbackManager.schedule(() => {
                    block.sections.push(new KeyframePropertiesSection(this, matchedStyles, keyframe.style, sectionIdx));
                    sectionIdx++;
                });
            }
            blocks.push(block);
        }
        await this.idleCallbackManager.awaitDone();
        return blocks;
    }
    async createNewRuleInViaInspectorStyleSheet() {
        const cssModel = this.cssModel();
        const node = this.node();
        if (!cssModel || !node) {
            return;
        }
        this.setUserOperation(true);
        const styleSheetHeader = await cssModel.requestViaInspectorStylesheet(node);
        this.setUserOperation(false);
        await this.createNewRuleInStyleSheet(styleSheetHeader);
    }
    async createNewRuleInStyleSheet(styleSheetHeader) {
        if (!styleSheetHeader) {
            return;
        }
        const text = (await styleSheetHeader.requestContent()).content || '';
        const lines = text.split('\n');
        const range = TextUtils.TextRange.TextRange.createFromLocation(lines.length - 1, lines[lines.length - 1].length);
        if (this.sectionBlocks && this.sectionBlocks.length > 0) {
            this.addBlankSection(this.sectionBlocks[0].sections[0], styleSheetHeader.id, range);
        }
    }
    addBlankSection(insertAfterSection, styleSheetId, ruleLocation) {
        const node = this.node();
        const blankSection = new BlankStylePropertiesSection(this, insertAfterSection.matchedStyles, node ? node.simpleSelector() : '', styleSheetId, ruleLocation, insertAfterSection.style(), 0);
        this.sectionsContainer.insertBefore(blankSection.element, insertAfterSection.element.nextSibling);
        for (const block of this.sectionBlocks) {
            const index = block.sections.indexOf(insertAfterSection);
            if (index === -1) {
                continue;
            }
            block.sections.splice(index + 1, 0, blankSection);
            blankSection.startEditingSelector();
        }
        let sectionIdx = 0;
        for (const block of this.sectionBlocks) {
            for (const section of block.sections) {
                section.setSectionIdx(sectionIdx);
                sectionIdx++;
            }
        }
    }
    removeSection(section) {
        for (const block of this.sectionBlocks) {
            const index = block.sections.indexOf(section);
            if (index === -1) {
                continue;
            }
            block.sections.splice(index, 1);
            section.element.remove();
        }
    }
    filterRegex() {
        return this.filterRegexInternal;
    }
    updateFilter() {
        let hasAnyVisibleBlock = false;
        for (const block of this.sectionBlocks) {
            hasAnyVisibleBlock = block.updateFilter() || hasAnyVisibleBlock;
        }
        this.noMatchesElement.classList.toggle('hidden', Boolean(hasAnyVisibleBlock));
    }
    willHide() {
        this.hideAllPopovers();
        super.willHide();
    }
    hideAllPopovers() {
        this.swatchPopoverHelperInternal.hide();
        this.imagePreviewPopover.hide();
        if (this.activeCSSAngle) {
            this.activeCSSAngle.minify();
            this.activeCSSAngle = null;
        }
    }
    allSections() {
        let sections = [];
        for (const block of this.sectionBlocks) {
            sections = sections.concat(block.sections);
        }
        return sections;
    }
    clipboardCopy(_event) {
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.StyleRuleCopied);
    }
    createStylesSidebarToolbar() {
        const container = this.contentElement.createChild('div', 'styles-sidebar-pane-toolbar-container');
        const hbox = container.createChild('div', 'hbox styles-sidebar-pane-toolbar');
        const filterContainerElement = hbox.createChild('div', 'styles-sidebar-pane-filter-box');
        const filterInput = StylesSidebarPane.createPropertyFilterElement(i18nString(UIStrings.filter), hbox, this.onFilterChanged.bind(this));
        UI.ARIAUtils.setAccessibleName(filterInput, i18nString(UIStrings.filterStyles));
        filterContainerElement.appendChild(filterInput);
        const toolbar = new UI.Toolbar.Toolbar('styles-pane-toolbar', hbox);
        toolbar.makeToggledGray();
        toolbar.appendItemsAtLocation('styles-sidebarpane-toolbar');
        this.toolbar = toolbar;
        const toolbarPaneContainer = container.createChild('div', 'styles-sidebar-toolbar-pane-container');
        const toolbarPaneContent = toolbarPaneContainer.createChild('div', 'styles-sidebar-toolbar-pane');
        return toolbarPaneContent;
    }
    showToolbarPane(widget, toggle) {
        if (this.pendingWidgetToggle) {
            this.pendingWidgetToggle.setToggled(false);
        }
        this.pendingWidgetToggle = toggle;
        if (this.animatedToolbarPane) {
            this.pendingWidget = widget;
        }
        else {
            this.startToolbarPaneAnimation(widget);
        }
        if (widget && toggle) {
            toggle.setToggled(true);
        }
    }
    appendToolbarItem(item) {
        if (this.toolbar) {
            this.toolbar.appendToolbarItem(item);
        }
    }
    startToolbarPaneAnimation(widget) {
        if (widget === this.currentToolbarPane) {
            return;
        }
        if (widget && this.currentToolbarPane) {
            this.currentToolbarPane.detach();
            widget.show(this.toolbarPaneElement);
            this.currentToolbarPane = widget;
            this.currentToolbarPane.focus();
            return;
        }
        this.animatedToolbarPane = widget;
        if (this.currentToolbarPane) {
            this.toolbarPaneElement.style.animationName = 'styles-element-state-pane-slideout';
        }
        else if (widget) {
            this.toolbarPaneElement.style.animationName = 'styles-element-state-pane-slidein';
        }
        if (widget) {
            widget.show(this.toolbarPaneElement);
        }
        const listener = onAnimationEnd.bind(this);
        this.toolbarPaneElement.addEventListener('animationend', listener, false);
        function onAnimationEnd() {
            this.toolbarPaneElement.style.removeProperty('animation-name');
            this.toolbarPaneElement.removeEventListener('animationend', listener, false);
            if (this.currentToolbarPane) {
                this.currentToolbarPane.detach();
            }
            this.currentToolbarPane = this.animatedToolbarPane;
            if (this.currentToolbarPane) {
                this.currentToolbarPane.focus();
            }
            this.animatedToolbarPane = null;
            if (this.pendingWidget) {
                this.startToolbarPaneAnimation(this.pendingWidget);
                this.pendingWidget = null;
            }
        }
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _maxLinkLength = 23;
export class SectionBlock {
    titleElementInternal;
    sections;
    constructor(titleElement) {
        this.titleElementInternal = titleElement;
        this.sections = [];
    }
    static createPseudoTypeBlock(pseudoType) {
        const separatorElement = document.createElement('div');
        separatorElement.className = 'sidebar-separator';
        separatorElement.textContent = i18nString(UIStrings.pseudoSElement, { PH1: pseudoType });
        return new SectionBlock(separatorElement);
    }
    static createKeyframesBlock(keyframesName) {
        const separatorElement = document.createElement('div');
        separatorElement.className = 'sidebar-separator';
        separatorElement.textContent = `@keyframes ${keyframesName}`;
        return new SectionBlock(separatorElement);
    }
    static async createInheritedNodeBlock(node) {
        const separatorElement = document.createElement('div');
        separatorElement.className = 'sidebar-separator';
        UI.UIUtils.createTextChild(separatorElement, i18nString(UIStrings.inheritedFroms));
        const link = await Common.Linkifier.Linkifier.linkify(node, {
            preventKeyboardFocus: true,
            tooltip: undefined,
        });
        separatorElement.appendChild(link);
        return new SectionBlock(separatorElement);
    }
    updateFilter() {
        let hasAnyVisibleSection = false;
        for (const section of this.sections) {
            hasAnyVisibleSection = section.updateFilter() || hasAnyVisibleSection;
        }
        if (this.titleElementInternal) {
            this.titleElementInternal.classList.toggle('hidden', !hasAnyVisibleSection);
        }
        return Boolean(hasAnyVisibleSection);
    }
    titleElement() {
        return this.titleElementInternal;
    }
}
export class IdleCallbackManager {
    discarded;
    promises;
    constructor() {
        this.discarded = false;
        this.promises = [];
    }
    discard() {
        this.discarded = true;
    }
    schedule(fn, timeout = 100) {
        if (this.discarded) {
            return;
        }
        this.promises.push(new Promise((resolve, reject) => {
            const run = () => {
                try {
                    fn();
                    resolve();
                }
                catch (err) {
                    reject(err);
                }
            };
            window.requestIdleCallback(() => {
                if (this.discarded) {
                    return resolve();
                }
                run();
            }, { timeout });
        }));
    }
    awaitDone() {
        return Promise.all(this.promises);
    }
}
export class StylePropertiesSection {
    parentPane;
    styleInternal;
    matchedStyles;
    editable;
    hoverTimer;
    willCauseCancelEditing;
    forceShowAll;
    originalPropertiesCount;
    element;
    innerElement;
    titleElement;
    propertiesTreeOutline;
    showAllButton;
    selectorElement;
    newStyleRuleToolbar;
    fontEditorToolbar;
    fontEditorSectionManager;
    fontEditorButton;
    selectedSinceMouseDown;
    elementToSelectorIndex;
    navigable;
    selectorRefElement;
    selectorContainer;
    fontPopoverIcon;
    hoverableSelectorsMode;
    isHiddenInternal;
    queryListElement;
    // Used to identify buttons that trigger a flexbox or grid editor.
    nextEditorTriggerButtonIdx = 1;
    sectionIdx = 0;
    constructor(parentPane, matchedStyles, style, sectionIdx) {
        this.parentPane = parentPane;
        this.sectionIdx = sectionIdx;
        this.styleInternal = style;
        this.matchedStyles = matchedStyles;
        this.editable = Boolean(style.styleSheetId && style.range);
        this.hoverTimer = null;
        this.willCauseCancelEditing = false;
        this.forceShowAll = false;
        this.originalPropertiesCount = style.leadingProperties().length;
        const rule = style.parentRule;
        this.element = document.createElement('div');
        this.element.classList.add('styles-section');
        this.element.classList.add('matched-styles');
        this.element.classList.add('monospace');
        UI.ARIAUtils.setAccessibleName(this.element, `${this.headerText()}, css selector`);
        this.element.tabIndex = -1;
        UI.ARIAUtils.markAsListitem(this.element);
        this.element.addEventListener('keydown', this.onKeyDown.bind(this), false);
        parentPane.sectionByElement.set(this.element, this);
        this.innerElement = this.element.createChild('div');
        this.titleElement = this.innerElement.createChild('div', 'styles-section-title ' + (rule ? 'styles-selector' : ''));
        this.propertiesTreeOutline = new UI.TreeOutline.TreeOutlineInShadow();
        this.propertiesTreeOutline.setFocusable(false);
        this.propertiesTreeOutline.registerCSSFiles([stylesSectionTreeStyles]);
        this.propertiesTreeOutline.element.classList.add('style-properties', 'matched-styles', 'monospace');
        // @ts-ignore TODO: fix ad hoc section property in a separate CL to be safe
        this.propertiesTreeOutline.section = this;
        this.innerElement.appendChild(this.propertiesTreeOutline.element);
        this.showAllButton = UI.UIUtils.createTextButton('', this.showAllItems.bind(this), 'styles-show-all');
        this.innerElement.appendChild(this.showAllButton);
        const selectorContainer = document.createElement('div');
        this.selectorElement = document.createElement('span');
        UI.ARIAUtils.setAccessibleName(this.selectorElement, i18nString(UIStrings.cssSelector));
        this.selectorElement.classList.add('selector');
        this.selectorElement.textContent = this.headerText();
        selectorContainer.appendChild(this.selectorElement);
        this.selectorElement.addEventListener('mouseenter', this.onMouseEnterSelector.bind(this), false);
        this.selectorElement.addEventListener('mousemove', event => event.consume(), false);
        this.selectorElement.addEventListener('mouseleave', this.onMouseOutSelector.bind(this), false);
        const openBrace = selectorContainer.createChild('span', 'sidebar-pane-open-brace');
        openBrace.textContent = ' {';
        selectorContainer.addEventListener('mousedown', this.handleEmptySpaceMouseDown.bind(this), false);
        selectorContainer.addEventListener('click', this.handleSelectorContainerClick.bind(this), false);
        const closeBrace = this.innerElement.createChild('div', 'sidebar-pane-closing-brace');
        closeBrace.textContent = '}';
        if (this.styleInternal.parentRule) {
            const newRuleButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.insertStyleRuleBelow), 'largeicon-add');
            newRuleButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this.onNewRuleClick, this);
            newRuleButton.element.tabIndex = -1;
            if (!this.newStyleRuleToolbar) {
                this.newStyleRuleToolbar =
                    new UI.Toolbar.Toolbar('sidebar-pane-section-toolbar new-rule-toolbar', this.innerElement);
            }
            this.newStyleRuleToolbar.appendToolbarItem(newRuleButton);
            UI.ARIAUtils.markAsHidden(this.newStyleRuleToolbar.element);
        }
        if (Root.Runtime.experiments.isEnabled('fontEditor') && this.editable) {
            this.fontEditorToolbar = new UI.Toolbar.Toolbar('sidebar-pane-section-toolbar', this.innerElement);
            this.fontEditorSectionManager = new FontEditorSectionManager(this.parentPane.swatchPopoverHelper(), this);
            this.fontEditorButton = new UI.Toolbar.ToolbarButton('Font Editor', 'largeicon-font-editor');
            this.fontEditorButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => {
                this.onFontEditorButtonClicked();
            }, this);
            this.fontEditorButton.element.addEventListener('keydown', event => {
                if (isEnterOrSpaceKey(event)) {
                    event.consume(true);
                    this.onFontEditorButtonClicked();
                }
            }, false);
            this.fontEditorToolbar.appendToolbarItem(this.fontEditorButton);
            if (this.styleInternal.type === SDK.CSSStyleDeclaration.Type.Inline) {
                if (this.newStyleRuleToolbar) {
                    this.newStyleRuleToolbar.element.classList.add('shifted-toolbar');
                }
            }
            else {
                this.fontEditorToolbar.element.classList.add('font-toolbar-hidden');
            }
        }
        this.selectorElement.addEventListener('click', this.handleSelectorClick.bind(this), false);
        this.element.addEventListener('contextmenu', this.handleContextMenuEvent.bind(this), false);
        this.element.addEventListener('mousedown', this.handleEmptySpaceMouseDown.bind(this), false);
        this.element.addEventListener('click', this.handleEmptySpaceClick.bind(this), false);
        this.element.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this), false);
        this.selectedSinceMouseDown = false;
        this.elementToSelectorIndex = new WeakMap();
        if (rule) {
            // Prevent editing the user agent and user rules.
            if (rule.isUserAgent() || rule.isInjected()) {
                this.editable = false;
            }
            else {
                // Check this is a real CSSRule, not a bogus object coming from BlankStylePropertiesSection.
                if (rule.styleSheetId) {
                    const header = rule.cssModel().styleSheetHeaderForId(rule.styleSheetId);
                    this.navigable = header && !header.isAnonymousInlineStyleSheet();
                }
            }
        }
        this.queryListElement = this.titleElement.createChild('div', 'query-list query-matches');
        this.selectorRefElement = this.titleElement.createChild('div', 'styles-section-subtitle');
        this.updateQueryList();
        this.updateRuleOrigin();
        this.titleElement.appendChild(selectorContainer);
        this.selectorContainer = selectorContainer;
        if (this.navigable) {
            this.element.classList.add('navigable');
        }
        if (!this.editable) {
            this.element.classList.add('read-only');
            this.propertiesTreeOutline.element.classList.add('read-only');
        }
        this.fontPopoverIcon = null;
        this.hoverableSelectorsMode = false;
        this.isHiddenInternal = false;
        this.markSelectorMatches();
        this.onpopulate();
    }
    setSectionIdx(sectionIdx) {
        this.sectionIdx = sectionIdx;
        this.onpopulate();
    }
    getSectionIdx() {
        return this.sectionIdx;
    }
    registerFontProperty(treeElement) {
        if (this.fontEditorSectionManager) {
            this.fontEditorSectionManager.registerFontProperty(treeElement);
        }
        if (this.fontEditorToolbar) {
            this.fontEditorToolbar.element.classList.remove('font-toolbar-hidden');
            if (this.newStyleRuleToolbar) {
                this.newStyleRuleToolbar.element.classList.add('shifted-toolbar');
            }
        }
    }
    resetToolbars() {
        if (this.parentPane.swatchPopoverHelper().isShowing() ||
            this.styleInternal.type === SDK.CSSStyleDeclaration.Type.Inline) {
            return;
        }
        if (this.fontEditorToolbar) {
            this.fontEditorToolbar.element.classList.add('font-toolbar-hidden');
        }
        if (this.newStyleRuleToolbar) {
            this.newStyleRuleToolbar.element.classList.remove('shifted-toolbar');
        }
    }
    static createRuleOriginNode(matchedStyles, linkifier, rule) {
        if (!rule) {
            return document.createTextNode('');
        }
        const ruleLocation = this.getRuleLocationFromCSSRule(rule);
        const header = rule.styleSheetId ? matchedStyles.cssModel().styleSheetHeaderForId(rule.styleSheetId) : null;
        function linkifyRuleLocation() {
            if (!rule) {
                return null;
            }
            if (ruleLocation && rule.styleSheetId && header && !header.isAnonymousInlineStyleSheet()) {
                return StylePropertiesSection.linkifyRuleLocation(matchedStyles.cssModel(), linkifier, rule.styleSheetId, ruleLocation);
            }
            return null;
        }
        function linkifyNode(label) {
            if (header?.ownerNode) {
                const link = linkifyDeferredNodeReference(header.ownerNode, {
                    preventKeyboardFocus: false,
                    tooltip: undefined,
                });
                link.textContent = label;
                return link;
            }
            return null;
        }
        if (header?.isMutable && !header.isViaInspector()) {
            const location = header.isConstructedByNew() ? null : linkifyRuleLocation();
            if (location) {
                return location;
            }
            const label = header.isConstructedByNew() ? i18nString(UIStrings.constructedStylesheet) : STYLE_TAG;
            const node = linkifyNode(label);
            if (node) {
                return node;
            }
            return document.createTextNode(label);
        }
        const location = linkifyRuleLocation();
        if (location) {
            return location;
        }
        if (rule.isUserAgent()) {
            return document.createTextNode(i18nString(UIStrings.userAgentStylesheet));
        }
        if (rule.isInjected()) {
            return document.createTextNode(i18nString(UIStrings.injectedStylesheet));
        }
        if (rule.isViaInspector()) {
            return document.createTextNode(i18nString(UIStrings.viaInspector));
        }
        const node = linkifyNode(STYLE_TAG);
        if (node) {
            return node;
        }
        return document.createTextNode('');
    }
    static getRuleLocationFromCSSRule(rule) {
        let ruleLocation;
        if (rule instanceof SDK.CSSRule.CSSStyleRule) {
            ruleLocation = rule.style.range;
        }
        else if (rule instanceof SDK.CSSRule.CSSKeyframeRule) {
            ruleLocation = rule.key().range;
        }
        return ruleLocation;
    }
    static tryNavigateToRuleLocation(matchedStyles, rule) {
        if (!rule) {
            return;
        }
        const ruleLocation = this.getRuleLocationFromCSSRule(rule);
        const header = rule.styleSheetId ? matchedStyles.cssModel().styleSheetHeaderForId(rule.styleSheetId) : null;
        if (ruleLocation && rule.styleSheetId && header && !header.isAnonymousInlineStyleSheet()) {
            const matchingSelectorLocation = this.getCSSSelectorLocation(matchedStyles.cssModel(), rule.styleSheetId, ruleLocation);
            this.revealSelectorSource(matchingSelectorLocation, true);
        }
    }
    static linkifyRuleLocation(cssModel, linkifier, styleSheetId, ruleLocation) {
        const matchingSelectorLocation = this.getCSSSelectorLocation(cssModel, styleSheetId, ruleLocation);
        return linkifier.linkifyCSSLocation(matchingSelectorLocation);
    }
    static getCSSSelectorLocation(cssModel, styleSheetId, ruleLocation) {
        const styleSheetHeader = cssModel.styleSheetHeaderForId(styleSheetId);
        const lineNumber = styleSheetHeader.lineNumberInSource(ruleLocation.startLine);
        const columnNumber = styleSheetHeader.columnNumberInSource(ruleLocation.startLine, ruleLocation.startColumn);
        return new SDK.CSSModel.CSSLocation(styleSheetHeader, lineNumber, columnNumber);
    }
    getFocused() {
        return this.propertiesTreeOutline.shadowRoot.activeElement || null;
    }
    focusNext(element) {
        // Clear remembered focused item (if any).
        const focused = this.getFocused();
        if (focused) {
            focused.tabIndex = -1;
        }
        // Focus the next item and remember it (if in our subtree).
        element.focus();
        if (this.propertiesTreeOutline.shadowRoot.contains(element)) {
            element.tabIndex = 0;
        }
    }
    ruleNavigation(keyboardEvent) {
        if (keyboardEvent.altKey || keyboardEvent.ctrlKey || keyboardEvent.metaKey || keyboardEvent.shiftKey) {
            return;
        }
        const focused = this.getFocused();
        let focusNext = null;
        const focusable = Array.from(this.propertiesTreeOutline.shadowRoot.querySelectorAll('[tabindex]'));
        if (focusable.length === 0) {
            return;
        }
        const focusedIndex = focused ? focusable.indexOf(focused) : -1;
        if (keyboardEvent.key === 'ArrowLeft') {
            focusNext = focusable[focusedIndex - 1] || this.element;
        }
        else if (keyboardEvent.key === 'ArrowRight') {
            focusNext = focusable[focusedIndex + 1] || this.element;
        }
        else if (keyboardEvent.key === 'ArrowUp' || keyboardEvent.key === 'ArrowDown') {
            this.focusNext(this.element);
            return;
        }
        if (focusNext) {
            this.focusNext(focusNext);
            keyboardEvent.consume(true);
        }
    }
    onKeyDown(event) {
        const keyboardEvent = event;
        if (UI.UIUtils.isEditing() || !this.editable || keyboardEvent.altKey || keyboardEvent.ctrlKey ||
            keyboardEvent.metaKey) {
            return;
        }
        switch (keyboardEvent.key) {
            case 'Enter':
            case ' ':
                this.startEditingAtFirstPosition();
                keyboardEvent.consume(true);
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                this.ruleNavigation(keyboardEvent);
                break;
            default:
                // Filter out non-printable key strokes.
                if (keyboardEvent.key.length === 1) {
                    this.addNewBlankProperty(0).startEditing();
                }
                break;
        }
    }
    setSectionHovered(isHovered) {
        this.element.classList.toggle('styles-panel-hovered', isHovered);
        this.propertiesTreeOutline.element.classList.toggle('styles-panel-hovered', isHovered);
        if (this.hoverableSelectorsMode !== isHovered) {
            this.hoverableSelectorsMode = isHovered;
            this.markSelectorMatches();
        }
    }
    onMouseLeave(_event) {
        this.setSectionHovered(false);
        this.parentPane.setActiveProperty(null);
    }
    onMouseMove(event) {
        const hasCtrlOrMeta = UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlEquivalentKey(event);
        this.setSectionHovered(hasCtrlOrMeta);
        const treeElement = this.propertiesTreeOutline.treeElementFromEvent(event);
        if (treeElement instanceof StylePropertyTreeElement) {
            this.parentPane.setActiveProperty(treeElement);
        }
        else {
            this.parentPane.setActiveProperty(null);
        }
        const selection = this.element.getComponentSelection();
        if (!this.selectedSinceMouseDown && selection && selection.toString()) {
            this.selectedSinceMouseDown = true;
        }
    }
    onFontEditorButtonClicked() {
        if (this.fontEditorSectionManager && this.fontEditorButton) {
            this.fontEditorSectionManager.showPopover(this.fontEditorButton.element, this.parentPane);
        }
    }
    style() {
        return this.styleInternal;
    }
    headerText() {
        const node = this.matchedStyles.nodeForStyle(this.styleInternal);
        if (this.styleInternal.type === SDK.CSSStyleDeclaration.Type.Inline) {
            return this.matchedStyles.isInherited(this.styleInternal) ? i18nString(UIStrings.styleAttribute) :
                'element.style';
        }
        if (node && this.styleInternal.type === SDK.CSSStyleDeclaration.Type.Attributes) {
            return i18nString(UIStrings.sattributesStyle, { PH1: node.nodeNameInCorrectCase() });
        }
        if (this.styleInternal.parentRule instanceof SDK.CSSRule.CSSStyleRule) {
            return this.styleInternal.parentRule.selectorText();
        }
        return '';
    }
    onMouseOutSelector() {
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer);
        }
        SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
    }
    onMouseEnterSelector() {
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer);
        }
        this.hoverTimer = setTimeout(this.highlight.bind(this), 300);
    }
    highlight(mode = 'all') {
        SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        const node = this.parentPane.node();
        if (!node) {
            return;
        }
        const selectorList = this.styleInternal.parentRule && this.styleInternal.parentRule instanceof SDK.CSSRule.CSSStyleRule ?
            this.styleInternal.parentRule.selectorText() :
            undefined;
        node.domModel().overlayModel().highlightInOverlay({ node, selectorList }, mode);
    }
    firstSibling() {
        const parent = this.element.parentElement;
        if (!parent) {
            return null;
        }
        let childElement = parent.firstChild;
        while (childElement) {
            const childSection = this.parentPane.sectionByElement.get(childElement);
            if (childSection) {
                return childSection;
            }
            childElement = childElement.nextSibling;
        }
        return null;
    }
    findCurrentOrNextVisible(willIterateForward, originalSection) {
        if (!this.isHidden()) {
            return this;
        }
        if (this === originalSection) {
            return null;
        }
        if (!originalSection) {
            originalSection = this;
        }
        let visibleSibling = null;
        const nextSibling = willIterateForward ? this.nextSibling() : this.previousSibling();
        if (nextSibling) {
            visibleSibling = nextSibling.findCurrentOrNextVisible(willIterateForward, originalSection);
        }
        else {
            const loopSibling = willIterateForward ? this.firstSibling() : this.lastSibling();
            if (loopSibling) {
                visibleSibling = loopSibling.findCurrentOrNextVisible(willIterateForward, originalSection);
            }
        }
        return visibleSibling;
    }
    lastSibling() {
        const parent = this.element.parentElement;
        if (!parent) {
            return null;
        }
        let childElement = parent.lastChild;
        while (childElement) {
            const childSection = this.parentPane.sectionByElement.get(childElement);
            if (childSection) {
                return childSection;
            }
            childElement = childElement.previousSibling;
        }
        return null;
    }
    nextSibling() {
        let curElement = this.element;
        do {
            curElement = curElement.nextSibling;
        } while (curElement && !this.parentPane.sectionByElement.has(curElement));
        if (curElement) {
            return this.parentPane.sectionByElement.get(curElement);
        }
        return;
    }
    previousSibling() {
        let curElement = this.element;
        do {
            curElement = curElement.previousSibling;
        } while (curElement && !this.parentPane.sectionByElement.has(curElement));
        if (curElement) {
            return this.parentPane.sectionByElement.get(curElement);
        }
        return;
    }
    onNewRuleClick(event) {
        event.data.consume();
        const rule = this.styleInternal.parentRule;
        if (!rule || !rule.style.range || rule.styleSheetId === undefined) {
            return;
        }
        const range = TextUtils.TextRange.TextRange.createFromLocation(rule.style.range.endLine, rule.style.range.endColumn + 1);
        this.parentPane.addBlankSection(this, rule.styleSheetId, range);
    }
    styleSheetEdited(edit) {
        const rule = this.styleInternal.parentRule;
        if (rule) {
            rule.rebase(edit);
        }
        else {
            this.styleInternal.rebase(edit);
        }
        this.updateQueryList();
        this.updateRuleOrigin();
    }
    createMediaList(mediaRules) {
        for (let i = mediaRules.length - 1; i >= 0; --i) {
            const media = mediaRules[i];
            // Don't display trivial non-print media types.
            const isMedia = !media.text || !media.text.includes('(') && media.text !== 'print';
            if (isMedia) {
                continue;
            }
            let queryPrefix = '';
            let queryText = '';
            let onQueryTextClick;
            switch (media.source) {
                case SDK.CSSMedia.Source.LINKED_SHEET:
                case SDK.CSSMedia.Source.INLINE_SHEET: {
                    queryText = `media="${media.text}"`;
                    break;
                }
                case SDK.CSSMedia.Source.MEDIA_RULE: {
                    queryPrefix = '@media';
                    queryText = media.text;
                    if (media.styleSheetId) {
                        onQueryTextClick = this.handleQueryRuleClick.bind(this, media);
                    }
                    break;
                }
                case SDK.CSSMedia.Source.IMPORT_RULE: {
                    queryText = `@import ${media.text}`;
                    break;
                }
            }
            const mediaQueryElement = new ElementsComponents.CSSQuery.CSSQuery();
            mediaQueryElement.data = {
                queryPrefix,
                queryText,
                onQueryTextClick,
            };
            this.queryListElement.append(mediaQueryElement);
        }
    }
    createContainerQueryList(containerQueries) {
        for (let i = containerQueries.length - 1; i >= 0; --i) {
            const containerQuery = containerQueries[i];
            if (!containerQuery.text) {
                continue;
            }
            let onQueryTextClick;
            if (containerQuery.styleSheetId) {
                onQueryTextClick = this.handleQueryRuleClick.bind(this, containerQuery);
            }
            const containerQueryElement = new ElementsComponents.CSSQuery.CSSQuery();
            containerQueryElement.data = {
                queryPrefix: '@container',
                queryName: containerQuery.name,
                queryText: containerQuery.text,
                onQueryTextClick,
            };
            this.queryListElement.append(containerQueryElement);
            this.addContainerForContainerQuery(containerQuery);
        }
    }
    async addContainerForContainerQuery(containerQuery) {
        const container = await containerQuery.getContainerForNode(this.matchedStyles.node().id);
        if (!container) {
            return;
        }
        const containerElement = new ElementsComponents.QueryContainer.QueryContainer();
        containerElement.data = {
            container: ElementsComponents.Helper.legacyNodeToElementsComponentsNode(container.containerNode),
            queryName: containerQuery.name,
            onContainerLinkClick: (event) => {
                event.preventDefault();
                ElementsPanel.instance().revealAndSelectNode(container.containerNode, true, true);
                container.containerNode.scrollIntoView();
            },
        };
        containerElement.addEventListener('queriedsizerequested', async () => {
            const details = await container.getContainerSizeDetails();
            if (details) {
                containerElement.updateContainerQueriedSizeDetails(details);
            }
        });
        this.queryListElement.prepend(containerElement);
    }
    updateQueryList() {
        this.queryListElement.removeChildren();
        if (this.styleInternal.parentRule && this.styleInternal.parentRule instanceof SDK.CSSRule.CSSStyleRule) {
            this.createMediaList(this.styleInternal.parentRule.media);
            this.createContainerQueryList(this.styleInternal.parentRule.containerQueries);
        }
    }
    isPropertyInherited(propertyName) {
        if (this.matchedStyles.isInherited(this.styleInternal)) {
            // While rendering inherited stylesheet, reverse meaning of this property.
            // Render truly inherited properties with black, i.e. return them as non-inherited.
            return !SDK.CSSMetadata.cssMetadata().isPropertyInherited(propertyName);
        }
        return false;
    }
    nextEditableSibling() {
        let curSection = this;
        do {
            curSection = curSection.nextSibling();
        } while (curSection && !curSection.editable);
        if (!curSection) {
            curSection = this.firstSibling();
            while (curSection && !curSection.editable) {
                curSection = curSection.nextSibling();
            }
        }
        return (curSection && curSection.editable) ? curSection : null;
    }
    previousEditableSibling() {
        let curSection = this;
        do {
            curSection = curSection.previousSibling();
        } while (curSection && !curSection.editable);
        if (!curSection) {
            curSection = this.lastSibling();
            while (curSection && !curSection.editable) {
                curSection = curSection.previousSibling();
            }
        }
        return (curSection && curSection.editable) ? curSection : null;
    }
    refreshUpdate(editedTreeElement) {
        this.parentPane.refreshUpdate(this, editedTreeElement);
    }
    updateVarFunctions(editedTreeElement) {
        let child = this.propertiesTreeOutline.firstChild();
        while (child) {
            if (child !== editedTreeElement && child instanceof StylePropertyTreeElement) {
                child.updateTitleIfComputedValueChanged();
            }
            child = child.traverseNextTreeElement(false /* skipUnrevealed */, null /* stayWithin */, true /* dontPopulate */);
        }
    }
    update(full) {
        this.selectorElement.textContent = this.headerText();
        this.markSelectorMatches();
        if (full) {
            this.onpopulate();
        }
        else {
            let child = this.propertiesTreeOutline.firstChild();
            while (child && child instanceof StylePropertyTreeElement) {
                child.setOverloaded(this.isPropertyOverloaded(child.property));
                child =
                    child.traverseNextTreeElement(false /* skipUnrevealed */, null /* stayWithin */, true /* dontPopulate */);
            }
        }
    }
    showAllItems(event) {
        if (event) {
            event.consume();
        }
        if (this.forceShowAll) {
            return;
        }
        this.forceShowAll = true;
        this.onpopulate();
    }
    onpopulate() {
        this.parentPane.setActiveProperty(null);
        this.nextEditorTriggerButtonIdx = 1;
        this.propertiesTreeOutline.removeChildren();
        const style = this.styleInternal;
        let count = 0;
        const properties = style.leadingProperties();
        const maxProperties = StylePropertiesSection.MaxProperties + properties.length - this.originalPropertiesCount;
        for (const property of properties) {
            if (!this.forceShowAll && count >= maxProperties) {
                break;
            }
            count++;
            const isShorthand = Boolean(style.longhandProperties(property.name).length);
            const inherited = this.isPropertyInherited(property.name);
            const overloaded = this.isPropertyOverloaded(property);
            if (style.parentRule && style.parentRule.isUserAgent() && inherited) {
                continue;
            }
            const item = new StylePropertyTreeElement(this.parentPane, this.matchedStyles, property, isShorthand, inherited, overloaded, false);
            this.propertiesTreeOutline.appendChild(item);
        }
        if (count < properties.length) {
            this.showAllButton.classList.remove('hidden');
            this.showAllButton.textContent = i18nString(UIStrings.showAllPropertiesSMore, { PH1: properties.length - count });
        }
        else {
            this.showAllButton.classList.add('hidden');
        }
    }
    isPropertyOverloaded(property) {
        return this.matchedStyles.propertyState(property) === SDK.CSSMatchedStyles.PropertyState.Overloaded;
    }
    updateFilter() {
        let hasMatchingChild = false;
        this.showAllItems();
        for (const child of this.propertiesTreeOutline.rootElement().children()) {
            if (child instanceof StylePropertyTreeElement) {
                const childHasMatches = child.updateFilter();
                hasMatchingChild = hasMatchingChild || childHasMatches;
            }
        }
        const regex = this.parentPane.filterRegex();
        const hideRule = !hasMatchingChild && regex !== null && !regex.test(this.element.deepTextContent());
        this.isHiddenInternal = hideRule;
        this.element.classList.toggle('hidden', hideRule);
        if (!hideRule && this.styleInternal.parentRule) {
            this.markSelectorHighlights();
        }
        return !hideRule;
    }
    isHidden() {
        return this.isHiddenInternal;
    }
    markSelectorMatches() {
        const rule = this.styleInternal.parentRule;
        if (!rule || !(rule instanceof SDK.CSSRule.CSSStyleRule)) {
            return;
        }
        this.queryListElement.classList.toggle('query-matches', this.matchedStyles.mediaMatches(this.styleInternal));
        const selectorTexts = rule.selectors.map(selector => selector.text);
        const matchingSelectorIndexes = this.matchedStyles.getMatchingSelectors(rule);
        const matchingSelectors = new Array(selectorTexts.length).fill(false);
        for (const matchingIndex of matchingSelectorIndexes) {
            matchingSelectors[matchingIndex] = true;
        }
        if (this.parentPane.isEditingStyle) {
            return;
        }
        const fragment = this.hoverableSelectorsMode ? this.renderHoverableSelectors(selectorTexts, matchingSelectors) :
            this.renderSimplifiedSelectors(selectorTexts, matchingSelectors);
        this.selectorElement.removeChildren();
        this.selectorElement.appendChild(fragment);
        this.markSelectorHighlights();
    }
    renderHoverableSelectors(selectors, matchingSelectors) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < selectors.length; ++i) {
            if (i) {
                UI.UIUtils.createTextChild(fragment, ', ');
            }
            fragment.appendChild(this.createSelectorElement(selectors[i], matchingSelectors[i], i));
        }
        return fragment;
    }
    createSelectorElement(text, isMatching, navigationIndex) {
        const element = document.createElement('span');
        element.classList.add('simple-selector');
        element.classList.toggle('selector-matches', isMatching);
        if (typeof navigationIndex === 'number') {
            this.elementToSelectorIndex.set(element, navigationIndex);
        }
        element.textContent = text;
        return element;
    }
    renderSimplifiedSelectors(selectors, matchingSelectors) {
        const fragment = document.createDocumentFragment();
        let currentMatching = false;
        let text = '';
        for (let i = 0; i < selectors.length; ++i) {
            if (currentMatching !== matchingSelectors[i] && text) {
                fragment.appendChild(this.createSelectorElement(text, currentMatching));
                text = '';
            }
            currentMatching = matchingSelectors[i];
            text += selectors[i] + (i === selectors.length - 1 ? '' : ', ');
        }
        if (text) {
            fragment.appendChild(this.createSelectorElement(text, currentMatching));
        }
        return fragment;
    }
    markSelectorHighlights() {
        const selectors = this.selectorElement.getElementsByClassName('simple-selector');
        const regex = this.parentPane.filterRegex();
        for (let i = 0; i < selectors.length; ++i) {
            const selectorMatchesFilter = regex !== null && regex.test(selectors[i].textContent || '');
            selectors[i].classList.toggle('filter-match', selectorMatchesFilter);
        }
    }
    checkWillCancelEditing() {
        const willCauseCancelEditing = this.willCauseCancelEditing;
        this.willCauseCancelEditing = false;
        return willCauseCancelEditing;
    }
    handleSelectorContainerClick(event) {
        if (this.checkWillCancelEditing() || !this.editable) {
            return;
        }
        if (event.target === this.selectorContainer) {
            this.addNewBlankProperty(0).startEditing();
            event.consume(true);
        }
    }
    addNewBlankProperty(index = this.propertiesTreeOutline.rootElement().childCount()) {
        const property = this.styleInternal.newBlankProperty(index);
        const item = new StylePropertyTreeElement(this.parentPane, this.matchedStyles, property, false, false, false, true);
        this.propertiesTreeOutline.insertChild(item, property.index);
        return item;
    }
    handleEmptySpaceMouseDown() {
        this.willCauseCancelEditing = this.parentPane.isEditingStyle;
        this.selectedSinceMouseDown = false;
    }
    handleEmptySpaceClick(event) {
        if (!this.editable || this.element.hasSelection() || this.checkWillCancelEditing() || this.selectedSinceMouseDown) {
            return;
        }
        const target = event.target;
        if (target.classList.contains('header') || this.element.classList.contains('read-only') ||
            target.enclosingNodeOrSelfWithClass('query')) {
            event.consume();
            return;
        }
        const deepTarget = UI.UIUtils.deepElementFromEvent(event);
        const treeElement = deepTarget && UI.TreeOutline.TreeElement.getTreeElementBylistItemNode(deepTarget);
        if (treeElement && treeElement instanceof StylePropertyTreeElement) {
            this.addNewBlankProperty(treeElement.property.index + 1).startEditing();
        }
        else {
            this.addNewBlankProperty().startEditing();
        }
        event.consume(true);
    }
    handleQueryRuleClick(query, event) {
        const element = event.currentTarget;
        if (UI.UIUtils.isBeingEdited(element)) {
            return;
        }
        if (UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlEquivalentKey(event) && this.navigable) {
            const location = query.rawLocation();
            if (!location) {
                event.consume(true);
                return;
            }
            const uiLocation = Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.instance().rawLocationToUILocation(location);
            if (uiLocation) {
                Common.Revealer.reveal(uiLocation);
            }
            event.consume(true);
            return;
        }
        if (!this.editable) {
            return;
        }
        const config = new UI.InplaceEditor.Config(this.editingMediaCommitted.bind(this, query), this.editingMediaCancelled.bind(this, element), undefined, this.editingMediaBlurHandler.bind(this));
        UI.InplaceEditor.InplaceEditor.startEditing(element, config);
        const selection = element.getComponentSelection();
        if (selection) {
            selection.selectAllChildren(element);
        }
        this.parentPane.setEditingStyle(true);
        const parentMediaElement = element.enclosingNodeOrSelfWithClass('query');
        parentMediaElement.classList.add('editing-query');
        event.consume(true);
    }
    editingMediaFinished(element) {
        this.parentPane.setEditingStyle(false);
        const parentMediaElement = element.enclosingNodeOrSelfWithClass('query');
        parentMediaElement.classList.remove('editing-query');
    }
    editingMediaCancelled(element) {
        this.editingMediaFinished(element);
        // Mark the selectors in group if necessary.
        // This is overridden by BlankStylePropertiesSection.
        this.markSelectorMatches();
        const selection = element.getComponentSelection();
        if (selection) {
            selection.collapse(element, 0);
        }
    }
    editingMediaBlurHandler() {
        return true;
    }
    editingMediaCommitted(query, element, newContent, _oldContent, _context, _moveDirection) {
        this.parentPane.setEditingStyle(false);
        this.editingMediaFinished(element);
        if (newContent) {
            newContent = newContent.trim();
        }
        function userCallback(success) {
            if (success) {
                this.matchedStyles.resetActiveProperties();
                this.parentPane.refreshUpdate(this);
            }
            this.parentPane.setUserOperation(false);
            this.editingMediaTextCommittedForTest();
        }
        // This gets deleted in finishOperation(), which is called both on success and failure.
        this.parentPane.setUserOperation(true);
        const cssModel = this.parentPane.cssModel();
        if (cssModel && query.styleSheetId) {
            const setQueryText = query instanceof SDK.CSSMedia.CSSMedia ? cssModel.setMediaText : cssModel.setContainerQueryText;
            setQueryText.call(cssModel, query.styleSheetId, query.range, newContent)
                .then(userCallback.bind(this));
        }
    }
    editingMediaTextCommittedForTest() {
    }
    handleSelectorClick(event) {
        const target = event.target;
        if (!target) {
            return;
        }
        if (UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlEquivalentKey(event) && this.navigable &&
            target.classList.contains('simple-selector')) {
            const selectorIndex = this.elementToSelectorIndex.get(target);
            if (selectorIndex) {
                this.navigateToSelectorSource(selectorIndex, true);
            }
            event.consume(true);
            return;
        }
        if (this.element.hasSelection()) {
            return;
        }
        this.startEditingAtFirstPosition();
        event.consume(true);
    }
    handleContextMenuEvent(event) {
        const target = event.target;
        if (!target) {
            return;
        }
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copySelector), () => {
            const selectorText = this.headerText();
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(selectorText);
        });
        contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copyRule), () => {
            const ruleText = StylesSidebarPane.formatLeadingProperties(this).ruleText;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(ruleText);
        });
        contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copyAllDeclarations), () => {
            const allDeclarationText = StylesSidebarPane.formatLeadingProperties(this).allDeclarationText;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(allDeclarationText);
        });
        contextMenu.show();
    }
    navigateToSelectorSource(index, focus) {
        const cssModel = this.parentPane.cssModel();
        if (!cssModel) {
            return;
        }
        const rule = this.styleInternal.parentRule;
        if (!rule || rule.styleSheetId === undefined) {
            return;
        }
        const header = cssModel.styleSheetHeaderForId(rule.styleSheetId);
        if (!header) {
            return;
        }
        const rawLocation = new SDK.CSSModel.CSSLocation(header, rule.lineNumberInSource(index), rule.columnNumberInSource(index));
        StylePropertiesSection.revealSelectorSource(rawLocation, focus);
    }
    static revealSelectorSource(rawLocation, focus) {
        const uiLocation = Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.instance().rawLocationToUILocation(rawLocation);
        if (uiLocation) {
            Common.Revealer.reveal(uiLocation, !focus);
        }
    }
    startEditingAtFirstPosition() {
        if (!this.editable) {
            return;
        }
        if (!this.styleInternal.parentRule) {
            this.moveEditorFromSelector('forward');
            return;
        }
        this.startEditingSelector();
    }
    startEditingSelector() {
        const element = this.selectorElement;
        if (UI.UIUtils.isBeingEdited(element)) {
            return;
        }
        element.scrollIntoViewIfNeeded(false);
        // Reset selector marks in group, and normalize whitespace.
        const textContent = element.textContent;
        if (textContent !== null) {
            element.textContent = textContent.replace(/\s+/g, ' ').trim();
        }
        const config = new UI.InplaceEditor.Config(this.editingSelectorCommitted.bind(this), this.editingSelectorCancelled.bind(this));
        UI.InplaceEditor.InplaceEditor.startEditing(this.selectorElement, config);
        const selection = element.getComponentSelection();
        if (selection) {
            selection.selectAllChildren(element);
        }
        this.parentPane.setEditingStyle(true);
        if (element.classList.contains('simple-selector')) {
            this.navigateToSelectorSource(0, false);
        }
    }
    moveEditorFromSelector(moveDirection) {
        this.markSelectorMatches();
        if (!moveDirection) {
            return;
        }
        if (moveDirection === 'forward') {
            const firstChild = this.propertiesTreeOutline.firstChild();
            let currentChild = firstChild;
            while (currentChild && currentChild.inherited()) {
                const sibling = currentChild.nextSibling;
                currentChild = sibling instanceof StylePropertyTreeElement ? sibling : null;
            }
            if (!currentChild) {
                this.addNewBlankProperty().startEditing();
            }
            else {
                currentChild.startEditing(currentChild.nameElement);
            }
        }
        else {
            const previousSection = this.previousEditableSibling();
            if (!previousSection) {
                return;
            }
            previousSection.addNewBlankProperty().startEditing();
        }
    }
    editingSelectorCommitted(element, newContent, oldContent, context, moveDirection) {
        this.editingSelectorEnded();
        if (newContent) {
            newContent = newContent.trim();
        }
        if (newContent === oldContent) {
            // Revert to a trimmed version of the selector if need be.
            this.selectorElement.textContent = newContent;
            this.moveEditorFromSelector(moveDirection);
            return;
        }
        const rule = this.styleInternal.parentRule;
        if (!rule) {
            return;
        }
        function headerTextCommitted() {
            this.parentPane.setUserOperation(false);
            this.moveEditorFromSelector(moveDirection);
            this.editingSelectorCommittedForTest();
        }
        // This gets deleted in finishOperationAndMoveEditor(), which is called both on success and failure.
        this.parentPane.setUserOperation(true);
        this.setHeaderText(rule, newContent).then(headerTextCommitted.bind(this));
    }
    setHeaderText(rule, newContent) {
        function onSelectorsUpdated(rule, success) {
            if (!success) {
                return Promise.resolve();
            }
            return this.matchedStyles.recomputeMatchingSelectors(rule).then(updateSourceRanges.bind(this, rule));
        }
        function updateSourceRanges(rule) {
            const doesAffectSelectedNode = this.matchedStyles.getMatchingSelectors(rule).length > 0;
            this.propertiesTreeOutline.element.classList.toggle('no-affect', !doesAffectSelectedNode);
            this.matchedStyles.resetActiveProperties();
            this.parentPane.refreshUpdate(this);
        }
        if (!(rule instanceof SDK.CSSRule.CSSStyleRule)) {
            return Promise.resolve();
        }
        const oldSelectorRange = rule.selectorRange();
        if (!oldSelectorRange) {
            return Promise.resolve();
        }
        return rule.setSelectorText(newContent).then(onSelectorsUpdated.bind(this, rule, Boolean(oldSelectorRange)));
    }
    editingSelectorCommittedForTest() {
    }
    updateRuleOrigin() {
        this.selectorRefElement.removeChildren();
        this.selectorRefElement.appendChild(StylePropertiesSection.createRuleOriginNode(this.matchedStyles, this.parentPane.linkifier, this.styleInternal.parentRule));
    }
    editingSelectorEnded() {
        this.parentPane.setEditingStyle(false);
    }
    editingSelectorCancelled() {
        this.editingSelectorEnded();
        // Mark the selectors in group if necessary.
        // This is overridden by BlankStylePropertiesSection.
        this.markSelectorMatches();
    }
    /**
     * A property at or near an index and suitable for subsequent editing.
     * Either the last property, if index out-of-upper-bound,
     * or property at index, if such a property exists,
     * or otherwise, null.
     */
    closestPropertyForEditing(propertyIndex) {
        const rootElement = this.propertiesTreeOutline.rootElement();
        if (propertyIndex >= rootElement.childCount()) {
            return rootElement.lastChild();
        }
        return rootElement.childAt(propertyIndex);
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static MaxProperties = 50;
}
export class BlankStylePropertiesSection extends StylePropertiesSection {
    normal;
    ruleLocation;
    styleSheetId;
    constructor(stylesPane, matchedStyles, defaultSelectorText, styleSheetId, ruleLocation, insertAfterStyle, sectionIdx) {
        const cssModel = stylesPane.cssModel();
        const rule = SDK.CSSRule.CSSStyleRule.createDummyRule(cssModel, defaultSelectorText);
        super(stylesPane, matchedStyles, rule.style, sectionIdx);
        this.normal = false;
        this.ruleLocation = ruleLocation;
        this.styleSheetId = styleSheetId;
        this.selectorRefElement.removeChildren();
        this.selectorRefElement.appendChild(StylePropertiesSection.linkifyRuleLocation(cssModel, this.parentPane.linkifier, styleSheetId, this.actualRuleLocation()));
        if (insertAfterStyle && insertAfterStyle.parentRule &&
            insertAfterStyle.parentRule instanceof SDK.CSSRule.CSSStyleRule) {
            this.createMediaList(insertAfterStyle.parentRule.media);
            this.createContainerQueryList(insertAfterStyle.parentRule.containerQueries);
        }
        this.element.classList.add('blank-section');
    }
    actualRuleLocation() {
        const prefix = this.rulePrefix();
        const lines = prefix.split('\n');
        const lastLine = lines[lines.length - 1];
        const editRange = new TextUtils.TextRange.TextRange(0, 0, lines.length - 1, lastLine ? lastLine.length : 0);
        return this.ruleLocation.rebaseAfterTextEdit(TextUtils.TextRange.TextRange.createFromLocation(0, 0), editRange);
    }
    rulePrefix() {
        return this.ruleLocation.startLine === 0 && this.ruleLocation.startColumn === 0 ? '' : '\n\n';
    }
    get isBlank() {
        return !this.normal;
    }
    editingSelectorCommitted(element, newContent, oldContent, context, moveDirection) {
        if (!this.isBlank) {
            super.editingSelectorCommitted(element, newContent, oldContent, context, moveDirection);
            return;
        }
        function onRuleAdded(newRule) {
            if (!newRule) {
                this.editingSelectorCancelled();
                this.editingSelectorCommittedForTest();
                return Promise.resolve();
            }
            return this.matchedStyles.addNewRule(newRule, this.matchedStyles.node())
                .then(onAddedToCascade.bind(this, newRule));
        }
        function onAddedToCascade(newRule) {
            const doesSelectorAffectSelectedNode = this.matchedStyles.getMatchingSelectors(newRule).length > 0;
            this.makeNormal(newRule);
            if (!doesSelectorAffectSelectedNode) {
                this.propertiesTreeOutline.element.classList.add('no-affect');
            }
            this.updateRuleOrigin();
            this.parentPane.setUserOperation(false);
            this.editingSelectorEnded();
            if (this.element.parentElement) // Might have been detached already.
             {
                this.moveEditorFromSelector(moveDirection);
            }
            this.markSelectorMatches();
            this.editingSelectorCommittedForTest();
        }
        if (newContent) {
            newContent = newContent.trim();
        }
        this.parentPane.setUserOperation(true);
        const cssModel = this.parentPane.cssModel();
        const ruleText = this.rulePrefix() + newContent + ' {}';
        if (cssModel) {
            cssModel.addRule(this.styleSheetId, ruleText, this.ruleLocation).then(onRuleAdded.bind(this));
        }
    }
    editingSelectorCancelled() {
        this.parentPane.setUserOperation(false);
        if (!this.isBlank) {
            super.editingSelectorCancelled();
            return;
        }
        this.editingSelectorEnded();
        this.parentPane.removeSection(this);
    }
    makeNormal(newRule) {
        this.element.classList.remove('blank-section');
        this.styleInternal = newRule.style;
        // FIXME: replace this instance by a normal StylePropertiesSection.
        this.normal = true;
    }
}
export class KeyframePropertiesSection extends StylePropertiesSection {
    constructor(stylesPane, matchedStyles, style, sectionIdx) {
        super(stylesPane, matchedStyles, style, sectionIdx);
        this.selectorElement.className = 'keyframe-key';
    }
    headerText() {
        if (this.styleInternal.parentRule instanceof SDK.CSSRule.CSSKeyframeRule) {
            return this.styleInternal.parentRule.key().text;
        }
        return '';
    }
    setHeaderText(rule, newContent) {
        function updateSourceRanges(success) {
            if (!success) {
                return;
            }
            this.parentPane.refreshUpdate(this);
        }
        if (!(rule instanceof SDK.CSSRule.CSSKeyframeRule)) {
            return Promise.resolve();
        }
        const oldRange = rule.key().range;
        if (!oldRange) {
            return Promise.resolve();
        }
        return rule.setKeyText(newContent).then(updateSourceRanges.bind(this));
    }
    isPropertyInherited(_propertyName) {
        return false;
    }
    isPropertyOverloaded(_property) {
        return false;
    }
    markSelectorHighlights() {
    }
    markSelectorMatches() {
        if (this.styleInternal.parentRule instanceof SDK.CSSRule.CSSKeyframeRule) {
            this.selectorElement.textContent = this.styleInternal.parentRule.key().text;
        }
    }
    highlight() {
    }
}
export function quoteFamilyName(familyName) {
    return `'${familyName.replaceAll('\'', '\\\'')}'`;
}
export class CSSPropertyPrompt extends UI.TextPrompt.TextPrompt {
    isColorAware;
    cssCompletions;
    selectedNodeComputedStyles;
    parentNodeComputedStyles;
    treeElement;
    isEditingName;
    cssVariables;
    constructor(treeElement, isEditingName) {
        // Use the same callback both for applyItemCallback and acceptItemCallback.
        super();
        this.initialize(this.buildPropertyCompletions.bind(this), UI.UIUtils.StyleValueDelimiters);
        const cssMetadata = SDK.CSSMetadata.cssMetadata();
        this.isColorAware = SDK.CSSMetadata.cssMetadata().isColorAwareProperty(treeElement.property.name);
        this.cssCompletions = [];
        const node = treeElement.node();
        if (isEditingName) {
            this.cssCompletions = cssMetadata.allProperties();
            if (node && !node.isSVGNode()) {
                this.cssCompletions = this.cssCompletions.filter(property => !cssMetadata.isSVGProperty(property));
            }
        }
        else {
            this.cssCompletions = cssMetadata.getPropertyValues(treeElement.property.name);
            if (node && cssMetadata.isFontFamilyProperty(treeElement.property.name)) {
                const fontFamilies = node.domModel().cssModel().fontFaces().map(font => quoteFamilyName(font.getFontFamily()));
                this.cssCompletions.unshift(...fontFamilies);
            }
        }
        /**
         * Computed styles cache populated for flexbox features.
         */
        this.selectedNodeComputedStyles = null;
        /**
         * Computed styles cache populated for flexbox features.
         */
        this.parentNodeComputedStyles = null;
        this.treeElement = treeElement;
        this.isEditingName = isEditingName;
        this.cssVariables = treeElement.matchedStyles().availableCSSVariables(treeElement.property.ownerStyle);
        if (this.cssVariables.length < 1000) {
            this.cssVariables.sort(Platform.StringUtilities.naturalOrderComparator);
        }
        else {
            this.cssVariables.sort();
        }
        if (!isEditingName) {
            this.disableDefaultSuggestionForEmptyInput();
            // If a CSS value is being edited that has a numeric or hex substring, hint that precision modifier shortcuts are available.
            if (treeElement && treeElement.valueElement) {
                const cssValueText = treeElement.valueElement.textContent;
                const cmdOrCtrl = Host.Platform.isMac() ? 'Cmd' : 'Ctrl';
                if (cssValueText !== null) {
                    if (cssValueText.match(/#[\da-f]{3,6}$/i)) {
                        this.setTitle(i18nString(UIStrings.incrementdecrementWithMousewheelOne, { PH1: cmdOrCtrl }));
                    }
                    else if (cssValueText.match(/\d+/)) {
                        this.setTitle(i18nString(UIStrings.incrementdecrementWithMousewheelHundred, { PH1: cmdOrCtrl }));
                    }
                }
            }
        }
    }
    onKeyDown(event) {
        const keyboardEvent = event;
        switch (keyboardEvent.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'PageUp':
            case 'PageDown':
                if (!this.isSuggestBoxVisible() && this.handleNameOrValueUpDown(keyboardEvent)) {
                    keyboardEvent.preventDefault();
                    return;
                }
                break;
            case 'Enter':
                if (keyboardEvent.shiftKey) {
                    return;
                }
                // Accept any available autocompletions and advance to the next field.
                this.tabKeyPressed();
                keyboardEvent.preventDefault();
                return;
        }
        super.onKeyDown(keyboardEvent);
    }
    onMouseWheel(event) {
        if (this.handleNameOrValueUpDown(event)) {
            event.consume(true);
            return;
        }
        super.onMouseWheel(event);
    }
    tabKeyPressed() {
        this.acceptAutoComplete();
        // Always tab to the next field.
        return false;
    }
    handleNameOrValueUpDown(event) {
        function finishHandler(_originalValue, _replacementString) {
            // Synthesize property text disregarding any comments, custom whitespace etc.
            if (this.treeElement.nameElement && this.treeElement.valueElement) {
                this.treeElement.applyStyleText(this.treeElement.nameElement.textContent + ': ' + this.treeElement.valueElement.textContent, false);
            }
        }
        function customNumberHandler(prefix, number, suffix) {
            if (number !== 0 && !suffix.length &&
                SDK.CSSMetadata.cssMetadata().isLengthProperty(this.treeElement.property.name) &&
                !this.treeElement.property.value.toLowerCase().startsWith('calc(')) {
                suffix = 'px';
            }
            return prefix + number + suffix;
        }
        // Handle numeric value increment/decrement only at this point.
        if (!this.isEditingName && this.treeElement.valueElement &&
            UI.UIUtils.handleElementValueModifications(event, this.treeElement.valueElement, finishHandler.bind(this), this.isValueSuggestion.bind(this), customNumberHandler.bind(this))) {
            return true;
        }
        return false;
    }
    isValueSuggestion(word) {
        if (!word) {
            return false;
        }
        word = word.toLowerCase();
        return this.cssCompletions.indexOf(word) !== -1 || word.startsWith('--');
    }
    async buildPropertyCompletions(expression, query, force) {
        const lowerQuery = query.toLowerCase();
        const editingVariable = !this.isEditingName && expression.trim().endsWith('var(');
        if (!query && !force && !editingVariable && (this.isEditingName || expression)) {
            return Promise.resolve([]);
        }
        const prefixResults = [];
        const anywhereResults = [];
        if (!editingVariable) {
            this.cssCompletions.forEach(completion => filterCompletions.call(this, completion, false /* variable */));
        }
        const node = this.treeElement.node();
        if (this.isEditingName && node) {
            const nameValuePresets = SDK.CSSMetadata.cssMetadata().nameValuePresets(node.isSVGNode());
            nameValuePresets.forEach(preset => filterCompletions.call(this, preset, false /* variable */, true /* nameValue */));
        }
        if (this.isEditingName || editingVariable) {
            this.cssVariables.forEach(variable => filterCompletions.call(this, variable, true /* variable */));
        }
        const results = prefixResults.concat(anywhereResults);
        if (!this.isEditingName && !results.length && query.length > 1 && '!important'.startsWith(lowerQuery)) {
            results.push({
                text: '!important',
                title: undefined,
                subtitle: undefined,
                iconType: undefined,
                priority: undefined,
                isSecondary: undefined,
                subtitleRenderer: undefined,
                selectionRange: undefined,
                hideGhostText: undefined,
                iconElement: undefined,
            });
        }
        const userEnteredText = query.replace('-', '');
        if (userEnteredText && (userEnteredText === userEnteredText.toUpperCase())) {
            for (let i = 0; i < results.length; ++i) {
                if (!results[i].text.startsWith('--')) {
                    results[i].text = results[i].text.toUpperCase();
                }
            }
        }
        for (const result of results) {
            if (editingVariable) {
                result.title = result.text;
                result.text += ')';
                continue;
            }
            const valuePreset = SDK.CSSMetadata.cssMetadata().getValuePreset(this.treeElement.name, result.text);
            if (!this.isEditingName && valuePreset) {
                result.title = result.text;
                result.text = valuePreset.text;
                result.selectionRange = { startColumn: valuePreset.startColumn, endColumn: valuePreset.endColumn };
            }
        }
        const ensureComputedStyles = async () => {
            if (!node || this.selectedNodeComputedStyles) {
                return;
            }
            this.selectedNodeComputedStyles = await node.domModel().cssModel().computedStylePromise(node.id);
            const parentNode = node.parentNode;
            if (parentNode) {
                this.parentNodeComputedStyles = await parentNode.domModel().cssModel().computedStylePromise(parentNode.id);
            }
        };
        for (const result of results) {
            await ensureComputedStyles();
            // Using parent node's computed styles does not work in all cases. For example:
            //
            // <div id="container" style="display: flex;">
            //  <div id="useless" style="display: contents;">
            //    <div id="item">item</div>
            //  </div>
            // </div>
            // TODO(crbug/1139945): Find a better way to get the flex container styles.
            const iconInfo = ElementsComponents.CSSPropertyIconResolver.findIcon(this.isEditingName ? result.text : `${this.treeElement.property.name}: ${result.text}`, this.selectedNodeComputedStyles, this.parentNodeComputedStyles);
            if (!iconInfo) {
                continue;
            }
            const icon = new IconButton.Icon.Icon();
            const width = '12.5px';
            const height = '12.5px';
            icon.data = {
                iconName: iconInfo.iconName,
                width,
                height,
                color: 'black',
            };
            icon.style.transform = `rotate(${iconInfo.rotate}deg) scale(${iconInfo.scaleX * 1.1}, ${iconInfo.scaleY * 1.1})`;
            icon.style.maxHeight = height;
            icon.style.maxWidth = width;
            result.iconElement = icon;
        }
        if (this.isColorAware && !this.isEditingName) {
            results.sort((a, b) => {
                if (Boolean(a.subtitleRenderer) === Boolean(b.subtitleRenderer)) {
                    return 0;
                }
                return a.subtitleRenderer ? -1 : 1;
            });
        }
        return Promise.resolve(results);
        function filterCompletions(completion, variable, nameValue) {
            const index = completion.toLowerCase().indexOf(lowerQuery);
            const result = {
                text: completion,
                title: undefined,
                subtitle: undefined,
                iconType: undefined,
                priority: undefined,
                isSecondary: undefined,
                subtitleRenderer: undefined,
                selectionRange: undefined,
                hideGhostText: undefined,
                iconElement: undefined,
            };
            if (variable) {
                const computedValue = this.treeElement.matchedStyles().computeCSSVariable(this.treeElement.property.ownerStyle, completion);
                if (computedValue) {
                    const color = Common.Color.Color.parse(computedValue);
                    if (color) {
                        result.subtitleRenderer = swatchRenderer.bind(null, color);
                    }
                }
            }
            if (nameValue) {
                result.hideGhostText = true;
            }
            if (index === 0) {
                result.priority = this.isEditingName ? SDK.CSSMetadata.cssMetadata().propertyUsageWeight(completion) : 1;
                prefixResults.push(result);
            }
            else if (index > -1) {
                anywhereResults.push(result);
            }
        }
        function swatchRenderer(color) {
            const swatch = new InlineEditor.ColorSwatch.ColorSwatch();
            swatch.renderColor(color);
            swatch.style.pointerEvents = 'none';
            return swatch;
        }
    }
}
export function unescapeCssString(input) {
    // https://drafts.csswg.org/css-syntax/#consume-escaped-code-point
    const reCssEscapeSequence = /(?<!\\)\\(?:([a-fA-F0-9]{1,6})|(.))[\n\t\x20]?/gs;
    return input.replace(reCssEscapeSequence, (_, $1, $2) => {
        if ($2) { // Handle the single-character escape sequence.
            return $2;
        }
        // Otherwise, handle the code point escape sequence.
        const codePoint = parseInt($1, 16);
        const isSurrogate = 0xD800 <= codePoint && codePoint <= 0xDFFF;
        if (isSurrogate || codePoint === 0x0000 || codePoint > 0x10FFFF) {
            return '\uFFFD';
        }
        return String.fromCodePoint(codePoint);
    });
}
export class StylesSidebarPropertyRenderer {
    rule;
    node;
    propertyName;
    propertyValue;
    colorHandler;
    bezierHandler;
    fontHandler;
    shadowHandler;
    gridHandler;
    varHandler;
    angleHandler;
    lengthHandler;
    constructor(rule, node, name, value) {
        this.rule = rule;
        this.node = node;
        this.propertyName = name;
        this.propertyValue = value;
        this.colorHandler = null;
        this.bezierHandler = null;
        this.fontHandler = null;
        this.shadowHandler = null;
        this.gridHandler = null;
        this.varHandler = document.createTextNode.bind(document);
        this.angleHandler = null;
        this.lengthHandler = null;
    }
    setColorHandler(handler) {
        this.colorHandler = handler;
    }
    setBezierHandler(handler) {
        this.bezierHandler = handler;
    }
    setFontHandler(handler) {
        this.fontHandler = handler;
    }
    setShadowHandler(handler) {
        this.shadowHandler = handler;
    }
    setGridHandler(handler) {
        this.gridHandler = handler;
    }
    setVarHandler(handler) {
        this.varHandler = handler;
    }
    setAngleHandler(handler) {
        this.angleHandler = handler;
    }
    setLengthHandler(handler) {
        this.lengthHandler = handler;
    }
    renderName() {
        const nameElement = document.createElement('span');
        UI.ARIAUtils.setAccessibleName(nameElement, i18nString(UIStrings.cssPropertyName));
        nameElement.className = 'webkit-css-property';
        nameElement.textContent = this.propertyName;
        nameElement.normalize();
        return nameElement;
    }
    renderValue() {
        const valueElement = document.createElement('span');
        UI.ARIAUtils.setAccessibleName(valueElement, i18nString(UIStrings.cssPropertyValue));
        valueElement.className = 'value';
        if (!this.propertyValue) {
            return valueElement;
        }
        const metadata = SDK.CSSMetadata.cssMetadata();
        if (this.shadowHandler && metadata.isShadowProperty(this.propertyName) &&
            !SDK.CSSMetadata.VariableRegex.test(this.propertyValue)) {
            valueElement.appendChild(this.shadowHandler(this.propertyValue, this.propertyName));
            valueElement.normalize();
            return valueElement;
        }
        if (this.gridHandler && metadata.isGridAreaDefiningProperty(this.propertyName)) {
            valueElement.appendChild(this.gridHandler(this.propertyValue, this.propertyName));
            valueElement.normalize();
            return valueElement;
        }
        if (metadata.isStringProperty(this.propertyName)) {
            UI.Tooltip.Tooltip.install(valueElement, unescapeCssString(this.propertyValue));
        }
        const regexes = [SDK.CSSMetadata.VariableRegex, SDK.CSSMetadata.URLRegex];
        const processors = [this.varHandler, this.processURL.bind(this)];
        if (this.bezierHandler && metadata.isBezierAwareProperty(this.propertyName)) {
            regexes.push(UI.Geometry.CubicBezier.Regex);
            processors.push(this.bezierHandler);
        }
        if (this.colorHandler && metadata.isColorAwareProperty(this.propertyName)) {
            regexes.push(Common.Color.Regex);
            processors.push(this.colorHandler);
        }
        if (this.angleHandler && metadata.isAngleAwareProperty(this.propertyName)) {
            // TODO(changhaohan): crbug.com/1138628 refactor this to handle unitless 0 cases
            regexes.push(InlineEditor.CSSAngleUtils.CSSAngleRegex);
            processors.push(this.angleHandler);
        }
        if (this.fontHandler && metadata.isFontAwareProperty(this.propertyName)) {
            if (this.propertyName === 'font-family') {
                regexes.push(InlineEditor.FontEditorUtils.FontFamilyRegex);
            }
            else {
                regexes.push(InlineEditor.FontEditorUtils.FontPropertiesRegex);
            }
            processors.push(this.fontHandler);
        }
        if (Root.Runtime.experiments.isEnabled('cssTypeComponentLength') && this.lengthHandler) {
            // TODO(changhaohan): crbug.com/1138628 refactor this to handle unitless 0 cases
            regexes.push(InlineEditor.CSSLengthUtils.CSSLengthRegex);
            processors.push(this.lengthHandler);
        }
        const results = TextUtils.TextUtils.Utils.splitStringByRegexes(this.propertyValue, regexes);
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const processor = result.regexIndex === -1 ? document.createTextNode.bind(document) : processors[result.regexIndex];
            if (processor) {
                valueElement.appendChild(processor(result.value));
            }
        }
        valueElement.normalize();
        return valueElement;
    }
    processURL(text) {
        // Strip "url(" and ")" along with whitespace.
        let url = text.substring(4, text.length - 1).trim();
        const isQuoted = /^'.*'$/s.test(url) || /^".*"$/s.test(url);
        if (isQuoted) {
            url = url.substring(1, url.length - 1);
        }
        const container = document.createDocumentFragment();
        UI.UIUtils.createTextChild(container, 'url(');
        let hrefUrl = null;
        if (this.rule && this.rule.resourceURL()) {
            hrefUrl = Common.ParsedURL.ParsedURL.completeURL(this.rule.resourceURL(), url);
        }
        else if (this.node) {
            hrefUrl = this.node.resolveURL(url);
        }
        const link = ImagePreviewPopover.setImageUrl(Components.Linkifier.Linkifier.linkifyURL(hrefUrl || url, {
            text: url,
            preventClick: false,
            // crbug.com/1027168
            // We rely on CSS text-overflow: ellipsis to hide long URLs in the Style panel,
            // so that we don't have to keep two versions (original vs. trimmed) of URL
            // at the same time, which complicates both StylesSidebarPane and StylePropertyTreeElement.
            bypassURLTrimming: true,
            className: undefined,
            lineNumber: undefined,
            columnNumber: undefined,
            showColumnNumber: false,
            inlineFrameIndex: 0,
            maxLength: undefined,
            tabStop: undefined,
        }), hrefUrl || url);
        container.appendChild(link);
        UI.UIUtils.createTextChild(container, ')');
        return container;
    }
}
let buttonProviderInstance;
export class ButtonProvider {
    button;
    constructor() {
        this.button = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.newStyleRule), 'largeicon-add');
        this.button.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this.clicked, this);
        const longclickTriangle = UI.Icon.Icon.create('largeicon-longclick-triangle', 'long-click-glyph');
        this.button.element.appendChild(longclickTriangle);
        new UI.UIUtils.LongClickController(this.button.element, this.longClicked.bind(this));
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DOMModel.DOMNode, onNodeChanged.bind(this));
        onNodeChanged.call(this);
        function onNodeChanged() {
            let node = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
            node = node ? node.enclosingElementOrSelf() : null;
            this.button.setEnabled(Boolean(node));
        }
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!buttonProviderInstance || forceNew) {
            buttonProviderInstance = new ButtonProvider();
        }
        return buttonProviderInstance;
    }
    clicked() {
        StylesSidebarPane.instance().createNewRuleInViaInspectorStyleSheet();
    }
    longClicked(event) {
        StylesSidebarPane.instance().onAddButtonLongClick(event);
    }
    item() {
        return this.button;
    }
}
//# sourceMappingURL=StylesSidebarPane.js.map