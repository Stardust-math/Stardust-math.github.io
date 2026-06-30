#!/usr/bin/env node

'use strict';

/*
  Check consistency between the English schedule source and the Chinese
  course-name / instructor mappings used by the Schedule / My Timetable module.

  Run from the repository root:

      node scripts/check_schedule_translations.js

  Optional strict mode:

      STRICT_WARNINGS=1 node scripts/check_schedule_translations.js

  Optional unused-mapping check:

      CHECK_UNUSED_MAPPINGS=1 node scripts/check_schedule_translations.js

  This script checks internal consistency only.
  It does not fetch or compare against external official catalog data.
  It has no third-party dependencies.
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const EN_SCHEDULE_FILE = path.join(
  ROOT,
  'assets/js/Content/EN/schedule/schedule_EN.js'
);

const ZH_SCHEDULE_FILE = path.join(
  ROOT,
  'assets/js/Content/ZH/schedule/schedule_ZH.js'
);

const STRICT_WARNINGS = String(process.env.STRICT_WARNINGS || '').trim() === '1';
const CHECK_UNUSED_MAPPINGS = String(process.env.CHECK_UNUSED_MAPPINGS || '').trim() === '1';

let errors = [];
let warnings = [];
let infos = [];

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function makeIssue(message, file, line) {
  return {
    message: String(message),
    file: file || null,
    line: Number.isFinite(line) ? line : null
  };
}

function fail(message, file, line) {
  errors.push(makeIssue(message, file, line));
}

function warn(message, file, line) {
  warnings.push(makeIssue(message, file, line));
}

function info(message, file, line) {
  infos.push(makeIssue(message, file, line));
}

function formatIssue(issue) {
  const location = issue.file
    ? `${rel(issue.file)}${issue.line ? `:${issue.line}` : ''}`
    : '';

  return location ? `${location}\n${issue.message}` : issue.message;
}

function readText(file) {
  if (!fs.existsSync(file)) {
    fail(`Missing required file: ${rel(file)}`, file);
    return '';
  }

  return fs.readFileSync(file, 'utf8');
}

function buildLineStarts(text) {
  const starts = [0];

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      starts.push(i + 1);
    }
  }

  return starts;
}

function lineForIndex(lineStarts, index) {
  if (!Array.isArray(lineStarts) || !Number.isFinite(index)) return null;

  let lo = 0;
  let hi = lineStarts.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (lineStarts[mid] <= index) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return hi + 1;
}

function escapeForAnnotationMessage(message) {
  return String(message)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A');
}

function escapeForAnnotationProperty(value) {
  return String(value)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A')
    .replace(/:/g, '%3A')
    .replace(/,/g, '%2C');
}

function printGithubAnnotation(level, issue) {
  const props = ['title=Schedule translation check'];

  if (issue.file) {
    props.push(`file=${escapeForAnnotationProperty(rel(issue.file))}`);
  }

  if (issue.line) {
    props.push(`line=${issue.line}`);
  }

  const safeMessage = escapeForAnnotationMessage(issue.message);

  if (level === 'error') {
    console.error(`::error ${props.join(',')}::${safeMessage}`);
  } else if (level === 'warning') {
    console.log(`::warning ${props.join(',')}::${safeMessage}`);
  }
}

function decodeHtmlEntities(s) {
  return String(s || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripTags(s) {
  return decodeHtmlEntities(String(s || '').replace(/<[^>]*>/g, ' '));
}

function normalizeSpaces(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function normalizeCourseCode(raw) {
  const s = normalizeSpaces(stripTags(raw));
  if (!s) return '';

  return s.split(/\s+/)[0].trim();
}

function normalizeCourseName(raw) {
  return normalizeSpaces(stripTags(raw));
}

function looksLikeCourseCode(code) {
  const s = String(code || '').trim();
  if (!s) return false;
  if (s === 'Null') return true;
  if (s.length > 40) return false;

  return (
    /^[A-Z]{1,12}\d[A-Za-z0-9_.-]*$/.test(s) ||
    /^\d{3,}[A-Za-z0-9_.-]*$/.test(s)
  );
}

function looksLikeCourseNumberText(text) {
  const s = normalizeSpaces(stripTags(text));
  if (!s) return false;

  return (
    /^[A-Z]{1,12}\d[A-Za-z0-9_.-]*(?:\s*\[[^\]]+\])?$/.test(s) ||
    /^\d{3,}[A-Za-z0-9_.-]*(?:\s*\[[^\]]+\])?$/.test(s)
  );
}

function sameText(a, b) {
  return normalizeSpaces(a) === normalizeSpaces(b);
}

function normalizeNameForConflict(name) {
  return normalizeSpaces(name)
    .replace(/\s*\(TA\)\s*$/i, '')
    .replace(/\s+/g, ' ');
}

function normalizeInstructorLookupToken(raw) {
  return normalizeSpaces(stripTags(raw))
    .replace(/[.。]+$/g, '')
    .trim();
}

function splitInstructorText(raw) {
  return normalizeSpaces(stripTags(raw))
    .split(/\s*[,;]\s*/)
    .map(normalizeInstructorLookupToken)
    .filter(Boolean);
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractObjectLiteral(source, constName, sourceFile, lineStarts) {
  const re = new RegExp(`const\\s+${escapeRegex(constName)}\\s*=\\s*\\{`, 'm');
  const m = re.exec(source);

  if (!m) {
    fail(
      `Cannot find object literal: ${constName} in ${rel(sourceFile)}`,
      sourceFile
    );
    return null;
  }

  const start = source.indexOf('{', m.index);
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const ch = source[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;

      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  fail(
    `Unclosed object literal: ${constName} in ${rel(sourceFile)}`,
    sourceFile,
    lineForIndex(lineStarts, start)
  );
  return null;
}

function evaluateObjectLiteral(objectLiteral, label) {
  if (!objectLiteral) return {};

  try {
    const value = vm.runInNewContext(`(${objectLiteral})`, Object.create(null), {
      filename: `${label}.vm.js`,
      timeout: 1000
    });

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      fail(`${label} is not an object.`);
      return {};
    }

    return value;
  } catch (e) {
    fail(`Failed to evaluate ${label}: ${e.message}`);
    return {};
  }
}

