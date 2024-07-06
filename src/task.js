import {
  parse,
  format,
  isToday,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  endOfWeek,
  subMilliseconds,
  isSameDay,
} from "date-fns";

import { displayTasks, displayTaskDetail } from "./displayTasks.js";

const tasks = [];

const taskGroups = ["Today", "This Week", "All", "Completed"];

class Task {
  constructor(
    name,
    description = "",
    priority = 3,
    dueDate = null,
    recurrence = "",
    taskGroups = [],
    notes = "",
    completedDate = null
  ) {
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.dueDate = dueDate ? parse(dueDate, "yyyy-MM-dd", new Date()) : null;
    this.recurrence = recurrence;
    if (!taskGroups.includes("Completed")) {
      this.taskGroups = ["All", ...new Set(taskGroups)];
    } else {
      this.taskGroups = [...new Set(taskGroups)];
    }
    this.notes = notes;
    this.completedDate = completedDate
      ? parse(completedDate, "yyyy-MM-dd", new Date())
      : null;
  }

  static createTask(options) {
    const instance = new Task(
      options.name,
      options.description || "",
      options.priority || 3,
      options.dueDate || null,
      options.recurrence || "",
      options.taskGroups || [],
      options.notes || "",
      options.completedDate || null
    );
    Task.saveToLocalStorage(instance);
    return instance;
  }

  static saveToLocalStorage(instance) {
    const key = instance.name + instance.dueDate;
    console.log(instance.dueDate);
    const serializedInstance = {
      ...instance,
      dueDate: instance.dueDate ? format(instance.dueDate, "yyyy-MM-dd") : null,
      completedDate: instance.completedDate
        ? format(instance.completedDate, "yyyy-MM-dd")
        : null,
    };
    localStorage.setItem(key, JSON.stringify(serializedInstance));
  }

