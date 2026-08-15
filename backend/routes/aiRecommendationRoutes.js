// backend/routes/aiRecommendationRoutes.js
const express = require('express');
const router = express.Router();
const { protect, verifyRole } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/aiRecommendationController');

const adminOnly = [protect, verifyRole('admin')];

// ── Generation endpoints ────────────────────────────────
router.post('/generate/job-role',              ...adminOnly, ctrl.generateJobRole);
router.post('/generate/skills/:jobRoleId',     ...adminOnly, ctrl.generateSkills);
router.post('/generate/weightages/:jobRoleId', ...adminOnly, ctrl.generateWeightages);
router.post('/generate/dependencies/:skillId', ...adminOnly, ctrl.generateDependencies);
router.post('/generate/competencies/:jobRoleId',...adminOnly, ctrl.generateCompetencies);
router.post('/generate/assessment/:jobRoleId', ...adminOnly, ctrl.generateAssessment);
router.post('/generate/forecast/:skillId',     ...adminOnly, ctrl.generateForecast);

// ── Queue management ────────────────────────────────────
router.get('/queue',               protect, verifyRole('admin'), ctrl.getQueue);
router.get('/queue/:id',           protect, verifyRole('admin'), ctrl.getQueueItem);
router.put('/queue/:id/edit',      ...adminOnly, ctrl.editQueueItem);
router.put('/queue/:id/approve',   ...adminOnly, ctrl.approveQueueItem);
router.put('/queue/:id/reject',    ...adminOnly, ctrl.rejectQueueItem);
router.put('/queue/:id/publish',   ...adminOnly, ctrl.publishQueueItem);
router.delete('/queue/:id',        ...adminOnly, ctrl.deleteQueueItem);

module.exports = router;
