import { Router } from 'express';
import { 
  getAccount, 
  getAccounts, 
  createAccount, 
  updateAccount 
} from '../controllers/accountController';

const router = Router();

router.get('/', getAccounts);
router.get('/:id', getAccount);
router.post('/', createAccount);
router.put('/:id', updateAccount);

export default router; 