  static loadFromLocalStorage() {
    const instances = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const storedData = JSON.parse(localStorage.getItem(key));
      if (storedData.name) {
        const instance = new Task(
          storedData.name,
          storedData.description,
          storedData.priority,
          storedData.dueDate, // Pass the string directly
          storedData.recurrence,
          storedData.taskGroups,
          storedData.notes,
          storedData.completedDate // Pass the string directly
        );
        instances.push(instance);
      }
    }
    return instances;
  }

  // static checkAndCreateRecurringTasks() {
  //   console.log("Starting recurring tasks check...");
  //   const today = startOfDay(new Date());
  //   const validRecurrences = ["daily", "weekly", "monthly", "yearly"];

  //   tasks.forEach((task) => {
  //     if (
  //       validRecurrences.includes(task.recurrence) &&
  //       task.dueDate &&
  //       !task.completedDate
  //     ) {
  //       console.log(
  //         `Processing recurring task: ${task.name}, Recurrence: ${task.recurrence}, Original Due Date: ${format(task.dueDate, "yyyy-MM-dd")}`
  //       );
  //       let newDueDate = task.dueDate;
  //       let createdTasks = 0;
  //       let iterations = 0;
  //       const maxIterations = 365; // Safeguard against infinite loops

  //       while (isBefore(newDueDate, today) && iterations < maxIterations) {
  //         newDueDate = this.calculateNextDueDate(newDueDate, task.recurrence);
  //         if (!newDueDate) {
  //           console.log(`Failed to create new due date for task: ${task.name}`);
  //           break;
  //         }

  //         console.log(
  //           `New due date calculated: ${format(newDueDate, "yyyy-MM-dd")}`
  //         );

  //         // Check if a task with this name and due date already exists
  //         const taskExists = tasks.some(
  //           (t) =>
  //             t.name === task.name &&
  //             t.dueDate &&
  //             isSameDay(t.dueDate, newDueDate)
  //         );

  //         if (!taskExists) {
  //           const recurringTask = Task.createTask({
  //             ...task,
  //             dueDate: format(newDueDate, "yyyy-MM-dd"),
  //             completedDate: null,
  //           });
  //           if (recurringTask) {
  //             addTaskToArray(recurringTask);
  //             createdTasks++;
  //             console.log(
  //               `Created new recurring task for: ${task.name} on ${format(newDueDate, "yyyy-MM-dd")}`
  //             );
  //           } else {
  //             console.log(`Failed to create recurring task for: ${task.name}`);
  //             break;
  //           }
  //         } else {
  //           console.log(
  //             `Task already exists for: ${task.name} on ${format(newDueDate, "yyyy-MM-dd")}`
  //           );
  //           break;
  //         }

  //         iterations++;
  //       }

  //       if (iterations >= maxIterations) {
  //         console.log(
  //           `Max iterations reached for task: ${task.name}. This may indicate an issue with date calculations.`
  //         );
  //       }

  //       console.log(
  //         `Created ${createdTasks} recurring tasks for: ${task.name}`
  //       );
  //     }
  //   });
  //   console.log("Recurring tasks check complete.");
  // }

  // static calculateNextDueDate(currentDueDate, recurrence) {
  //   switch (recurrence) {
  //     case "daily":
  //       return addDays(currentDueDate, 1);
  //     case "weekly":
  //       return addWeeks(currentDueDate, 1);
  //     case "monthly":
  //       return addMonths(currentDueDate, 1);
  //     case "yearly":
  //       return addYears(currentDueDate, 1);
  //     default:
  //       console.log(`Unknown recurrence type: ${recurrence}`);
  //       return null;
  //   }
  // }

  // createRecurringTask() {
  //   let newDueDate;

  //   if (this.dueDate && !isNaN(this.dueDate.getTime())) {
  //     if (this.recurrence === "daily") {
  //       newDueDate = format(addDays(this.dueDate, 1), "yyyy-MM-dd");
  //     } else if (this.recurrence === "weekly") {
  //       newDueDate = format(addWeeks(this.dueDate, 1), "yyyy-MM-dd");
  //     } else if (this.recurrence === "monthly") {
  //       newDueDate = format(addMonths(this.dueDate, 1), "yyyy-MM-dd");
  //     } else if (this.recurrence === "yearly") {
  //       newDueDate = format(addYears(this.dueDate, 1), "yyyy-MM-dd");
  //     } else if (this.recurrence === "completionDay") {
  //       newDueDate = format(addDays(this.completedDate, 1), "yyyy-MM-dd");
  //     } else if (this.recurrence === "completionWeek") {
  //       newDueDate = format(addWeeks(this.completedDate, 1), "yyyy-MM-dd");
  //     } else if (this.recurrence === "completionMonth") {
  //       newDueDate = format(addMonths(this.completedDate, 1), "yyyy-MM-dd");
  //     } else if (this.recurrence === "completionYear") {
  //       newDueDate = format(addYears(this.completedDate, 1), "yyyy-MM-dd");
  //     } else {
  //       return null;
  //     }
  //   } else {
  //     return null;
  //   }

  //   return newDueDate;
  // }

  getRecurrenceText() {
    const recurrenceTexts = {
      "": "Never",
      daily: "Every Day",
      weekly: "Every Week",
      monthly: "Every Month",
      yearly: "Every Year",
      completionDay: "Day After Completion",
      completionWeek: "Week After Completion",
      completionMonth: "Month After Completion",
      completionYear: "Year After Completion",
    };
    return recurrenceTexts[this.recurrence] || "None";
  }
}

