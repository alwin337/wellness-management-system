import { create } from "../models/notification";

// Create notification
const createNotification = async ({
  userId,
  type,
  title,
  message,
  referenceId = null,
  referenceType = null,
}) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!type) {
      throw new Error("Notification type is required");
    }

    if (!title) {
      throw new Error("Notification title is required");
    }

    if (!message) {
      throw new Error("Notification message is required");
    }

    const notification =
      await create({
        userId,
        type,
        title,
        message,
        referenceId,
        referenceType,
      });

    return notification;
  } catch (error) {
    console.error(
      "CREATE NOTIFICATION ERROR:",
      error.message
    );

    throw error;
  }
};


// Create appointment notification
const notifyAppointmentConfirmed =
  async (userId, appointmentId) => {
    return createNotification({
      userId,

      type:
        "appointment_confirmed",

      title:
        "Appointment Confirmed",

      message:
        "Your counselling appointment has been confirmed.",

      referenceId:
        appointmentId,

      referenceType:
        "Appointment",
    });
  };


// Appointment cancelled
const notifyAppointmentCancelled =
  async (userId, appointmentId) => {
    return createNotification({
      userId,

      type:
        "appointment_cancelled",

      title:
        "Appointment Cancelled",

      message:
        "Your counselling appointment has been cancelled.",

      referenceId:
        appointmentId,

      referenceType:
        "Appointment",
    });
  };


// Appointment completed
const notifyAppointmentCompleted =
  async (userId, appointmentId) => {
    return createNotification({
      userId,

      type:
        "appointment_completed",

      title:
        "Session Completed",

      message:
        "Your counselling session has been completed.",

      referenceId:
        appointmentId,

      referenceType:
        "Appointment",
    });
  };


// Counsellor feedback
const notifySessionFeedback =
  async (userId, sessionId) => {
    return createNotification({
      userId,

      type:
        "session_feedback",

      title:
        "Session Feedback Received",

      message:
        "Your counsellor has added feedback to your recent session.",

      referenceId:
        sessionId,

      referenceType:
        "Session",
    });
  };


// Assessment result
const notifyAssessmentResult =
  async (
    userId,
    assessmentResultId
  ) => {
    return createNotification({
      userId,

      type:
        "assessment_result",

      title:
        "Assessment Result Available",

      message:
        "Your assessment result is now available.",

      referenceId:
        assessmentResultId,

      referenceType:
        "AssessmentResult",
    });
  };


// Export
export default {
  createNotification,
  notifyAppointmentConfirmed,
  notifyAppointmentCancelled,
  notifyAppointmentCompleted,
  notifySessionFeedback,
  notifyAssessmentResult,
};