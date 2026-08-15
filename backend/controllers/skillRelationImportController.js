// backend/controllers/skillRelationImportController.js
const { Readable } = require('stream');
const { parse } = require('csv-parse');
const mongoose = require('mongoose');
const SkillRelation = require('../models/SkillRelation');
const Skill = require('../models/Skill');

const ALLOWED_TYPES = ['parent', 'child', 'prerequisite', 'related'];
const ALLOWED_DEPENDENCY_TYPES = ['Required', 'Recommended', 'Optional'];

/**
 * POST /api/skill-relations/import
 * Body: multipart/form-data  with field "csv" (the uploaded file)
 * Admin only.
 *
 * CSV columns:
 *   fromSkillId  – ObjectId of the source Skill
 *   toSkillId    – ObjectId of the target Skill
 *   relationship – one of: parent | child | prerequisite | related
 *   dependencyType (optional) – Required | Recommended | Optional
 */
exports.importCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded. Use field name "csv".' });
  }

  const rows = [];
  const errors = [];
  let rowIndex = 0;

  // ── Parse CSV ──────────────────────────────────────────────────────────────
  try {
    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer);
      stream
        .pipe(
          parse({
            columns: true,           // use first row as header
            skip_empty_lines: true,
            trim: true,
          })
        )
        .on('data', (record) => {
          rowIndex++;
          const { fromSkillId, toSkillId, relationship, dependencyType } = record;

          // ── Validate ObjectIds ────────────────────────────────────────────
          if (!mongoose.Types.ObjectId.isValid(fromSkillId)) {
            errors.push({ row: rowIndex, reason: `Invalid fromSkillId: "${fromSkillId}"` });
            return;
          }
          if (!mongoose.Types.ObjectId.isValid(toSkillId)) {
            errors.push({ row: rowIndex, reason: `Invalid toSkillId: "${toSkillId}"` });
            return;
          }

          // ── Validate enum: relationship ───────────────────────────────────
          if (!ALLOWED_TYPES.includes(relationship)) {
            errors.push({
              row: rowIndex,
              reason: `Invalid relationship "${relationship}". Allowed: ${ALLOWED_TYPES.join(', ')}`,
            });
            return;
          }

          // ── Validate enum: dependencyType (optional) ──────────────────────
          if (dependencyType && !ALLOWED_DEPENDENCY_TYPES.includes(dependencyType)) {
            errors.push({
              row: rowIndex,
              reason: `Invalid dependencyType "${dependencyType}". Allowed: ${ALLOWED_DEPENDENCY_TYPES.join(', ')}`,
            });
            return;
          }

          rows.push({
            rowIndex,
            fromSkillId: new mongoose.Types.ObjectId(fromSkillId),
            toSkillId:   new mongoose.Types.ObjectId(toSkillId),
            relationship,
            dependencyType: dependencyType || undefined,
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
  } catch (parseErr) {
    return res.status(422).json({ message: 'CSV parse error: ' + parseErr.message });
  }

  if (rows.length === 0) {
    return res.status(422).json({
      message: 'No valid rows to import.',
      processed: rowIndex,
      created: 0,
      skipped: errors.length,
      errors,
    });
  }

  // ── Validate that referenced skills exist ──────────────────────────────────
  const allIds = [...new Set(rows.flatMap((r) => [r.fromSkillId.toString(), r.toSkillId.toString()]))];
  const foundSkills = await Skill.find(
    { _id: { $in: allIds } },
    { _id: 1 }
  ).lean();
  const foundSet = new Set(foundSkills.map((s) => s._id.toString()));

  const validRows = [];
  for (const row of rows) {
    const missingIds = [];
    if (!foundSet.has(row.fromSkillId.toString())) missingIds.push(`fromSkillId (${row.fromSkillId})`);
    if (!foundSet.has(row.toSkillId.toString()))   missingIds.push(`toSkillId (${row.toSkillId})`);

    if (missingIds.length > 0) {
      errors.push({ row: row.rowIndex, reason: `Skill not found: ${missingIds.join(', ')}` });
    } else {
      validRows.push({
        from:           row.fromSkillId,
        to:             row.toSkillId,
        type:           row.relationship,
        dependencyType: row.dependencyType,
      });
    }
  }

  if (validRows.length === 0) {
    return res.status(422).json({
      message: 'No valid rows after skill existence check.',
      processed: rowIndex,
      created: 0,
      skipped: errors.length,
      errors,
    });
  }

  // ── Bulk insert (ordered:false → continue on duplicate key errors) ─────────
  let insertedCount = 0;
  const insertErrors = [];

  try {
    const result = await SkillRelation.insertMany(validRows, {
      ordered: false,
      rawResult: true,
    });
    insertedCount = result.insertedCount ?? validRows.length;
  } catch (bulkErr) {
    // Some inserts may have succeeded even on a BulkWriteError
    if (bulkErr.insertedDocs !== undefined) {
      insertedCount = bulkErr.insertedDocs.length;
    }
    if (bulkErr.writeErrors) {
      bulkErr.writeErrors.forEach((we) => {
        insertErrors.push({ reason: we.errmsg || 'Duplicate or write error' });
      });
    } else {
      return res.status(500).json({ message: bulkErr.message });
    }
  }

  const skipped = errors.length + insertErrors.length;

  return res.status(200).json({
    message: 'Import complete',
    processed: rowIndex,
    created: insertedCount,
    skipped,
    errors: [...errors, ...insertErrors],
  });
};
