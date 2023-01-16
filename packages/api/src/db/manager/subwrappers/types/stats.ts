import { ActivityMap, UserResponse, SavedEvent } from "@b5x/types";

export interface UserResponseWithContentContext extends UserResponse {
  userId: number;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
  fragmentRefUri: string;
}

// TODO: Make this a DraftAnalyzedUser?
export interface DraftUserWithStats {
  id: number;
  email: string;
  createdAt: Date;
  textResponseCount: number;
  finalResponsesByFragmentRefUri: Record<string, UserResponse>;
  completedDocumentUris: string[];
  completedTopicUris: string[];
  responseCount: number;
  responseRetryCount: number;
  totalTextResponseLength: number;
  events: SavedEvent[];
}

export interface DocumentWithStats {
  uri: string;
  topicUri: string;
  title: string;
  completionCount: number;
}
