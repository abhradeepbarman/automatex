import { Router } from 'express';
import {
  addStep,
  deleteStep,
  getStep,
  updateStep,
} from '../controllers/step.controller';
import { auth } from '../middlewares';

const router: Router = Router();

router.get('/:workflowId/:stepId', auth, getStep);
router.post('/:workflowId', auth, addStep);
router.put('/:workflowId/:stepId', auth, updateStep);
router.delete('/:workflowId/:stepId', auth, deleteStep);

export default router;
