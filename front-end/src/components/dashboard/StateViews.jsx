import React from "react";
import { AlertCircle, CalendarRange, Inbox } from "lucide-react";

export const LoadingState = ({ message = "Loading dashboard data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="flex space-x-2 justify-center items-center">
        <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
      <p className="text-gray-500 font-medium text-sm animate-pulse">{message}</p>
    </div>
  );
};

export const EmptyState = ({ message = "No records found", subtitle }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-center">
      <Inbox className="w-10 h-10 text-gray-400 mb-3" />
      <h3 className="font-semibold text-gray-700 text-base">{message}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export const ErrorState = ({ message = "Something went wrong while fetching data.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-red-100 rounded-2xl bg-red-50/30 text-center">
      <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
      <h3 className="font-semibold text-red-700 text-base">Unable to Load Data</h3>
      <p className="text-sm text-red-500 mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
