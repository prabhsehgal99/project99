import { DailyLogPage } from "@/components/daily-log-page";

export default async function DailyLogDate({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <DailyLogPage dateKey={date} />;
}