function checkAndCreateRecurringTasks(tasks) {
  // console.log("Starting recurring tasks check...");
  const today = startOfDay(new Date());
  const validRecurrences = [
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "completionDay",
    "completionWeek",
    "completionMonth",
    "completionYear",
  ];

  tasks.forEach((task) => {
    if (
      validRecurrences.includes(task.recurrence) &&
      task.dueDate &&
      !task.completedDate
    ) {
      // console.log(
      //   `Processing recurring task: ${task.name}, Recurrence: ${task.recurrence}, Original Due Date: ${format(task.dueDate, "yyyy-MM-dd")}`
      // );
      let newDueDate = task.dueDate;
      let createdTasks = 0;
      let iterations = 0;
      const maxIterations = 365;

      while (isBefore(newDueDate, today) && iterations < maxIterations) {
        newDueDate = calculateNextDueDate(
          newDueDate,
          task.recurrence,
          task.completedDate
        );
        if (!newDueDate) {
          // console.log(`Failed to create new due date for task: ${task.name}`);
          break;
        }

        // console.log(
        //   `New due date calculated: ${format(newDueDate, "yyyy-MM-dd")}`
        // );

        const taskExists = tasks.some(
          (t) =>
            t.name === task.name &&
            t.dueDate &&
            isSameDay(t.dueDate, newDueDate)
        );

        if (!taskExists) {
          const recurringTask = Task.createTask({
            ...task,
            dueDate: format(newDueDate, "yyyy-MM-dd"),
            completedDate: null,
          });
          if (recurringTask) {
            addTaskToArray(recurringTask);
            createdTasks++;
            // console.log(
            //   `Created new recurring task for: ${task.name} on ${format(newDueDate, "yyyy-MM-dd")}`
            // );
          } else {
            console.log(`Failed to create recurring task for: ${task.name}`);
            break;
          }
        } else {
          // console.log(
          //   `Task already exists for: ${task.name} on ${format(newDueDate, "yyyy-MM-dd")}`
          // );
          break;
        }

        iterations++;
      }

      if (iterations >= maxIterations) {
        // console.log(
        //   `Max iterations reached for task: ${task.name}. This may indicate an issue with date calculations.`
        // );
      }

      // console.log(`Created ${createdTasks} recurring tasks for: ${task.name}`);
    }
  });
  // console.log("Recurring tasks check complete.");
}

function calculateNextDueDate(currentDueDate, recurrence, completedDate) {
  switch (recurrence) {
    case "daily":
      return addDays(currentDueDate, 1);
    case "weekly":
      return addWeeks(currentDueDate, 1);
    case "monthly":
      return addMonths(currentDueDate, 1);
    case "yearly":
      return addYears(currentDueDate, 1);
    case "completionDay":
      return addDays(completedDate || currentDueDate, 1);
    case "completionWeek":
      return addWeeks(completedDate || currentDueDate, 1);
    case "completionMonth":
      return addMonths(completedDate || currentDueDate, 1);
    case "completionYear":
      return addYears(completedDate || currentDueDate, 1);
    default:
      console.log(`Unknown recurrence type: ${recurrence}`);
      return null;
  }
}

function addTaskToArray(task) {
  tasks.push(task);
  tasks.sort((a, b) => {
    const aDueDate = a.dueDate ? a.dueDate.getTime() : Infinity;
    const bDueDate = b.dueDate ? b.dueDate.getTime() : Infinity;

    if (aDueDate === Infinity && bDueDate === Infinity) {
      return a.priority - b.priority;
    } else if (aDueDate === Infinity) {
      return 1;
    } else if (bDueDate === Infinity) {
      return -1;
    } else {
      return aDueDate - bDueDate || a.priority - b.priority;
    }
  });
}

function saveTaskGroupsToLocalStorage() {
  localStorage.setItem("taskGroups", JSON.stringify(taskGroups));
}

function addTaskGroup(name) {
  if (name && !taskGroups.includes(name)) {
    taskGroups.push(name);
    saveTaskGroupsToLocalStorage();
  }
}

function loadTaskGroupsFromLocalStorage() {
  const storedTaskGroups = localStorage.getItem("taskGroups");
  if (storedTaskGroups) {
    taskGroups.length = 0; // Clear the existing task groups array
    taskGroups.push(...JSON.parse(storedTaskGroups));
  }
}

