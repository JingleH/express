/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  createTag,
  readBlockConfig,
// eslint-disable-next-line import/no-unresolved
} from '../../scripts/scripts.js';

const DEFAULT_DELAY = 1000;
const MAX_NONCONFIG_ROWS = 3;

/**
 * @param {HTMLDivElement} block
 * @param {string} href
 * @param {number} [delay=0]
 */
// eslint-disable-next-line no-unused-vars
async function loadSpline(block, href, $fallback, delay = 0) {
  const { Application } = await import('../../scripts/spline-runtime.min.js');
  const canvas = createTag('canvas', { id: 'canvas3d', class: 'canvas3d' });
  block.append(canvas);
  const app = new Application(canvas);

  console.debug('[loadSpline()/code] href: ', href);

  await app.load(href, {
    // credentials: 'include',
    mode: 'no-cors',
  });
}

function loadSplineFrame(block, href, $fallback, delay = 0) {
  const iframe = document.createElement('iframe');
  console.debug('[loadSpline()/frame] href: ', href);

  iframe.src = href;

  // setTimeout(() => {
  iframe.onload = () => {
    setTimeout(() => {
      iframe.style.opacity = '1';
      if ($fallback) {
        $fallback.style.display = 'none';
      }
    }, delay);
    iframe.onload = null;
  };
  block.append(iframe);
  // const content = iframe.previousElementSibling;
  // window.content = content;
  // iframe.style.paddingTop = `${content.offsetHeight + content.offsetTop - 63}px`;
  // }, delay);
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const conf = readBlockConfig(block);
  const rows = [...block.querySelectorAll(':scope > div')];

  const nonconfRows = Math.min(rows.length - Object.keys(conf).length, MAX_NONCONFIG_ROWS);
  rows.forEach(($row, i) => {
    if (i >= nonconfRows) {
      $row.remove();
    }
  });

  // required row
  const $link = rows.shift().querySelector(':scope a');
  $link.parentElement.parentElement.remove();

  // fallback images
  /** @type {HTMLDivElement} */
  let $fallbackImg;
  if (rows[0] && rows[0].childElementCount === 1) {
    if (rows[0].querySelectorAll('picture').length === rows[0].firstChild.childElementCount) {
      rows[0].classList.add('fallback');
      // eslint-disable-next-line prefer-destructuring
      $fallbackImg = rows[0];
    }
  }

  if (!$link || document.body.dataset.device === 'mobile' || window.screen.width < 900) {
    return;
  }

  const { href } = $link;
  $link.parentElement.parentElement.remove();

  let { delay } = conf;
  if (delay) {
    delay = Number.parseInt(delay, 10);
  }
  if (delay == null || Number.isNaN(delay)) {
    delay = DEFAULT_DELAY;
  }

  // loadSpline(block, href, $fallbackImg,delay);
  loadSplineFrame(block, href, $fallbackImg, delay);
}
