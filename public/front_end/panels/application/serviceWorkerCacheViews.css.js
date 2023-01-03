// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2014 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

.service-worker-cache-data-view .data-view-toolbar {
  position: relative;
  background-color: var(--color-background-elevation-1);
  border-bottom: 1px solid var(--color-details-hairline);
  padding-right: 10px;
}

.service-worker-cache-data-view .data-grid {
  flex: auto;
}

.service-worker-cache-data-view .data-grid .data-container tr:nth-last-child(1) td {
  border: 0;
}

.service-worker-cache-data-view .data-grid .data-container tr:nth-last-child(2) td {
  border-bottom: 1px solid var(--color-details-hairline);
}

.service-worker-cache-data-view .data-grid .data-container tr.selected {
  background-color: var(--color-background-highlight);
  color: inherit;
}

.service-worker-cache-data-view .data-grid:focus .data-container tr.selected {
  background-color: var(--color-primary);
  color: var(--color-background);
}

.service-worker-cache-data-view .section,
.service-worker-cache-data-view .section > .header,
.service-worker-cache-data-view .section > .header .title {
  margin: 0;
  min-height: inherit;
  line-height: inherit;
}

.service-worker-cache-data-view .data-grid .data-container td .section .header .title {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.cache-preview-panel-resizer {
  background-color: var(--color-background-elevation-1);
  height: 4px;
  border-bottom: 1px solid var(--color-details-hairline);
}

.cache-storage-summary-bar {
  flex: 0 0 27px;
  line-height: 27px;
  padding-left: 5px;
  background-color: var(--color-background-elevation-1);
  border-top: 1px solid var(--color-details-hairline);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/*# sourceURL=serviceWorkerCacheViews.css */
`);
export default styles;
