import styles from "./style.css";
// import "style.css";
// import styles from "./style.css"
import { format, parse } from "date-fns";
import {
  tasks,
  Task,
  addTaskToArray,
  filterTasks,
  addTaskGroup,
  taskGroups,
  saveTaskGroupsToLocalStorage,
  loadTaskGroupsFromLocalStorage,
  removeTaskByName,
  editTaskByName,
  checkAndCreateRecurringTasks,
  calculateNextDueDate,
} from "./task.js";
import {
  displayTasks,
  displayTaskGroups,
  displayTaskDetail,
} from "./displayTasks.js";

window.addEventListener("load", function () {
  loadTaskGroupsFromLocalStorage(); // Load task groups from local storage
  displayTaskGroups(taskGroups);

  const loadedInstances = Task.loadFromLocalStorage();
  loadedInstances.forEach((instance) => addTaskToArray(instance));

  // Task.checkAndCreateRecurringTasks();
  checkAndCreateRecurringTasks(tasks);

  const filteredTasks = filterTasks(tasks, "All");

  displayTasks(filteredTasks);

  // Add event listeners for task group selectors
  const taskGroupSelectors = document.querySelectorAll(".taskgroup");
  taskGroupSelectors.forEach(function (selector) {
    selector.addEventListener("click", function () {
      const previouslySelectedDiv = document.querySelector(".clicked");
      if (previouslySelectedDiv) {
        previouslySelectedDiv.classList.remove("clicked");
      }
      displayTasks(filterTasks(tasks, selector.innerText));
      selector.classList.add("clicked");
    });
    if (selector.innerText === "All") {
      selector.click();
    }
  });
});

const taskGroupSelectors = document.querySelectorAll(".taskgroup");

taskGroupSelectors.forEach(function (selector) {
  selector.addEventListener("click", function () {
    const previouslySelectedDiv = document.querySelector(".clicked");
    if (previouslySelectedDiv) {
      previouslySelectedDiv.classList.remove("clicked");
    }
    displayTasks(filterTasks(tasks, selector.innerText));

    selector.classList.add("clicked");
  });
  if (selector.innerText === "All") {
    selector.click();
  }
});

const displayList = document.getElementById("mainview");

displayList.addEventListener("click", function (event) {
  if (event.target.closest(".task")) {
    const taskElement = event.target.closest(".task");
    const taskName = taskElement.querySelector(".name").textContent;
    const taskDueDate = taskElement.querySelector(".due-date").textContent;

    const task = tasks.find(
      (task) =>
        task.name === taskName &&
        (task.dueDate
          ? format(task.dueDate, "MMM dd yyyy") === taskDueDate
          : !taskDueDate)
    );

    if (task) {
      displayTaskDetail(task);
    }
  }
});

const addTaskButton = document.getElementById("addtask");

const cancelButton = document.getElementById("cancelButton");
cancelButton.addEventListener("click", function () {
  formContainer.classList.add("hidden"); // Hide the form
});

addTaskButton.addEventListener("click", function () {
  // Clear the form fields
  document.getElementById("taskName").value = "";
  document.getElementById("dueDate").value = "";
  document.getElementById("priority").value = "3";
  document.getElementById("recurrence").value = "";
  document.getElementById("taskNotes").value = "";

  // Clear the task group options
  const taskGroupsSelect = document.getElementById("taskGroups");
  taskGroupsSelect.innerHTML = "";

  // // Populate the task group options from the sidebar
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
      taskGroupsSelect.appendChild(option);
    }
  });

  // Show the form
  formContainer.classList.remove("hidden");
});

const formContainer = document.getElementById("formContainer");
const taskGroupsSelect = document.getElementById("taskGroups");

taskGroups.forEach(function (group) {
  if (
    group !== "All" &&
    group !== "Today" &&
    group !== "This Week" &&
    group !== "Completed"
  ) {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    taskGroupsSelect.appendChild(option);
  }
});

const taskForm = document.getElementById("taskForm");

const taskList = document.getElementById("mainview");

taskList.addEventListener("click", function (event) {
  if (event.target.matches(".complete-task")) {
    const completedTaskElement = event.target.closest(".task");
    const completedTask =
      completedTaskElement.querySelector(".name").textContent;
    const currentDate = new Date();

    const taskToComplete = tasks.find(
      (task) => task.name === completedTask && !task.completedDate
    );

    if (taskToComplete) {
      // Mark the task as completed
      taskToComplete.completedDate = currentDate;
      let groupsToCopy = taskToComplete.taskGroups;
      taskToComplete.taskGroups = ["Completed"];

      // Save the completed task
      Task.saveToLocalStorage(taskToComplete);

      // Create a new recurring task if necessary
      if (taskToComplete.recurrence) {
        // const newDueDate = taskToComplete.createRecurringTask();
        const newDueDate = calculateNextDueDate(
          taskToComplete.dueDate,
          taskToComplete.recurrence,
          currentDate
        );
        if (newDueDate) {
          const defaultGroups = ["Today", "This Week", "All", "Completed"];
          const customGroups = groupsToCopy.filter(
            (group) => !defaultGroups.includes(group)
          );

          const recurringTask = Task.createTask({
            ...taskToComplete,
            dueDate: newDueDate,
            completedDate: null,
            taskGroups: ["All", ...customGroups],
          });
          addTaskToArray(recurringTask);
        }
      }

      // Update the display
      const selectedTaskGroup = document.querySelector(".selected").textContent;
      const filteredTasks = filterTasks(tasks, selectedTaskGroup);
      displayTasks(filteredTasks);
    }
  }
});

