/**
 * Strategy Actions
 * Étape 7.2.1 - Planification stratégique
 * Étape 7.2.2 - Gestion des budgets
 * Étape 7.2.3 - Gestion des objectifs (Goals)
 */

// OKR Actions
export { getObjectivesAction } from './getObjectivesAction';
export { createObjectiveAction } from './createObjectiveAction';
export { updateKeyResultAction } from './updateKeyResultAction';

// Budget Actions
export { getBudgetsAction } from './getBudgetsAction';
export { createBudgetAction } from './createBudgetAction';
export { updateBudgetItemAction } from './updateBudgetItemAction';

// Goal Actions
export { getGoalsAction } from './getGoalsAction';
export { createGoalAction } from './createGoalAction';
export { updateGoalAction } from './updateGoalAction';

// Types
export type { GetObjectivesParams, GetObjectivesResult, ObjectiveWithKeyResults } from './getObjectivesAction';
export type { CreateObjectiveParams, CreateObjectiveResult, KeyResultInput } from './createObjectiveAction';
export type { UpdateKeyResultParams, UpdateKeyResultResult } from './updateKeyResultAction';
export type { GetBudgetsParams, GetBudgetsResult, BudgetWithItems } from './getBudgetsAction';
export type { CreateBudgetParams, CreateBudgetResult, BudgetItemInput } from './createBudgetAction';
export type { UpdateBudgetItemParams, UpdateBudgetItemResult } from './updateBudgetItemAction';
export type { GetGoalsParams, GetGoalsResult, GoalWithDetails } from './getGoalsAction';
export type { CreateGoalParams, CreateGoalResult } from './createGoalAction';
export type { UpdateGoalParams, UpdateGoalResult } from './updateGoalAction';
