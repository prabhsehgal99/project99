import type { DailyLog, Food, NutritionEntry, NutritionValues } from "@/lib/types";

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

export function foodSnapshot(food: Food) {
  return {
    foodId: food.id,
    foodName: food.name,
    brand: food.brand,
    servingName: food.servingName,
    servingGrams: food.servingGrams,
    per100g: food.per100g
  };
}
