import { describe, expect, it } from "vitest";
import { nutritionDaySummary, nutritionForEntry } from "@/lib/nutrition";
import { defaultDailyLog, type NutritionEntry } from "@/lib/types";

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
});
