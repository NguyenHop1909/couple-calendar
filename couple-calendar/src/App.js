import ErrorBoundary from "./ErrorBoundary";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { db, auth, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "./firebase";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import confetti from "canvas-confetti";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);
  const [partnerEvents, setPartnerEvents] = useState([]);
  const [showPartnerCalendar, setShowPartnerCalendar] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: { date: null, time: "08:00" },
    end: { date: null, time: "09:00" },
    note: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "vi";
  });
  const [loginError, setLoginError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasShownSuccessMessage, setHasShownSuccessMessage] = useState(false);
  const [dateError, setDateError] = useState(null);
  const [titleError, setTitleError] = useState(null);

  const translations = {
    vi: {
      loginPrompt: "Đăng nhập",
      emailLabel: "Email:",
      passwordLabel: "Mật khẩu:",
      loginButton: "Đăng nhập",
      themeToggleDark: "🌙 Chế độ tối",
      themeToggleLight: "☀️ Chế độ sáng",
      loginErrorUser2: "Em bé bì sai mật khẩu rồi 😢\nBuồn quó ò 😢\nMật khẩu là ngày kỉ niệm mình ó 💕",
      loginErrorDefault: "Đăng nhập thất bại: ",
      loginSuccessUser2: "Chúc mừng Em bé bì đã đoán đúng mật khẩu rùi 🎉\nYayy, pháo bông bắn tung tóe nè 🎇💕",
      enterCalendar: "Vào lịch thui nào 🎉",
      closeButtonLoginError: "Nhập lại nhen bé yêu của anh ơi 🥰",
      closeButtonDateError: "Nhập lại nhen bé yêu của anh ơi 🥰",
      closeButtonTitleError: "Nhập nhen cục dàng ơi 🥰",
      logoutButton: "Đăng xuất",
      sidebarTitle: "Lịch của chúng mình 💕",
      partnerCalendarLabel: "Lịch của Em Bé Bì 💖",
      loveMessage: "Anh Yêu Em Bé Nhiều 💕",
      addEventTitle: "Thêm công việc 💕",
      editEventTitle: "Chỉnh sửa công việc 💕",
      userLabel: "Người thêm:",
      user1Option: "Anh Bé Bó Bì ⚡",
      user2Option: "Em Bé Bé Bì 💖",
      titleLabel: "Tên công việc: ",
      titlePlaceholder: "Nhập Tên Công Việc Nè Em Bé 🥰",
      startDateLabel: "Ngày bắt đầu:",
      startDatePlaceholder: "Chọn ngày bắt đầu",
      endDateLabel: "Ngày kết thúc:",
      endDatePlaceholder: "Chọn ngày kết thúc",
      noteLabel: "Ghi chú:",
      notePlaceholder: "Nhập Ghi Chú Nè Em Bé 🥰",
      saveButton: "Lưu",
      updateButton: "Cập nhật",
      deleteButton: "Xóa",
      closeModalButton: "Đóng",
      titleError: "Bé ơi nhập tên công việc vào nè 🥰",
      dateTimeError: "Vui lòng nhập đầy đủ ngày và giờ!",
      dateError: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu! 🥰",
      editPermissionError: "Bạn chỉ có thể chỉnh sửa sự kiện của mình!",
      errorOccurred: "Đã có lỗi xảy ra: ",
      languageToggle: "🇻🇳 Tiếng Việt"
    },
    en: {
      loginPrompt: "Login",
      emailLabel: "Email:",
      passwordLabel: "Password:",
      loginButton: "Login",
      themeToggleDark: "🌙 Dark Mode",
      themeToggleLight: "☀️ Light Mode",
      loginErrorUser2: "Em Be Be Bi entered the wrong password 😢\nSo sad huhu 😢\nThe password is our anniversary date 💕",
      loginErrorDefault: "Login failed: ",
      loginSuccessUser2: "Congrats Em Be Be Bi for guessing the password right 🎉\nYayy, fireworks everywhere 🎇💕",
      enterCalendar: "Let's go to the calendar 🎉",
      closeButtonLoginError: "Try again, my baby 🥰",
      closeButtonDateError: "Try again, my baby 🥰",
      closeButtonTitleError: "Enter it, my baby cute 🥰",
      logoutButton: "Logout",
      sidebarTitle: "Our Calendar 💕",
      partnerCalendarLabel: "Em Be Be Bi's Calendar 💖",
      loveMessage: "I Love You So Much 💕",
      addEventTitle: "Add Task 💕",
      editEventTitle: "Edit Task 💕",
      userLabel: "Added by:",
      user1Option: "Anh Be Bo Bi⚡",
      user2Option: "Em Be Be Bi 💖",
      titleLabel: "Task Name: ",
      titlePlaceholder: "Enter Task Name 🥰",
      startDateLabel: "Start Date:",
      startDatePlaceholder: "Select start date",
      endDateLabel: "End Date:",
      endDatePlaceholder: "Select end date",
      noteLabel: "Note:",
      notePlaceholder: "Enter Notes Baby 💖",
      saveButton: "Save",
      updateButton: "Update",
      deleteButton: "Delete",
      closeModalButton: "Close",
      titleError: "Baby, please enter the task name 🥰",
      dateTimeError: "Please fill in the date and time completely!",
      dateError: "The end date cannot be earlier than the start date! 🥰",
      editPermissionError: "You can only edit your own events!",
      errorOccurred: "An error occurred: ",
      languageToggle: "🇬🇧 English"
    }
  };

  // Reset loginError khi chuyển ngôn ngữ
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setLoginError(null); // Reset thông báo lỗi
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("language", language);
    document.body.className = theme;
  }, [theme, language]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Người dùng đã đăng nhập:", currentUser.uid);
        setUser(currentUser);
        if (currentUser.uid === "9jtmqiVDv0b9JNhX28hxC4fcDY93") {
          setSelectedUser("user1");
        } else if (currentUser.uid === "aAqgzb9d4LXz0pVcJZJ7romEBqc2") {
          setSelectedUser("user2");
          if (!hasShownSuccessMessage) {
            setShowSuccessMessage(true);
            setLoginSuccess(translations[language].loginSuccessUser2);
            fireConfetti();
          }
        }
      } else {
        console.log("Người dùng chưa đăng nhập");
        setUser(null);
        setSelectedUser(null);
        setEvents([]);
        setPartnerEvents([]);
        setShowSuccessMessage(false);
        setHasShownSuccessMessage(false);
      }
    });
    return () => unsubscribe();
  }, [language, hasShownSuccessMessage]);

  useEffect(() => {
    if (!selectedUser) return;
    const unsubscribe = onSnapshot(
      collection(db, "events", "user1", "tasks"),
      (snapshot) => {
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
      },
      (error) => {
        console.error("Lỗi trong snapshot listener (user1):", error);
      }
    );
    return () => unsubscribe();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;
    const unsubscribe = onSnapshot(
      collection(db, "events", "user2", "tasks"),
      (snapshot) => {
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
      },
      (error) => {
        console.error("Lỗi trong snapshot listener (user2):", error);
      }
    );
    return () => unsubscribe();
  }, [selectedUser]);

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff69b4", "#ffb6c1", "#ff85c0", "#fff0f5"],
    });
  };

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginError(null);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      if (email.toLowerCase() === "embebebi@gmail.com") {
        if (error.code === "auth/invalid-credential") {
          setLoginError(translations[language].loginErrorUser2);
        } else {
          setLoginError(translations[language].loginErrorDefault + error.message);
        }
      } else {
        if (error.code === "auth/invalid-credential") {
          alert(translations[language].loginErrorDefault + "Wrong email or password!");
        } else {
          alert(translations[language].loginErrorDefault + error.message);
        }
        setLoginError(null);
      }
      setLoginSuccess(null);
      setShowSuccessMessage(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Đăng xuất thành công");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      alert(translations[language].loginErrorDefault + error.message);
    }
  };

  const handleDateClick = (arg) => {
    const selectedDate = new Date(arg.dateStr);
    setNewEvent({
      title: "",
      start: { date: selectedDate, time: "08:00" },
      end: { date: selectedDate, time: "09:00" },
      note: ""
    });
    setIsEditing(false);
    setEditEvent(null);
    setShowModal(true);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title) {
      setTitleError(translations[language].titleError);
      return;
    }
    if (!newEvent.start.date || !newEvent.start.time || !newEvent.end.date || !newEvent.end.time) {
      alert(translations[language].dateTimeError);
      return;
    }

    const startDate = new Date(newEvent.start.date);
    const [startHours, startMinutes] = newEvent.start.time.split(":");
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(newEvent.end.date);
    const [endHours, endMinutes] = newEvent.end.time.split(":");
    endDate.setHours(endHours, endMinutes, 0, 0);

    if (endDate < startDate) {
      setDateError(translations[language].dateError);
      return;
    }

    try {
      const userPath = selectedUser === "user1" ? "user1" : "user2";
      const startDateTime = startDate.toISOString().slice(0, 23);
      const endDateTime = endDate.toISOString().slice(0, 23);

      await addDoc(collection(db, "events", userPath, "tasks"), {
        title: newEvent.title,
        start: startDateTime,
        end: endDateTime,
        note: newEvent.note
      });
      setNewEvent({
        title: "",
        start: { date: null, time: "08:00" },
        end: { date: null, time: "09:00" },
        note: ""
      });
      setShowModal(false);
    } catch (error) {
      console.error("Lỗi khi thêm sự kiện:", error);
      alert(translations[language].errorOccurred + error.message);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title) {
      setTitleError(translations[language].titleError);
      return;
    }
    if (!newEvent.start.date || !newEvent.start.time || !newEvent.end.date || !newEvent.end.time) {
      alert(translations[language].dateTimeError);
      return;
    }

    const startDate = new Date(newEvent.start.date);
    const [startHours, startMinutes] = newEvent.start.time.split(":");
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(newEvent.end.date);
    const [endHours, endMinutes] = newEvent.end.time.split(":");
    endDate.setHours(endHours, endMinutes, 0, 0);

    if (endDate < startDate) {
      setDateError(translations[language].dateError);
      return;
    }

    try {
      const userPath = selectedUser === "user1" ? "user1" : "user2";
      const startDateTime = startDate.toISOString().slice(0, 23);
      const endDateTime = endDate.toISOString().slice(0, 23);

      const eventRef = doc(db, "events", userPath, "tasks", editEvent.id);
      await updateDoc(eventRef, {
        title: newEvent.title,
        start: startDateTime,
        end: endDateTime,
        note: newEvent.note
      });
      setNewEvent({
        title: "",
        start: { date: null, time: "08:00" },
        end: { date: null, time: "09:00" },
        note: ""
      });
      setShowModal(false);
      setIsEditing(false);
      setEditEvent(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật sự kiện:", error);
      alert(translations[language].errorOccurred + error.message);
    }
  };

  const handleDeleteEvent = async () => {
    if (editEvent) {
      try {
        const userPath = selectedUser === "user1" ? "user1" : "user2";
        const eventRef = doc(db, "events", userPath, "tasks", editEvent.id);
        await deleteDoc(eventRef);
        setNewEvent({
          title: "",
          start: { date: null, time: "08:00" },
          end: { date: null, time: "09:00" },
          note: ""
        });
        setShowModal(false);
        setIsEditing(false);
        setEditEvent(null);
      } catch (error) {
        console.error("Lỗi khi xóa sự kiện:", error);
        alert(translations[language].errorOccurred + error.message);
      }
    }
  };

  if (!user || (selectedUser === "user2" && showSuccessMessage)) {
    return (
      <div className="app">
        {selectedUser === "user2" && showSuccessMessage ? (
          <div className="success-modal">
            <div className="success-modal-content">
              <p>{loginSuccess.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}</p>
              <button onClick={() => {
                setShowSuccessMessage(false);
                setLoginSuccess(null);
                setHasShownSuccessMessage(true);
              }}>
                {translations[language].enterCalendar}
              </button>
            </div>
          </div>
        ) : (
          <div className="login-modal">
            <h2>{translations[language].loginPrompt}</h2>
            {loginError && (
              <div className="error-modal">
                <div className="error-modal-content">
                  <p>{loginError.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}</p>
                  <button onClick={() => setLoginError(null)}>{translations[language].closeButtonLoginError}</button>
                </div>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const password = e.target.password.value;
                handleLogin(email, password);
              }}
            >
              <div className="toggle-buttons">
                <div className="theme-toggle">
                  <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                    {theme === "light" ? translations[language].themeToggleDark : translations[language].themeToggleLight}
                  </button>
                </div>
                <div className="language-toggle">
                  <button onClick={() => handleLanguageChange(language === "vi" ? "en" : "vi")}>
                    {language === "vi" ? translations.en.languageToggle : translations.vi.languageToggle}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>{translations[language].emailLabel}</label>
                <input
                  type="email"
                  name="email"
                  required
                  onChange={() => setLoginError(null)} // Reset lỗi khi người dùng nhập email
                />
              </div>
              <div className="form-group">
                <label>{translations[language].passwordLabel}</label>
                <input
                  type="password"
                  name="password"
                  required
                  onChange={() => setLoginError(null)} // Reset lỗi khi người dùng nhập mật khẩu
                />
              </div>
              <button type="submit">{translations[language].loginButton}</button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <div className="logout-button">
          <button onClick={handleLogout}>{translations[language].logoutButton}</button>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? translations[language].themeToggleDark : translations[language].themeToggleLight}
          </button>
          <div className="language-toggle">
            <button onClick={() => handleLanguageChange(language === "vi" ? "en" : "vi")}>
              {language === "vi" ? translations.en.languageToggle : translations.vi.languageToggle}
            </button>
          </div>
        </div>

        <div className="sidebar">
          <h3 className="sidebar-title">{translations[language].sidebarTitle}</h3>
          <label className="partner-calendar-label">
            <input
              type="checkbox"
              checked={showPartnerCalendar}
              onChange={() => setShowPartnerCalendar(!showPartnerCalendar)}
            />
            <span className="partner-calendar-text">{translations[language].partnerCalendarLabel}</span>
          </label>
        </div>

        <div className="calendar">
          {selectedUser === "user2" && (
            <div className="love-message">
              {translations[language].loveMessage}
            </div>
          )}
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
              const currentUser = selectedUser;

              if (eventUser !== currentUser) {
                alert(translations[language].editPermissionError);
                return;
              }

              const start = new Date(info.event.startStr);
              const end = new Date(info.event.endStr);

              const formatTime = (date) => {
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = String(date.getMinutes()).padStart(2, "0");
                return `${hours}:${minutes}`;
              };

              setEditEvent({
                id: info.event.id,
                title: info.event.title,
                start: { date: start, time: formatTime(start) },
                end: { date: end, time: formatTime(end) },
                note: info.event.extendedProps.note || "",
                user: eventUser
              });
              setNewEvent({
                title: info.event.title,
                start: { date: start, time: formatTime(start) },
                end: { date: end, time: formatTime(end) },
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
              <h2>{isEditing ? translations[language].editEventTitle : translations[language].addEventTitle}</h2>
              {dateError && (
                <div className="date-error-modal">
                  <div className="date-error-modal-content">
                    <p>{dateError.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        <br />
                      </span>
                    ))}</p>
                    <button onClick={() => setDateError(null)}>{translations[language].closeButtonDateError}</button>
                  </div>
                </div>
              )}
              {titleError && (
                <div className="title-error-modal">
                  <div className="title-error-modal-content">
                    <p>{titleError.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        <br />
                      </span>
                    ))}</p>
                    <button onClick={() => setTitleError(null)}>{translations[language].closeButtonTitleError}</button>
                  </div>
                </div>
              )}
              <form onSubmit={isEditing ? handleUpdateEvent : handleAddEvent}>
                <div className="form-group">
                  <label>{translations[language].userLabel}</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    disabled
                  >
                    <option value="user1" className="user1-option">{translations[language].user1Option}</option>
                    <option value="user2" className="user2-option">{translations[language].user2Option}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{translations[language].titleLabel}<span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder={translations[language].titlePlaceholder}
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>{translations[language].startDateLabel}</label>
                  <DatePicker
                    selected={newEvent.start.date}
                    onChange={(date) => setNewEvent({ ...newEvent, start: { ...newEvent.start, date } })}
                    dateFormat="dd/MM/yyyy"
                    placeholderText={translations[language].startDatePlaceholder}
                    className="date-picker"
                  />
                  <input
                    type="time"
                    value={newEvent.start.time}
                    onChange={(e) => setNewEvent({ ...newEvent, start: { ...newEvent.start, time: e.target.value } })}
                    className="time-picker"
                  />
                </div>
                <div className="form-group">
                  <label>{translations[language].endDateLabel}</label>
                  <DatePicker
                    selected={newEvent.end.date}
                    onChange={(date) => setNewEvent({ ...newEvent, end: { ...newEvent.end, date } })}
                    dateFormat="dd/MM/yyyy"
                    placeholderText={translations[language].endDatePlaceholder}
                    className="date-picker"
                  />
                  <input
                    type="time"
                    value={newEvent.end.time}
                    onChange={(e) => setNewEvent({ ...newEvent, end: { ...newEvent.end, time: e.target.value } })}
                    className="time-picker"
                  />
                </div>
                <div className="form-group">
                  <label>{translations[language].noteLabel}</label>
                  <textarea
                    placeholder={translations[language].notePlaceholder}
                    value={newEvent.note}
                    onChange={(e) => setNewEvent({ ...newEvent, note: e.target.value })}
                  />
                </div>
                <div className="button-group">
                  <button type="submit">{isEditing ? translations[language].updateButton : translations[language].saveButton}</button>
                  {isEditing && (
                    <button type="button" onClick={handleDeleteEvent}>
                      {translations[language].deleteButton}
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
                        start: { date: null, time: "08:00" },
                        end: { date: null, time: "09:00" },
                        note: ""
                      });
                      setDateError(null);
                      setTitleError(null);
                    }}
                  >
                    {translations[language].closeModalButton}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;