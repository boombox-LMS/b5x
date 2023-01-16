export interface UserTagRemovalParams {
  userId: number;
  key?: string;
  value?: any;
  confirmRemoveAll: true | undefined;
}

export interface TopicTagRemovalParams {
  topicId: number;
  key?: string;
  value?: any;
  confirmRemoveAll: true | undefined;
}

export interface TopicTagSearchCriteria {
  key?: string;
  value?: any;
  topicId: number;
}

export interface UserTagSearchCriteria {
  key?: string;
  value?: any;
  userId: number;
}
