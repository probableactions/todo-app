import format from 'date-fns/format';
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';
import isToday from 'date-fns/isToday';
import isTomorrow from 'date-fns/isTomorrow';
import cacheDom from './cacheDom';
import { projectController, taskController } from './appController';
import DeleteIcon from '../../assets/images/delete-icon.svg';
import DeleteIconHover from '../../assets/images/delete-icon-hover.svg';
import EditIcon from '../../assets/images/edit-icon.svg';
import EditIconHover from '../../assets/images/edit-icon-hover.svg';

const hideTaskForm = () => {
	const { formModule } = cacheDom;
	formModule.classList.add('hidden');
};

const showTaskForm = () => {
	const { formModule } = cacheDom;
	formModule.classList.remove('hidden');
};

const toggleSidebar = () => {
	const { projectSidebar, taskContainer } = cacheDom;
	projectSidebar.classList.toggle('hidden');
	const sidebarWidth = projectSidebar.clientWidth;

	taskContainer.style.marginLeft = `${sidebarWidth}px`;
};
const hideSidebar = () => {
	const { projectSidebar, taskContainer } = cacheDom;
	projectSidebar.classList.add('hidden');

	taskContainer.style.marginLeft = `0px`;
};

// Create DOM elements related to Projects
const createProjectSelectOption = (project) => {
	const { taskProjectSelect } = cacheDom;
	const selectOption = document.createElement('option');
	selectOption.value = project.name;
	selectOption.textContent = project.name;
	taskProjectSelect.appendChild(selectOption);
};

const renderProjectSelectOptions = () => {
	const { taskProjectSelect } = cacheDom;
	const defaultOption = document.createElement('option');
	defaultOption.value = 'Inbox';
	defaultOption.textContent = 'Send to Inbox';
	taskProjectSelect.textContent = '';
	taskProjectSelect.appendChild(defaultOption);
	projectController.allProjects.forEach((project) => {
		if (project.name !== 'Inbox') {
			createProjectSelectOption(project);
		}
	});
};

const createProjectWrapper = (project) => {
	const projectList = cacheDom.listProjects;
	const projectListItem = document.createElement('li');
	const projectLink = document.createElement('a');
	projectLink.classList.add('projectLink');
	projectLink.setAttribute('href', `#${project.name}`);
	projectLink.textContent = project.name;
	const btnEditProject = document.createElement('button');
	btnEditProject.setAttribute('class', `btnEditProject`);
	const editIcon = new Image();
	editIcon.src = EditIcon;
	const disableHoverEffectEditIcon = () => {
		editIcon.src = EditIcon;
	};
	const enableHoverEffectEditIcon = () => {
		editIcon.src = EditIconHover;
	};
	btnEditProject.addEventListener('mouseover', enableHoverEffectEditIcon);
	btnEditProject.addEventListener('mouseleave', disableHoverEffectEditIcon);
	btnEditProject.appendChild(editIcon);
	const btnDeleteProject = document.createElement('button');
	btnDeleteProject.setAttribute('class', `btnDeleteProject`);
	const deleteIcon = new Image();
	deleteIcon.src = DeleteIcon;
	const disableHoverEffectDeleteIcon = () => {
		deleteIcon.src = DeleteIcon;
	};
	const enableHoverEffectDeleteIcon = () => {
		deleteIcon.src = DeleteIconHover;
	};
	deleteIcon.addEventListener('mouseover', enableHoverEffectDeleteIcon);
	deleteIcon.addEventListener('mouseleave', disableHoverEffectDeleteIcon);
	btnDeleteProject.appendChild(deleteIcon);
	projectListItem.classList.add('project-wrapper');
	projectListItem.dataset.projectName = project.name;
	projectListItem.appendChild(projectLink);
	projectListItem.appendChild(btnEditProject);
	projectListItem.appendChild(btnDeleteProject);
	projectList.appendChild(projectListItem);
	if (project.name === 'Inbox') {
		projectListItem.classList.add('hidden');
	}
};

const renderProjectList = () => {
	const projectList = cacheDom.listProjects;
	projectList.textContent = '';
	projectController.allProjects.forEach((project) => {
		createProjectWrapper(project);
	});
};

const updateFormToEditProjectMode = () => {
	const { btnEditProjectSubmit, btnAddProject } = cacheDom;
	btnAddProject.classList.add('hidden');
	btnEditProjectSubmit.classList.remove('hidden');
};

