import ErrorBoundary from "./ErrorBoundary";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { db, collection, addDoc, onSnapshot } from "./firebase";
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
    setShowModal(true);
  };

  // Thêm sự kiện mới
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (newEvent.title) {
      try {
        await addDoc(collection(db, "events", "user1", "tasks"), {
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
            eventClick={(info) =>
              alert(`${info.event.title}\nGhi chú: ${info.event.extendedProps.note || "Không có"}`)
            }
          />
        </div>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Thêm công việc</h2>
              <form onSubmit={handleAddEvent}>
                <input
                  type="text"
                  placeholder="Tên công việc"
                  value={newEvent.title}
                  onChange={(e) => {
                    console.log("Title:", e.target.value);
                    setNewEvent({ ...newEvent, title: e.target.value });
                  }}
                  autoFocus
                />
                <input
                  type="text" // Thay tạm để debug
                  value={newEvent.start}
                  onChange={(e) => {
                    console.log("Start:", e.target.value);
                    setNewEvent({ ...newEvent, start: e.target.value });
                  }}
                />
                <input
                  type="text" // Thay tạm để debug
                  value={newEvent.end}
                  onChange={(e) => {
                    console.log("End:", e.target.value);
                    setNewEvent({ ...newEvent, end: e.target.value });
                  }}
                />
                <textarea
                  placeholder="Ghi chú"
                  value={newEvent.note}
                  onChange={(e) => {
                    console.log("Note:", e.target.value);
                    setNewEvent({ ...newEvent, note: e.target.value });
                  }}
                />
                <button
                  type="submit"
                  onClick={() => console.log("Nút Lưu được nhấn")}
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log("Nút Đóng được nhấn");
                    setShowModal(false);
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