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
    start: { date: "", time: "" },
    end: { date: "", time: "" },
    note: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("user1"); // Mặc định là "Anh"
  const [editEvent, setEditEvent] = useState(null); // Lưu sự kiện đang chỉnh sửa
  const [isEditing, setIsEditing] = useState(false); // Xác định đang ở chế độ chỉnh sửa
  const [userRole, setUserRole] = useState(null); // "male" hoặc "female"

  // Lấy dữ liệu của "Anh" (user1)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events", "user1", "tasks"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => {
          const start = doc.data().start;
          const end = doc.data().end;
          if (!start || !end || isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) {
            return null;
          }
          return {
            id: doc.id,
            title: doc.data().title,
            start: start,
            end: end,
            extendedProps: { note: doc.data().note },
            color: "blue"
          };
        })
        .filter((event) => event !== null);
      setEvents(data);
    });
    return () => unsubscribe();
  }, []);

  // Lấy dữ liệu của "Em" (user2)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events", "user2", "tasks"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => {
          const start = doc.data().start;
          const end = doc.data().end;
          if (!start || !end || isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) {
            return null;
          }
          return {
            id: doc.id,
            title: doc.data().title,
            start: start,
            end: end,
            extendedProps: { note: doc.data().note },
            color: "pink"
          };
        })
        .filter((event) => event !== null);
      setPartnerEvents(data);
    });
    return () => unsubscribe();
  }, []);

  // Khi nhấp vào ngày để thêm sự kiện
  const handleDateClick = (arg) => {
    const dateStr = arg.dateStr;
    setNewEvent({
      title: "",
      start: { date: dateStr, time: "08:00" },
      end: { date: dateStr, time: "09:00" },
      note: ""
    });
    setSelectedUser(userRole === "male" ? "user1" : "user2");
    setIsEditing(false);
    setEditEvent(null);
    setShowModal(true);
  };

  // Thêm sự kiện mới
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title) {
      alert("Vui lòng nhập Tên công việc!");
      return;
    }
    if (!newEvent.start.date || !newEvent.start.time || !newEvent.end.date || !newEvent.end.time) {
      alert("Vui lòng nhập đầy đủ ngày và giờ!");
      return;
    }

    try {
      const userPath = selectedUser === "user1" ? "user1" : "user2";
      const startS = new Date();
      const startDateTime = `${newEvent.start.date}T${newEvent.start.time}:00.000`;
      const endDateTime = `${newEvent.end.date}T${newEvent.end.time}:00.000`;
      await addDoc(collection(db, "events", userPath, "tasks"), {
        title: newEvent.title,
        start: startDateTime,
        end: endDateTime,
        note: newEvent.note
      });
      setNewEvent({
        title: "",
        start: { date: "", time: "" },
        end: { date: "", time: "" },
        note: ""
      });
      setShowModal(false);
    } catch (error) {
      console.error("Lỗi khi thêm sự kiện:", error);
      alert("Đã có lỗi xảy ra: " + error.message);
    }
  };

  // Cập nhật sự kiện
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title) {
      alert("Vui lòng nhập Tên công việc!");
      return;
    }
    if (!newEvent.start.date || !newEvent.start.time || !newEvent.end.date || !newEvent.end.time) {
      alert("Vui lòng nhập đầy đủ ngày và giờ!");
      return;
    }

    try {
      const userPath = selectedUser === "user1" ? "user1" : "user2";
      const startDateTime = `${newEvent.start.date}T${newEvent.start.time}:00.000`;
      const endDateTime = `${newEvent.end.date}T${newEvent.end.time}:00.000`;
      const eventRef = doc(db, "events", userPath, "tasks", editEvent.id);
      await updateDoc(eventRef, {
        title: newEvent.title,
        start: startDateTime,
        end: endDateTime,
        note: newEvent.note
      });
      setNewEvent({
        title: "",
        start: { date: "", time: "" },
        end: { date: "", time: "" },
        note: ""
      });
      setShowModal(false);
      setIsEditing(false);
      setEditEvent(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật sự kiện:", error);
      alert("Đã có lỗi xảy ra: " + error.message);
    }
  };

  // Xóa sự kiện
  const handleDeleteEvent = async () => {
    if (editEvent) {
      try {
        const userPath = selectedUser === "user1" ? "user1" : "user2";
        const eventRef = doc(db, "events", userPath, "tasks", editEvent.id);
        await deleteDoc(eventRef);
        setNewEvent({
          title: "",
          start: { date: "", time: "" },
          end: { date: "", time: "" },
          note: ""
        });
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
        {!userRole && (
          <div className="modal">
            <div className="modal-content">
              <h2>Chào bạn! Bạn là ai? 💕</h2>
              <div className="button-group">
                <button onClick={() => setUserRole("male")}>Anh Bé Bó Bì ⚡</button>
                <button onClick={() => setUserRole("female")}>Em Bé Bì 💖</button>
              </div>
            </div>
          </div>
        )}

        {userRole && (
          <>
            <div className="sidebar">
              <h3>Lịch của chúng mình</h3>
              <label>
                <input
                  type="checkbox"
                  checked={showPartnerCalendar}
                  onChange={() => setShowPartnerCalendar(!showPartnerCalendar)}
                />
                Lịch của Em Bé Bì 💖
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
                  const eventUser = info.event.backgroundColor === "blue" ? "user1" : "user2";
                  const currentUser = userRole === "male" ? "user1" : "user2";

                  if (eventUser !== currentUser) {
                    alert("Bạn chỉ có thể chỉnh sửa sự kiện của mình!");
                    return;
                  }

                  const formatDateTime = (dateStr) => {
                    if (!dateStr || isNaN(new Date(dateStr).getTime())) {
                      const defaultDate = new Date();
                      return {
                        date: defaultDate.toISOString().slice(0, 10),
                        time: "08:00"
                      };
                    }

                    const date = new Date(dateStr);
                    const datePart = date.toISOString().slice(0, 10);
                    const timePart = date.toISOString().slice(11, 16);
                    return { date: datePart, time: timePart };
                  };

                  const start = formatDateTime(info.event.startStr);
                  const end = formatDateTime(info.event.endStr);

                  setEditEvent({
                    id: info.event.id,
                    title: info.event.title,
                    start: start,
                    end: end,
                    note: info.event.extendedProps.note || "",
                    user: eventUser
                  });
                  setNewEvent({
                    title: info.event.title,
                    start: start,
                    end: end,
                    note: info.event.extendedProps.note || ""
                  });
                  setSelectedUser(eventUser);
                  setIsEditing(true);
                  setShowModal(true);
                }}
              />
            </div>

            {showModal && (
              <div className="modal">
                <div className="modal-content">
                  <h2>{isEditing ? "Chỉnh sửa công việc 💕" : "Thêm công việc 💕"}</h2>
                  <form onSubmit={isEditing ? handleUpdateEvent : handleAddEvent}>
                    <div className="form-group">
                      <label>Người thêm:</label>
                      <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        disabled
                      >
                        <option value="user1" className="user1-option">Anh Bé Bó Bì ⚡</option>
                        <option value="user2" className="user2-option">Em Bé Bì 💖</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tên công việc: <span className="required">*</span></label>
                      <input
                        type="text"
                        placeholder="VD: Hẹn đi ăn tối"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        autoFocus
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Ngày bắt đầu:</label>
                      <input
                        type="date"
                        value={newEvent.start.date}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          start: { ...newEvent.start, date: e.target.value }
                        })}
                      />
                      <input
                        type="time"
                        value={newEvent.start.time}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          start: { ...newEvent.start, time: e.target.value }
                        })}
                        step="60"
                      />
                    </div>
                    <div className="form-group">
                      <label>Ngày kết thúc:</label>
                      <input
                        type="date"
                        value={newEvent.end.date}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          end: { ...newEvent.end, date: e.target.value }
                        })}
                      />
                      <input
                        type="time"
                        value={newEvent.end.time}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          end: { ...newEvent.end, time: e.target.value }
                        })}
                        step="60"
                      />
                    </div>
                    <div className="form-group">
                      <label>Ghi chú:</label>
                      <textarea
                        placeholder="VD: Đi ăn ở nhà hàng ABC"
                        value={newEvent.note}
                        onChange={(e) => setNewEvent({ ...newEvent, note: e.target.value })}
                      />
                    </div>
                    <div className="button-group">
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
                          setNewEvent({
                            title: "",
                            start: { date: "", time: "" },
                            end: { date: "", time: "" },
                            note: ""
                          });
                        }}
                      >
                        Đóng
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;