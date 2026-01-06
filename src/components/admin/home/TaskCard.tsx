import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

export default function TaskCard({ tasks, onAdd, onToggle, onDelete }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");
  const [freq, setFreq] = useState("ONCE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd(content, freq);
    setContent("");
    setIsAdding(false);
  };

  return (
    <div
      className="
        bg-white dark:bg-slate-900
        rounded-2xl p-6 shadow-sm
        border border-slate-200 dark:border-slate-800
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <CheckSquare className="text-blue-500" />
          Ghi chú
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="
            p-1 rounded text-blue-600
            hover:bg-slate-100 dark:hover:bg-slate-800
          "
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="
            mb-4 p-3 rounded-xl border
            bg-slate-50 dark:bg-slate-800
            border-slate-200 dark:border-slate-700
          "
        >
          <input
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập việc..."
            className="
              w-full bg-transparent outline-none text-sm mb-2
              text-slate-900 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-500
            "
          />

          <div className="flex justify-between items-center">
            <select
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
              className="
                text-xs rounded px-2 py-1 border
                bg-white dark:bg-slate-800
                text-slate-900 dark:text-slate-100
                border-slate-300 dark:border-slate-600
              "
            >
              <option value="ONCE">Một lần</option>
              <option value="DAILY">Hàng ngày</option>
            </select>

            <button
              type="submit"
              className="
                text-xs font-bold px-3 py-1 rounded
                bg-blue-600 text-white
                hover:bg-blue-700
              "
            >
              Thêm
            </button>
          </div>
        </form>
      )}

      {/* Task list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {tasks.map((task: any) => (
          <div
            key={task.id}
            className="
              flex items-center gap-3 p-3 rounded-xl border
              bg-white dark:bg-slate-900
              border-slate-200 dark:border-slate-700
            "
          >
            <input
              type="checkbox"
              checked={task.isDone}
              onChange={() => onToggle(task.id, !task.isDone)}
              className="accent-blue-600 cursor-pointer"
            />

            <span
              className={`
                text-sm flex-1
                ${task.isDone
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-100'}
              `}
            >
              {task.content}
            </span>

            <button
              onClick={() => onDelete(task.id)}
              className="
                text-red-400 hover:text-red-600
                dark:hover:text-red-500
              "
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
