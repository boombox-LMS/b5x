import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api/v1",
    prepareHeaders(headers) {
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: [
    "User",
    "Responses",
    "Enrollment",
    "Catalog",
    "Issues",
    "Feedback",
    "Users",
    "UserEmails",
  ],
  endpoints: (builder) => ({
    /**
     *  Topics --------------------------------------------------
     */
    // get all topics available to the current user,
    // along with their status
    getTopicsCatalog: builder.query({
      query: () => "/topics.catalog",
      providesTags: ["Catalog"],
    }),
    getTopicInfo: builder.query({
      query: (params) => ({
        url: "/topics.info",
        params,
      }),
    }),
    getTopicContents: builder.query({
      query: (uri) => ({
        url: "/topics.contents",
        params: { uri },
      }),
    }),
    publishTopic: builder.mutation({
      query: (topic) => ({
        url: "/topics.publish",
        method: "POST",
        body: topic,
      }),
    }),
    verifyTopicCompletion: builder.mutation({
      query: (topicUri) => ({
        url: "/topics.verifyCompletion",
        method: "POST",
        body: { topicUri },
      }),
      invalidatesTags: ["Catalog", "Enrollment"],
    }),
    /**
     *  Documents -----------------------------------------------
     */
    verifyDocumentCompletion: builder.mutation({
      query: (documentUri) => ({
        url: "/documents.verifyCompletion",
        method: "POST",
        body: { documentUri },
      }),
      invalidatesTags: ["Enrollment"],
    }),
    /**
     *  Enrollments ---------------------------------------------
     */
    getEnrollment: builder.query({
      query: (uri) => ({
        url: "/topics.enrollment",
        params: { uri },
      }),
      providesTags: ["Enrollment"],
    }),
    /**
     *  Responses -----------------------------------------------
     */
    getResponses: builder.query({
      query: (documentUri) => ({
        url: "/documents.responses",
        params: { documentUri },
      }),
      providesTags: ["Responses"],
    }),
    createResponse: builder.mutation({
      query: ({ fragmentUri, enrollmentId, value, status }) => ({
        url: "/responses.create",
        method: "POST",
        body: {
          fragmentUri,
          enrollmentId,
          value,
          status,
        },
      }),
      // TODO: Make response tag invalidation more granular
      // to avoid re-rendering everything
      invalidatesTags: ["Responses", "Enrollment"],
    }),
    /**
     *  Dev tools -----------------------------------------------
     */
    populateTopicResponses: builder.mutation({
      query: (topicUri) => ({
        url: "/topics.populateResponses",
        method: "POST",
        body: { topicUri },
      }),
    }),
    clearTopicResponses: builder.mutation({
      query: (topicUri) => ({
        url: "/topics.clearResponses",
        method: "POST",
        body: { topicUri },
      }),
    }),
    /**
     *  Documents -----------------------------------------------
     */
    getDocumentContents: builder.query({
      query: (documentUri) => ({
        url: "/documents.contents",
        params: { documentUri },
      }),
    }),
    // old functionality below
    populateDocumentResponses: builder.mutation({
      query: (documentUri) => ({
        url: "/documents.populateResponses",
        method: "POST",
        body: { documentUri },
      }),
    }),
    // old functionality below
    clearDocumentResponses: builder.mutation({
      query: (documentUri) => ({
        url: "/documents.clearResponses",
        method: "POST",
        body: { documentUri },
      }),
    }),
    /**
     *  Tickets ------------------------------------------------
     */
    getIssues: builder.query({
      query: () => "/tickets/issues.list",
      providesTags: ["Issues"],
    }),
    getFeedback: builder.query({
      query: () => "/tickets/feedback.list",
      providesTags: ["Feedback"],
    }),
    createTicket: builder.mutation({
      query: (params) => ({
        url: "/tickets.create",
        method: "POST",
        body: params,
      }),
    }),
    setTicketStatus: builder.mutation({
      query: ({ ticketId, status }) => ({
        url: "/tickets.setStatus",
        method: "POST",
        body: { ticketId, status },
      }),
      invalidatesTags: ["Issues", "Feedback"],
    }),
    setTicketAssignee: builder.mutation({
      query: ({ ticketId, assigneeEmail }) => ({
        url: "/tickets.setAssignee",
        method: "POST",
        body: { ticketId, assigneeEmail },
      }),
      invalidatesTags: ["Issues", "Feedback"],
    }),
    // highlights
    // messages
    /**
     *  User ----------------------------------------------------
     */
    logInUser: builder.mutation({
      query: (email) => ({
        url: "/users.logIn",
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["User"],
    }),
    logOutUser: builder.mutation({
      query: () => ({
        url: "/users.logOut",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    getCurrentUserInfo: builder.query({
      query: () => ({
        url: "/users.current",
      }),
      providesTags: ["User"],
    }),
    getUserProfile: builder.query({
      query: ({ username }) => ({
        url: "/users.profile",
        params: { username },
      }),
      providesTags: ["User"],
    }),
    modifyUserGroups: builder.mutation({
      query: ({ users }) => ({
        url: "/users.modifyGroups",
        method: "POST",
        body: { users },
      }),
      invalidatesTags: ["Users", "UserEmails"],
    }),
    assignApiKey: builder.mutation({
      query: ({ username }) => ({
        url: "/users.assignApiKey",
        method: "POST",
        body: { username },
      }),
    }),
    // temporary endpoint just to populate ticket assignment mockup
    getUserEmails: builder.query({
      query: () => ({
        url: "/users.listEmails",
      }),
      providesTags: ["UserEmails"],
    }),
    /**
     *  Stats --------------------------------------------------
     */
    getUserStats: builder.query({
      query: (userId) => ({
        url: "/stats.listUsers",
      }),
      providesTags: ["Users"],
    }),
    getTopicStats: builder.query({
      query: (userId) => ({
        url: "/stats.listTopics",
      }),
    }),
  }),
});

// AWKWARD: It seems like this isn't the way exports are commonly done anymore,
// and it's more standard to just access api.endpoints.etc
export const {
  // topics
  useGetTopicsCatalogQuery,
  useGetTopicInfoQuery,
  usePopulateTopicResponsesMutation,
  useClearTopicResponsesMutation,
  useVerifyTopicCompletionMutation,
  usePublishTopicMutation,
  // documents
  useGetDocumentContentsQuery,
  usePopulateDocumentResponsesMutation,
  useClearDocumentResponsesMutation,
  useVerifyDocumentCompletionMutation,
  // enrollments
  useGetEnrollmentQuery,
  // responses
  useGetResponsesQuery,
  useCreateResponseMutation,
  // tickets,
  useGetIssuesQuery,
  useGetFeedbackQuery,
  useCreateTicketMutation,
  useSetTicketStatusMutation,
  useSetTicketAssigneeMutation,
  // user
  useGetCurrentUserInfoQuery,
  useLogInUserMutation,
  useLogOutUserMutation,
  useModifyUserGroupsMutation,
  useGetUserProfileQuery,
  // stats
  useGetUserStatsQuery,
  useGetTopicStatsQuery,
  // temporary for ticket mockup
  useGetUserEmailsQuery,
} = api;
