import { boolean, integer, json, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const CourseList = pgTable("course_list", {
    id: serial("id").primaryKey(),
    courseid: varchar("course_id").notNull(),
    name: varchar("name").notNull(),
    category: varchar("category").notNull(),
    topic: varchar("topic").notNull(),
    level: varchar("level").notNull(),
    language: varchar("language").notNull(),
    courseOutput: json("course_output").notNull(),
    createdby: varchar("created_by").notNull(),
    username: varchar("user_name").notNull(),
    addVideo: boolean("add_video").default(true).notNull(),
});

export const Chapters = pgTable("chapters", {
    id: serial("id").primaryKey(),
    courseid: varchar("course_id").notNull(),
    chapterId: integer("chapter_id").notNull(),
    content: json("content").notNull(),
    videoId: varchar("video_id").notNull(),
});

export const UserSubscription = pgTable("user_subscription", {
    id: serial("id").primaryKey(),
    email: varchar("email").notNull(),
    razorpayPaymentId: varchar("razorpay_payment_id"),
    razorpayOrderId: varchar("razorpay_order_id"),
    active: boolean("active").default(false).notNull(),
    createdAt: varchar("created_at").notNull(),
});