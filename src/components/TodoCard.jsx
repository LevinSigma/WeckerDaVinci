import { useEffect, useState } from "react";

const STORAGE_KEY = "davinci-todos";

function loadTodos() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export default function TodoCard() {
    const [todos, setTodos] = useState(loadTodos);
    const [newTodo, setNewTodo] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }, [todos]);

    const doneCount = todos.filter((todo) => todo.done).length;

    function addTodo() {
        const text = newTodo.trim();
        if (text === "") return;

        setTodos((current) => [...current, { id: `${Date.now()}`, text, done: false }]);
        setNewTodo("");
    }

    function toggleTodo(id) {
        setTodos((current) =>
            current.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
        );
    }

    function deleteTodo(id) {
        setTodos((current) => current.filter((todo) => todo.id !== id));
    }

    function startEdit(todo) {
        setEditingId(todo.id);
        setEditingText(todo.text);
    }

    function commitEdit() {
        const text = editingText.trim();
        if (text !== "") {
            setTodos((current) =>
                current.map((todo) => (todo.id === editingId ? { ...todo, text } : todo))
            );
        }
        setEditingId(null);
        setEditingText("");
    }

    return (
        <div className="todo-widget">
            <div className="input-group">
                <input
                    type="text"
                    className="label-input"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                    placeholder="Neues To-Do"
                />
                <button className="btn-primary" onClick={addTodo}>
                    Hinzufügen
                </button>
            </div>

            {todos.length > 0 && (
                <div className="todo-progress">
                    {doneCount} von {todos.length} erledigt
                </div>
            )}

            <ul className="todo-list">
                {todos.length === 0 ? (
                    <p className="empty-state">Keine offenen Aufgaben.</p>
                ) : (
                    todos.map((todo) => (
                        <li key={todo.id} className={`todo-item ${todo.done ? "done" : ""}`}>
                            <button
                                type="button"
                                className={`todo-checkbox ${todo.done ? "checked" : ""}`}
                                role="checkbox"
                                aria-checked={todo.done}
                                aria-label={todo.done ? "Als offen markieren" : "Als erledigt markieren"}
                                onClick={() => toggleTodo(todo.id)}
                            >
                                {todo.done && "✓"}
                            </button>

                            {editingId === todo.id ? (
                                <input
                                    type="text"
                                    className="todo-edit-input"
                                    value={editingText}
                                    autoFocus
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onBlur={commitEdit}
                                    onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                                />
                            ) : (
                                <span className="todo-text" onClick={() => toggleTodo(todo.id)}>
                                    {todo.text}
                                </span>
                            )}

                            <div className="todo-item-actions">
                                <button className="icon-button" onClick={() => startEdit(todo)} aria-label="Bearbeiten">
                                    ✎
                                </button>
                                <button className="icon-button danger" onClick={() => deleteTodo(todo.id)} aria-label="Löschen">
                                    ×
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
