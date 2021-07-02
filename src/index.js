import './style.css';
import { format, isToday, parseISO, isValid } from 'date-fns'

let projectList = JSON.parse(localStorage.getItem('projectList')) || [];
let taskList = JSON.parse(localStorage.getItem('taskList')) || [];

const Task = (title, description, dueDate, priority, complete, project) => {
    return { title, description, dueDate, priority, complete, project };
};

const manipulateDOM = (() => {
    const container = document.querySelector('.todo');

    const addTask = (task) => {
        //create elements
        const taskDiv = document.createElement('div');
        const taskContent = document.createElement('div');
        const taskPriority = document.createElement('div');
        const checkBox = document.createElement('div');
        const taskTitle = document.createElement('h3');
        const taskDescription = document.createElement('p');
        const taskDate = document.createElement('p');
        const taskDelete = document.createElement('span');
        //add classes to elements
        taskDiv.classList.add('task');
        taskPriority.classList.add('priority');
        checkBox.classList.add('checkbox');
        taskDelete.classList.add('delete-task');
        // add task info
        taskInfo(task, taskTitle, taskDescription, taskDate, taskPriority, taskContent);
        // append elements
        taskPriority.appendChild(checkBox);
        taskDiv.appendChild(taskPriority);
        taskDiv.appendChild(taskContent);
        taskDiv.appendChild(taskDelete);
        container.appendChild(taskDiv);
        //check if this task has already been checked
        checkedBox(checkBox, taskTitle, task.complete);
        //add event listeners to each element
        eventListeners.checkTheBox(checkBox, taskTitle, task);
        eventListeners.editTask(task, taskTitle, taskDescription, taskDate, taskPriority, taskContent, taskDiv);
        eventListeners.deleteTask(task, taskDiv, taskDelete);
    };
    const colorcodePriority = (priority) => {
        if (priority === "low") { return "#009D89" }
        else if (priority === "medium") { return "#C38700" }
        else if (priority === "high") { return "#C90D0D" }
    }
    const taskInfo = (task, taskTitle, taskDescription, taskDate, taskPriority, taskContent) => {
        taskTitle.textContent = task.title;
        taskDescription.textContent = task.description;
        isValid(parseISO(task.dueDate)) && (taskDate.textContent = format(parseISO(task.dueDate), 'MMM do, yyyy'));
        taskPriority.style.backgroundColor = colorcodePriority(task.priority);
        taskContent.appendChild(taskTitle);
        task.description && taskContent.appendChild(taskDescription);
        task.dueDate && taskContent.appendChild(taskDate);
    }
    const checkedBox = (checkbox, title, complete) => {
        if (complete) {
            checkbox.classList.add('checked');
            title.style.textDecoration = "line-through";
            title.style.color = '#6C6C6C';
        }
        else {
            checkbox.classList.remove('checked');
            title.style.removeProperty('text-decoration');
            title.style.color = '#3B3B3B';
        }
    }
    const addProject = (project, select) => {
        const projects = document.querySelector('.projects');
        const newProject = document.createElement('li');
        const option = document.createElement('option');
        newProject.textContent = project;
        option.textContent = project;
        option.value = project;
        eventListeners.clickProject(newProject);
        projects.appendChild(newProject);
        select.appendChild(option);
    }
    const toggleSection = () => {
        const main = document.querySelector(".main");
        const sidebar = document.querySelector(".sidebar");
        if (main.id === "main2") {
            main.removeAttribute('id');
            sidebar.removeAttribute('id');
        } else {
            main.id = "main2";
            sidebar.id = "sidebar2";
        }
    }
    const clearTasks = () => {
        const container = document.querySelector('.todo');
        container.textContent = "";
    }
    const defaultEditModal = (task) => {
        document.getElementById("modal").style.display = "flex";
        document.getElementById("modal-title").textContent = "Edit Task";
        document.getElementById("edit-task").style.display = "block";
        document.getElementById("submit-task").style.display = "none";
        document.getElementById("title").value = task.title;
        document.getElementById("desc").value = task.description
        isValid(parseISO(task.dueDate)) && (document.getElementById("date").value = format(parseISO(task.dueDate), 'yyyy-MM-dd'));
    }
    const closeModal = () => {
        document.getElementById("modal").style.display = "none";
        document.querySelector(".taskform").reset();
        eventListeners.removeButtonEvents();
    }
    const defaultOption = (val, sel) => {
        if (!val) { return sel.selectedIndex = 0 }
        for (let i, j = 0; i = sel.options[j]; j++) {
            if (i.value == val) {
                sel.selectedIndex = j;
                break;
            }
        }
    }
    return {
        addTask,
        checkedBox,
        addProject,
        toggleSection,
        clearTasks,
        taskInfo,
        defaultOption,
        defaultEditModal,
        closeModal
    };
})();

