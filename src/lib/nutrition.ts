import type { DailyLog, Food, MealGroup, NutritionEntry, NutritionValues, SavedMeal, SavedMealItem, UserSettings } from "@/lib/types";

export const mealGroups: MealGroup[] = ["breakfast", "lunch", "dinner", "snacks", "custom"];

export const defaultMealLabels: Record<MealGroup, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
  custom: "Custom meal"
};

export const zeroNutrition = (): NutritionValues => ({ calories: 0, protein: 0, carbohydrates: 0, fat: 0, fibre: 0 });

export function addNutrition(...values: NutritionValues[]): NutritionValues {
  return values.reduce<NutritionValues>(
    (total, value) => ({
      calories: total.calories + value.calories,
      protein: total.protein + value.protein,
      carbohydrates: total.carbohydrates + value.carbohydrates,
      fat: total.fat + value.fat,
      fibre: total.fibre + value.fibre
    }),
    zeroNutrition()
  );
}

export function nutritionForFood(food: Pick<Food, "per100g" | "servingGrams">, quantity: number): NutritionValues {
  const multiplier = (food.servingGrams * quantity) / 100;
  return {
    calories: Math.round(food.per100g.calories * multiplier),
    protein: Math.round(food.per100g.protein * multiplier),
    carbohydrates: Math.round(food.per100g.carbohydrates * multiplier),
    fat: Math.round(food.per100g.fat * multiplier),
    fibre: Math.round(food.per100g.fibre * multiplier)
  };
}

export function nutritionForEntry(entry: NutritionEntry): NutritionValues {
  return nutritionForFood(entry, entry.quantity);
}

export function manualNutritionAdjustment(log: DailyLog): NutritionValues {
  return {
    calories: log.caloriesConsumed,
    protein: log.proteinConsumed,
    carbohydrates: log.carbohydratesConsumed,
    fat: log.fatConsumed,
    fibre: log.fibreConsumed
  };
}

export function nutritionDaySummary(log: DailyLog, entries: NutritionEntry[]) {
  const meals = addNutrition(...entries.map(nutritionForEntry));
  const manual = manualNutritionAdjustment(log);
  return { meals, manual, total: addNutrition(meals, manual) };
}

export function nutritionTargets(values: NutritionValues, settings: Pick<UserSettings, "calorieGoal" | "proteinGoal">) {
  return {
    caloriesRemaining: settings.calorieGoal - values.calories,
    proteinRemaining: settings.proteinGoal - values.protein,
    caloriePercent: settings.calorieGoal > 0 ? (values.calories / settings.calorieGoal) * 100 : 0,
    proteinPercent: settings.proteinGoal > 0 ? (values.protein / settings.proteinGoal) * 100 : 0
  };
}

export function entriesForMeal(entries: NutritionEntry[], mealLabel: string) {
  return entries.filter((entry) => entry.mealLabel === mealLabel);
}

export function mealNutrition(entries: NutritionEntry[]) {
  return addNutrition(...entries.map(nutritionForEntry));
}

export function orderedMealLabels(entries: NutritionEntry[]) {
  const customLabels = [...new Set(entries.filter((entry) => entry.mealGroup === "custom").map((entry) => entry.mealLabel))];
  const standardLabels = mealGroups
    .filter((group) => group !== "custom" && entries.some((entry) => entry.mealGroup === group))
    .map((group) => defaultMealLabels[group]);
  return [...standardLabels, ...customLabels];
}

export function isAvailableFood(food: Food) {
  return !food.archived;
}

export function foodSnapshot(food: Pick<Food, "id" | "name" | "brand" | "servingName" | "servingGrams" | "per100g">) {
  return {
    foodId: food.id,
    foodName: food.name,
    brand: food.brand,
    servingName: food.servingName,
    servingGrams: food.servingGrams,
    per100g: food.per100g
  };
}

export function savedMealItem(entry: NutritionEntry): SavedMealItem {
  return {
    schemaVersion: entry.schemaVersion,
    foodId: entry.foodId,
    foodName: entry.foodName,
    brand: entry.brand,
    servingName: entry.servingName,
    servingGrams: entry.servingGrams,
    per100g: entry.per100g,
    quantity: entry.quantity
  };
}

export function copyNutritionEntry(entry: NutritionEntry, id: string, date: string, mealGroup: MealGroup, mealLabel: string): NutritionEntry {
  return {
    ...entry,
    id,
    date,
    mealGroup,
    mealLabel,
    createdAt: undefined,
    updatedAt: undefined
  };
}

export function entriesFromSavedMeal(meal: SavedMeal, ids: string[], date: string, mealGroup: MealGroup, mealLabel: string): NutritionEntry[] {
  return meal.items.map((item, index) => ({
    ...item,
    id: ids[index],
    date,
    mealGroup,
    mealLabel
  }));
}
