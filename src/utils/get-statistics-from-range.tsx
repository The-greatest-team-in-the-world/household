import { ChoreCompletion } from "@/types/chore-completion";

export function getChoresByCurrentWeek(chores: ChoreCompletion[]) {
  return chores.filter((c) => c.completedAt.toDate() >= getThisWeekStart());
}

export function getChoresByLastWeek(chores: ChoreCompletion[]) {
  return chores.filter(
    (c) =>
      c.completedAt.toDate() >= getLastWeekStart() &&
      c.completedAt.toDate() < getThisWeekStart(),
  );
}

export function getChoresByThisMonth(chores: ChoreCompletion[]) {
  return chores.filter((c) => c.completedAt.toDate() >= getThisMonthStart());
}

export function getChoresByLastMonth(chores: ChoreCompletion[]) {
  return chores.filter(
    (c) =>
      c.completedAt.toDate() >= getLastMonthStart() &&
      c.completedAt.toDate() < getThisMonthStart(),
  );
}

function getThisWeekStart() {
  const today = new Date();
  let currentWeekDay = today.getDay() === 0 ? 7 : today.getDay();

  const thisWeek = new Date(today);

  thisWeek.setDate(today.getDate() - (currentWeekDay - 1));
  thisWeek.setHours(0, 0, 0, 0);

  return thisWeek;
}

function getLastWeekStart() {
  const today = new Date();
  let currentWeekDay = today.getDay() === 0 ? 7 : today.getDay();

  const lastWeek = new Date(today);

  lastWeek.setDate(today.getDate() - (currentWeekDay + 6));
  lastWeek.setHours(0, 0, 0, 0);

  return lastWeek;
}

function getThisMonthStart() {
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  thisMonth.setHours(0, 0, 0, 0);

  return thisMonth;
}

function getLastMonthStart() {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  lastMonth.setHours(0, 0, 0, 0);

  return lastMonth;
}