const eventListeners = (() => {
    const modal = document.getElementById("modal");
    const close = document.querySelector(".close");

    const checkTheBox = (checkbox, title, task) => {
        checkbox.addEventListener("click", function () {
            manipulateLogic.checkedBox(task);
            manipulateDOM.checkedBox(checkbox, title, task.complete);

        });
    }
    const clickProject = (project) => {
        project.addEventListener("click", function () {
            manipulateDOM.toggleSection();
            loadProgram.showTasks(project.innerText)
        });
    }
    const editTask = (task, taskTitle, taskDescription, taskDate, taskPriority, taskContent, taskDiv) => {
        taskDiv.addEventListener("dblclick", function () {
            manipulateDOM.defaultEditModal(task);
            const p = document.getElementById("priority");
            const pr = document.getElementById("select-project");
            manipulateDOM.defaultOption(task.priority, p);
            manipulateDOM.defaultOption(task.project, pr);
            submitEdit(task, taskTitle, taskDescription, taskDate, taskPriority, taskContent);
        });
    }
    const submitEdit = (task, taskTitle, taskDescription, taskDate, taskPriority, taskContent) => {
        document.getElementById("edit-task").addEventListener("click", function (e) {
            e.preventDefault();
            const title = document.getElementById("title").value;
            const desc = document.getElementById("desc").value;
            const date = document.getElementById("date").value;
            const p = document.getElementById("priority");
            const pr = document.getElementById("select-project");
            const priority = p.options[p.selectedIndex].value;
            const project = pr.options[pr.selectedIndex].value;
            manipulateLogic.editInfo(task, title, desc, date, priority, project);
            manipulateDOM.taskInfo(task, taskTitle, taskDescription, taskDate, taskPriority, taskContent);
            manipulateDOM.closeModal();
        }, { once: true });
    }
    const removeButtonEvents = () => {
        const oriEl = document.getElementById("edit-task");
        const newEditBtn = oriEl.cloneNode(true);
        oriEl.parentNode.replaceChild(newEditBtn, oriEl);
    }
    const deleteTask = (task, taskDiv, taskDelete) => {
        taskDelete.addEventListener("click", function () {
            manipulateLogic.deleteTask(task);
            taskDiv.remove();
        });
    }
    document.getElementById("submit").addEventListener("click", function (e) {
        e.preventDefault();
        let project = document.getElementById("project");
        const select = document.getElementById("select-project");
        if (project.value) {
            manipulateDOM.addProject(project.value, select);
            manipulateLogic.addProject(project.value);
            project.value = "";
        }
    });
    document.getElementById("submit-task").addEventListener("click", function (e) {
        e.preventDefault();
        const title = document.getElementById("title").value;
        const desc = document.getElementById("desc").value;
        const date = document.getElementById("date").value;
        const p = document.getElementById("priority");
        const priority = p.options[p.selectedIndex].value;
        const pr = document.getElementById("select-project");
        const project = pr.options[pr.selectedIndex].value;
        const task = manipulateLogic.addTask(title, desc, date, priority, project);
        manipulateDOM.addTask(task);
    });
    document.getElementById("open-modal").onclick = function () {
        modal.style.display = "flex";
        document.getElementById("edit-task").style.display = "none";
        document.getElementById("submit-task").style.display = "block";
        document.getElementById("modal-title").textContent = "Add a Task";
    }
    window.onclick = function (event) {
        if (event.target == modal) {
            manipulateDOM.closeModal();
        }
    }
    close.onclick = function () {
        manipulateDOM.closeModal();
    }
    document.getElementById("all").addEventListener("click", function () {
        manipulateDOM.toggleSection();
        loadProgram.showTasks(false);
    });
    document.getElementById("today").addEventListener("click", function () {
        manipulateDOM.toggleSection();
        loadProgram.filterByDate();
    });
    document.getElementById("switch").addEventListener("click", function () {
        manipulateDOM.toggleSection();
    });

    return {
        checkTheBox,
        clickProject,
        editTask,
        deleteTask,
        removeButtonEvents
    }
})();

const manipulateLogic = (() => {
    const addProject = (project) => {
        projectList.push(project);
        localStorage.setItem("projectList", JSON.stringify(projectList));
    }
    const addTask = (title, desc, date, priority, project) => {
        const newTask = Task(title, desc, date, priority, false, project);
        taskList.push(newTask);
        localStorage.setItem("taskList", JSON.stringify(taskList));
        return newTask;
    }
    const checkedBox = (task) => {
        task.complete = task.complete ? false : true;
        localStorage.setItem("taskList", JSON.stringify(taskList));
    }
    const editInfo = (task, title, desc, date, priority, project) => {
        task.title = title;
        task.description = desc;
        task.dueDate = date;
        task.priority = priority;
        task.project = project;
        localStorage.setItem("taskList", JSON.stringify(taskList));
    }
    const deleteTask = (task) => {
        const index = taskList.findIndex((itask) => itask == task);
        taskList.splice(index, 1);
        localStorage.setItem("taskList", JSON.stringify(taskList));
    }
    return {
        addProject,
        addTask,
        checkedBox,
        editInfo,
        deleteTask
    }
})();

let loadProgram = (() => {
    //loading stored projects
    (function () {
        const select = document.getElementById("select-project");
        projectList.forEach((project) => {
            manipulateDOM.addProject(project, select);
        })
    })();
    const showTasks = (project) => {
        manipulateDOM.clearTasks();
        const list = project ? taskList.filter((task) => task.project === project) : taskList;
        list.forEach((task) => {
            manipulateDOM.addTask(task);
        })
    }
    const filterByDate = () => {
        manipulateDOM.clearTasks();
        const list = taskList.filter((task) => isToday(parseISO(task.dueDate)));
        list.forEach((task) => {
            manipulateDOM.addTask(task);
        })
    }
    showTasks();
    return {
        showTasks,
        filterByDate
    }
})();