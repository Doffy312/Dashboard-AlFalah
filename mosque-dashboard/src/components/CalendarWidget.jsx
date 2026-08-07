import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';

// Dummy data based on PRD requirements
const dummyEvents = [
  { id: 1, date: new Date(), title: 'Kajian Rutin Ahad Pagi', time: '05:30 - 07:00', location: 'Ruang Utama Masjid' },
  { id: 2, date: addDays(new Date(), 2), title: 'Rapat Evaluasi Bulanan Takmir', time: '19:30 - 21:00', location: 'Ruang Sekretariat' },
  { id: 3, date: addDays(new Date(), 5), title: 'Pembagian Sembako Mustahik', time: '08:00 - 11:00', location: 'Halaman Masjid' },
];

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day) => setSelectedDate(day);

  // Calendar rendering logic
  const renderHeader = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={prevMonth} style={{ width: '32px', height: '32px' }}>
            <ChevronLeft size={16} />
          </button>
          <button className="btn-icon" onClick={nextMonth} style={{ width: '32px', height: '32px' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', paddingBottom: '8px' }}>
          {format(addDays(startDate, i), 'EEEEE')}
        </div>
      );
    }
    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Check if there are events on this day
        const hasEvent = dummyEvents.some(event => isSameDay(event.date, cloneDay));

        days.push(
          <div 
            key={day} 
            onClick={() => onDateClick(cloneDay)}
            style={{ 
              padding: '10px 0', 
              textAlign: 'center',
              cursor: 'pointer',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: !isSameMonth(day, monthStart) 
                ? 'rgba(255, 255, 255, 0.2)' 
                : isSameDay(day, selectedDate)
                  ? '#fff'
                  : 'var(--text-primary)',
              background: isSameDay(day, selectedDate) 
                ? 'var(--accent-color)' 
                : 'transparent',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if(!isSameDay(cloneDay, selectedDate)) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if(!isSameDay(cloneDay, selectedDate)) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {formattedDate}
            {hasEvent && (
              <div style={{
                position: 'absolute',
                bottom: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: isSameDay(day, selectedDate) ? '#fff' : 'var(--accent-color)'
              }} />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderAgenda = () => {
    const dayEvents = dummyEvents.filter(event => isSameDay(event.date, selectedDate));
    
    return (
      <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Jadwal {format(selectedDate, 'dd MMM yyyy')}
          <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', padding: '2px 8px', borderRadius: '12px' }}>
            {dayEvents.length} Program
          </span>
        </h4>
        
        {dayEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dayEvents.map(event => (
              <div key={event.id} style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h5 style={{ fontWeight: 600, fontSize: '0.9rem' }}>{event.title}</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    Berjalan
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {event.time}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '0.875rem' }}>Tidak ada jadwal program pada hari ini.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card" style={{ padding: '24px', height: '100%' }}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {renderAgenda()}
    </div>
  );
};

export default CalendarWidget;
