import { useMemo } from 'react';
import { addDays, formatDisplayDate, parseDateKey, toDateKey } from '../utils/date';

interface HeatmapProps {
  completions: Record<string, true>;
  color: string;
  today: string;
  weeks?: number;
  onToggleDate: (dateKey: string) => void;
}

interface Cell {
  key: string;
  future: boolean;
}

export function Heatmap({
  completions,
  color,
  today,
  weeks = 13,
  onToggleDate,
}: HeatmapProps) {
  const columns = useMemo(() => {
    // End the grid on the Saturday of today's week, so weeks*7 cells back
    // from there always lands exactly on a Sunday — no partial leading week.
    const todayDate = parseDateKey(today);
    const gridEndDate = new Date(todayDate);
    gridEndDate.setDate(gridEndDate.getDate() + (6 - gridEndDate.getDay()));
    const gridStartDate = new Date(gridEndDate);
    gridStartDate.setDate(gridStartDate.getDate() - (weeks * 7 - 1));
    const gridStart = toDateKey(gridStartDate);

    const cols: Cell[][] = [];
    let cursor = gridStart;
    for (let w = 0; w < weeks; w++) {
      const col: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        col.push({ key: cursor, future: cursor > today });
        cursor = addDays(cursor, 1);
      }
      cols.push(col);
    }
    return cols;
  }, [today, weeks]);

  return (
    <div className="flex gap-[3px] overflow-x-auto py-1">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-[3px]">
          {col.map((cell) => {
            const done = !!completions[cell.key];
            return (
              <button
                key={cell.key}
                type="button"
                disabled={cell.future}
                onClick={() => onToggleDate(cell.key)}
                title={`${formatDisplayDate(cell.key)} — ${
                  cell.future ? '아직 오지 않음' : done ? '완료' : '미완료'
                }`}
                className={`h-3 w-3 rounded-sm transition-colors ${
                  cell.future
                    ? 'invisible'
                    : done
                      ? 'cursor-pointer'
                      : 'cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
                style={done && !cell.future ? { backgroundColor: color } : undefined}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
