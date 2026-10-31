/* =========================================
   1. DATA (variables + array of objects)
   ========================================= */
let tasks = []; // all tasks live here
let nextId = 1; // unique id for each task
let currentFilter = "all"; // "all" | "active" | "completed"
let searchText = ""; // what the user typed in search

/* =========================================
   2. FIND HTML ELEMENTS
   ========================================= */
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const modal = document.getElementById("modal");
const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("title-input");
const priorityInput = document.getElementById("priority-input");
const categoryInput = document.getElementById("category-input");
const dueInput = document.getElementById("due-input");
const errorMessage = document.getElementById("error-message");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter");

// Icons (kept here so render() stays short)
const tickIcon =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
const trashIcon =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>';

/* =========================================
   3. HELPER FUNCTIONS
   ========================================= */

// Today's date as text: "2025-06-30" (same format as <input type="date">)
function getToday() {
  return new Date().toLocaleDateString("en-CA");
}

// Turn a due date into a label + tell if it is overdue
function getDueLabel(dueDate) {
  if (dueDate === "") {
    return { text: "No date", overdue: false };
  } else if (dueDate < getToday()) {
    return { text: "Overdue", overdue: true };
  } else if (dueDate === getToday()) {
    return { text: "Today", overdue: false };
  } else {
    return { text: dueDate, overdue: false };
  }
}

/* =========================================
   4. ADD, TOGGLE, DELETE
   ========================================= */
function addTask(title, priority, category, dueDate) {
  title = title.trim(); // remove spaces at start and end

  // Validation
  if (title.length < 3) {
    errorMessage.textContent = "Task name must be at least 3 characters.";
    return false; // failed
  }

  // One task = one object
  const newTask = {
    id: nextId,
    title: title,
    priority: priority,
    category: category,
    dueDate: dueDate,
    createdAt: getToday(),
    completed: false,
  };

  nextId = nextId + 1;
  tasks.unshift(newTask); // add to the START (newest first)
  errorMessage.textContent = "";
  render();
  return true; // success
}

// Flip completed: true -> false, false -> true
function toggleTask(id) {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].completed = !tasks[i].completed;
    }
  }
  render();
}

// Keep every task EXCEPT the one with this id
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  render();
}

/* =========================================
   5. WHICH TASKS TO SHOW? (filter + search)
   ========================================= */
function getVisibleTasks() {
  const result = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    // Does it match the selected filter button?
    let matchesFilter = true;
    if (currentFilter === "active") {
      matchesFilter = task.completed === false;
    } else if (currentFilter === "completed") {
      matchesFilter = task.completed === true;
    }

    // Does it match the search text?
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    if (matchesFilter && matchesSearch) {
      result.push(task);
    }
  }
  return result;
}

/* =========================================
   6. STATS (numbers + progress bar)
   ========================================= */
function updateStats() {
  let completed = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) {
      completed = completed + 1;
    }
  }

  const total = tasks.length;
  const active = total - completed;

  let percent = 0;
  if (total > 0) {
    percent = Math.round((completed / total) * 100);
  }

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-active").textContent = active;
  document.getElementById("stat-completed").textContent = completed;
  document.getElementById("stat-progress").textContent = percent + "%";
  document.getElementById("bar-fill").style.width = percent + "%";

  document.getElementById("count-all").textContent = total;
  document.getElementById("count-active").textContent = active;
  document.getElementById("count-completed").textContent = completed;
}

/* =========================================
   7. RENDER = draw everything on screen
   Clear the list, then rebuild it from the array.
   ========================================= */
function render() {
  taskList.innerHTML = ""; // clear old cards
  const visibleTasks = getVisibleTasks();

  for (let i = 0; i < visibleTasks.length; i++) {
    const task = visibleTasks[i];
    const due = getDueLabel(task.dueDate);
    const priorityName =
      task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    const li = document.createElement("li");
    li.className = "task";
    if (task.completed) {
      li.classList.add("task--done");
    }

    // The whole card as one HTML template
    li.innerHTML = `
      <div class="task__top">
        <button class="check" onclick="toggleTask(${task.id})">
          ${task.completed ? tickIcon : ""}
        </button>
        <span class="task__title"></span>
        <button class="trash" onclick="deleteTask(${task.id})">
          ${trashIcon}
        </button>
      </div>
      <div class="tags">
        <span class="tag tag--${task.priority}">${priorityName} Priority</span>
        <span class="tag tag--category">${task.category}</span>
        <span class="tag ${due.overdue ? "tag--overdue" : "tag--due"}">${due.text}</span>
        <span class="tag tag--created">${task.createdAt}</span>
      </div>
    `;

    // Title is typed by the user, so we add it with textContent (safe)
    li.querySelector(".task__title").textContent = task.title;

    taskList.appendChild(li);
  }

  // Show the "empty" message only when nothing is visible
  if (visibleTasks.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  updateStats();
}

/* =========================================
   8. POPUP OPEN / CLOSE
   ========================================= */
function openModal() {
  taskForm.reset();
  errorMessage.textContent = "";
  dueInput.value = getToday(); // default due date = today
  modal.classList.add("modal--open");
  titleInput.focus();
}

function closeModal() {
  modal.classList.remove("modal--open");
}

/* =========================================
   9. EVENTS
   ========================================= */
document.getElementById("open-modal").addEventListener("click", openModal);
document.getElementById("cancel-btn").addEventListener("click", closeModal);

// Click on the dark background also closes the popup
modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

// Form submitted (button click OR Enter key)
taskForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading
  const success = addTask(
    titleInput.value,
    priorityInput.value,
    categoryInput.value,
    dueInput.value,
  );
  if (success) {
    closeModal();
  }
});

// Search: runs on every keystroke
searchInput.addEventListener("input", function () {
  searchText = searchInput.value.trim();
  render();
});

// Filter buttons: All / Active / Completed
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter; // reads data-filter="..."

    filterButtons.forEach((b) => b.classList.remove("filter--active"));
    button.classList.add("filter--active");

    render();
  });
});

/* =========================================
   10. START THE APP
   ========================================= */
addTask("Go to the gym", "low", "Health", getToday());
addTask("Practice HTML and CSS", "medium", "Study", getToday());
addTask("Revise Java OOP Concepts", "high", "Work", getToday());
