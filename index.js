let task = [];
let nextId = 1
let currentFilter = "all";
let searchText = "";
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
const filterbuttons = document.querySelectorAll(".filter-button");

function getToday(){
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
}

function toInputDate(date){
        return date.toISOString().slice(0, 10);
}

function getDueLabel(dateString){
        if (dateString === "") {
                return {text: "No due date", overdue: false};
        }
    const due = new Date(dateString + "T00:00:00");
  // 86400000 = milliseconds in one day
  const days = Math.round((due - getToday()) / 86400000);

  // IF / ELSE IF / ELSE: pick the right label
  if (days < 0) {
    return { text: "Overdue", overdue: true };
  } else if (days === 0) {
    return { text: "Today", overdue: false };
  } else if (days === 1) {
    return { text: "Tomorrow", overdue: false };
  } else {
    return { text: due.toLocaleDateString(), overdue: false };
  }           
 }

 function addTask(title, priority, category, dueDate) {
        const cleanTitle = title.trim();
        if (cleanTitle === "") {
                errorMessage.textContent = "Title cannot be empty.";
                return;
        } else if (cleanTitle.length < 3) {
                errorMessage.textContent = "Title must be at least 3 characters long.";
                return;
        }
        const newTask = {
                id: nextId++,
                title: cleanTitle,
                priority: priority,
                category: category,
                due: dueDate,
                completed: false,
                createdAt: new Date().toLocaleDateString()
        };
        nextId = nextId + 1;
        task.unshift(newTask);
        saveTasks();
        renderTasks();
        modal.style.display = "none";
        taskForm.reset();
        errorMessage.textContent = "";   
        
        return true;
}

function toggleTask(id) {
  task = task.map(function (task) {
    if (task.id === id) {
      return { ...task, completed: !task.completed }; // !true = false
    }
    return task;
  });
  render();
}   

function deleteTask(id) {
  task = task.filter((task) => task.id !== id);
  render();
}
function countTasks(testFunction) {
  return task.filter(testFunction).length;
}

function updateStats() {
  const total = tasks.length; // NUMBER
  const completed = countTasks(isCompleted); // NUMBER
  const active = countTasks(isActive); // NUMBER

  let percent = 0;
  if (total > 0) {
    // avoid dividing by zero
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

  // map() TRANSFORMS data: task objects -> just the titles (strings)
  const activeTitles = tasks.filter(isActive).map((task) => task.title);
  document.title =
    activeTitles.length > 0
      ? "(" + activeTitles.length + ") Daily Task Manager"
      : "Daily Task Manager";
}

function openModal() {
  taskForm.reset(); 
  errorMessage.textContent = "";
  dueInput.value = toInputDate(getToday()); 
  modal.classList.add("modal--open"); 
  titleInput.focus();
}

function closeModal() {
  modal.classList.remove("modal--open");
}
document.getElementById("open-modal").addEventListener("click", openModal);
document.getElementById("cancel-btn").addEventListener("click", closeModal);