taskList.addEventListener("click", function (event) {
  if (event.target.matches(".delete-task")) {
    const taskElement = event.target.closest(".task");
    const taskName = taskElement.querySelector(".name").textContent;
    const taskDueDate = taskElement.querySelector(".due-date").textContent;
    removeTaskByName(
      taskName,
      taskDueDate
        ? format(parse(taskDueDate, "MMM dd yyyy", new Date()), "yyyy-MM-dd")
        : ""
    );
    // Get the currently selected task group
    const selectedTaskGroup = document.querySelector(".selected").textContent;
    // Filter the tasks based on the selected task group
    const filteredTasks = filterTasks(tasks, selectedTaskGroup);
    // Run the displayTasks function with the filtered tasks
    displayTasks(filteredTasks);
  }
});

const addTaskGroupButton = document.getElementById("addtaskgroup");
const taskGroupFormContainer = document.getElementById(
  "taskGroupFormContainer"
);
const cancelTaskGroupButton = document.getElementById("cancelTaskGroupButton");

addTaskGroupButton.addEventListener("click", function () {
  taskGroupFormContainer.classList.remove("hidden");
});

cancelTaskGroupButton.addEventListener("click", function () {
  taskGroupFormContainer.classList.add("hidden");
});

const taskGroupForm = document.getElementById("taskGroupForm");

taskGroupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskGroupName = document.getElementById("taskGroupName").value;
  addTaskGroup(taskGroupName);
  displayTaskGroups(taskGroups);

  taskGroupForm.reset();
  taskGroupFormContainer.classList.add("hidden");
});

const sidebar = document.getElementById("sidebar");

// Create a custom context menu
const contextMenu = document.createElement("div");
contextMenu.classList.add("context-menu");
contextMenu.innerHTML = '<div class="context-menu-item">Delete</div>';
document.body.appendChild(contextMenu);

// Hide the context menu when clicking outside of it
document.addEventListener("click", function (event) {
  if (!contextMenu.contains(event.target)) {
    contextMenu.style.display = "none";
  }
});

sidebar.addEventListener("contextmenu", function (event) {
  event.preventDefault();

  const taskGroup = event.target.closest(".taskgroup");
  if (taskGroup) {
    const taskGroupName = taskGroup.textContent;

    // Show the context menu at the mouse position
    contextMenu.style.display = "block";
    contextMenu.style.left = event.pageX + "px";
    contextMenu.style.top = event.pageY + "px";

    // Handle the click event on the "Delete" option
    contextMenu.addEventListener("click", function (event) {
      if (event.target.classList.contains("context-menu-item")) {
        const index = taskGroups.indexOf(taskGroupName);
        if (index !== -1) {
          taskGroups.splice(index, 1);
          saveTaskGroupsToLocalStorage();
          displayTaskGroups(taskGroups);
        }
        contextMenu.style.display = "none";
      }
    });
  }
});

taskList.addEventListener("click", function (event) {
  if (event.target.matches(".edit-task")) {
    const taskElement = event.target.closest(".task");
    const taskName = taskElement.querySelector(".name").textContent;
    const taskDueDate = taskElement.querySelector(".due-date").textContent;
    // const taskToEdit = tasks.find(task => task.name === taskName);
    const taskToEdit = tasks.find(
      (task) =>
        task.name === taskName &&
        (task.dueDate
          ? format(task.dueDate, "MMM dd yyyy") === taskDueDate
          : !taskDueDate)
    );

    if (taskToEdit) {
      // Populate the form with the task details
      document.getElementById("taskName").value = taskToEdit.name;
      document.getElementById("dueDate").value = taskToEdit.dueDate
        ? format(taskToEdit.dueDate, "yyyy-MM-dd")
        : "";
      document.getElementById("priority").value = taskToEdit.priority;
      document.getElementById("recurrence").value = taskToEdit.recurrence;
      document.getElementById("taskNotes").value = taskToEdit.notes;

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
          option.selected = taskToEdit.taskGroups.includes(group);
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
        const updatedPriority = parseInt(
          document.getElementById("priority").value
        );
        const updatedRecurrence = document.getElementById("recurrence").value;
        const updatedNotes = document.getElementById("taskNotes").value;

        editTaskByName(taskName, {
          name: updatedTaskName,
          dueDate: updatedDueDate,
          taskGroups: updatedSelectedTaskGroups,
          priority: updatedPriority,
          recurrence: updatedRecurrence,
          notes: updatedNotes,
          completedDate: taskToEdit.completedDate, // Include the original completion date
        });

        // Reset the form and hide it
        taskForm.reset();
        formContainer.classList.add("hidden");

        // Restore the form submission behavior for adding a new task
        taskForm.removeEventListener("submit", updateTask);
        taskForm.addEventListener("submit", addTask);
      }
    }
  }
});

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
    dueDate: dueDate || null,
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

taskForm.addEventListener("submit", addTask);
