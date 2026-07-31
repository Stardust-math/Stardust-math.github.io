#!/usr/bin/env node
'use strict';

const fs = require('fs');

const {
  relative,
  loadItems,
  asString,
  isHttpUrl
} = require(
  './lib/social_anime_data.js'
);

const USER_AGENT =
  'Mozilla/5.0 ' +
  '(Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) ' +
  'Chrome/124.0 Safari/537.36 ' +
  'StardustMathAnimeLinkReport/1.0';

const REQUEST_TIMEOUT_MS =
  15000;

const RETRIES =
  1;

const CONCURRENCY =
  4;

function escapeWorkflowCommand(value) {
  return String(value || '')
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A');
}

function emitWarning(
  filePath,
  message
) {
  const file =
    escapeWorkflowCommand(
      filePath
    );

  const text =
    escapeWorkflowCommand(
      message
    );

  console.log(
    `::warning file=${file}::${text}`
  );
}

function delay(milliseconds) {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

async function requestOnce(
  url,
  method
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      REQUEST_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        url,
        {
          method,

          redirect:
            'follow',

          signal:
            controller.signal,

          headers: {
            'User-Agent':
              USER_AGENT,

            Accept:
              'text/html,' +
              'application/xhtml+xml,' +
              'application/json;q=0.9,' +
              '*/*;q=0.8',

            'Accept-Language':
              'zh-CN,zh;q=0.9,en;q=0.8',

            'Cache-Control':
              'no-cache'
          }
        }
      );

    const result = {
      method,

      status:
        response.status,

      ok:
        response.status >= 200 &&
        response.status < 400,

      finalUrl:
        response.url ||
        url,

      error:
        ''
    };

    if (
      response.body &&
      typeof response.body
        .cancel === 'function'
    ) {
      await response.body
        .cancel()
        .catch(() => {});
    }

    return result;
  } catch (error) {
    return {
      method,

      status:
        null,

      ok:
        false,

      finalUrl:
        url,

      error:
        (
          error &&
          error.name ===
            'AbortError'
        )
          ? (
              'Timeout after ' +
              REQUEST_TIMEOUT_MS +
              ' ms'
            )
          : (
              asString(
                error &&
                error.message
              ) ||
              'Request failed'
            )
    };
  } finally {
    clearTimeout(
      timeout
    );
  }
}

async function checkUrl(url) {
  if (!isHttpUrl(url)) {
    return {
      ok:
        false,

      method:
        'validate',

      status:
        null,

      finalUrl:
        url,

      reason:
        'Invalid HTTP(S) URL'
    };
  }

  let lastResult =
    null;

  for (
    let attempt = 0;
    attempt <= RETRIES;
    attempt += 1
  ) {
    const head =
      await requestOnce(
        url,
        'HEAD'
      );

    if (head.ok) {
      return {
        ...head,

        reason:
          `HTTP ${head.status}`
      };
    }

    const get =
      await requestOnce(
        url,
        'GET'
      );

    if (get.ok) {
      return {
        ...get,

        reason:
          `HTTP ${get.status}`
      };
    }

    lastResult =
      get.error
        ? get
        : head;

    if (attempt < RETRIES) {
      await delay(
        700
      );
    }
  }

  return {
    ok:
      false,

    method:
      lastResult
        ? lastResult.method
        : 'GET',

    status:
      lastResult
        ? lastResult.status
        : null,

    finalUrl:
      lastResult
        ? lastResult.finalUrl
        : url,

    reason:
      lastResult
        ? (
            lastResult.error ||
            (
              lastResult.status !==
                null
                ? (
                    `HTTP ${lastResult.status}`
                  )
                : 'Request failed'
            )
          )
        : 'Request failed'
  };
}

function createTasks(items) {
  const tasks = [];

  items.forEach((item) => {
    const source =
      item.source || {};

    const filePath =
      relative(
        item.__filePath
      );

    const id =
      asString(
        item.id
      );

    tasks.push({
      id,

      filePath,

      type:
        'Bangumi',

      url:
        asString(
          source.bangumiUrl
        )
    });

    tasks.push({
      id,

      filePath,

      type:
        'Watch',

      url:
        asString(
          source.watchUrl
        )
    });
  });

  return tasks;
}

