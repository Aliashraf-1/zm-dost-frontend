"use client";

import { useState } from "react";
import { CheckCircle2, Clock, AlertCircle, XCircle, Plus, Eye, ChevronDown, ChevronUp } from "lucide-react";
import TaskModal from "./TaskModal";

export default function EmployeeTasks({ employee, onTaskAdd, onTaskUpdate, canAssign = true }) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showPreviousTasks, setShowPreviousTasks] = useState(false);

  const getStatusBadge = (status) => {
    const variants = {
      Completed: { class: "bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 size={14} /> },
      "In Progress": { class: "bg-blue-500/10 text-blue-400", icon: <Clock size={14} /> },
      Pending: { class: "bg-amber-500/10 text-amber-400", icon: <Clock size={14} /> },
      Failed: { class: "bg-red-500/10 text-red-400", icon: <XCircle size={14} /> },
    };
    return variants[status] || variants.Pending;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      High: "bg-red-500/10 text-red-400",
      Medium: "bg-amber-500/10 text-amber-400",
      Low: "bg-blue-500/10 text-blue-400",
    };
    return variants[priority] || variants.Medium;
  };

  const allTasks = employee?.tasks || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneDayAgo = new Date(today);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const isRecent = (task) => {
    const taskDate = new Date(task.assignedDate);
    return taskDate >= oneDayAgo;
  };

  const isCompletedOrFailed = (task) => {
    return task.status === "Completed" || task.status === "Failed";
  };

  const activeTasks = allTasks.filter(task => isRecent(task) || isCompletedOrFailed(task));
  const oldPendingTasks = allTasks.filter(task => !isRecent(task) && !isCompletedOrFailed(task));

  const displayTasks = showAllTasks 
    ? (showPreviousTasks ? [...activeTasks, ...oldPendingTasks] : activeTasks)
    : (showPreviousTasks ? [...activeTasks.slice(0, 3), ...oldPendingTasks] : activeTasks.slice(0, 3));

  const totalTasks = allTasks.length;
  const hiddenOldCount = oldPendingTasks.length;

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const taskId = editingTask._id || editingTask.id;
        await onTaskUpdate({ ...taskData, _id: taskId, id: taskId });
      } else if (onTaskAdd) {
        const { id, _id, ...cleanData } = taskData;
        await onTaskAdd(cleanData);
      }
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Task save failed:", error);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-xs text-muted-foreground">
            {totalTasks} total tasks
            {hiddenOldCount > 0 && (
              <span className="ml-2 text-amber-400">
                ({hiddenOldCount} old tasks hidden)
              </span>
            )}
          </p>
        </div>
        {canAssign && (
        <button
          onClick={() => {
            setEditingTask(null);
            setShowTaskModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          <Plus size={16} />
          Assign Task
        </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {displayTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No tasks</p>
          </div>
        ) : (
          displayTasks.map((task) => {
            const taskId = task._id || task.id;
            const statusBadge = getStatusBadge(task.status);
            const isExpanded = expandedTask === taskId;
            const isOld = !isRecent(task) && !isCompletedOrFailed(task);

            return (
              <div
                key={taskId}
                className={`rounded-xl border p-4 transition hover:border-border ${
                  isOld
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border bg-muted"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium text-foreground">{task.title}</h3>
                      <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium ${statusBadge.class}`}
                      >
                        {statusBadge.icon}
                        {task.status}
                      </span>
                      {isOld && (
                        <span className="text-xs text-amber-400">⚠️ Overdue</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      {task.completedAt && (
                        <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                      )}
                      {task.failureReason && (
                        <span className="text-red-400">Failed: {task.failureReason}</span>
                      )}
                      {task.failureDeduction > 0 && (
                        <span className="text-red-400">Deduction: Rs. {task.failureDeduction}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedTask(isExpanded ? null : taskId)}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setShowTaskModal(true);
                      }}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      ✏️
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 border-t border-border pt-3">
                    <div className="grid gap-2 text-sm">
                      <p><span className="text-muted-foreground">Description:</span> {task.description}</p>
                      <p><span className="text-muted-foreground">Assigned:</span> {new Date(task.assignedDate).toLocaleString()}</p>
                      <p><span className="text-muted-foreground">Due:</span> {new Date(task.dueDate).toLocaleString()}</p>
                      {task.completedAt && (
                        <p><span className="text-muted-foreground">Completed:</span> {new Date(task.completedAt).toLocaleString()}</p>
                      )}
                      {task.remarks && (
                        <p><span className="text-muted-foreground">Remarks:</span> {task.remarks}</p>
                      )}
                      {task.failureReason && (
                        <p><span className="text-red-400">Failure Reason:</span> {task.failureReason}</p>
                      )}
                      {task.failureDeduction > 0 && (
                        <p><span className="text-red-400">Failure Deduction:</span> Rs. {task.failureDeduction}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Show More (Recent) */}
      {activeTasks.length > 3 && (
        <div className="mt-4 border-t border-border pt-3 text-center">
          <button
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="inline-flex items-center gap-1 text-sm text-indigo-400 transition hover:text-indigo-300"
          >
            {showAllTasks ? (
              <>
                <ChevronUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show More ({activeTasks.length - 3} more)
              </>
            )}
          </button>
        </div>
      )}

      {/* Show Previous (Old Tasks) */}
      {hiddenOldCount > 0 && (
        <div className="mt-2 border-t border-border pt-3 text-center">
          <button
            onClick={() => setShowPreviousTasks(!showPreviousTasks)}
            className="inline-flex items-center gap-1 text-sm text-amber-400 transition hover:text-amber-300"
          >
            {showPreviousTasks ? (
              <>
                <ChevronUp size={16} />
                Hide Previous ({hiddenOldCount})
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show Previous ({hiddenOldCount} old tasks)
              </>
            )}
          </button>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          employee={employee}
          task={editingTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}