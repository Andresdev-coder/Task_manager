import { Router } from 'express';
import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.js';

// mergeParams permite leer :projectId aunque esta ruta se monte dentro de otra
const router = Router({ mergeParams: true });

router.use(protect);

router.route('/').get(getTasksByProject).post(createTask);
router.route('/:taskId').put(updateTask).delete(deleteTask);

export default router;