const updateFormToAddProjectMode = () => {
	const { btnEditProjectSubmit, btnAddProject } = cacheDom;
	btnAddProject.classList.remove('hidden');
	btnEditProjectSubmit.classList.add('hidden');
};
// Create DOM elements related to Tasks

const updateTaskContainerTitle = (currentView) => {
	const { taskCollectionTitle } = cacheDom;
	taskCollectionTitle.textContent = currentView;
};

const getTaskFormValues = () => {
	const title = cacheDom.titleInput.value;
	const description = cacheDom.descriptionInput.value;
	const priority = cacheDom.priorityInput.value;
	const dueDate = cacheDom.dueDateInput.value;
	const taskCompleted = cacheDom.taskCompletedInput.checked;
	const associatedProject = cacheDom.taskProjectSelect.value;

	return {
		title,
		description,
		priority,
		dueDate,
		taskCompleted,
		associatedProject,
	};
};

const updateFormToEditTaskMode = () => {
	const { btnSubmitTask, btnSubmitUpdatedTask, spanModuleTitle } = cacheDom;
	btnSubmitTask.classList.add('hidden');
	btnSubmitUpdatedTask.classList.remove('hidden');
	spanModuleTitle.textContent = 'Edit';
};

const updateFormToAddNewTaskMode = () => {
	const { btnSubmitTask, btnSubmitUpdatedTask, spanModuleTitle } = cacheDom;
	btnSubmitTask.classList.remove('hidden');
	btnSubmitUpdatedTask.classList.add('hidden');
	spanModuleTitle.textContent = 'Add';
};

const updateFormValuesWithCurrentTask = (projectName, taskTitle) => {
	const thisTask = taskController.returnThisTask(projectName, taskTitle);
	cacheDom.titleInput.value = thisTask.title;
	cacheDom.descriptionInput.value = thisTask.description;
	cacheDom.priorityInput.value = thisTask.priority;
	cacheDom.dueDateInput.value = thisTask.dueDate;
	cacheDom.taskCompletedInput.checked = thisTask.taskCompleted;
	cacheDom.taskProjectSelect.value = thisTask.associatedProject;
};

