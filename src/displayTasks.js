import { format, parse, startOfDay } from "date-fns";
import {
  editTaskByName,
  tasks,
  filterTasks,
  removeTaskByName,
  taskGroups,
  addTaskToArray,
  Task,
} from "./task.js";

// create task list
function displayTasks(tasklist) {
  const displayList = document.getElementById("mainview");
  const existingTasks = Array.from(displayList.querySelectorAll(".task"));

  // Create a map of existing task names to their index
  const existingTaskMap = new Map();
  existingTasks.forEach((task, index) => {
    existingTaskMap.set(task.querySelector(".name").innerText, index);
  });

  // Create new task elements
  const newTasks = tasklist.map((task, index) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");

    const priority = document.createElement("div");
    priority.classList.add("priority");
    if (task.completedDate) {
      priority.classList.remove("priority1", "priority2", "priority3");
      priority.classList.add("priority-completed");
    } else if (task.priority === 1) {
      priority.classList.add("priority1");
    } else if (task.priority === 2) {
      priority.classList.add("priority2");
    } else {
      priority.classList.add("priority3");
    }

    const taskContent = document.createElement("div");
    taskContent.classList.add("task-content");

    const taskInfo = document.createElement("div");
    taskInfo.classList.add("task-info");

    const name = document.createElement("div");
    name.classList.add("name");
    name.innerText = task.name;

    const dueDate = document.createElement("div");
    dueDate.classList.add("due-date");
    dueDate.innerText = task.dueDate ? format(task.dueDate, "MMM dd yyyy") : "";

    const actionButtons = document.createElement("div");
    actionButtons.classList.add("action-buttons");

    const completeButton = document.createElement("button");
    completeButton.innerText = "\u2714";
    completeButton.classList.add("complete-task");

    const deleteTaskButton = document.createElement("button");
    deleteTaskButton.innerText = "X";
    deleteTaskButton.classList.add("delete-task");

    const editButton = document.createElement("button");
    editButton.innerText = "\u270E";
    editButton.classList.add("edit-task");
    actionButtons.appendChild(editButton);

    taskInfo.appendChild(name);
    taskInfo.appendChild(dueDate);
    actionButtons.appendChild(completeButton);
    actionButtons.appendChild(deleteTaskButton);
    taskContent.appendChild(taskInfo);
    taskContent.appendChild(actionButtons);
    taskElement.appendChild(priority);
    taskElement.appendChild(taskContent);

    return taskElement;
  });

  // Calculate the new positions of existing tasks
  existingTasks.forEach((task, index) => {
    const taskName = task.querySelector("div:nth-child(2)").innerText;
    const newIndex = tasklist.findIndex((t) => t.name === taskName);
    if (newIndex !== -1) {
      const newPosition = newIndex * task.offsetHeight;
      task.style.transform = `translateY(${newPosition - index * task.offsetHeight}px)`;
      task.style.transition = "transform 0.5s";
    } else {
      task.style.opacity = "0";
      task.style.transition = "opacity 0.5s";
    }
  });

  // Wait for the transitions to complete
  setTimeout(() => {
    displayList.replaceChildren(...newTasks);
    newTasks.forEach((task) => {
      task.classList.add("fade-in");
    });
  }, 500);
}

function displayTaskGroups(taskGroups) {
  const displayGroupList = document.getElementById("sidebar");
  displayGroupList.innerHTML = ""; // Clear existing task groups

  for (let i in taskGroups) {
    const taskGroup = document.createElement("div");
    taskGroup.innerText = taskGroups[i];
    taskGroup.classList.add("taskgroup");
    taskGroup.setAttribute("data-group", `${taskGroups[i]}`);
    displayGroupList.appendChild(taskGroup);
  }
}

