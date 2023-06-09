/* eslint-disable no-use-before-define */
import { projectController, taskController } from './appController';
import cacheDom from './cacheDom';
import {
	toggleSidebar,
	hideSidebar,
	hideTaskForm,
	showTaskForm,
	updateTaskContainerTitle,
	getTaskFormValues,
	updateFormValuesWithCurrentTask,
	updateFormToEditTaskMode,
	updateFormToAddNewTaskMode,
	updateFormToEditProjectMode,
	updateFormToAddProjectMode,
	renderProjectSelectOptions,
	renderProjectList,
	renderAllTasks,
	renderInboxTasks,
	renderProjectTasks,
	renderTodayTasks,
	renderWeekTasks,
	renderCompletedTasks,
} from './domManipulator';

import {
	loadAllProjects,
	saveAllProjects,
	saveAllTasks,
	loadAllTasks,
	checkForFirstTimeOpened,
} from './storage';

const {
	btnToggleSidebar,
	// Functions for updating nodeLists
	btnsDeleteTasks,
	btnsEditTasks,
	btnsMarkComplete,
	linksProjects,
	btnsDeleteProject,
	btnsEditProject,
	// Links for Project Filters
	allTasksFilter,
	inboxFilter,
	todayFilter,
	weekFilter,
	completedFilter,
	// Project Form and Project Elements
	formProject,
	projectNameInput,
	btnAddProject,
	btnEditProjectSubmit,
	// Add Task Form and related elements
	btnCloseModule,
	formTask,
	btnSubmitUpdatedTask,
	btnNewTask,
} = cacheDom;

const addClickListenersToRenderedNodes = () => {
	btnsDeleteProject().forEach((btn) =>
		btn.addEventListener('click', deleteProjectClick)
	);

	btnsEditProject().forEach((btn) => {
		btn.addEventListener('click', editProjectClick);
	});

	btnsDeleteTasks().forEach((btn) =>
		btn.addEventListener('click', deleteTaskClick)
	);
	btnsMarkComplete().forEach((btn) =>
		btn.addEventListener('click', markTaskCompleteClick)
	);

	btnsEditTasks().forEach((btn) => {
		btn.addEventListener('click', editTaskClick);
	});
	linksProjects().forEach((link) => {
		link.addEventListener('click', projectLinkClick);
	});
};

btnToggleSidebar.addEventListener('click', toggleSidebar);
// Handle Filtering Tasks
allTasksFilter.addEventListener('click', () => {
	updateTaskContainerTitle('All Tasks');
	renderAllTasks();
	addClickListenersToRenderedNodes();
});
inboxFilter.addEventListener('click', () => {
	updateTaskContainerTitle('Inbox');
	renderInboxTasks();
	addClickListenersToRenderedNodes();
});
todayFilter.addEventListener('click', () => {
	updateTaskContainerTitle('Today');
	renderTodayTasks();
	addClickListenersToRenderedNodes();
});
weekFilter.addEventListener('click', () => {
	updateTaskContainerTitle('This Week');
	renderWeekTasks();
	addClickListenersToRenderedNodes();
});

completedFilter.addEventListener('click', () => {
	updateTaskContainerTitle('Completed Tasks');
	renderCompletedTasks();
	addClickListenersToRenderedNodes();
});

// Handle Filtering per Project Basis
const projectLinkClick = (e) => {
	const { projectName } = e.target.closest('li').dataset;
	updateTaskContainerTitle(projectName);
	renderProjectTasks(projectName);
	addClickListenersToRenderedNodes();
	updateTaskContainerTitle(projectName);
};

// Handle Project Creation and Deletion and Editing

formProject.addEventListener('submit', (e) => {
	e.preventDefault();
	if (!btnAddProject.classList.contains('hidden')) {
		projectController.createProject(projectNameInput.value);
	} else if (!btnEditProjectSubmit.classList.contains('hidden')) {
		const { projectName } = formProject.dataset;
		projectController.editProjectName(projectName, projectNameInput.value);
		updateFormToAddProjectMode();
	}
	saveAllProjects();
	renderProjectList();
	updateTaskContainerTitle(projectNameInput.value);
	renderProjectSelectOptions();
	renderProjectTasks(projectNameInput.value);
	formProject.reset();
	addClickListenersToRenderedNodes();
});

