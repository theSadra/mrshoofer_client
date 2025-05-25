import React, { useState } from "react";
import { Calendar } from "react-modern-calendar-datepicker";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

export default function PersianDatePickerButton({ onDateSelected }: { onDateSelected?: (date: string) => void }) {
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<{ year: number, month: number, day: number } | null>(null);

    return (
        <>
            <button
                type="button"
                className="bg-default-100 text-sm font-light px-4 py-2 flex items-center gap-2 rounded"
                onClick={() => setOpen(true)}
            >
                <span>
                    <svg width="22" height="22" className="text-default-700" viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V9h14zm0-11H5V6h14zm-7 5h5v5h-5z" /></svg>
                </span>
                {selectedDate ? `${selectedDate.year}/${selectedDate.month}/${selectedDate.day}` : "انتخاب تاریخ"}
            </button>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs w-full flex flex-col items-center">
                        <Calendar
                            value={selectedDate}
                            onChange={date => {
                                setSelectedDate(date || null);
                                setOpen(false);
                                if (onDateSelected && date) {
                                    onDateSelected(`${date.year}/${date.month}/${date.day}`);
                                }
                            }}
                            locale="fa"
                            calendarClassName="persian-calendar"
                        />
                        <button
                            className="mt-4 px-4 py-2 rounded bg-default-200 text-default-700"
                            onClick={() => setOpen(false)}
                        >
                            بستن
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
