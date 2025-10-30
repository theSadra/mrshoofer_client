"use client";
import React, { useState } from "react";
import moment from "moment-jalaali";
import DatePicker from "react-datepicker2";



function persian_datePicket({istoday=true,hastimepicker=false, onChange, value, placeholder}) {
      const [value, setValue] = useState(moment()); // moment-jalaali date
  return (
   <DatePicker
      isGregorian={false}
      timePicker={hastimepicker}
      inputFormat="jYYYY/jMM/jDD"
      locale="fa" // Persian locale
      placeholderText={placeholder || "انتخاب تاریخ"}
      onChange={(val) => onChange(val)} // update state
    />
  )
}

export default persian_datePicket