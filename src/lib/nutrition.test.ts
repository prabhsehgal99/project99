import { describe, expect, it } from "vitest";
import { copyNutritionEntry, entriesFromSavedMeal, foodSnapshot, isAvailableFood, mealNutrition, nutritionDaySummary, nutritionForEntry, nutritionTargets, orderedMealLabels, savedMealItem, sortNutritionEntries } from "@/lib/nutrition";
import { defaultDailyLog, type Food, type NutritionEntry, type SavedMeal } from "@/lib/types";

const entry: NutritionEntry = {
  id: "entry", schemaVersion: 1, date: "2026-08-08", mealGroup: "breakfast", mealLabel: "Breakfast",
  foodId: "food", foodName: "Oats", brand: "", servingName: "bowl", servingGrams: 50,
  per100g: { calories: 400, protein: 12, carbohydrates: 60, fat: 8, fibre: 10 }, quantity: 1
};

describe("nutrition summaries", () => {
  it("normalizes a serving from grams and combines it with the manual adjustment", () => {
    expect(nutritionForEntry(entry)).toEqual({ calories: 200, protein: 6, carbohydrates: 30, fat: 4, fibre: 5 });
    const log = { ...defaultDailyLog(entry.date), caloriesConsumed: 100, proteinConsumed: 3 };
    expect(nutritionDaySummary(log, [entry]).total).toEqual({ calories: 300, protein: 9, carbohydrates: 30, fat: 4, fibre: 5 });
  });

  it("scales fractional servings without mutating the historical entry snapshot", () => {
    const copied = { ...entry, id: "copied", date: "2026-08-07", quantity: 1.5 };
    expect(nutritionForEntry(copied)).toEqual({ calories: 300, protein: 9, carbohydrates: 45, fat: 6, fibre: 8 });
    expect(entry.quantity).toBe(1);
    expect(copied.foodName).toBe(entry.foodName);
  });

  it("keeps meal snapshots immutable while grouping and copying entries", () => {
    const copied = copyNutritionEntry(entry, "copy", "2026-08-07", "dinner", "Dinner");
    expect(copied).toMatchObject({ id: "copy", date: "2026-08-07", mealGroup: "dinner", mealLabel: "Dinner", foodName: "Oats" });
    expect(entry).toMatchObject({ id: "entry", date: "2026-08-08", mealGroup: "breakfast" });
    expect(mealNutrition([entry, copied])).toEqual({ calories: 400, protein: 12, carbohydrates: 60, fat: 8, fibre: 10 });
    expect(orderedMealLabels([copied, entry])).toEqual(["Breakfast", "Dinner"]);
  });

  it("sorts the day’s entry snapshots locally while the server index is building", () => {
    const later = { ...entry, id: "later", createdAt: { toMillis: () => 2 } as NonNullable<NutritionEntry["createdAt"]> };
    const earlier = { ...entry, id: "earlier", createdAt: { toMillis: () => 1 } as NonNullable<NutritionEntry["createdAt"]> };
    expect(sortNutritionEntries([later, earlier]).map((item) => item.id)).toEqual(["earlier", "later"]);
  });

  it("builds saved-meal snapshots and destination copies without changing the source", () => {
    const meal: SavedMeal = { id: "usual", schemaVersion: 1, name: "Usual oats", mealGroup: "breakfast", items: [savedMealItem(entry)] };
    const restored = entriesFromSavedMeal(meal, ["new-entry"], "2026-08-09", "lunch", "Lunch");
    expect(restored[0]).toMatchObject({ id: "new-entry", date: "2026-08-09", mealGroup: "lunch", mealLabel: "Lunch", foodName: "Oats" });
    expect(meal.items[0].foodName).toBe("Oats");
    expect(restored[0].per100g).toEqual(entry.per100g);
  });

  it("reports food availability and plain-language target deltas", () => {
    const food: Food = { id: "oats", schemaVersion: 1, name: "Oats", brand: "", provenance: "user", servingName: "bowl", servingGrams: 50, per100g: entry.per100g, favourite: false, archived: false };
    expect(isAvailableFood(food)).toBe(true);
    expect(isAvailableFood({ ...food, archived: true })).toBe(false);
    expect(foodSnapshot(food)).toMatchObject({ foodId: "oats", foodName: "Oats" });
    const targets = nutritionTargets({ calories: 2300, protein: 170, carbohydrates: 0, fat: 0, fibre: 0 }, { calorieGoal: 2200, proteinGoal: 160 });
    expect(targets.caloriesRemaining).toBe(-100);
    expect(targets.proteinRemaining).toBe(-10);
    expect(targets.caloriePercent).toBeCloseTo(104.545, 2);
    expect(targets.proteinPercent).toBe(106.25);
  });
});
