export function getDaysInPeriod(startDate: string, endDate: string): string[] {
  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  const formatDate = (date: Date): string => date.toISOString().split('T')[0];

  if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }

  const dates: string[] = [];
  for ( let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
    dates.push(formatDate(d));
  }

  return dates;
}