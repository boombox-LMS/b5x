// TODO: The rigid events structure
// is pretty silly, now that we have TS
// we can just design a variety of event shapes
// that make sense for each specific event.

export type UserActivityItem =
  | EnrollmentActivityItem
  | ResponseActivityItem
  | DocumentCompletionActivityItem
  | TopicCompletionActivityItem;
export type UserActivityEvent =
  | EnrollmentEventSeedData
  | TopicCompletionEventSeedData
  | ResponseEventSeedData
  | DocumentCompletionEventSeedData;
export type UserActivityEventInsertionData =
  | EnrollmentEventInsertionData
  | ResponseEventInsertionData
  | DocumentCompletionEventInsertionData
  | TopicCompletionEventInsertionData;
export type UserActivitySeedData =
  | UserActivityEvent
  | EnrollmentSeedData
  | ResponseSeedData
  | TopicCompletionSeedData
  | DocumentCompletionSeedData;

export interface UserActivityCollection {
  enrollments: EnrollmentSeedData[];
  responses: ResponseSeedData[];
  documentCompletions: DocumentCompletionSeedData[];
  topicCompletions: TopicCompletionSeedData[];
  events: UserActivityEvent[];
}

export interface UserActivityCollectionEntry {
  category:
    | "enrollments"
    | "responses"
    | "documentCompletions"
    | "topicCompletions"
    | "events";
  obj: UserActivitySeedData;
}

export interface EnrollmentInsertionData {
  userId: number;
  topicUri: string;
  createdAt: null | string; // ISO string
  currentDocumentUri: string;
}

export interface EnrollmentSeedData {
  insertionData: EnrollmentInsertionData;
  uuid: string;
}

export interface EnrollmentEventInsertionData {
  name: "enrollmentCreated";
  createdAt: null | string; // ISO string
  data: {
    enrollments: number[];
    users: number[];
    topics: string[];
  };
}

export interface EnrollmentEventSeedData {
  insertionData: EnrollmentEventInsertionData;
  foreignUuids: {
    // TODO: Why is enrollments plural here
    // but singular in the response activity item?
    enrollments: string;
  };
}

export interface EnrollmentActivityItem {
  enrollment: EnrollmentSeedData;
  event: EnrollmentEventSeedData;
}

export interface ResponseEventInsertionData {
  name: "responseSubmitted";
  createdAt: null | string; // ISO string
  data: {
    fragments: string[];
    documents: string[];
    users: number[];
    topics: string[];
    enrollments: number[];
    responses: number[];
  };
}

export interface ResponseInsertionData {
  enrollmentId: null | number;
  fragmentRefUri: string;
  value: any; // TODO: JSON string?
  status: string;
  createdAt: null | string; // ISO string
}

export interface ResponseSeedData {
  insertionData: ResponseInsertionData;
  uuid: string;
  foreignUuids: {
    enrollment: string;
  };
}

export interface ResponseEventSeedData {
  insertionData: ResponseEventInsertionData;
  foreignUuids: {
    responses: string;
    enrollments: string;
  };
}

export interface ResponseActivityItem {
  response: ResponseSeedData;
  event: ResponseEventSeedData;
}

export interface DocumentCompletionEventInsertionData {
  createdAt: null | string; // ISO string
  name: "documentCompleted";
  data: {
    topics: string[];
    documents: string[];
    users: number[];
  };
}

export interface DocumentCompletionSeedData {
  insertionData: {
    createdAt: null | string; // ISO string
    userId: number;
    documentUri: string;
  };
}

export interface DocumentCompletionEventSeedData {
  insertionData: DocumentCompletionEventInsertionData;
}

export interface DocumentCompletionActivityItem {
  documentCompletion: DocumentCompletionSeedData;
  event: DocumentCompletionEventSeedData;
}

export interface TopicCompletionEventInsertionData {
  name: "topicCompleted";
  data: {
    topics: string[];
    users: number[];
  };
  createdAt: null | string; // ISO string
}

export interface TopicCompletionSeedData {
  insertionData: {
    userId: number;
    topicUri: string;
    topicSlug: string;
    topicVersion: string;
    createdAt: null | string; // ISO string
  };
}

export interface TopicCompletionEventSeedData {
  insertionData: TopicCompletionEventInsertionData;
}

export interface TopicCompletionActivityItem {
  topicCompletion: TopicCompletionSeedData;
  event: TopicCompletionEventSeedData;
}