function parseZhMappings(zhText, zhLineStarts) {
  const byCode = evaluateObjectLiteral(
    extractObjectLiteral(zhText, 'COURSE_NAME_ZH_BY_CODE', ZH_SCHEDULE_FILE, zhLineStarts),
    'COURSE_NAME_ZH_BY_CODE'
  );

  const byText = evaluateObjectLiteral(
    extractObjectLiteral(zhText, 'COURSE_NAME_ZH_BY_TEXT', ZH_SCHEDULE_FILE, zhLineStarts),
    'COURSE_NAME_ZH_BY_TEXT'
  );

  const instructors = evaluateObjectLiteral(
    extractObjectLiteral(zhText, 'INSTRUCTOR_ZH_BY_TOKEN', ZH_SCHEDULE_FILE, zhLineStarts),
    'INSTRUCTOR_ZH_BY_TOKEN'
  );

  return { byCode, byText, instructors };
}

function collectSemesterMarkers(enText) {
  const markers = [];
  const re = /<div\s+class=["']semester-timetable-container[^"']*["']\s+id=["']([^"']+)["'][^>]*>/g;

  let m;
  while ((m = re.exec(enText)) !== null) {
    markers.push({
      id: m[1],
      index: m.index
    });
  }

  markers.sort((a, b) => a.index - b.index);
  return markers;
}

function getSemesterAt(markers, index) {
  let result = 'unknown';

  for (const marker of markers) {
    if (marker.index <= index) {
      result = marker.id;
    } else {
      break;
    }
  }

  return result;
}

function makeRecordKey(semester, code, enName) {
  return `${semester}\u0000${code}\u0000${enName}`;
}