async function mapWithConcurrency(
  values,
  limit,
  worker
) {
  const results =
    new Array(
      values.length
    );

  let cursor = 0;

  async function runWorker() {
    while (true) {
      const index =
        cursor;

      cursor += 1;

      if (
        index >=
        values.length
      ) {
        return;
      }

      results[index] =
        await worker(
          values[index],
          index
        );
    }
  }

  const workers =
    Array.from(
      {
        length:
          Math.min(
            limit,
            values.length
          )
      },
      () =>
        runWorker()
    );

  await Promise.all(
    workers
  );

  return results;
}

function markdownEscape(value) {
  return String(
    value == null
      ? ''
      : value
  )
    .replace(
      /\|/g,
      '\\|'
    )
    .replace(
      /\r?\n/g,
      ' '
    )
    .trim();
}

function makeSummary(results) {
  const okay =
    results.filter(
      (entry) =>
        entry.result.ok
    ).length;

  const warnings =
    results.length -
    okay;

  const lines = [
    '# Social Anime external-link report',
    '',
    `Checked: ${results.length}`,
    '',
    `Reachable from this GitHub Actions run: ${okay}`,
    '',
    `Warnings: ${warnings}`,
    '',
    '> This report is informational only. A warning can be caused by the remote site rejecting automated requests.',
    '',
    '| Item | Link | Result | Final URL |',
    '|---|---|---|---|'
  ];

  results.forEach(({
    task,
    result
  }) => {
    lines.push(
      '| ' +
      markdownEscape(
        task.id
      ) +
      ' | ' +
      markdownEscape(
        task.type
      ) +
      ' | ' +
      markdownEscape(
        result.ok
          ? result.reason
          : (
              'Warning: ' +
              result.reason
            )
      ) +
      ' | ' +
      markdownEscape(
        result.finalUrl ||
        task.url
      ) +
      ' |'
    );
  });

  lines.push('');

  return lines.join('\n');
}

async function main() {
  const items =
    loadItems();

  const tasks =
    createTasks(
      items
    );

  console.log(
    'Social Anime external-link report'
  );

  console.log(
    '================================='
  );

  const results =
    await mapWithConcurrency(
      tasks,
      CONCURRENCY,
      async (task) => {
        const result =
          await checkUrl(
            task.url
          );

        const prefix =
          result.ok
            ? 'OK'
            : 'WARNING';

        console.log(
          `${prefix}  ` +
          `${task.id}  ` +
          `${task.type}  ` +
          `${result.reason}  ` +
          `${task.url}`
        );

        if (!result.ok) {
          emitWarning(
            task.filePath,
            `${task.id} ${task.type} link may be inaccessible: ` +
            `${result.reason}; ${task.url}`
          );
        }

        return {
          task,
          result
        };
      }
    );

  const summary =
    makeSummary(
      results
    );

  const summaryPath =
    asString(
      process.env
        .GITHUB_STEP_SUMMARY
    );

  if (summaryPath) {
    fs.appendFileSync(
      summaryPath,
      summary + '\n',
      'utf8'
    );
  }

  const warningCount =
    results.filter(
      (entry) =>
        !entry.result.ok
    ).length;

  console.log('');

  console.log(
    `Checked: ${results.length}`
  );

  console.log(
    `Warnings: ${warningCount}`
  );

  console.log(
    'Link warnings are informational and do not fail this script.'
  );
}

main().catch((error) => {
  const message =
    error && error.stack
      ? error.stack
      : String(error);

  console.error(
    '[check_social_anime_links] Report could not be completed.'
  );

  console.error(
    message
  );

  emitWarning(
    'scripts/check_social_anime_links.js',
    'Anime external-link report could not be completed: ' +
    message
  );

  const summaryPath =
    asString(
      process.env
        .GITHUB_STEP_SUMMARY
    );

  if (summaryPath) {
    fs.appendFileSync(
      summaryPath,
      '# Social Anime external-link report\n\n' +
      'The informational report could not be completed. ' +
      'This does not block deployment.\n',
      'utf8'
    );
  }

  process.exitCode = 0;
});