"use client";

import type { User } from "firebase/auth";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { useTodayData } from "@/components/today-data-provider";
import { deleteNutritionEntry, saveFood, saveNutritionEntry, saveSavedMeal, subscribeToFoods, subscribeToNutritionEntries, subscribeToSavedMeals } from "@/lib/firestore";
import { nutritionDaySummary } from "@/lib/nutrition";
import type { Food, MealGroup, NutritionEntry, SavedMeal } from "@/lib/types";

const mealGroups: MealGroup[] = ["breakfast", "lunch", "dinner", "snacks"];

function savedMealItem(entry: NutritionEntry) {
  return { schemaVersion: entry.schemaVersion, foodId: entry.foodId, foodName: entry.foodName, brand: entry.brand, servingName: entry.servingName, servingGrams: entry.servingGrams, per100g: entry.per100g, quantity: entry.quantity };
}

export function NutritionPage() { return <AuthenticatedShell>{(user) => <NutritionContent user={user} />}</AuthenticatedShell>; }

function NutritionContent({ user }: { user: User }) {
  const { today, todayLog } = useTodayData();
  const [foods, setFoods] = useState<Food[]>([]);
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("0");
  const [protein, setProtein] = useState("0");
  const [carbohydrates, setCarbohydrates] = useState("0");
  const [fat, setFat] = useState("0");
  const [fibre, setFibre] = useState("0");
  const [servingGrams, setServingGrams] = useState("100");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<MealGroup>("breakfast");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => subscribeToFoods(user.uid, setFoods, (nextError) => setError(nextError.message)), [user.uid]);
  useEffect(() => subscribeToNutritionEntries(user.uid, today, setEntries, (nextError) => setError(nextError.message)), [today, user.uid]);
  useEffect(() => subscribeToSavedMeals(user.uid, setSavedMeals, (nextError) => setError(nextError.message)), [user.uid]);
  const visibleFoods = useMemo(() => foods.filter((food) => !food.archived && food.name.toLowerCase().includes(query.toLowerCase())), [foods, query]);
  const summary = nutritionDaySummary(todayLog, entries);
  async function createFood() {
    const kcal = Number(calories); const grams = Number(servingGrams); const macros = [protein, carbohydrates, fat, fibre].map(Number);
    if (!foodName.trim() || !Number.isFinite(kcal) || kcal < 0 || !Number.isFinite(grams) || grams <= 0 || macros.some((value) => !Number.isFinite(value) || value < 0)) { setError("Enter a food name and valid nutrition values."); return; }
    setSaving(true); setError("");
    try {
      await saveFood(user.uid, { id: crypto.randomUUID(), schemaVersion: 1, name: foodName.trim(), brand: "", provenance: "user", servingName: "serving", servingGrams: grams, per100g: { calories: kcal, protein: macros[0], carbohydrates: macros[1], fat: macros[2], fibre: macros[3] }, favourite: false, archived: false });
      setFoodName("");
    } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Could not create food."); } finally { setSaving(false); }
  }
  async function addFood(food: Food) {
    setSaving(true); setError("");
    try {
      await saveNutritionEntry(user.uid, { id: crypto.randomUUID(), schemaVersion: 1, date: today, mealGroup: group, mealLabel: group, foodId: food.id, foodName: food.name, brand: food.brand, servingName: food.servingName, servingGrams: food.servingGrams, per100g: food.per100g, quantity: 1 });
    } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Could not add food."); } finally { setSaving(false); }
  }
  async function saveMeal(meal: MealGroup) {
    const items = entries.filter((entry) => entry.mealGroup === meal);
    if (!items.length) { setError(`Add food to ${meal} before saving it.`); return; }
    setSaving(true); setError("");
    try { await saveSavedMeal(user.uid, { id: crypto.randomUUID(), schemaVersion: 1, name: `${meal[0].toUpperCase()}${meal.slice(1)} meal`, mealGroup: meal, items: items.map(savedMealItem) }); }
    catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Could not save meal."); } finally { setSaving(false); }
  }
  async function addSavedMeal(meal: SavedMeal) {
    setSaving(true); setError("");
    try { await Promise.all(meal.items.map((item) => saveNutritionEntry(user.uid, { ...item, id: crypto.randomUUID(), schemaVersion: 1, date: today, mealGroup: meal.mealGroup, mealLabel: meal.mealGroup }))); }
    catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Could not add saved meal."); } finally { setSaving(false); }
  }
  return <div className="mx-auto max-w-3xl space-y-7"><header><Link className="inline-flex min-h-11 items-center gap-2 text-sm text-muted" href={`/log/${today}`}><ArrowLeft className="h-4 w-4" />Daily Log</Link><p className="mt-4 text-xs font-medium text-muted">Nutrition · {today}</p><h1 className="mt-1 text-3xl font-medium tracking-[-0.04em] text-ink">Food log</h1><p className="mt-2 text-sm text-muted">Meals and manual adjustment are shown separately, then combined.</p></header>{error ? <p className="rounded-md border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100" role="alert">{error}</p> : null}<section className="grid gap-3 border-y border-line py-4 sm:grid-cols-3"><NutritionTotal label="Meals" value={summary.meals.calories} /><NutritionTotal label="Manual adjustment" value={summary.manual.calories} /><NutritionTotal label="Today total" value={summary.total.calories} /></section><section className="border-y border-line py-5"><h2 className="text-base font-semibold text-ink">Saved meals</h2><div className="mt-3 flex flex-wrap gap-2">{savedMeals.length ? savedMeals.map((meal) => <button key={meal.id} className="min-h-11 rounded-md border border-line bg-raised px-3 text-sm text-ink" type="button" disabled={saving} onClick={() => void addSavedMeal(meal)}>Add {meal.name}</button>) : <p className="text-sm text-muted">Save a logged meal to reuse it.</p>}</div></section><section className="border-y border-line py-5"><h2 className="text-base font-semibold text-ink">Add food</h2><div className="mt-3 flex flex-wrap gap-2"><select className="min-h-11 rounded-md border-line bg-raised text-ink" value={group} onChange={(event) => setGroup(event.target.value as MealGroup)}>{mealGroups.map((value) => <option key={value} value={value}>{value}</option>)}</select><input className="min-h-11 min-w-0 flex-1 rounded-md border-line bg-raised text-ink" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your foods" aria-label="Search foods" /></div><div className="mt-3 divide-y divide-line border-y border-line">{visibleFoods.length ? visibleFoods.map((food) => <button key={food.id} className="flex min-h-12 w-full items-center justify-between text-left text-sm" type="button" disabled={saving} onClick={() => void addFood(food)}><span><span className="block font-medium text-ink">{food.name}</span><span className="text-xs text-muted">{food.per100g.calories} kcal / 100 g</span></span><Plus className="h-5 w-5 text-muted" /></button>) : <p className="py-4 text-sm text-muted">Create your first food below.</p>}</div></section><section className="border-y border-line py-5"><h2 className="text-base font-semibold text-ink">Create a food</h2><div className="mt-3 grid gap-2 sm:grid-cols-3"><input className="min-h-11 rounded-md border-line bg-raised text-ink sm:col-span-1" value={foodName} onChange={(event) => setFoodName(event.target.value)} placeholder="Food name" aria-label="Food name" /><input className="min-h-11 rounded-md border-line bg-raised text-ink" type="number" value={calories} onChange={(event) => setCalories(event.target.value)} placeholder="kcal / 100g" aria-label="Calories per 100 grams" /><input className="min-h-11 rounded-md border-line bg-raised text-ink" type="number" value={servingGrams} onChange={(event) => setServingGrams(event.target.value)} placeholder="serving grams" aria-label="Serving grams" /><input className="min-h-11 rounded-md border-line bg-raised text-ink" type="number" value={protein} onChange={(event) => setProtein(event.target.value)} placeholder="protein g / 100g" aria-label="Protein per 100 grams" /><input className="min-h-11 rounded-md border-line bg-raised text-ink" type="number" value={carbohydrates} onChange={(event) => setCarbohydrates(event.target.value)} placeholder="carbs g / 100g" aria-label="Carbohydrates per 100 grams" /><input className="min-h-11 rounded-md border-line bg-raised text-ink" type="number" value={fat} onChange={(event) => setFat(event.target.value)} placeholder="fat g / 100g" aria-label="Fat per 100 grams" /><input className="min-h-11 rounded-md border-line bg-raised text-ink" type="number" value={fibre} onChange={(event) => setFibre(event.target.value)} placeholder="fibre g / 100g" aria-label="Fibre per 100 grams" /></div><button className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-raised px-3 text-sm text-ink" type="button" disabled={saving} onClick={() => void createFood()}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Create food</button></section>{mealGroups.map((meal) => <section key={meal} className="border-y border-line py-4"><div className="flex items-center justify-between"><h2 className="capitalize text-sm font-semibold text-ink">{meal}</h2>{entries.some((entry) => entry.mealGroup === meal) ? <button className="min-h-11 text-xs text-muted" type="button" disabled={saving} onClick={() => void saveMeal(meal)}>Save meal</button> : null}</div>{entries.filter((entry) => entry.mealGroup === meal).map((entry) => <div key={entry.id} className="mt-2 flex min-h-11 items-center justify-between text-sm"><span className="text-ink">{entry.foodName} <span className="text-muted">· {entry.quantity} serving</span></span><button className="min-h-11 px-2 text-muted" type="button" onClick={() => void deleteNutritionEntry(user.uid, entry.id)} aria-label={`Remove ${entry.foodName}`}><Trash2 className="h-4 w-4" /></button></div>)}</section>)}</div>;
}

function NutritionTotal({ label, value }: { label: string; value: number }) { return <div><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-medium text-ink">{value} kcal</p></div>; }
