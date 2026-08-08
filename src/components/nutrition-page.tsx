"use client";

import type { User } from "firebase/auth";
import { ArrowLeft, Copy, Heart, Loader2, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { useTodayData } from "@/components/today-data-provider";
import { isFutureDateKey, isValidDateKey, longDateLabel, shiftDateKey } from "@/lib/dates";
import { deleteNutritionEntry, saveFood, saveNutritionEntry, saveSavedMeal, subscribeToDailyLog, subscribeToFoods, subscribeToNutritionEntries, subscribeToRecentNutritionEntries, subscribeToSavedMeals, updateNutritionEntry } from "@/lib/firestore";
import { foodSnapshot, nutritionDaySummary, nutritionForEntry, nutritionForFood } from "@/lib/nutrition";
import { defaultDailyLog, type DailyLog, type Food, type MealGroup, type NutritionEntry, type SavedMeal } from "@/lib/types";

const mealGroups: MealGroup[] = ["breakfast", "lunch", "dinner", "snacks", "custom"];
const defaultMealLabels: Record<MealGroup, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snacks: "Snacks", custom: "Custom meal" };

function savedMealItem(entry: NutritionEntry) {
  return { schemaVersion: entry.schemaVersion, foodId: entry.foodId, foodName: entry.foodName, brand: entry.brand, servingName: entry.servingName, servingGrams: entry.servingGrams, per100g: entry.per100g, quantity: entry.quantity };
}

function copyEntry(entry: NutritionEntry, date: string, mealGroup: MealGroup, mealLabel: string): NutritionEntry {
  return { ...entry, id: crypto.randomUUID(), date, mealGroup, mealLabel, createdAt: undefined, updatedAt: undefined };
}

export function NutritionPage() {
  return <AuthenticatedShell>{(user) => <NutritionContent user={user} />}</AuthenticatedShell>;
}