function displayTaskDetail(task) {
  const current = document.getElementById("current");
  const taskDetails = document.createElement("div");

  taskDetails.classList.add("taskdetails");
  setTimeout(() => {
    current.replaceChildren();

    taskDetails.classList.add("fade-out");
    current.appendChild(taskDetails);

    setTimeout(() => {
      taskDetails.classList.remove("fade-out");
    }, 500);

    // priority
    const priority = document.createElement("div");
    priority.classList.add("priority");
    if (task.completedDate) {
      priority.classList.add("priority-completed");
    } else if (task.priority === 1) {
      priority.classList.add("priority1");
    } else if (task.priority === 2) {
      priority.classList.add("priority2");
    } else {
      priority.classList.add("priority3");
    }
    // name
    const name = document.createElement("div");
    name.innerText = task.name;
    name.classList.add("name");
    // date
    const dueDate = document.createElement("div");
    // dueDate.innerText = "Due: " + format(task.dueDate, "MMM dd yyyy");
    dueDate.innerText = task.dueDate
      ? "Due: " + format(task.dueDate, "MMM dd yyyy")
      : "No due date";
    dueDate.classList.add("due-date");
    // notes

    // Notes label
    const notesLabel = document.createElement("div");
    notesLabel.innerText = "Notes:";
    notesLabel.classList.add("notes-label");

    // Notes container
    const notesContainer = document.createElement("div");
    notesContainer.classList.add("notes-container");

    // Notes
    const notes = document.createElement("div");
    notes.innerText = task.notes;
    notes.classList.add("notes");
    notesContainer.appendChild(notes);

    // recurrence
    const recurrence = document.createElement("div");
    // recurrence.innerText = "Recurs: " + task.getRecurrenceText.call(task);
    recurrence.innerText = "Recurs: " + task.getRecurrenceText();
    // action buttons
    const actionButtons = document.createElement("div");
    actionButtons.classList.add("action-buttons");

    // complete button
    const completeButton = document.createElement("button");
    completeButton.innerText = "\u2714";
    completeButton.classList.add("complete-task");

    completeButton.addEventListener("click", function () {
      const completedTaskElement = event.target.closest(".taskdetails");
      const completedTask =
        completedTaskElement.querySelector(".name").textContent;
      const currentDate = new Date();

      const taskToComplete = tasks.find(
        (task) => task.name === completedTask && !task.completedDate
      );

      if (taskToComplete) {
        // Mark the task as completed
        taskToComplete.completedDate = currentDate;
        taskToComplete.taskGroups = ["Completed"];

        // Save the completed task
        Task.saveToLocalStorage(taskToComplete);

        let taskToDisplay;

        // Create a new recurring task if necessary
        if (taskToComplete.recurrence) {
          const newDueDate = taskToComplete.createRecurringTask();
          if (newDueDate) {
            const recurringTask = Task.createTask({
              ...taskToComplete,
              dueDate: newDueDate,
              completedDate: null,
              taskGroups: taskToComplete.taskGroups.filter(
                (group) => group !== "Completed"
              ),
            });
            addTaskToArray(recurringTask);
            taskToDisplay = recurringTask;
          }
        }

        // If no recurring task was created, display the completed task
        if (!taskToDisplay) {
          taskToDisplay = taskToComplete;
        }

        // Update the display
        const selectedTaskGroup =
          document.querySelector(".selected").textContent;
        const filteredTasks = filterTasks(tasks, selectedTaskGroup);
        displayTasks(filteredTasks);

        // Update the task detail view
        displayTaskDetail(taskToDisplay);
      }
    });

    const deleteTaskButton = document.createElement("button");
    deleteTaskButton.innerText = "X";
    deleteTaskButton.classList.add("delete-task");
    deleteTaskButton.addEventListener("click", function () {
      const taskName = task.name;
      removeTaskByName(taskName);
      // Get the currently selected task group
      const selectedTaskGroup = document.querySelector(".selected").textContent;
      // Filter the tasks based on the selected task group
      const filteredTasks = filterTasks(tasks, selectedTaskGroup);
      // Run the displayTasks function with the filtered tasks
      displayTasks(filteredTasks);
      // Clear the task detail view
      current.innerHTML = "";
    });

    const editButton = document.createElement("button");
    editButton.innerText = "\u270E";
    editButton.classList.add("edit-task");
    editButton.addEventListener("click", function () {
      // Populate the form with the task details
      document.getElementById("taskName").value = task.name;
      document.getElementById("dueDate").value = task.dueDate
        ? format(task.dueDate, "yyyy-MM-dd")
        : "";
      document.getElementById("priority").value = task.priority;
      document.getElementById("recurrence").value = task.recurrence;
      document.getElementById("taskNotes").value = task.notes;

      // Populate the task group options in the form
      const taskGroupsSelect = document.getElementById("taskGroups");
      taskGroupsSelect.innerHTML = "";
      taskGroups.forEach(function (group) {
        if (
          group !== "Today" &&
          group !== "This Week" &&
          group !== "All" &&
          group !== "Completed"
        ) {
          const option = document.createElement("option");
          option.value = group;
          option.textContent = group;
          option.selected = task.taskGroups.includes(group);
          taskGroupsSelect.appendChild(option);
        }
      });

      // Show the form
      formContainer.classList.remove("hidden");

      // Change the form submission behavior to update the task
      taskForm.removeEventListener("submit", addTask);
      taskForm.addEventListener("submit", updateTask);

      function updateTask(event) {
        event.preventDefault();

        // Get the updated form values
        const updatedTaskName = document.getElementById("taskName").value;
        const updatedDueDate = document.getElementById("dueDate").value;
        const updatedSelectedTaskGroups = Array.from(
          document.querySelectorAll("#taskGroups option:checked")
        ).map((option) => option.value);
        const updatedTaskGroupsWithAll = ["All", ...updatedSelectedTaskGroups];
        const updatedPriority = parseInt(
          document.getElementById("priority").value
        );
        const updatedRecurrence = document.getElementById("recurrence").value;
        const updatedNotes = document.getElementById("taskNotes").value;

        // Update the task properties
        task.name = updatedTaskName;
        task.dueDate = updatedDueDate
          ? startOfDay(parse(updatedDueDate, "yyyy-MM-dd", new Date()))
          : null;
        task.taskGroups = updatedTaskGroupsWithAll;
        task.priority = updatedPriority;
        task.recurrence = updatedRecurrence;
        task.notes = updatedNotes;

        // Save the updated task to local storage
        Task.saveToLocalStorage(task);

        // Get the currently selected task group
        const selectedTaskGroup =
          document.querySelector(".selected").textContent;

        // Filter the tasks based on the selected task group
        const filteredTasks = filterTasks(tasks, selectedTaskGroup);

        // Run the displayTasks function with the filtered tasks
        displayTasks(filteredTasks);

        // Update the task detail view
        displayTaskDetail(task);

        // Reset the form and hide it
        taskForm.reset();
        formContainer.classList.add("hidden");

        // Restore the form submission behavior for adding a new task
        taskForm.removeEventListener("submit", updateTask);
        taskForm.addEventListener("submit", addTask);
      }
    });

    actionButtons.appendChild(editButton);
    actionButtons.appendChild(completeButton);
    actionButtons.appendChild(deleteTaskButton);

    taskDetails.appendChild(priority);
    taskDetails.appendChild(name);
    taskDetails.appendChild(dueDate);
    taskDetails.appendChild(notesLabel);
    taskDetails.appendChild(notesContainer);
    taskDetails.appendChild(recurrence);
    taskDetails.appendChild(actionButtons);
  }, 500);
}

