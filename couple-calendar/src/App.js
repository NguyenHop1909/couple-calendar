import ErrorBoundary from "./ErrorBoundary";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { db, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "./firebase";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]); // Lịch của "Anh"
  const [partnerEvents, setPartnerEvents] = useState([]); // Lịch của "Em"
  const [showPartnerCalendar, setShowPartnerCalendar] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    note: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("user1"); // Mặc định là "Anh"
  const [editEvent, setEditEvent] = useState(null); // Lưu sự kiện đang chỉnh sửa
  const [isEditing, setIsEditing] = useState(false); // Xác định đang ở chế độ chỉnh sửa

  // Lấy dữ liệu của "Anh" (user1)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events", "user1", "tasks"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        start: doc.data().start,
        end: doc.data().end,
        extendedProps: { note: doc.data().note },
        color: "blue"
      }));
      setEvents(data);
    });
    return () => unsubscribe();
  }, []);

  // Lấy dữ liệu của "Em" (user2)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events", "user2", "tasks"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        start: doc.data().start,
        end: doc.data().end,
        extendedProps: { note: doc.data().note },
        color: "pink"
      }));
      setPartnerEvents(data);
    });
    return () => unsubscribe();
  }, []);

  // Khi nhấp vào ngày để thêm sự kiện
  const handleDateClick = (arg) => {
    const dateStr = arg.dateStr;
    const start = `${dateStr}T08:00`;
    const end = `${dateStr}T09:00`;
    setNewEvent({
      title: "",
      start: start,
      end: end,
      note: ""
    });
    setSelectedUser("user1"); // Mặc định là "Anh" khi thêm mới
    setIsEditing(false);
    setEditEvent(null);
    setShowModal(true);
  };

  // Thêm sự kiện mới
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (newEvent.title) {
      try {
        const userPath = selectedUser === "user1" ? "user1" : "user2";
        await addDoc(collection(db, "events", userPath, "tasks"), {
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          note: newEvent.note
        });
        setNewEvent({ title: "", start: "", end: "", note: "" });
        setShowModal(false);
      } catch (error) {
        console.error("Lỗi khi thêm sự kiện:", error);
        alert("Đã có lỗi xảy ra: " + error.message);
      }
    }
  };

  // Cập nhật sự kiện
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (newEvent.title && editEvent) {
      try {
        const userPath = selectedUser === "user1" ? "user1" : "user2";
        const eventRef = doc(db, "events", userPath, "tasks", editEvent.id);
        await updateDoc(eventRef, {
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          note: newEvent.note
        });
        setNewEvent({ title: "", start: "", end: "", note: "" });
        setShowModal(false);
        setIsEditing(false);
        setEditEvent(null);
      } catch (error) {
        console.error("Lỗi khi cập nhật sự kiện:", error);
        alert("Đã có lỗi xảy ra: " + error.message);
      }
    }
  };

  // Xóa sự kiện
  const handleDeleteEvent = async () => {
    if (editEvent) {
      try {
        const userPath = selectedUser === "user1" ? "user1" : "user2";
        const eventRef = doc(db, "events", userPath, "tasks", editEvent.id);
        await deleteDoc(eventRef);
        setNewEvent({ title: "", start: "", end: "", note: "" });
        setShowModal(false);
        setIsEditing(false);
        setEditEvent(null);
      } catch (error) {
        console.error("Lỗi khi xóa sự kiện:", error);
        alert("Đã có lỗi xảy ra: " + error.message);
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="app">
        <div className="sidebar">
          <h3>Lịch của chúng mình</h3>
          <label>
            <input
              type="checkbox"
              checked={showPartnerCalendar}
              onChange={() => setShowPartnerCalendar(!showPartnerCalendar)}
            />
            Lịch của Em (Ngân)
          </label>
        </div>

        <div className="calendar">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={showPartnerCalendar ? [...events, ...partnerEvents] : events}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            dateClick={handleDateClick}
            eventClick={(info) => {
              setEditEvent({
                id: info.event.id,
                title: info.event.title,
                start: info.event.startStr,
                end: info.event.endStr,
                note: info.event.extendedProps.note || "",
                user: info.event.backgroundColor === "blue" ? "user1" : "user2"
              });
              setNewEvent({
                title: info.event.title,
                start: info.event.startStr,
                end: info.event.endStr,
                note: info.event.extendedProps.note || ""
              });
              setSelectedUser(info.event.backgroundColor === "blue" ? "user1" : "user2");
              setIsEditing(true);
              setShowModal(true);
            }}
          />
        </div>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{isEditing ? "Chỉnh sửa công việc" : "Thêm công việc"}</h2>
              <form onSubmit={isEditing ? handleUpdateEvent : handleAddEvent}>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  disabled={isEditing}
                >
                  <option value="user1">Anh</option>
                  <option value="user2">Em (Ngân)</option>
                </select>
                <input
                  type="text"
                  placeholder="Tên công việc"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  autoFocus
                />
                <input
                  type="datetime-local"
                  value={newEvent.start}
                  onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                  step="60"
                />
                <input
                  type="datetime-local"
                  value={newEvent.end}
                  onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                  step="60"
                />
                <textarea
                  placeholder="Ghi chú"
                  value={newEvent.note}
                  onChange={(e) => setNewEvent({ ...newEvent, note: e.target.value })}
                />
                <button type="submit">{isEditing ? "Cập nhật" : "Lưu"}</button>
                {isEditing && (
                  <button type="button" onClick={handleDeleteEvent}>
                    Xóa
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditing(false);
                    setEditEvent(null);
                    setNewEvent({ title: "", start: "", end: "", note: "" });
                  }}
                >
                  Đóng
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;