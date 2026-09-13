"use client";
import React from "react";

import { UserInputProvider } from "../_context/UserInputContext";
import Header from "./Header";

export default function CreateCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserInputProvider>
      <Header />
      {children}
    </UserInputProvider>
  );
}