function isWithinCurrentWeek(date) {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfYesterday = subMilliseconds(startOfToday, 1);
  const endOfWeekDate = endOfWeek(today);

  return (
    isAfter(date, endOfYesterday) && isBefore(date, endOfDay(endOfWeekDate))
  );
}

function filterTasks(tasks, taskgroup) {
  // Remove the 'selected' class from all task group elements
  const taskGroupElements = document.querySelectorAll(".taskgroup");
  taskGroupElements.forEach((element) => element.classList.remove("selected"));

  // Add the 'selected' class to the current task group element
  const selectedTaskGroup = document.querySelector(
    `.taskgroup[data-group="${taskgroup}"]`
  );
  if (selectedTaskGroup) {
    selectedTaskGroup.classList.add("selected");
  }
  if (taskgroup === "Today") {
    return tasks.filter((item) => isToday(item.dueDate) && !item.completedDate);
  } else if (taskgroup === "This Week") {
    return tasks.filter(
      (item) => isWithinCurrentWeek(item.dueDate) && !item.completedDate
    );
  } else if (taskgroup === "All") {
    return tasks.filter((item) => !item.completedDate);
  } else {
    return tasks.filter((item) => item.taskGroups.includes(taskgroup));
  }
}

function removeTaskByName(taskName, taskDueDate) {
  const taskIndex = tasks.findIndex(
    (task) =>
      task.name === taskName &&
      (task.dueDate
        ? format(task.dueDate, "yyyy-MM-dd") === taskDueDate
        : !taskDueDate)
  );
  if (taskIndex !== -1) {
    const removedTask = tasks.splice(taskIndex, 1)[0];
    const key = removedTask.name + removedTask.dueDate;
    localStorage.removeItem(key);
  }
  return tasks;
}

function editTaskByName(taskName, updatedProperties) {
  // const taskToEdit = tasks.find(task => task.name === taskName);
  const taskToEdit = tasks.find(
    (task) =>
      task.name === taskName &&
      task.priority === updatedProperties.priority &&
      (task.completedDate
        ? task.completedDate.getTime() ===
          updatedProperties.completedDate?.getTime()
        : !updatedProperties.completedDate)
  );

  if (taskToEdit) {
    // Parse the dueDate string into a Date object if it exists
    if (updatedProperties.dueDate) {
      updatedProperties.dueDate = startOfDay(
        parse(updatedProperties.dueDate, "yyyy-MM-dd", new Date())
      );
    }

    // Update task properties
    Object.assign(taskToEdit, updatedProperties);

    // Handle task groups based on completion status
    if (taskToEdit.completedDate) {
      taskToEdit.taskGroups = ["Completed"];
    } else {
      // Remove 'Completed' from task groups if it exists
      taskToEdit.taskGroups = taskToEdit.taskGroups.filter(
        (group) => group !== "Completed"
      );

      // Add 'All' to task groups if it's not already present
      if (!taskToEdit.taskGroups.includes("All")) {
        taskToEdit.taskGroups.unshift("All");
      }
    }

    Task.saveToLocalStorage(taskToEdit);

    // Get the currently selected task group
    const selectedTaskGroup = document.querySelector(".selected").textContent;

    // Filter the tasks based on the selected task group
    const filteredTasks = filterTasks(tasks, selectedTaskGroup);

    // Run the displayTasks function with the filtered tasks
    displayTasks(filteredTasks);

    // Update the task detail view if it's currently displayed
    const currentTaskName =
      document.querySelector("#current .name")?.textContent;
    if (currentTaskName === taskName) {
      displayTaskDetail(taskToEdit);
    }
  }
}

export {
  Task,
  tasks,
  addTaskToArray,
  addTaskGroup,
  taskGroups,
  filterTasks,
  removeTaskByName,
  editTaskByName,
  saveTaskGroupsToLocalStorage,
  loadTaskGroupsFromLocalStorage,
  checkAndCreateRecurringTasks,
  calculateNextDueDate,
};