function addCourseRecord(map, semester, codeRaw, enNameRaw, sourceKind, index, lineStarts) {
  const code = normalizeCourseCode(codeRaw);
  const enName = normalizeCourseName(enNameRaw);

  if (!looksLikeCourseCode(code)) return;
  if (!enName) return;

  if (
    enName === 'Course Name' ||
    enName === 'Course Number' ||
    enName === 'Period' ||
    enName === 'Time'
  ) {
    return;
  }

  const key = makeRecordKey(semester, code, enName);

  if (!map.has(key)) {
    map.set(key, {
      semester,
      code,
      enName,
      occurrences: []
    });
  }

  map.get(key).occurrences.push({
    sourceKind,
    index,
    line: lineForIndex(lineStarts, index)
  });
}

function parseTimetableCourseBlocks(enText, records, markers, lineStarts) {
  const blockRe =
    /<div\s+class=["']course-number["'][^>]*>([\s\S]*?)<\/div>\s*<div\s+class=["']course-name["'][^>]*>([\s\S]*?)<\/div>/g;

  let m;
  while ((m = blockRe.exec(enText)) !== null) {
    addCourseRecord(
      records,
      getSemesterAt(markers, m.index),
      m[1],
      m[2],
      'timetable-cell',
      m.index,
      lineStarts
    );
  }
}

function parseRecoveredCourseBlocks(enText, records, markers, lineStarts) {
  const brokenBlockRe =
    /<div\s+class=["']course-name["'][^>]*>([\s\S]*?)<\/div>\s*<div\s+class=["']course-name["'][^>]*>([\s\S]*?)<\/div>/g;

  let m;
  while ((m = brokenBlockRe.exec(enText)) !== null) {
    if (!looksLikeCourseNumberText(m[1])) continue;

    const code = normalizeCourseCode(m[1]);
    const enName = normalizeCourseName(m[2]);
    const line = lineForIndex(lineStarts, m.index);

    fail([
      `Probable HTML class typo in ${rel(EN_SCHEDULE_FILE)}.`,
      `  semester: ${getSemesterAt(markers, m.index)}`,
      `  found: <div class="course-name">${normalizeSpaces(stripTags(m[1]))}</div>`,
      `  next course name: ${enName}`,
      `  suggestion: change the first class from "course-name" to "course-number".`
    ].join('\n'), EN_SCHEDULE_FILE, line);

    addCourseRecord(
      records,
      getSemesterAt(markers, m.index),
      code,
      enName,
      'recovered-broken-course-block',
      m.index,
      lineStarts
    );
  }
}

function parseMyClassesTables(enText, records, markers, lineStarts) {
  const tableRe =
    /<table\s+class=["'][^"']*\bmy-classes-table\b[^"']*["'][^>]*>([\s\S]*?)<\/table>/gi;

  let tableMatch;
  while ((tableMatch = tableRe.exec(enText)) !== null) {
    const semester = getSemesterAt(markers, tableMatch.index);
    const tableHtml = tableMatch[1];
    const tableContentOffset = tableMatch[0].indexOf(tableHtml);
    const tableContentStart = tableMatch.index + Math.max(tableContentOffset, 0);

    const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;

    while ((rowMatch = rowRe.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];

      if (/<th\b/i.test(rowHtml)) continue;

      const rowAbsIndex = tableContentStart + rowMatch.index;
      const rowContentOffset = rowMatch[0].indexOf(rowHtml);
      const rowContentStart = rowAbsIndex + Math.max(rowContentOffset, 0);

      const cellMatches = Array.from(rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi));
      const cells = cellMatches.map(cell => cell[1]);

      if (cells.length < 2) continue;

      const courseCellIndex = cellMatches[0]
        ? rowContentStart + cellMatches[0].index
        : rowAbsIndex;

      addCourseRecord(
        records,
        semester,
        cells[0],
        cells[1],
        'my-classes-table',
        courseCellIndex,
        lineStarts
      );
    }
  }
}

function parseEnglishCourses(enText, lineStarts) {
  const records = new Map();
  const markers = collectSemesterMarkers(enText);

  parseTimetableCourseBlocks(enText, records, markers, lineStarts);
  parseRecoveredCourseBlocks(enText, records, markers, lineStarts);
  parseMyClassesTables(enText, records, markers, lineStarts);

  return Array.from(records.values()).sort((a, b) => {
    if (a.semester !== b.semester) return a.semester.localeCompare(b.semester);
    if (a.code !== b.code) return a.code.localeCompare(b.code);
    return a.enName.localeCompare(b.enName);
  });
}

function makeInstructorRecordKey(semester, enName) {
  return `${semester}\u0000${enName}`;
}

function addInstructorRecords(map, semester, rawInstructorText, sourceKind, index, lineStarts) {
  const names = splitInstructorText(rawInstructorText);

  names.forEach(enName => {
    const key = makeInstructorRecordKey(semester, enName);

    if (!map.has(key)) {
      map.set(key, {
        semester,
        enName,
        occurrences: []
      });
    }

    map.get(key).occurrences.push({
      sourceKind,
      index,
      line: lineForIndex(lineStarts, index)
    });
  });
}

function parseTimetableInstructors(enText, records, markers, lineStarts) {
  const instructorRe =
    /<div\s+class=["']instructor["'][^>]*>([\s\S]*?)<\/div>/gi;

  let m;
  while ((m = instructorRe.exec(enText)) !== null) {
    addInstructorRecords(
      records,
      getSemesterAt(markers, m.index),
      m[1],
      'timetable-cell',
      m.index,
      lineStarts
    );
  }
}

function parseMyClassesTableInstructors(enText, records, markers, lineStarts) {
  const tableRe =
    /<table\s+class=["'][^"']*\bmy-classes-table\b[^"']*["'][^>]*>([\s\S]*?)<\/table>/gi;

  let tableMatch;
  while ((tableMatch = tableRe.exec(enText)) !== null) {
    const semester = getSemesterAt(markers, tableMatch.index);
    const tableHtml = tableMatch[1];
    const tableContentOffset = tableMatch[0].indexOf(tableHtml);
    const tableContentStart = tableMatch.index + Math.max(tableContentOffset, 0);

    const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;

    while ((rowMatch = rowRe.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];

      if (/<th\b/i.test(rowHtml)) continue;

      const rowAbsIndex = tableContentStart + rowMatch.index;
      const rowContentOffset = rowMatch[0].indexOf(rowHtml);
      const rowContentStart = rowAbsIndex + Math.max(rowContentOffset, 0);

      const cellMatches = Array.from(rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi));
      const cells = cellMatches.map(cell => cell[1]);

      if (cells.length < 3) continue;

      const instructorCellIndex = cellMatches[2]
        ? rowContentStart + cellMatches[2].index
        : rowAbsIndex;

      addInstructorRecords(
        records,
        semester,
        cells[2],
        'my-classes-table',
        instructorCellIndex,
        lineStarts
      );
    }
  }
}

function parseEnglishInstructors(enText, lineStarts) {
  const records = new Map();
  const markers = collectSemesterMarkers(enText);

  parseTimetableInstructors(enText, records, markers, lineStarts);
  parseMyClassesTableInstructors(enText, records, markers, lineStarts);

  return Array.from(records.values()).sort((a, b) => {
    if (a.semester !== b.semester) return a.semester.localeCompare(b.semester);
    return a.enName.localeCompare(b.enName);
  });
}

function formatOccurrences(occurrences) {
  if (!occurrences || !occurrences.length) return '  occurrences: unknown';

  const lines = occurrences
    .slice(0, 8)
    .map(o => `  - ${o.sourceKind}${o.line ? `, line ${o.line}` : ''}`);

  if (occurrences.length > 8) {
    lines.push(`  - ... ${occurrences.length - 8} more occurrence(s) omitted`);
  }

  return lines.join('\n');
}

function firstOccurrenceLine(record) {
  const first = record && record.occurrences && record.occurrences[0];
  return first && first.line ? first.line : null;
}

function checkMissingAndFallbacks(records, byCode, byText) {
  for (const r of records) {
    const hasCodeMap = Object.prototype.hasOwnProperty.call(byCode, r.code);
    const hasTextMap = Object.prototype.hasOwnProperty.call(byText, r.enName);
    const line = firstOccurrenceLine(r);

    if (!hasCodeMap && !hasTextMap) {
      fail([
        `Missing Chinese course-name mapping.`,
        `  semester: ${r.semester}`,
        `  code: ${r.code}`,
        `  EN: ${r.enName}`,
        formatOccurrences(r.occurrences),
        `  Add either COURSE_NAME_ZH_BY_CODE["${r.code}"] or COURSE_NAME_ZH_BY_TEXT["${r.enName}"].`
      ].join('\n'), EN_SCHEDULE_FILE, line);
      continue;
    }

    if (r.code !== 'Null' && !hasCodeMap && hasTextMap) {
      warn([
        `Course uses English-text fallback because code mapping is missing.`,
        `  semester: ${r.semester}`,
        `  code: ${r.code}`,
        `  EN: ${r.enName}`,
        formatOccurrences(r.occurrences),
        `  ZH by text: ${byText[r.enName]}`,
        `  Suggestion: add COURSE_NAME_ZH_BY_CODE["${r.code}"] for a more stable mapping.`
      ].join('\n'), EN_SCHEDULE_FILE, line);
    }

    if (hasCodeMap && hasTextMap && !sameText(byCode[r.code], byText[r.enName])) {
      warn([
        `Code mapping and English-text mapping disagree.`,
        `  semester: ${r.semester}`,
        `  code: ${r.code}`,
        `  EN: ${r.enName}`,
        formatOccurrences(r.occurrences),
        `  ZH by code: ${byCode[r.code]}`,
        `  ZH by text: ${byText[r.enName]}`,
        `  Effective page result: ${byCode[r.code]}`
      ].join('\n'), EN_SCHEDULE_FILE, line);
    }
  }
}

function checkCodeNameConflicts(records) {
  const codeToNames = new Map();

  for (const r of records) {
    if (r.code === 'Null') continue;

    if (!codeToNames.has(r.code)) {
      codeToNames.set(r.code, new Map());
    }

    const normalized = normalizeNameForConflict(r.enName);

    if (!codeToNames.get(r.code).has(normalized)) {
      codeToNames.get(r.code).set(normalized, new Set());
    }

    codeToNames.get(r.code).get(normalized).add(r.enName);
  }

  for (const [code, normalizedNameMap] of codeToNames.entries()) {
    if (normalizedNameMap.size <= 1) continue;

    const names = [];

    for (const variants of normalizedNameMap.values()) {
      for (const item of variants) {
        names.push(item);
      }
    }

    warn([
      `Same course code appears with multiple English names.`,
      `  code: ${code}`,
      ...names.sort().map(name => `  - ${name}`)
    ].join('\n'));
  }
}

function checkMissingInstructorMappings(instructorRecords, instructorMap) {
  for (const r of instructorRecords) {
    const hasMap = Object.prototype.hasOwnProperty.call(instructorMap, r.enName);
    const line = firstOccurrenceLine(r);

    if (!hasMap) {
      fail([
        `Missing Chinese instructor mapping.`,
        `  semester: ${r.semester}`,
        `  instructor: ${r.enName}`,
        formatOccurrences(r.occurrences),
        `  Add INSTRUCTOR_ZH_BY_TOKEN["${r.enName}"].`,
        `  Runtime fallback before fixing: the original English name will be kept.`
      ].join('\n'), EN_SCHEDULE_FILE, line);
    }
  }
}

function checkUnusedMappings(records, byCode, byText, instructorRecords, instructorMap) {
  if (!CHECK_UNUSED_MAPPINGS) {
    info('Unused mapping check is disabled. Set CHECK_UNUSED_MAPPINGS=1 to enable it.');
    return;
  }

  const usedCodes = new Set(records.map(r => r.code));
  const usedNames = new Set(records.map(r => r.enName));
  const usedInstructorNames = new Set(instructorRecords.map(r => r.enName));

  Object.keys(byCode).sort().forEach(code => {
    if (!usedCodes.has(code)) {
      warn(`Unused COURSE_NAME_ZH_BY_CODE entry: ${code} -> ${byCode[code]}`);
    }
  });

  Object.keys(byText).sort().forEach(name => {
    if (!usedNames.has(name)) {
      warn(`Unused COURSE_NAME_ZH_BY_TEXT entry: ${name} -> ${byText[name]}`);
    }
  });

  Object.keys(instructorMap).sort().forEach(name => {
    if (!usedInstructorNames.has(name)) {
      warn(`Unused INSTRUCTOR_ZH_BY_TOKEN entry: ${name} -> ${instructorMap[name]}`);
    }
  });
}

function printSection(title, items, level) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));

  if (!items.length) {
    console.log('(none)');
    return;
  }

  items.forEach((item, idx) => {
    console.log(`${idx + 1}. ${formatIssue(item)}`);

    if (level === 'error') {
      printGithubAnnotation('error', item);
    } else if (level === 'warning') {
      printGithubAnnotation('warning', item);
    }
  });
}

