import { Router } from 'express';
import { auth } from '@repo/server-common/middlewares';
import {
  createWorkflow,
  deleteWorkflow,
  getAllWorkflows,
  getWorkflow,
  updateWorkflow,
} from '../controllers/workflow.controller';

const router: Router = Router();

router.get('/', auth, getAllWorkflows);
router.get('/:id', auth, getWorkflow);
router.post('/', auth, createWorkflow);
router.put('/:id', auth, updateWorkflow);
router.delete('/:id', auth, deleteWorkflow);

export default router;
