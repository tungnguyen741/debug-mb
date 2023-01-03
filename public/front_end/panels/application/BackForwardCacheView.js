// Copyright (c) 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Buttons from '../../ui/components/buttons/buttons.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as LitHtml from '../../ui/lit-html/lit-html.js';
import * as ReportView from '../../ui/components/report_view/report_view.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import { NotRestoredReasonDescription } from './BackForwardCacheStrings.js';
import backForwardCacheViewStyles from './backForwardCacheView.css.js';
const UIStrings = {
    /**
     * @description Title text in back/forward cache view of the Application panel
     */
    mainFrame: 'Main Frame',
    /**
     * @description Title text in back/forward cache view of the Application panel
     */
    backForwardCacheTitle: 'Back/forward cache',
    /**
     * @description Status text for the status of the main frame
     */
    unavailable: 'unavailable',
    /**
     * @description Entry name text in the back/forward cache view of the Application panel
     */
    url: 'URL',
    /**
     * @description Entry name text in the back/forward cache view of the Application panel
     */
    bfcacheStatus: 'Back/forward cache Status',
    /**
     * @description Status text for the status of the back/forward cache status
     */
    unknown: 'unknown',
    /**
     * @description Status text for the status of the back/forward cache status indicating that
     * the back/forward cache was not used and a normal navigation occured instead.
     */
    normalNavigation: 'Normal navigation (Not restored from back/forward cache)',
    /**
     * @description Status text for the status of the back/forward cache status indicating that
     * the back/forward cache was used to restore the page instead of reloading it.
     */
    restoredFromBFCache: 'Restored from back/forward cache',
    /**
     * @description Label for a list of reasons which prevent the page from being eligible for
     * back/forward cache. These reasons are actionable i.e. they can be cleaned up to make the
     * page eligible for back/forward cache.
     */
    pageSupportNeeded: 'Actionable',
    /**
     * @description Explanation for actionable items which prevent the page from being eligible
     * for back/forward cache.
     */
    pageSupportNeededExplanation: 'These reasons are actionable i.e. they can be cleaned up to make the page eligible for back/forward cache.',
    /**
     * @description Label for a list of reasons which prevent the page from being eligible for
     * back/forward cache. These reasons are circumstantial / not actionable i.e. they cannot be
     * cleaned up by developers to make the page eligible for back/forward cache.
     */
    circumstantial: 'Not Actionable',
    /**
     * @description Explanation for circumstantial/non-actionable items which prevent the page from being eligible
     * for back/forward cache.
     */
    circumstantialExplanation: 'These reasons are not actionable i.e. caching was prevented by something outside of the direct control of the page.',
    /**
     * @description Label for a list of reasons which prevent the page from being eligible for
     * back/forward cache. These reasons are pending support by chrome i.e. in a future version
     * of chrome they will not prevent back/forward cache usage anymore.
     */
    supportPending: 'Pending Support',
    /**
     * @description Button name for showing whether BFCache is available in the pages.
     */
    runTest: 'Run Test',
    /**
     * @description Explanation for 'pending support' items which prevent the page from being eligible
     * for back/forward cache.
     */
    supportPendingExplanation: 'Chrome support for these reasons is pending i.e. they will not prevent the page from being eligible for back/forward cache in a future version of Chrome.',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/BackForwardCacheView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class BackForwardCacheView extends UI.ThrottledWidget.ThrottledWidget {
    constructor() {
        super(true, 1000);
        this.getMainResourceTreeModel()?.addEventListener(SDK.ResourceTreeModel.Events.MainFrameNavigated, this.onBackForwardCacheUpdate, this);
        this.getMainResourceTreeModel()?.addEventListener(SDK.ResourceTreeModel.Events.BackForwardCacheDetailsUpdated, this.onBackForwardCacheUpdate, this);
        this.update();
    }
    wasShown() {
        super.wasShown();
        this.registerCSSFiles([backForwardCacheViewStyles]);
    }
    onBackForwardCacheUpdate() {
        this.update();
    }
    async doUpdate() {
        const data = { reportTitle: i18nString(UIStrings.backForwardCacheTitle) };
        const html = LitHtml.html `
      <${ReportView.ReportView.Report.litTagName} .data=${data}>
      ${this.renderMainFrameInformation(this.getMainFrame())}
      </${ReportView.ReportView.Report.litTagName}>
    `;
        LitHtml.render(html, this.contentElement, { host: this });
    }
    getMainResourceTreeModel() {
        const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
        return mainTarget?.model(SDK.ResourceTreeModel.ResourceTreeModel) || null;
    }
    getMainFrame() {
        return this.getMainResourceTreeModel()?.mainFrame || null;
    }
    async goBackOneHistoryEntry() {
        SDK.TargetManager.TargetManager.instance().removeModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.FrameNavigated, this.goBackOneHistoryEntry, this);
        const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
        if (!mainTarget) {
            return;
        }
        const resourceTreeModel = mainTarget.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (!resourceTreeModel) {
            return;
        }
        const historyResults = await resourceTreeModel.navigationHistory();
        if (!historyResults) {
            return;
        }
        resourceTreeModel.navigateToHistoryEntry(historyResults.entries[historyResults.currentIndex - 1]);
    }
    async navigateAwayAndBack() {
        // Checking BFCache Compatibility
        const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
        if (!mainTarget) {
            return;
        }
        const resourceTreeModel = mainTarget.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (resourceTreeModel) {
            // This event is removed by inside of goBackOneHistoryEntry().
            SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.FrameNavigated, this.goBackOneHistoryEntry, this);
            // We can know whether the current page can use BFCache
            // as the browser navigates to another unrelated page and goes back to the current page.
            // We chose "chrome://terms" because it must be cross-site.
            // Ideally, We want to have our own testing page like "chrome: //bfcache-test".
            resourceTreeModel.navigate('chrome://terms');
        }
    }
    renderMainFrameInformation(mainFrame) {
        if (!mainFrame) {
            return LitHtml.html `<${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.mainFrame)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
      ${i18nString(UIStrings.unavailable)}
      </${ReportView.ReportView.ReportValue.litTagName}>`;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${Buttons.Button.Button.litTagName}
            .variant=${"primary" /* PRIMARY */}
            @click=${this.navigateAwayAndBack}>
            ${i18nString(UIStrings.runTest)}
      </${Buttons.Button.Button.litTagName}>
      </${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.url)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>${mainFrame.url}</${ReportView.ReportView.ReportValue.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.bfcacheStatus)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>${this.renderBackForwardCacheStatus(mainFrame.backForwardCacheDetails.restoredFromCache)}</${ReportView.ReportView.ReportValue.litTagName}>
       ${this.maybeRenderExplanations(mainFrame.backForwardCacheDetails.explanations)}
    `;
    }
    renderBackForwardCacheStatus(status) {
        switch (status) {
            case true:
                return i18nString(UIStrings.restoredFromBFCache);
            case false:
                return i18nString(UIStrings.normalNavigation);
        }
        return i18nString(UIStrings.unknown);
    }
    maybeRenderExplanations(explanations) {
        if (explanations.length === 0) {
            return LitHtml.nothing;
        }
        const pageSupportNeeded = explanations.filter(explanation => explanation.type === "PageSupportNeeded" /* PageSupportNeeded */);
        const supportPending = explanations.filter(explanation => explanation.type === "SupportPending" /* SupportPending */);
        const circumstantial = explanations.filter(explanation => explanation.type === "Circumstantial" /* Circumstantial */);
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      ${this.renderExplanations(i18nString(UIStrings.pageSupportNeeded), i18nString(UIStrings.pageSupportNeededExplanation), pageSupportNeeded)}
      ${this.renderExplanations(i18nString(UIStrings.supportPending), i18nString(UIStrings.supportPendingExplanation), supportPending)}
      ${this.renderExplanations(i18nString(UIStrings.circumstantial), i18nString(UIStrings.circumstantialExplanation), circumstantial)}
    `;
        // clang-format on
    }
    renderExplanations(category, explainerText, explanations) {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      ${explanations.length > 0 ? LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName}>
          ${category}
          <${IconButton.Icon.Icon.litTagName} class="inline-icon" .data=${{
            iconName: 'help_outline',
            color: 'var(--color-text-secondary)',
            width: '16px',
            height: '16px',
        }} title=${explainerText}></${IconButton.Icon.Icon.litTagName}>
        </${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName}>
          <ul class='not-restored-reason-list'>${explanations.map(explanation => this.renderReason(explanation))}</ul>
        </${ReportView.ReportView.ReportValue.litTagName}>
      ` : LitHtml.nothing}
    `;
        // clang-format on
    }
    renderReason(explanation) {
        return LitHtml.html `
      <li>
      <${IconButton.Icon.Icon.litTagName} class="inline-icon" .data=${{
            iconName: 'circled_exclamation_icon',
            color: 'orange',
            width: '16px',
            height: '16px',
        }}></${IconButton.Icon.Icon.litTagName}>
        ${explanation.reason} : ${(explanation.reason in NotRestoredReasonDescription) ?
            LitHtml.html `${NotRestoredReasonDescription[explanation.reason].name()}` :
            LitHtml.nothing} </li>
    `;
    }
}
//# sourceMappingURL=BackForwardCacheView.js.map