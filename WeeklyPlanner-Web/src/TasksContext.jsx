import { useState, useEffect, createContext } from "react";
import { message } from "antd";

export const Context = createContext();

function TasksContext({ children }) {

    //Global state for tasks storage
    const [tasks, setTasks] = useState({});
    const [tasksLoading, setTasksLoading] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskModalDate, setTaskModalDate] = useState(undefined);

    //Global function to open add task modal, optional initial date argument
    const openTaskModal = (boolean, date) => {

        //Checking if there is a user logged in
        if (localStorage.getItem("JWT") === null) return;

        setTaskModalDate(date);
        setShowTaskModal(boolean);
    };

    //Global function for fetching all tasks from an account
    const fetchTasks = async () => {

        //Checking if there is a user logged in
        if (localStorage.getItem("JWT") === null) return;

        setTasksLoading(true);

        //Creating loading message
        message.loading({
            type: 'loading',
            content: 'Fetching tasks',
            duration: 0,
            key: "loadingMessage"
        });

        //Making request
        const response = await fetch(`https://api-weeklyplanner.adamose.com/tasks`, {
            "method": "GET",
            "headers": { "Authorization": localStorage.getItem("JWT"), "x-api-key": "ObYIVP54zf35RbJsVO1i785wLdLTiswQ2JU3MAwu" }
        });

        //Invalid token or deleted account, sign out user
        if (response.status !== 200) {
            localStorage.clear();
            location.reload();
        } else {
            const body = await response.json();

            //Half a second buffer to allow loading animations to not close instantly
            await new Promise(r => setTimeout(r, 500));
            message.destroy("loadingMessage");
            setTasks(body.tasks);
            setTasksLoading(false);
        }
    };

    //Global function for deleting a task from an account
    const deleteTask = async (taskId, taskContent) => {
        
        //Checking if there is a user logged in
        if (localStorage.getItem("JWT") === null) return;

        //Removing task from UI
        const updatedTasks = {...tasks};
        delete updatedTasks[taskId];
        setTasks(updatedTasks);

        deleteRequest(taskId, taskContent);
    };

    //Global function for deleting all tasks in a day
    const deleteTasks = async (dateString) => {

        //Checking if there is a user logged in
        if (localStorage.getItem("JWT") === null) return;

        const updatedTasks = {...tasks};

        //Looping through all tasks and deleting the ones who date matches the supplied date
        for (const [taskId, task] of Object.entries(tasks)) {
            if (task.date === dateString) {
                delete updatedTasks[taskId];
                deleteRequest(taskId, task.content);
            }
        }

        //Removing tasks from UI
        setTasks(updatedTasks);
    };

    //Local helper function to make request to delete task from database
    const deleteRequest = async (taskId, taskContent) => {

        //Function assumes caller has already checked that a user is logged in
        const response = await fetch(`https://api-weeklyplanner.adamose.com/task/?id=${taskId}`, {
            "method": "DELETE",
            "headers": { "Authorization": localStorage.getItem("JWT"), "x-api-key": "ObYIVP54zf35RbJsVO1i785wLdLTiswQ2JU3MAwu" }
        });

        //Invalid taskId or server error
        if (response.status !== 200) 
            message.error(`Failed to delete task: ${taskContent}`, 2);
    };

    //Fetching tasks on initial load
    useEffect(() => { fetchTasks() }, []);

    return (
        <Context.Provider value={{ tasks, tasksLoading, setTasks, fetchTasks, deleteTask, deleteTasks, showTaskModal, openTaskModal, taskModalDate }}>
            {children}
        </Context.Provider>
    );
}

export default TasksContext;