function addTask(event) {
  event.preventDefault();

  // Get the form values
  const taskName = document.getElementById("taskName").value;
  const dueDate = document.getElementById("dueDate").value;
  const selectedTaskGroups = Array.from(
    document.querySelectorAll("#taskGroups option:checked")
  ).map((option) => option.value);
  const taskGroupsWithAll = ["All", ...selectedTaskGroups];
  const priority = parseInt(document.getElementById("priority").value);
  const recurrence = document.getElementById("recurrence").value;
  const notes = document.getElementById("taskNotes").value;

  // Validate the task name and date
  if (!taskName) {
    console.error("Task name is required.");
    return;
  }

  const newtask = Task.createTask({
    name: taskName,
    dueDate: dueDate
      ? startOfDay(parse(dueDate, "yyyy-MM-dd", new Date()))
      : null,
    taskGroups: taskGroupsWithAll,
    priority: priority,
    recurrence: recurrence,
    notes: notes,
  });

  addTaskToArray(newtask);

  // Get the currently selected task group
  const selectedTaskGroup = document.querySelector(".selected").textContent;

  // Filter the tasks based on the selected task group
  const filteredTasks = filterTasks(tasks, selectedTaskGroup);

  // Run the displayTasks function with the filtered tasks
  displayTasks(filteredTasks);

  // Reset the form
  taskForm.reset();
  formContainer.classList.add("hidden");
}

export { displayTasks, displayTaskGroups, displayTaskDetail };