const createTaskWrapper = (task) => {
	const { taskCollection } = cacheDom;
	const taskWrapper = document.createElement('div');
	taskWrapper.classList.add('task-wrapper');
	const taskHeader = document.createElement('div');
	taskHeader.classList.add('task-header');
	const title = document.createElement('h3');
	title.textContent = task.title;

	const dueDate = document.createElement('p');
	const dateArray = task.dueDate.split('-');
	const formatDate = format(
		new Date(dateArray[0], dateArray[1] - 1, dateArray[2]),
		'PPP'
	);
	if (task.isCompleted === true) {
		dueDate.textContent = `completed`;
	} else if (
		isToday(new Date(dateArray[0], dateArray[1] - 1, dateArray[2])) === true
	) {
		dueDate.textContent = `due today`;
		dueDate.classList.add('due-today-task');
	} else if (
		isTomorrow(new Date(dateArray[0], dateArray[1] - 1, dateArray[2])) === true
	) {
		dueDate.textContent = `due tomorrow`;
	} else {
		dueDate.textContent = `due ${formatDistanceToNowStrict(
			new Date(dateArray[0], dateArray[1] - 1, dateArray[2]),
			{ addSuffix: true }
		)}`;
	}
	if (dueDate.textContent.includes('ago')) {
		dueDate.classList.add('overdue-task');
	}
	const btnComplete = document.createElement('input');
	btnComplete.type = 'checkbox';
	btnComplete.classList.add('btnMarkComplete');
	if (task.isCompleted === true) {
		btnComplete.checked = true;
	} else btnComplete.checked = false;
	taskHeader.appendChild(title);
	taskHeader.appendChild(dueDate);
	taskHeader.appendChild(btnComplete);
	const taskBody = document.createElement('div');
	taskBody.classList.add('task-body');
	const description = document.createElement('p');
	description.textContent = task.description;
	taskBody.appendChild(description);
	const taskFooter = document.createElement('div');
	taskFooter.classList.add('task-footer');
	const project = document.createElement('p');
	project.textContent = 'Project: ';
	const projectSpan = document.createElement('span');
	project.appendChild(projectSpan);
	projectSpan.textContent = task.associatedProject;
	if (task.associatedProject === 'Inbox') {
		projectSpan.classList.add('task-project-inbox');
	}
	const priority = document.createElement('p');
	const prioritySpan = document.createElement('span');
	prioritySpan.textContent = task.priority;
	if (task.priority === 'Low') {
		prioritySpan.classList.add('task-priority-low');
	} else if (task.priority === 'High') {
		prioritySpan.classList.add('task-priority-high');
	} else if (task.priority === 'Medium') {
		prioritySpan.classList.add('task-priority-medium');
	}
	priority.textContent = 'Priority: ';
	priority.appendChild(prioritySpan);
	const createdOn = document.createElement('p');
	const createdOnSpan = document.createElement('span');
	createdOnSpan.textContent = format(task.createdTime, 'PPP');
	createdOn.textContent = 'Created: ';
	createdOn.appendChild(createdOnSpan);
	const dueOn = document.createElement('p');
	const dueOnSpan = document.createElement('span');
	dueOnSpan.textContent = formatDate;
	dueOn.textContent = 'Due: ';
	dueOn.appendChild(dueOnSpan);
	const btnEditTask = document.createElement('button');
	btnEditTask.setAttribute('class', `btnEditTask`);
	const editIcon = new Image();
	editIcon.src = EditIcon;

	const disableHoverEffectEditIcon = () => {
		editIcon.src = EditIcon;
	};
	const enableHoverEffectEditIcon = () => {
		editIcon.src = EditIconHover;
	};
	btnEditTask.addEventListener('mouseover', enableHoverEffectEditIcon);
	btnEditTask.addEventListener('mouseleave', disableHoverEffectEditIcon);
	btnEditTask.appendChild(editIcon);
	const btnDeleteTask = document.createElement('button');
	btnDeleteTask.setAttribute('class', `btnDeleteTask`);
	const deleteIcon = new Image();
	deleteIcon.src = DeleteIcon;

	const disableHoverEffectDeleteIcon = () => {
		deleteIcon.src = DeleteIcon;
	};
	const enableHoverEffectDeleteIcon = () => {
		deleteIcon.src = DeleteIconHover;
	};

	deleteIcon.addEventListener('mouseover', enableHoverEffectDeleteIcon);
	deleteIcon.addEventListener('mouseleave', disableHoverEffectDeleteIcon);
	btnDeleteTask.appendChild(deleteIcon);
	taskWrapper.dataset.projectName = task.associatedProject;
	taskWrapper.dataset.taskTitle = task.title;
	if (task.isCompleted === true) {
		taskWrapper.classList.add('strike');
	}
	title.addEventListener('click', () => {
		taskBody.classList.toggle('hidden');
		taskFooter.classList.toggle('hidden');
	});
	taskFooter.appendChild(project);
	taskFooter.appendChild(priority);
	taskFooter.appendChild(createdOn);
	taskFooter.appendChild(dueOn);
	taskFooter.appendChild(btnEditTask);
	taskFooter.appendChild(btnDeleteTask);
	taskWrapper.appendChild(taskHeader);
	taskBody.classList.add('hidden');
	taskWrapper.appendChild(taskBody);
	taskFooter.classList.add('hidden');

	taskWrapper.appendChild(taskFooter);
	taskCollection.appendChild(taskWrapper);
};

const renderAllTasks = () => {
	const { taskCollection } = cacheDom;
	taskCollection.textContent = '';
	taskController
		.sortCompletedTasks()
		.filter((task) => task.isCompleted === false)
		.forEach((task) => {
			createTaskWrapper(task);
		});
};

const renderInboxTasks = () => {
	const { taskCollection } = cacheDom;
	taskCollection.textContent = '';
	projectController
		.sortProjectTasksByCreationTime('Inbox')
		.filter((task) => task.isCompleted === false)

		.forEach((task) => createTaskWrapper(task));
};

const renderProjectTasks = (projectName) => {
	const { taskCollection } = cacheDom;
	taskCollection.textContent = '';
	projectController
		.sortProjectCompletedTasks(projectName)
		.filter((task) => task.isCompleted === false)

		.forEach((task) => createTaskWrapper(task));
};
const renderTodayTasks = () => {
	const { taskCollection } = cacheDom;
	taskCollection.textContent = '';
	taskController
		.getTodaysTasks()
		.filter((task) => task.isCompleted === false)
		.forEach((task) => createTaskWrapper(task));
};

const renderWeekTasks = () => {
	const { taskCollection } = cacheDom;
	taskCollection.textContent = '';
	taskController
		.getWeekTasks()
		.filter((task) => task.isCompleted === false)
		.forEach((task) => createTaskWrapper(task));
};

const renderCompletedTasks = () => {
	const { taskCollection } = cacheDom;
	taskCollection.textContent = '';
	taskController.getCompletedTasks().forEach((task) => createTaskWrapper(task));
};
export {
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
};
