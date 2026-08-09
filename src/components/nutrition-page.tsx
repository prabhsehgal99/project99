"use client";

import type { User } from "firebase/auth";
import { Archive, ArrowLeft, Copy, Heart, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { useTodayData } from "@/components/today-data-provider";
import { isFutureDateKey, isValidDateKey, longDateLabel, shiftDateKey } from "@/lib/dates";
import { deleteNutritionEntry, saveFood, saveNutritionEntries, saveNutritionEntry, saveSavedMeal, subscribeToDailyLog, subscribeToFoods, subscribeToNutritionEntries, subscribeToRecentNutritionEntries, subscribeToSavedMeals, updateNutritionEntry } from "@/lib/firestore";
import { copyNutritionEntry, defaultMealLabels, entriesForMeal, entriesFromSavedMeal, foodSnapshot, isAvailableFood, mealGroups, mealNutrition, nutritionDaySummary, nutritionForEntry, nutritionForFood, nutritionTargets, orderedMealLabels, savedMealItem } from "@/lib/nutrition";
import { defaultDailyLog, type DailyLog, type Food, type MealGroup, type NutritionEntry, type NutritionValues, type SavedMeal } from "@/lib/types";

type Destination = { group: MealGroup; label: string };
type FoodDraft = { name: string; brand: string; servingName: string; servingGrams: string; calories: string; protein: string; carbohydrates: string; fat: string; fibre: string };

const emptyFoodDraft: FoodDraft = { name: "", brand: "", servingName: "serving", servingGrams: "100", calories: "0", protein: "0", carbohydrates: "0", fat: "0", fibre: "0" };

function draftForFood(food?: Food): FoodDraft {
  if (!food) return emptyFoodDraft;
  return { name: food.name, brand: food.brand, servingName: food.servingName, servingGrams: String(food.servingGrams), calories: String(food.per100g.calories), protein: String(food.per100g.protein), carbohydrates: String(food.per100g.carbohydrates), fat: String(food.per100g.fat), fibre: String(food.per100g.fibre) };
}

function destinationForGroup(group: MealGroup): Destination {
  return { group, label: defaultMealLabels[group] };
}

function groupForLabel(entries: NutritionEntry[], label: string): MealGroup {
  return entries.find((entry) => entry.mealLabel === label)?.mealGroup ?? "custom";
}

export function NutritionPage() {
  return <AuthenticatedShell>{(user) => <NutritionContent user={user} />}</AuthenticatedShell>;
}

function NutritionContent({ user }: { user: User }) {
  const router = useRouter();
  const params = useSearchParams();
  const { today, settings } = useTodayData();
  const requestedDate = params.get("date") ?? today;
  const date = isValidDateKey(requestedDate) && !isFutureDateKey(requestedDate, today) ? requestedDate : today;
  const [foods, setFoods] = useState<Food[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog>(defaultDailyLog(today));
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [recentEntries, setRecentEntries] = useState<NutritionEntry[]>([]);
  const [sourceEntries, setSourceEntries] = useState<NutritionEntry[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [destination, setDestination] = useState<Destination>(destinationForGroup("breakfast"));
  const [customMealName, setCustomMealName] = useState("");
  const [query, setQuery] = useState("");
  const [foodToAdd, setFoodToAdd] = useState<Food | null>(null);
  const [foodToEdit, setFoodToEdit] = useState<Food | null | "new">(null);
  const [quantity, setQuantity] = useState("1");
  const [copyDate, setCopyDate] = useState(shiftDateKey(date, -1) ?? date);
  const [savingMealLabel, setSavingMealLabel] = useState<string | null>(null);
  const [savedMealName, setSavedMealName] = useState("");
  const [replacingSavedMeal, setReplacingSavedMeal] = useState<SavedMeal | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeToFoods(user.uid, setFoods, (nextError) => setError(nextError.message)), [user.uid]);
  useEffect(() => subscribeToDailyLog(user.uid, date, (snapshot) => setDailyLog(snapshot.log), (nextError) => setError(nextError.message)), [date, user.uid]);
  useEffect(() => subscribeToNutritionEntries(user.uid, date, setEntries, (nextError) => setError(nextError.message)), [date, user.uid]);
  useEffect(() => subscribeToNutritionEntries(user.uid, copyDate, setSourceEntries, (nextError) => setError(nextError.message)), [copyDate, user.uid]);
  useEffect(() => subscribeToRecentNutritionEntries(user.uid, setRecentEntries, (nextError) => setError(nextError.message)), [user.uid]);
  useEffect(() => subscribeToSavedMeals(user.uid, setSavedMeals, (nextError) => setError(nextError.message)), [user.uid]);

  const summary = nutritionDaySummary(dailyLog, entries);
  const targets = nutritionTargets(summary.total, settings);
  const availableFoods = useMemo(() => foods.filter(isAvailableFood), [foods]);
  const searchedFoods = useMemo(() => availableFoods.filter((food) => `${food.name} ${food.brand}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [availableFoods, query]);
  const favourites = useMemo(() => availableFoods.filter((food) => food.favourite), [availableFoods]);
  const recentFoods = useMemo(() => recentEntries.map((entry) => foods.find((food) => food.id === entry.foodId)).filter((food): food is Food => Boolean(food && isAvailableFood(food))).filter((food, index, values) => values.findIndex((candidate) => candidate.id === food.id) === index), [foods, recentEntries]);
  const labels = orderedMealLabels(entries);
  const sourceLabels = orderedMealLabels(sourceEntries);
  const activeDestination: Destination = destination.group === "custom" ? { group: "custom", label: customMealName.trim() || defaultMealLabels.custom } : destination;

  async function run(action: () => Promise<void>) {
    setSaving(true);
    setError("");
    try { await action(); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Could not save your nutrition update. Try again."); } finally { setSaving(false); }
  }

  function changeDate(nextDate: string) {
    if (!isValidDateKey(nextDate) || isFutureDateKey(nextDate, today)) return;
    router.replace(`/nutrition?date=${nextDate}`);
  }

  function chooseDestination(group: MealGroup) {
    setDestination(destinationForGroup(group));
    if (group !== "custom") setCustomMealName("");
  }

  async function addFood(food: Food, amount: string) {
    const nextQuantity = Number(amount);
    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0 || nextQuantity > 100) { setError("Quantity must be between 0.01 and 100 servings."); return; }
    await run(async () => {
      await saveNutritionEntry(user.uid, { id: crypto.randomUUID(), schemaVersion: 1, date, mealGroup: activeDestination.group, mealLabel: activeDestination.label, ...foodSnapshot(food), quantity: nextQuantity });
      setFoodToAdd(null);
      setQuantity("1");
    });
  }

  async function changeEntry(entry: NutritionEntry, patch: Partial<Pick<NutritionEntry, "quantity" | "mealGroup" | "mealLabel">>) {
    const next = { ...entry, ...patch };
    if (!Number.isFinite(next.quantity) || next.quantity <= 0 || next.quantity > 100) { setError("Quantity must be between 0.01 and 100 servings."); return; }
    await run(() => updateNutritionEntry(user.uid, next));
  }

  async function copyMeal(label: string) {
    const items = entriesForMeal(sourceEntries, label);
    await run(() => saveNutritionEntries(user.uid, items.map((entry) => copyNutritionEntry(entry, crypto.randomUUID(), date, activeDestination.group, activeDestination.label))));
  }

  async function addSavedMeal(meal: SavedMeal) {
    await run(() => saveNutritionEntries(user.uid, entriesFromSavedMeal(meal, meal.items.map(() => crypto.randomUUID()), date, activeDestination.group, activeDestination.label)));
  }

  async function saveMeal() {
    if (!savingMealLabel || !savedMealName.trim()) { setError("Name the saved meal before saving it."); return; }
    const items = entriesForMeal(entries, savingMealLabel);
    if (items.length === 0) { setError("Add food to this meal before saving it."); return; }
    const mealGroup = groupForLabel(entries, savingMealLabel);
    await run(async () => {
      await saveSavedMeal(user.uid, { id: replacingSavedMeal?.id ?? crypto.randomUUID(), schemaVersion: 1, name: savedMealName.trim(), mealGroup, items: items.map(savedMealItem), createdAt: replacingSavedMeal?.createdAt });
      setSavingMealLabel(null); setSavedMealName(""); setReplacingSavedMeal(null);
    });
  }

  async function saveFoodDraft(draft: FoodDraft, existing: Food | null) {
    const values = { servingGrams: Number(draft.servingGrams), calories: Number(draft.calories), protein: Number(draft.protein), carbohydrates: Number(draft.carbohydrates), fat: Number(draft.fat), fibre: Number(draft.fibre) };
    if (!draft.name.trim() || !draft.servingName.trim() || Object.values(values).some((value) => !Number.isFinite(value) || value < 0) || values.servingGrams <= 0) { setError("Enter a name, serving, and valid non-negative nutrition values."); return; }
    await run(async () => {
      await saveFood(user.uid, { id: existing?.id ?? crypto.randomUUID(), schemaVersion: 1, name: draft.name.trim(), brand: draft.brand.trim(), provenance: "user", servingName: draft.servingName.trim(), servingGrams: values.servingGrams, per100g: { calories: values.calories, protein: values.protein, carbohydrates: values.carbohydrates, fat: values.fat, fibre: values.fibre }, favourite: existing?.favourite ?? false, archived: existing?.archived ?? false, createdAt: existing?.createdAt });
      setFoodToEdit(null);
    });
  }

  async function toggleFood(food: Food, patch: Partial<Pick<Food, "favourite" | "archived">>) {
    await run(() => saveFood(user.uid, { ...food, ...patch }));
  }

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-ink" href={`/log/${date}`}><ArrowLeft className="h-4 w-4" />Daily Log</Link>
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Meals</p>
          <h1 className="mt-1 text-3xl font-medium tracking-[-0.04em] text-ink">{longDateLabel(date)}</h1>
        </div>
        <label className="text-sm text-muted">Date<input className="mt-1 block min-h-11 rounded-xl border border-line bg-raised px-3 text-ink" type="date" max={today} value={date} onChange={(event) => changeDate(event.target.value)} /></label>
      </header>

      {requestedDate !== date ? <p className="mb-5 text-sm text-muted">That date is unavailable; showing today instead.</p> : null}
      {error ? <div className="mb-5 rounded-xl border border-red-300/30 bg-red-300/10 p-4 text-sm text-red-100" role="alert"><p>{error}</p><button className="mt-2 min-h-11 text-sm font-medium underline" type="button" onClick={() => setError("")}>Dismiss</button></div> : null}

      <section className="border-y border-line py-5" aria-label="Daily nutrition summary">
        <div className="grid gap-5 sm:grid-cols-3"><NutritionTotal label="Meals" value={summary.meals} /><NutritionTotal label="Manual adjustment" value={summary.manual} /><NutritionTotal label="Day total" value={summary.total} emphasis /></div>
        <div className="mt-5 grid gap-2 border-t border-line pt-4 text-sm sm:grid-cols-2"><p className="text-muted">Calories <span className="float-right tabular-nums text-ink">{targetCopy(targets.caloriesRemaining, "kcal")}</span></p><p className="text-muted">Protein <span className="float-right tabular-nums text-ink">{targetCopy(targets.proteinRemaining, "g")}</span></p></div>
      </section>

      <section className="border-b border-line py-5" aria-labelledby="meal-destination-title">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Add to</p><h2 id="meal-destination-title" className="mt-1 text-lg font-medium text-ink">{activeDestination.label}</h2></div><button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink" type="button" onClick={() => setFoodToEdit("new")}><Plus className="h-4 w-4" />New food</button></div>
        <div className="mt-4 flex flex-wrap gap-2">{mealGroups.map((group) => <button key={group} className={`min-h-11 rounded-xl border px-3 text-sm ${destination.group === group ? "border-ink bg-raised text-ink" : "border-line text-muted hover:text-ink"}`} type="button" onClick={() => chooseDestination(group)}>{defaultMealLabels[group]}</button>)}</div>
        {destination.group === "custom" ? <input className="mt-3 min-h-11 w-full rounded-xl border border-line bg-raised px-3 text-ink" value={customMealName} onChange={(event) => setCustomMealName(event.target.value)} placeholder="Custom meal name" aria-label="Custom meal name" /> : null}
      </section>

      <section className="border-b border-line py-5" aria-labelledby="find-food-title">
        <div className="flex items-center justify-between gap-3"><h2 id="find-food-title" className="text-lg font-medium text-ink">Find food</h2><span className="text-xs text-muted">{activeDestination.label}</span></div>
        <label className="relative mt-3 block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><span className="sr-only">Search your foods</span><input className="min-h-12 w-full rounded-xl border border-line bg-raised py-2 pl-10 pr-3 text-ink" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your foods" /></label>
        {query ? <FoodRows foods={searchedFoods} empty="No matching food. Create it once, then reuse it." onAdd={setFoodToAdd} onEdit={setFoodToEdit} onFavourite={(food) => toggleFood(food, { favourite: !food.favourite })} /> : <><FoodRows title="Favourites" foods={favourites} empty="Favourite foods stay close to hand." onAdd={setFoodToAdd} onEdit={setFoodToEdit} onFavourite={(food) => toggleFood(food, { favourite: !food.favourite })} /><FoodRows title="Recent" foods={recentFoods} empty="Foods you log will appear here." onAdd={setFoodToAdd} onEdit={setFoodToEdit} onFavourite={(food) => toggleFood(food, { favourite: !food.favourite })} /><FoodRows title="All foods" foods={availableFoods} empty="Build your personal food library to begin." onAdd={setFoodToAdd} onEdit={setFoodToEdit} onFavourite={(food) => toggleFood(food, { favourite: !food.favourite })} /></>}
      </section>

      {savedMeals.length ? <section className="border-b border-line py-5" aria-labelledby="saved-meals-title"><h2 id="saved-meals-title" className="text-lg font-medium text-ink">Saved meals</h2><div className="mt-3 grid gap-2">{savedMeals.map((meal) => <div key={meal.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0"><div><p className="text-sm font-medium text-ink">{meal.name}</p><p className="text-xs text-muted">{meal.items.length} foods · {defaultMealLabels[meal.mealGroup]}</p></div><button className="min-h-11 rounded-xl bg-raised px-3 text-sm text-ink" type="button" disabled={saving} onClick={() => void addSavedMeal(meal)}>Add</button></div>)}</div></section> : null}

      <section className="border-b border-line py-5" aria-labelledby="copy-meals-title"><h2 id="copy-meals-title" className="text-lg font-medium text-ink">Copy a meal</h2><div className="mt-3 flex flex-wrap items-end gap-3"><label className="text-sm text-muted">From date<input className="mt-1 block min-h-11 rounded-xl border border-line bg-raised px-3 text-ink" type="date" max={today} value={copyDate} onChange={(event) => setCopyDate(event.target.value)} /></label><div className="flex flex-wrap gap-2">{sourceLabels.length ? sourceLabels.map((label) => <button key={label} className="min-h-11 rounded-xl border border-line px-3 text-sm text-ink" type="button" disabled={saving} onClick={() => void copyMeal(label)}><Copy className="mr-1 inline h-4 w-4" />{label}</button>) : <p className="pb-2 text-sm text-muted">No meals on that date.</p>}</div></div></section>

      <section className="pt-6" aria-labelledby="logged-meals-title"><h2 id="logged-meals-title" className="text-lg font-medium text-ink">Logged meals</h2>{labels.length ? <div className="mt-3 space-y-6">{labels.map((label) => <MealSection key={label} label={label} entries={entriesForMeal(entries, label)} saving={saving} onAdd={() => { setDestination({ group: groupForLabel(entries, label), label }); setCustomMealName(groupForLabel(entries, label) === "custom" ? label : ""); window.scrollTo({ top: 0, behavior: "smooth" }); }} onSave={() => { setSavingMealLabel(label); setReplacingSavedMeal(null); setSavedMealName(""); }} onChange={(entry, patch) => void changeEntry(entry, patch)} onDelete={(entry) => void run(() => deleteNutritionEntry(user.uid, entry.id))} onCopy={(entry) => void run(() => saveNutritionEntry(user.uid, copyNutritionEntry(entry, crypto.randomUUID(), date, activeDestination.group, activeDestination.label)))} />)}</div> : <p className="mt-3 border-y border-line py-6 text-sm leading-6 text-muted">No food logged yet. Choose a meal, then add something from your library.</p>}</section>

      {foodToAdd ? <FoodAddSheet food={foodToAdd} quantity={quantity} saving={saving} onQuantity={setQuantity} onClose={() => setFoodToAdd(null)} onAdd={() => void addFood(foodToAdd, quantity)} /> : null}
      {foodToEdit ? <FoodEditorSheet food={foodToEdit === "new" ? null : foodToEdit} saving={saving} onClose={() => setFoodToEdit(null)} onSave={(draft) => void saveFoodDraft(draft, foodToEdit === "new" ? null : foodToEdit)} onArchive={foodToEdit === "new" ? undefined : () => void toggleFood(foodToEdit, { archived: !foodToEdit.archived })} /> : null}
      {savingMealLabel ? <SavedMealSheet name={savedMealName} replacing={replacingSavedMeal !== null} savedMeals={savedMeals} saving={saving} onName={setSavedMealName} onChooseExisting={(id) => { const meal = savedMeals.find((candidate) => candidate.id === id) ?? null; setReplacingSavedMeal(meal); if (meal) setSavedMealName(meal.name); }} onClose={() => { setSavingMealLabel(null); setReplacingSavedMeal(null); }} onSave={() => void saveMeal()} /> : null}
    </div>
  );
}

function FoodRows({ title, foods, empty, onAdd, onEdit, onFavourite }: { title?: string; foods: Food[]; empty: string; onAdd: (food: Food) => void; onEdit: (food: Food) => void; onFavourite: (food: Food) => Promise<void> }) {
  return <div className={title ? "mt-5" : "mt-3"}>{title ? <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{title}</h3> : null}{foods.length ? <div className="mt-2 divide-y divide-line border-y border-line">{foods.map((food) => <div key={food.id} className="flex min-h-14 items-center gap-1"><button className="min-h-11 min-w-0 flex-1 py-2 text-left" type="button" onClick={() => onAdd(food)}><span className="block text-sm font-medium text-ink">{food.name}</span><span className="block text-xs text-muted">{food.brand ? `${food.brand} · ` : ""}{food.per100g.calories} kcal / 100 g</span></button><button className="min-h-11 min-w-11 text-muted hover:text-ink" type="button" onClick={() => void onFavourite(food)} aria-label={`${food.favourite ? "Remove" : "Add"} ${food.name} ${food.favourite ? "from" : "to"} favourites`}>{food.favourite ? <Heart className="mx-auto h-4 w-4 fill-current" /> : <Star className="mx-auto h-4 w-4" />}</button><button className="min-h-11 min-w-11 text-muted hover:text-ink" type="button" onClick={() => onEdit(food)} aria-label={`Edit ${food.name}`}><Pencil className="mx-auto h-4 w-4" /></button></div>)}</div> : <p className="mt-2 text-sm text-muted">{empty}</p>}</div>;
}

function MealSection({ label, entries, saving, onAdd, onSave, onChange, onDelete, onCopy }: { label: string; entries: NutritionEntry[]; saving: boolean; onAdd: () => void; onSave: () => void; onChange: (entry: NutritionEntry, patch: Partial<Pick<NutritionEntry, "quantity" | "mealGroup" | "mealLabel">>) => void; onDelete: (entry: NutritionEntry) => void; onCopy: (entry: NutritionEntry) => void }) {
  const total = mealNutrition(entries);
  return <article className="border-y border-line py-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-medium tracking-[-0.025em] text-ink">{label}</h3><p className="mt-1 text-sm text-muted">{formatNutrition(total)}</p></div><div className="flex gap-1"><button className="min-h-11 rounded-xl bg-raised px-3 text-sm text-ink" type="button" onClick={onAdd}>Add food</button><button className="min-h-11 px-3 text-sm text-muted hover:text-ink" type="button" onClick={onSave}>Save meal</button></div></div><div className="mt-3 divide-y divide-line">{entries.map((entry) => <div key={entry.id} className="flex flex-wrap items-center gap-2 py-3"><div className="min-w-32 flex-1"><p className="text-sm font-medium text-ink">{entry.foodName}</p><p className="text-xs text-muted">{formatNutrition(nutritionForEntry(entry))}</p></div><label className="sr-only" htmlFor={`quantity-${entry.id}`}>Servings for {entry.foodName}</label><input id={`quantity-${entry.id}`} className="min-h-11 w-18 rounded-xl border border-line bg-raised px-2 text-sm text-ink" type="number" min="0.01" max="100" step="0.25" value={entry.quantity} onChange={(event) => onChange(entry, { quantity: Number(event.target.value) })} /><label className="sr-only" htmlFor={`meal-${entry.id}`}>Meal for {entry.foodName}</label><select id={`meal-${entry.id}`} className="min-h-11 rounded-xl border border-line bg-raised px-2 text-sm text-ink" value={entry.mealGroup} onChange={(event) => { const group = event.target.value as MealGroup; onChange(entry, { mealGroup: group, mealLabel: defaultMealLabels[group] }); }}><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snacks">Snacks</option><option value="custom">Custom</option></select><button className="min-h-11 min-w-10 text-muted hover:text-ink" type="button" disabled={saving} onClick={() => onCopy(entry)} aria-label={`Copy ${entry.foodName}`}><Copy className="mx-auto h-4 w-4" /></button><button className="min-h-11 min-w-10 text-muted hover:text-ink" type="button" disabled={saving} onClick={() => onDelete(entry)} aria-label={`Remove ${entry.foodName}`}><Trash2 className="mx-auto h-4 w-4" /></button></div>)}</div></article>;
}

function FoodAddSheet({ food, quantity, saving, onQuantity, onClose, onAdd }: { food: Food; quantity: string; saving: boolean; onQuantity: (quantity: string) => void; onClose: () => void; onAdd: () => void }) {
  const values = nutritionForFood(food, Number(quantity) || 0);
  return <Sheet title={`Add ${food.name}`} onClose={onClose}><p className="text-sm text-muted">{food.brand || food.servingName}</p><label className="mt-5 block text-sm text-muted">Servings<input className="mt-1 block min-h-12 w-full rounded-xl border border-line bg-raised px-3 text-ink" type="number" min="0.01" max="100" step="0.25" autoFocus value={quantity} onChange={(event) => onQuantity(event.target.value)} /></label><p className="mt-4 border-y border-line py-3 text-sm text-ink">{formatNutrition(values)}</p><button className="mt-5 min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink" type="button" disabled={saving} onClick={onAdd}>{saving ? "Adding…" : "Add food"}</button></Sheet>;
}

function FoodEditorSheet({ food, saving, onClose, onSave, onArchive }: { food: Food | null; saving: boolean; onClose: () => void; onSave: (draft: FoodDraft) => void; onArchive?: () => void }) {
  const [draft, setDraft] = useState(() => draftForFood(food ?? undefined));
  const update = (field: keyof FoodDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const fields: { field: keyof FoodDraft; label: string; step?: string }[] = [{ field: "name", label: "Food name" }, { field: "brand", label: "Brand (optional)" }, { field: "servingName", label: "Serving name" }, { field: "servingGrams", label: "Serving grams", step: "1" }, { field: "calories", label: "Calories per 100 g", step: "1" }, { field: "protein", label: "Protein per 100 g", step: "0.1" }, { field: "carbohydrates", label: "Carbohydrates per 100 g", step: "0.1" }, { field: "fat", label: "Fat per 100 g", step: "0.1" }, { field: "fibre", label: "Fibre per 100 g", step: "0.1" }];
  return <Sheet title={food ? `Edit ${food.name}` : "Create food"} onClose={onClose}><div className="grid gap-3">{fields.map(({ field, label, step }) => <label key={field} className="text-sm text-muted">{label}<input className="mt-1 block min-h-11 w-full rounded-xl border border-line bg-raised px-3 text-ink" type={step ? "number" : "text"} min={step ? "0" : undefined} step={step} value={draft[field]} onChange={(event) => update(field, event.target.value)} /></label>)}</div><button className="mt-5 min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink" type="button" disabled={saving} onClick={() => onSave(draft)}>{saving ? "Saving…" : "Save food"}</button>{food && onArchive ? <button className="mt-2 min-h-11 w-full rounded-xl border border-line px-3 text-sm text-muted hover:text-ink" type="button" disabled={saving} onClick={onArchive}><Archive className="mr-2 inline h-4 w-4" />{food.archived ? "Restore food" : "Archive food"}</button> : null}</Sheet>;
}

function SavedMealSheet({ name, replacing, savedMeals, saving, onName, onChooseExisting, onClose, onSave }: { name: string; replacing: boolean; savedMeals: SavedMeal[]; saving: boolean; onName: (name: string) => void; onChooseExisting: (id: string) => void; onClose: () => void; onSave: () => void }) {
  return <Sheet title={replacing ? "Replace saved meal" : "Save meal"} onClose={onClose}><label className="block text-sm text-muted">Meal name<input className="mt-1 block min-h-12 w-full rounded-xl border border-line bg-raised px-3 text-ink" autoFocus value={name} onChange={(event) => onName(event.target.value)} placeholder="e.g. Usual breakfast" /></label>{savedMeals.length ? <label className="mt-3 block text-sm text-muted">Or replace an existing meal<select className="mt-1 block min-h-12 w-full rounded-xl border border-line bg-raised px-3 text-ink" defaultValue="" onChange={(event) => onChooseExisting(event.target.value)}><option value="">Save as new</option>{savedMeals.map((meal) => <option key={meal.id} value={meal.id}>{meal.name}</option>)}</select></label> : null}<button className="mt-5 min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink" type="button" disabled={saving} onClick={onSave}>{saving ? "Saving…" : replacing ? "Replace saved meal" : "Save meal"}</button></Sheet>;
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}><section className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-panel p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-medium text-ink">{title}</h2><button className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted hover:bg-raised hover:text-ink" type="button" onClick={onClose} aria-label={`Close ${title}`}><X className="h-5 w-5" /></button></div>{children}</section></div>;
}

function NutritionTotal({ label, value, emphasis = false }: { label: string; value: NutritionValues; emphasis?: boolean }) {
  return <div><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{label}</p><p className={`mt-2 text-2xl tracking-[-0.03em] ${emphasis ? "font-medium text-ink" : "text-ink"}`}>{value.calories.toLocaleString()} <span className="text-sm text-muted">kcal</span></p><p className="mt-1 text-xs text-muted">P {value.protein} · C {value.carbohydrates} · F {value.fat} · Fi {value.fibre}</p></div>;
}

function targetCopy(value: number, unit: string) {
  return value >= 0 ? `${Math.round(value).toLocaleString()} ${unit} remaining` : `${Math.abs(Math.round(value)).toLocaleString()} ${unit} over`;
}

function formatNutrition(value: NutritionValues) {
  return `${value.calories} kcal · P ${value.protein} · C ${value.carbohydrates} · F ${value.fat} · Fi ${value.fibre}`;
}
