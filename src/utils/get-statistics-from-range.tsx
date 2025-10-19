import { ChoreCompletion } from "@/types/chore-completion";

export function getChoresFromCurrentWeek(chores: ChoreCompletion[]) {
  return chores.filter((c) => c.completedAt.toDate() >= getThisWeekStart());
}

export function getChoresFromLastWeek(chores: ChoreCompletion[]) {
  return chores.filter(
    (c) =>
      c.completedAt.toDate() >= getLastWeekStart() &&
      c.completedAt.toDate() < getThisWeekStart(),
  );
}

export function getChoresFromCurrentMonth(chores: ChoreCompletion[]) {
  return chores.filter((c) => c.completedAt.toDate() >= getThisMonthStart());
}

export function getChoresFromLastMonth(chores: ChoreCompletion[]) {
  return chores.filter(
    (c) =>
      c.completedAt.toDate() >= getLastMonthStart() &&
      c.completedAt.toDate() < getThisMonthStart(),
  );
}

export function getChoresFromLastXDays(
  chores: ChoreCompletion[],
  days: number,
) {
  const today = new Date();
  const startDate = new Date(today);

  startDate.setDate(today.getDate() - days);

  return chores.filter((c) => c.completedAt.toDate() >= startDate);
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