const deleteProjectClick = (e) => {
	const { projectName } = e.target.closest('li').dataset;
	projectController.deleteProject(projectName);
	saveAllProjects();
	saveAllTasks();
	renderProjectList();
	renderInboxTasks();
	renderProjectSelectOptions();
	updateTaskContainerTitle('Inbox');
	addClickListenersToRenderedNodes();
};

const editProjectClick = (e) => {
	const { projectName } = e.target.closest('button').parentNode.dataset;
	projectNameInput.value = projectName;
	updateFormToEditProjectMode();
	formProject.dataset.projectName = projectName;
	btnsDeleteProject().forEach((btn) => (btn.disabled = true));
};

// Handle Task Creation and Deletion
btnNewTask.addEventListener('click', () => {
	updateFormToAddNewTaskMode();
	showTaskForm();
	btnCloseModule.addEventListener('click', hideTaskForm);
});

formTask.addEventListener('submit', (e) => {
	e.preventDefault();
	const {
		title,
		description,
		priority,
		dueDate,
		taskCompleted,
		associatedProject,
	} = getTaskFormValues();

	if (btnSubmitUpdatedTask.classList.contains('hidden')) {
		taskController.createTask(
			title,
			description,
			priority,
			dueDate,
			taskCompleted,
			associatedProject
		);
	} else if (!btnSubmitUpdatedTask.classList.contains('hidden')) {
		const { taskTitle, projectName } = formTask.dataset;
		taskController.editTask(
			projectName,
			taskTitle,
			title,
			description,
			priority,
			dueDate,
			taskCompleted,
			associatedProject
		);
		updateFormToAddNewTaskMode();
	}
	cacheDom.formTask.reset();
	saveAllTasks();
	hideTaskForm();
	updateTaskContainerTitle(associatedProject);
	renderProjectTasks(associatedProject);
	addClickListenersToRenderedNodes();
});

const editTaskClick = (e) => {
	updateFormToEditTaskMode();
	const { taskTitle, projectName } = e.target.closest('.task-wrapper').dataset;
	updateFormValuesWithCurrentTask(projectName, taskTitle);
	showTaskForm();
	btnCloseModule.addEventListener('click', hideTaskForm);
	formTask.dataset.projectName = projectName;
	formTask.dataset.taskTitle = taskTitle;
};

const deleteTaskClick = (e) => {
	const { taskTitle, projectName } = e.target.closest('.task-wrapper').dataset;
	taskController.deleteTask(projectName, taskTitle);
	saveAllTasks();
	saveAllProjects();
	renderProjectTasks(projectName);
	if (cacheDom.taskCollectionTitle.textContent === 'Completed Tasks') {
		renderCompletedTasks();
	}
	addClickListenersToRenderedNodes();
};

const markTaskCompleteClick = (e) => {
	const { taskTitle, projectName } = e.target.closest('.task-wrapper').dataset;
	taskController.markTaskCompleted(projectName, taskTitle);
	saveAllTasks();
	renderProjectTasks(projectName);
	if (cacheDom.taskCollectionTitle.textContent === 'Completed Tasks') {
		renderCompletedTasks();
	}
	addClickListenersToRenderedNodes();
};

window.addEventListener('load', () => {
	if (checkForFirstTimeOpened() === true) {
		projectController.initializeDefaultProjects();
		taskController.initializeDefaultTasks();
		toggleSidebar();
		renderProjectList();
		renderProjectTasks('Getting Started');
		updateTaskContainerTitle('Getting Started');
		saveAllProjects(); // save
		saveAllTasks(); // save
		addClickListenersToRenderedNodes();
		return;
	}
	if (localStorage.getItem('savedProjects') !== null) {
		loadAllProjects();
		renderProjectList();
		renderProjectSelectOptions();
		hideSidebar();
	}
	if (localStorage.getItem('savedTasks') !== null) {
		loadAllTasks();
		renderInboxTasks();
		updateTaskContainerTitle('Inbox');
		hideSidebar();
	}

	addClickListenersToRenderedNodes();
});
