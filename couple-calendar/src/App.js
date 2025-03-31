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
    const unsubscribe = onSnapshot(collection(db, "events/user1"), (snapshot) => {
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
    const unsubscribe = onSnapshot(collection(db, "events/user2"), (snapshot) => {
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
    setNewEvent({
      ...newEvent,
      start: arg.dateStr + "T08:00",
      end: arg.dateStr + "T09:00"
    });
    setShowModal(true);
  };

  // Thêm sự kiện mới
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (newEvent.title) {
      await addDoc(collection(db, "events/user1"), {
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        note: newEvent.note
      });
      setNewEvent({ title: "", start: "", end: "", note: "" });
      setShowModal(false);
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h3>Lịch của chúng mình</h3>
        <label>
          <input
            type="checkbox"
            checked={showPartnerCalendar}
            onChange={() => setShowPartnerCalendar(!showPartnerCalendar)}
          />
          Lịch của Em (hồng)
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
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
              />
              <input
                type="datetime-local"
                value={newEvent.end}
                onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
              />
              <textarea
                placeholder="Ghi chú"
                value={newEvent.note}
                onChange={(e) => setNewEvent({ ...newEvent, note: e.target.value })}
              />
              <button type="submit">Lưu</button>
              <button type="button" onClick={() => setShowModal(false)}>Đóng</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;