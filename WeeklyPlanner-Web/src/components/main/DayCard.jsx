import Task from "./Task.jsx";
import Placeholder from "./Placeholder.jsx";
import { Context } from "../../TasksContext.jsx"
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useRef, useContext } from "react";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function DayCard({ dateObject }) {

    const { tasks, deleteTasks, tasksLoading, openTaskModal } = useContext(Context);
    const dateString = useRef(`${dateObject.getMonth() + 1}-${dateObject.getDate()}-${dateObject.getFullYear()}`);
    const cardDate = `${weekdays[dateObject.getDay()]} ${dateObject.getDate()}`;

    return (
        <div className="card">
            <div className="card-body">
                <div className="card-title">
                    <MinusOutlined className="card-title-icon" onClick={() => deleteTasks(dateString.current)} />
                    <h3 className="card-date">{cardDate}</h3>
                    <PlusOutlined className="card-title-icon" onClick={() => openTaskModal(true, dateObject)} />
                </div>
                
                {tasksLoading && <Placeholder />}

                <ul>
                    {Object.keys(tasks).map( taskId => (tasks[taskId].date === dateString.current) && <Task key={taskId} task={tasks[taskId]} taskId={taskId} /> )}
                </ul>
            </div>
        </div>
    );
}

export default DayCard;