function NutritionContent({ user }: { user: User }) {
  const params = useSearchParams();
  const { today } = useTodayData();
  const requestedDate = params.get("date") ?? today;
  const date = isValidDateKey(requestedDate) && !isFutureDateKey(requestedDate, today) ? requestedDate : today;
  const [foods, setFoods] = useState<Food[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog>(defaultDailyLog(today));
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [recentEntries, setRecentEntries] = useState<NutritionEntry[]>([]);
  const [sourceEntries, setSourceEntries] = useState<NutritionEntry[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [group, setGroup] = useState<MealGroup>("breakfast");
  const [customLabel, setCustomLabel] = useState("");
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [copyDate, setCopyDate] = useState(shiftDateKey(date, -1) ?? date);
  const [savedMealName, setSavedMealName] = useState("");
  const [replacingSavedMealId, setReplacingSavedMealId] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [macros, setMacros] = useState({ calories: "0", protein: "0", carbohydrates: "0", fat: "0", fibre: "0", servingGrams: "100" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeToFoods(user.uid, setFoods, (nextError) => setError(nextError.message)), [user.uid]);
  useEffect(() => subscribeToDailyLog(user.uid, date, (snapshot) => setDailyLog(snapshot.log), (nextError) => setError(nextError.message)), [date, user.uid]);
  useEffect(() => subscribeToNutritionEntries(user.uid, date, setEntries, (nextError) => setError(nextError.message)), [date, user.uid]);
  useEffect(() => subscribeToNutritionEntries(user.uid, copyDate, setSourceEntries, (nextError) => setError(nextError.message)), [copyDate, user.uid]);
  useEffect(() => subscribeToRecentNutritionEntries(user.uid, setRecentEntries, (nextError) => setError(nextError.message)), [user.uid]);
  useEffect(() => subscribeToSavedMeals(user.uid, setSavedMeals, (nextError) => setError(nextError.message)), [user.uid]);

  const label = group === "custom" ? customLabel.trim() || defaultMealLabels.custom : defaultMealLabels[group];
  const summary = nutritionDaySummary(dailyLog, entries);
  const visibleFoods = useMemo(() => foods.filter((food) => !food.archived && food.name.toLowerCase().includes(query.toLowerCase())), [foods, query]);
  const favourites = foods.filter((food) => !food.archived && food.favourite);
  const recentFoods = useMemo(() => recentEntries.map((entry) => foods.find((food) => food.id === entry.foodId)).filter((food): food is Food => Boolean(food && !food.archived)).filter((food, index, all) => all.findIndex((item) => item.id === food.id) === index), [foods, recentEntries]);

  function openFood(food: Food) { setSelectedFood(food); setQuantity("1"); }
  async function run(action: () => Promise<void>) {
    setSaving(true); setError("");
    try { await action(); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Could not save your nutrition update. Try again."); } finally { setSaving(false); }
  }
  async function addSelectedFood() {
    if (!selectedFood) return;
    const nextQuantity = Number(quantity);
    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0 || nextQuantity > 100) { setError("Quantity must be between 0 and 100 servings."); return; }
    await run(async () => {
      await saveNutritionEntry(user.uid, { id: crypto.randomUUID(), schemaVersion: 1, date, mealGroup: group, mealLabel: label, ...foodSnapshot(selectedFood), quantity: nextQuantity });
      setSelectedFood(null);
    });
  }
  async function updateQuantity(entry: NutritionEntry, nextQuantity: string) {
    const quantityValue = Number(nextQuantity);
    if (!Number.isFinite(quantityValue) || quantityValue <= 0 || quantityValue > 100) { setError("Quantity must be between 0 and 100 servings."); return; }
    await run(() => updateNutritionEntry(user.uid, { ...entry, quantity: quantityValue }));
  }
  async function toggleFavourite(food: Food) { await run(() => saveFood(user.uid, { ...food, favourite: !food.favourite })); }
  async function createFood() {
    const values = Object.fromEntries(Object.entries(macros).map(([key, value]) => [key, Number(value)])) as Record<keyof typeof macros, number>;
    if (!foodName.trim() || Object.values(values).some((value) => !Number.isFinite(value) || value < 0) || values.servingGrams <= 0) { setError("Enter a food name and valid nutrition values."); return; }
    await run(async () => {
      await saveFood(user.uid, { id: crypto.randomUUID(), schemaVersion: 1, name: foodName.trim(), brand: "", provenance: "user", servingName: "serving", servingGrams: values.servingGrams, per100g: { calories: values.calories, protein: values.protein, carbohydrates: values.carbohydrates, fat: values.fat, fibre: values.fibre }, favourite: false, archived: false });
      setFoodName("");
    });
  }
  async function copyOne(entry: NutritionEntry) { await run(() => saveNutritionEntry(user.uid, copyEntry(entry, date, group, label))); }
  async function copyMeal(mealLabel: string) { await run(async () => { await Promise.all(sourceEntries.filter((entry) => entry.mealLabel === mealLabel).map((entry) => saveNutritionEntry(user.uid, copyEntry(entry, date, group, label)))); }); }
  async function saveMeal(mealLabel: string) {
    const items = entries.filter((entry) => entry.mealLabel === mealLabel);
    if (!items.length || !savedMealName.trim()) { setError("Enter a saved-meal name and choose a meal with food."); return; }
    const previous = savedMeals.find((meal) => meal.id === replacingSavedMealId);
    await run(async () => { await saveSavedMeal(user.uid, { id: previous?.id ?? crypto.randomUUID(), schemaVersion: 1, name: savedMealName.trim(), mealGroup: group, items: items.map(savedMealItem), createdAt: previous?.createdAt }); setSavedMealName(""); setReplacingSavedMealId(null); });
  }
  async function addSavedMeal(meal: SavedMeal) { await run(async () => { await Promise.all(meal.items.map((item) => saveNutritionEntry(user.uid, { ...item, id: crypto.randomUUID(), date, mealGroup: group, mealLabel: label }))); }); }

  const selectedNutrition = selectedFood ? nutritionForFood(selectedFood, Number(quantity) || 0) : null;
  return <div className="mx-auto max-w-3xl space-y-7"><header><Link className="inline-flex min-h-11 items-center gap-2 text-sm text-muted" href={`/log/${date}`}><ArrowLeft className="h-4 w-4" />Daily Log</Link><p className="mt-4 text-xs font-medium text-muted">Nutrition</p><h1 className="mt-1 text-3xl font-medium tracking-[-0.04em] text-ink">{longDateLabel(date)}</h1>{requestedDate !== date ? <p className="mt-2 text-sm text-warm">That date is unavailable; showing today instead.</p> : null}</header>{error ? <p className="rounded-md border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100" role="alert">{error}</p> : null}<section className="grid gap-3 border-y border-line py-4 sm:grid-cols-3"><NutritionTotals label="Meals" value={summary.meals} /><NutritionTotals label="Manual adjustment" value={summary.manual} /><NutritionTotals label="Day total" value={summary.total} /></section><section className="border-y border-line py-5"><h2 className="text-base font-semibold text-ink">Choose where to add</h2><div className="mt-3 flex flex-wrap gap-2">{mealGroups.map((value) => <button key={value} className={`min-h-11 rounded-md border px-3 text-sm ${group === value ? "border-ink bg-raised text-ink" : "border-line text-muted"}`} type="button" onClick={() => setGroup(value)}>{defaultMealLabels[value]}</button>)}</div>{group === "custom" ? <input className="mt-3 min-h-11 w-full rounded-md border-line bg-raised text-ink" value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} placeholder="Custom meal name" aria-label="Custom meal name" /> : null}</section><section className="border-y border-line py-5"><h2 className="text-base font-semibold text-ink">Saved meals</h2><div className="mt-3 flex flex-wrap gap-2">{savedMeals.length ? savedMeals.map((meal) => <div key={meal.id} className="flex items-center rounded-md border border-line bg-raised"><button className="min-h-11 px-3 text-sm text-ink" type="button" disabled={saving} onClick={() => void addSavedMeal(meal)}>Add {meal.name}</button><button className="min-h-11 border-l border-line px-3 text-xs text-muted" type="button" onClick={() => { setReplacingSavedMealId(meal.id); setSavedMealName(meal.name); }}>Replace</button></div>) : <p className="text-sm text-muted">Save a logged meal to reuse it.</p>}</div></section><FoodList title="Favourites" foods={favourites} empty="Favourite foods appear here." onFood={openFood} onFavourite={toggleFavourite} /><FoodList title="Recent foods" foods={recentFoods} empty="Foods you log will appear here." onFood={openFood} onFavourite={toggleFavourite} /><section className="border-y border-line py-5"><h2 className="text-base font-semibold text-ink">Search your foods</h2><input className="mt-3 min-h-11 w-full rounded-md border-line bg-raised text-ink" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search foods" aria-label="Search foods" /><FoodRows foods={visibleFoods} onFood={openFood} onFavourite={toggleFavourite} /></section>{selectedFood ? <section className="rounded-xl border border-line bg-panel p-4"><h2 className="text-base font-semibold text-ink">Add {selectedFood.name}</h2><label className="mt-3 block text-sm text-muted" htmlFor="entry-quantity">Servings<input id="entry-quantity" className="mt-1 block min-h-11 w-full rounded-md border-line bg-raised text-ink" type="number" min="0.01" max="100" step="0.25" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>{selectedNutrition ? <p className="mt-3 text-sm text-muted">{formatNutrition(selectedNutrition)}</p> : null}<div className="mt-4 flex gap-2"><button className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-ink" type="button" disabled={saving} onClick={() => void addSelectedFood()}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add food"}</button><button className="min-h-11 px-3 text-sm text-muted" type="button" onClick={() => setSelectedFood(null)}>Cancel</button></div></section> : null}<section className="border-y border-line py-5"><h2 className="text-base font-semibold text-ink">Create a food</h2><div className="mt-3 grid gap-2 sm:grid-cols-3"><input className="min-h-11 rounded-md border-line bg-raised text-ink" value={foodName} onChange={(event) => setFoodName(event.target.value)} placeholder="Food name" aria-label="Food name" />{Object.entries(macros).map(([field, value]) => <input key={field} className="min-h-11 rounded-md border-line bg-raised text-ink" type="number" min="0" step="0.1" value={value} onChange={(event) => setMacros((current) => ({ ...current, [field]: event.target.value }))} placeholder={field === "servingGrams" ? "Serving grams" : `${field} / 100g`} aria-label={field} />)}</div><button className="mt-3 min-h-11 rounded-md border border-line bg-raised px-3 text-sm text-ink" type="button" disabled={saving} onClick={() => void createFood()}><Plus className="mr-2 inline h-4 w-4" />Create food</button></section><section className="border-y border-line py-5"><h2 className="text-base font-semibold text-ink">Copy from another day</h2><input className="mt-3 min-h-11 rounded-md border-line bg-raised text-ink" type="date" max={today} value={copyDate} onChange={(event) => setCopyDate(event.target.value)} aria-label="Source date to copy" />{[...new Set(sourceEntries.map((entry) => entry.mealLabel))].map((sourceLabel) => <div key={sourceLabel} className="mt-3 flex items-center justify-between gap-3"><span className="text-sm text-ink">{sourceLabel}</span><button className="min-h-11 rounded-md border border-line px-3 text-sm text-muted" type="button" disabled={saving} onClick={() => void copyMeal(sourceLabel)}><Copy className="mr-1 inline h-4 w-4" />Copy meal</button></div>)}</section><section className="space-y-4">{[...new Set(entries.map((entry) => entry.mealLabel))].map((mealLabel) => <div key={mealLabel} className="border-y border-line py-4"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold text-ink">{mealLabel}</h2><div className="flex gap-2"><input className="min-h-11 max-w-40 rounded-md border-line bg-raised px-2 text-sm text-ink" value={savedMealName} onChange={(event) => setSavedMealName(event.target.value)} placeholder="Saved meal name" aria-label="Saved meal name" /><button className="min-h-11 text-xs text-muted" type="button" disabled={saving} onClick={() => void saveMeal(mealLabel)}>{replacingSavedMealId ? "Replace meal" : "Save meal"}</button></div></div>{entries.filter((entry) => entry.mealLabel === mealLabel).map((entry) => <EntryRow key={entry.id} entry={entry} saving={saving} onQuantity={updateQuantity} onCopy={copyOne} onDelete={(item) => void run(() => deleteNutritionEntry(user.uid, item.id))} />)}</div>)}</section></div>;
}

