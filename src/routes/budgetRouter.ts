import { Router } from 'express';
import { BudgetController } from '../controllers/BudgetController';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import {
  validateBudgetExists,
  validateBudgetId,
  validateBudgetInput,
} from '../middleware/budget';
import { ExpensesController } from '../controllers/ExpenseController';
import {
  validateExpenseExists,
  validateExpenseId,
  validateExpenseInput,
} from '../middleware/expense';

const router = Router();

/*
 * Estas lineas son para ejecutar los middlewares 'validateBudgetId' y 'validateBudgetExists'
 * solo en las peticiones dondes traiga el parametro 'budgetId'
 */
router.param('budgetId', validateBudgetId);
router.param('budgetId', validateBudgetExists);
router.param('expenseId', validateExpenseId);
router.param('expenseId', validateExpenseExists);

router.get('/', BudgetController.getAll);

router.post(
  '/',
  validateBudgetInput,
  handleInputErrors,
  BudgetController.create,
);

router.get('/:budgetId', BudgetController.getBudgetById);

router.put(
  '/:budgetId',
  validateBudgetInput,
  handleInputErrors,
  BudgetController.updateById,
);

router.delete('/:budgetId', BudgetController.deleteById);

/** Routes for expenses */
router.post(
  '/:budgetId/expenses',
  validateExpenseInput,
  handleInputErrors,
  ExpensesController.create,
);

router.get('/:budgetId/expenses/:expenseId', ExpensesController.getById);

router.put(
  '/:budgetId/expenses/:expenseId',
  validateExpenseInput,
  handleInputErrors,
  ExpensesController.updateById,
);

router.delete('/:budgetId/expenses/:expenseId', ExpensesController.deleteById);

export default router;