function printSummary(records, byCode, byText, instructorRecords, instructorMap) {
  const uniqueCodes = new Set(records.map(r => r.code));
  const uniquePairs = new Set(records.map(r => `${r.code}\u0000${r.enName}`));
  const uniqueInstructorNames = new Set(instructorRecords.map(r => r.enName));

  console.log('\nSchedule translation check summary');
  console.log('==================================');
  console.log(`English source: ${rel(EN_SCHEDULE_FILE)}`);
  console.log(`Chinese mapping source: ${rel(ZH_SCHEDULE_FILE)}`);
  console.log(`Course records found: ${records.length}`);
  console.log(`Unique code/name pairs: ${uniquePairs.size}`);
  console.log(`Unique course codes: ${uniqueCodes.size}`);
  console.log(`ZH mappings by code: ${Object.keys(byCode).length}`);
  console.log(`ZH mappings by English text: ${Object.keys(byText).length}`);
  console.log(`Instructor records found: ${instructorRecords.length}`);
  console.log(`Unique instructors: ${uniqueInstructorNames.size}`);
  console.log(`ZH instructor mappings: ${Object.keys(instructorMap).length}`);
}

function main() {
  const enText = readText(EN_SCHEDULE_FILE);
  const zhText = readText(ZH_SCHEDULE_FILE);

  if (errors.length) {
    printSection('Errors', errors, 'error');
    process.exit(1);
  }

  const enLineStarts = buildLineStarts(enText);
  const zhLineStarts = buildLineStarts(zhText);

  const { byCode, byText, instructors } = parseZhMappings(zhText, zhLineStarts);
  const records = parseEnglishCourses(enText, enLineStarts);
  const instructorRecords = parseEnglishInstructors(enText, enLineStarts);

  if (records.length === 0) {
    fail(
      `No course records found in ${rel(EN_SCHEDULE_FILE)}. The parser may need to be updated.`,
      EN_SCHEDULE_FILE
    );
  }

  checkMissingAndFallbacks(records, byCode, byText);
  checkCodeNameConflicts(records);
  checkMissingInstructorMappings(instructorRecords, instructors);
  checkUnusedMappings(records, byCode, byText, instructorRecords, instructors);

  printSummary(records, byCode, byText, instructorRecords, instructors);
  printSection('Errors', errors, 'error');
  printSection('Warnings', warnings, 'warning');

  if (infos.length) {
    printSection('Info', infos, 'info');
  }

  if (errors.length) {
    console.error('\nSchedule translation check failed.');
    process.exit(1);
  }

  if (STRICT_WARNINGS && warnings.length) {
    console.error('\nSchedule translation check failed because STRICT_WARNINGS=1 and warnings were found.');
    process.exit(1);
  }

  console.log('\nSchedule translation check passed.');
}

main();