function FoodList({ title, foods, empty, onFood, onFavourite }: { title: string; foods: Food[]; empty: string; onFood: (food: Food) => void; onFavourite: (food: Food) => Promise<void> }) { return <section className="border-y border-line py-5"><h2 className="text-base font-semibold text-ink">{title}</h2>{foods.length ? <FoodRows foods={foods} onFood={onFood} onFavourite={onFavourite} /> : <p className="mt-3 text-sm text-muted">{empty}</p>}</section>; }
function FoodRows({ foods, onFood, onFavourite }: { foods: Food[]; onFood: (food: Food) => void; onFavourite: (food: Food) => Promise<void> }) { return <div className="mt-3 divide-y divide-line border-y border-line">{foods.map((food) => <div key={food.id} className="flex min-h-12 items-center gap-2"><button className="min-w-0 flex-1 py-2 text-left" type="button" onClick={() => onFood(food)}><span className="block text-sm font-medium text-ink">{food.name}</span><span className="text-xs text-muted">{food.per100g.calories} kcal / 100 g</span></button><button className="min-h-11 min-w-11 text-muted" type="button" onClick={() => void onFavourite(food)} aria-label={`${food.favourite ? "Remove" : "Add"} ${food.name} ${food.favourite ? "from" : "to"} favourites`}>{food.favourite ? <Heart className="h-4 w-4 fill-current" /> : <Star className="h-4 w-4" />}</button></div>)}</div>; }
function EntryRow({ entry, saving, onQuantity, onCopy, onDelete }: { entry: NutritionEntry; saving: boolean; onQuantity: (entry: NutritionEntry, quantity: string) => Promise<void>; onCopy: (entry: NutritionEntry) => Promise<void>; onDelete: (entry: NutritionEntry) => void }) { const values = nutritionForEntry(entry); return <div className="flex flex-wrap items-center gap-2 border-t border-line py-3 text-sm"><div className="min-w-32 flex-1"><p className="font-medium text-ink">{entry.foodName}</p><p className="text-xs text-muted">{formatNutrition(values)}</p></div><label className="sr-only" htmlFor={`quantity-${entry.id}`}>Quantity for {entry.foodName}</label><input id={`quantity-${entry.id}`} className="min-h-11 w-20 rounded-md border-line bg-raised px-2 text-ink" type="number" min="0.01" step="0.25" defaultValue={entry.quantity} onBlur={(event) => { if (event.target.value !== String(entry.quantity)) void onQuantity(entry, event.target.value); }} /><button className="min-h-11 px-2 text-muted" type="button" disabled={saving} onClick={() => void onCopy(entry)} aria-label={`Copy ${entry.foodName}`}><Copy className="h-4 w-4" /></button><button className="min-h-11 px-2 text-muted" type="button" disabled={saving} onClick={() => onDelete(entry)} aria-label={`Remove ${entry.foodName}`}><Trash2 className="h-4 w-4" /></button></div>; }
function NutritionTotals({ label, value }: { label: string; value: { calories: number; protein: number; carbohydrates: number; fat: number; fibre: number } }) { return <div><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-medium text-ink">{value.calories} kcal</p><p className="text-xs text-muted">P {value.protein} · C {value.carbohydrates} · F {value.fat} · Fi {value.fibre}</p></div>; }
function formatNutrition(value: { calories: number; protein: number; carbohydrates: number; fat: number; fibre: number }) { return `${value.calories} kcal · P ${value.protein} · C ${value.carbohydrates} · F ${value.fat} · Fi ${value.fibre}`; }
