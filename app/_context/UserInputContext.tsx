"use client";
import React, { createContext, useState, ReactNode } from "react";

type UserInputContextType = {
  userCourseInput: Record<string, any>;
  setUserCourseInput: React.Dispatch<React.SetStateAction<Record<string, any>>>;
};

export const UserInputContext = React.createContext<UserInputContextType | null>(null);

export const UserInputProvider = ({ children }: { children: ReactNode }) => {
  const [userCourseInput, setUserCourseInput] = useState<Record<string, any>>({});

  return (
    <UserInputContext.Provider value={{ userCourseInput, setUserCourseInput }}>
      {children}
    </UserInputContext.Provider>
  );
};
